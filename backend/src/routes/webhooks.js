import express from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { runTenantFullSync } from '../services/shopifyService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Verify Shopify webhook signature
function verifyWebhook(data, hmacHeader, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(data, 'utf8')
    .digest('base64');
  return hash === hmacHeader;
}

// POST /webhooks/shopify
// This endpoint receives webhooks from Shopify
router.post('/shopify', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
    const shopDomain = req.get('X-Shopify-Shop-Domain');
    const topic = req.get('X-Shopify-Topic');

    if (!shopDomain) {
      return res.status(400).json({ error: 'Missing shop domain' });
    }

    // Find tenant by shop domain
    const tenant = await prisma.tenant.findUnique({
      where: { shopDomain }
    });

    if (!tenant || !tenant.shopifyAccessToken) {
      console.log(`Webhook received for unknown tenant: ${shopDomain}`);
      return res.status(200).json({ received: true }); // Return 200 to acknowledge
    }

    // Verify webhook signature (optional but recommended)
    // For production, store webhook secret in tenant config
    // const webhookSecret = tenant.webhookSecret || process.env.SHOPIFY_WEBHOOK_SECRET;
    // if (webhookSecret && !verifyWebhook(req.body, hmacHeader, webhookSecret)) {
    //   return res.status(401).json({ error: 'Invalid webhook signature' });
    // }

    const rawBody = req.body.toString('utf8');
    const payload = JSON.parse(rawBody);

    console.log(`Webhook received: ${topic} for tenant ${tenant.id}`);

    // Handle different webhook topics
    switch (topic) {
      case 'orders/create':
      case 'orders/updated':
      case 'orders/paid':
      case 'orders/cancelled':
        // Trigger incremental sync for orders
        await handleOrderWebhook(tenant.id, payload);
        break;
      
      case 'customers/create':
      case 'customers/update':
        // Trigger incremental sync for customers
        await handleCustomerWebhook(tenant.id, payload);
        break;
      
      case 'products/create':
      case 'products/update':
        // Trigger incremental sync for products
        await handleProductWebhook(tenant.id, payload);
        break;
      
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to acknowledge receipt (Shopify will retry if we return error)
    res.status(200).json({ received: true, error: 'Processing failed' });
  }
});

// Handle order webhooks
async function handleOrderWebhook(tenantId, payload) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) return;

    const order = payload;
    
    // Find or create customer
    let customerId = null;
    if (order.customer && order.customer.id) {
      const customer = await prisma.customer.upsert({
        where: {
          tenantId_shopifyCustomerId: {
            tenantId: tenant.id,
            shopifyCustomerId: BigInt(order.customer.id)
          }
        },
        update: {
          firstName: order.customer.first_name || null,
          lastName: order.customer.last_name || null,
          email: order.customer.email || null,
          phone: order.customer.phone || null,
          updatedAt: new Date(order.customer.updated_at)
        },
        create: {
          tenantId: tenant.id,
          shopifyCustomerId: BigInt(order.customer.id),
          firstName: order.customer.first_name || null,
          lastName: order.customer.last_name || null,
          email: order.customer.email || null,
          phone: order.customer.phone || null,
          createdAt: new Date(order.customer.created_at),
          updatedAt: new Date(order.customer.updated_at)
        }
      });
      customerId = customer.id;
    }

    // Upsert order
    const dbOrder = await prisma.order.upsert({
      where: {
        tenantId_shopifyOrderId: {
          tenantId: tenant.id,
          shopifyOrderId: BigInt(order.id)
        }
      },
      update: {
        orderNumber: order.order_number?.toString() || null,
        customerId,
        totalPrice: parseFloat(order.total_price || 0),
        currency: order.currency || 'USD',
        financialStatus: order.financial_status || null,
        processedAt: order.processed_at ? new Date(order.processed_at) : null
      },
      create: {
        tenantId: tenant.id,
        shopifyOrderId: BigInt(order.id),
        orderNumber: order.order_number?.toString() || null,
        customerId,
        totalPrice: parseFloat(order.total_price || 0),
        currency: order.currency || 'USD',
        financialStatus: order.financial_status || null,
        processedAt: order.processed_at ? new Date(order.processed_at) : null,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at)
      }
    });

    // Update order items
    await prisma.orderItem.deleteMany({
      where: {
        tenantId: tenant.id,
        orderId: dbOrder.id
      }
    });

    if (order.line_items && Array.isArray(order.line_items)) {
      for (const lineItem of order.line_items) {
        let productId = null;
        if (lineItem.product_id) {
          const product = await prisma.product.findUnique({
            where: {
              tenantId_shopifyProductId: {
                tenantId: tenant.id,
                shopifyProductId: BigInt(lineItem.product_id)
              }
            }
          });
          productId = product?.id || null;
        }

        await prisma.orderItem.create({
          data: {
            tenantId: tenant.id,
            orderId: dbOrder.id,
            productId,
            quantity: lineItem.quantity || 0,
            price: parseFloat(lineItem.price || 0)
          }
        });
      }
    }

    console.log(`Order ${order.id} synced via webhook`);
  } catch (error) {
    console.error('Error handling order webhook:', error);
  }
}

// Handle customer webhooks
async function handleCustomerWebhook(tenantId, payload) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) return;

    const customer = payload;

    await prisma.customer.upsert({
      where: {
        tenantId_shopifyCustomerId: {
          tenantId: tenant.id,
          shopifyCustomerId: BigInt(customer.id)
        }
      },
      update: {
        firstName: customer.first_name || null,
        lastName: customer.last_name || null,
        email: customer.email || null,
        phone: customer.phone || null,
        updatedAt: new Date(customer.updated_at)
      },
      create: {
        tenantId: tenant.id,
        shopifyCustomerId: BigInt(customer.id),
        firstName: customer.first_name || null,
        lastName: customer.last_name || null,
        email: customer.email || null,
        phone: customer.phone || null,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at)
      }
    });

    console.log(`Customer ${customer.id} synced via webhook`);
  } catch (error) {
    console.error('Error handling customer webhook:', error);
  }
}

// Handle product webhooks
async function handleProductWebhook(tenantId, payload) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) return;

    const product = payload;

    await prisma.product.upsert({
      where: {
        tenantId_shopifyProductId: {
          tenantId: tenant.id,
          shopifyProductId: BigInt(product.id)
        }
      },
      update: {
        title: product.title,
        status: product.status || null,
        updatedAt: new Date(product.updated_at)
      },
      create: {
        tenantId: tenant.id,
        shopifyProductId: BigInt(product.id),
        title: product.title,
        status: product.status || null,
        createdAt: new Date(product.created_at),
        updatedAt: new Date(product.updated_at)
      }
    });

    console.log(`Product ${product.id} synced via webhook`);
  } catch (error) {
    console.error('Error handling product webhook:', error);
  }
}

export default router;

