import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetch a resource from Shopify Admin API
 */
export async function fetchShopifyResource(tenant, resource, limit = 250, pageInfo = null) {
  if (!tenant.shopDomain || !tenant.shopifyAccessToken) {
    throw new Error('Tenant missing shopDomain or shopifyAccessToken');
  }

  const baseUrl = `https://${tenant.shopDomain}/admin/api/2024-10/${resource}.json`;
  const params = new URLSearchParams({ limit: limit.toString() });
  
  if (pageInfo) {
    params.append('page_info', pageInfo);
  }

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': tenant.shopifyAccessToken
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching ${resource} from Shopify:`, error.response?.data || error.message);
    
    // Provide more specific error messages
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        throw new Error('Invalid Shopify API credentials. Please check your access token.');
      } else if (status === 404) {
        throw new Error(`Shopify store not found. Check if shop domain "${tenant.shopDomain}" is correct.`);
      } else if (status === 403) {
        throw new Error('Access denied. Check if your API token has the required permissions.');
      } else if (status === 429) {
        throw new Error('Shopify API rate limit exceeded. Please wait a moment and try again.');
      } else {
        throw new Error(`Shopify API error (${status}): ${data?.errors?.message || data?.error || 'Unknown error'}`);
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to Shopify store "${tenant.shopDomain}". Check your internet connection and shop domain.`);
    } else {
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

/**
 * Fetch all pages of a Shopify resource
 */
async function fetchAllPages(tenant, resource) {
  let allItems = [];
  let pageInfo = null;
  let hasNextPage = true;
  let pageCount = 0;
  const maxPages = 100; // Safety limit

  while (hasNextPage && pageCount < maxPages) {
    try {
      const data = await fetchShopifyResource(tenant, resource, 250, pageInfo);
      const items = data[resource] || [];
      allItems = allItems.concat(items);
      pageCount++;

      // Check for pagination in response
      // Shopify 2024-10 API uses cursor-based pagination
      const linkHeader = data.headers?.link || '';
      const nextPageMatch = linkHeader.match(/<[^>]+page_info=([^>]+)>; rel="next"/);
      
      if (nextPageMatch) {
        pageInfo = nextPageMatch[1];
      } else if (items.length < 250) {
        // If we got fewer items than requested, we're done
        hasNextPage = false;
      } else {
        // No next page link and we got full page - might have more
        // Try to continue with next cursor if available
        const nextCursor = data.next_cursor || null;
        if (nextCursor) {
          pageInfo = nextCursor;
        } else {
          hasNextPage = false;
        }
      }

      // Small delay to respect rate limits (2 requests per second)
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // If error on first page, throw it
      if (pageCount === 0) {
        throw error;
      }
      // If error on subsequent pages, log and return what we have
      console.warn(`Error fetching page ${pageCount + 1} of ${resource}, returning ${allItems.length} items`);
      break;
    }
  }

  if (pageCount >= maxPages) {
    console.warn(`Reached maximum page limit (${maxPages}) for ${resource}, returning ${allItems.length} items`);
  }

  return allItems;
}

/**
 * Run full sync for a tenant
 */
export async function runTenantFullSync(tenantId) {
  console.log(`Starting full sync for tenant ${tenantId}`);

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant) {
    throw new Error(`Tenant ${tenantId} not found`);
  }

  if (!tenant.shopDomain || !tenant.shopifyAccessToken) {
    throw new Error(`Tenant ${tenantId} missing Shopify configuration`);
  }

  try {
    // Sync Customers
    console.log(`Syncing customers for tenant ${tenantId}`);
    const customers = await fetchAllPages(tenant, 'customers');
    
    for (const shopifyCustomer of customers) {
      await prisma.customer.upsert({
        where: {
          tenantId_shopifyCustomerId: {
            tenantId: tenant.id,
            shopifyCustomerId: BigInt(shopifyCustomer.id)
          }
        },
        update: {
          firstName: shopifyCustomer.first_name || null,
          lastName: shopifyCustomer.last_name || null,
          email: shopifyCustomer.email || null,
          phone: shopifyCustomer.phone || null,
          updatedAt: new Date(shopifyCustomer.updated_at)
        },
        create: {
          tenantId: tenant.id,
          shopifyCustomerId: BigInt(shopifyCustomer.id),
          firstName: shopifyCustomer.first_name || null,
          lastName: shopifyCustomer.last_name || null,
          email: shopifyCustomer.email || null,
          phone: shopifyCustomer.phone || null,
          createdAt: new Date(shopifyCustomer.created_at),
          updatedAt: new Date(shopifyCustomer.updated_at)
        }
      });
    }

    console.log(`Synced ${customers.length} customers`);

    // Sync Products
    console.log(`Syncing products for tenant ${tenantId}`);
    const products = await fetchAllPages(tenant, 'products');
    
    for (const shopifyProduct of products) {
      await prisma.product.upsert({
        where: {
          tenantId_shopifyProductId: {
            tenantId: tenant.id,
            shopifyProductId: BigInt(shopifyProduct.id)
          }
        },
        update: {
          title: shopifyProduct.title,
          status: shopifyProduct.status || null,
          updatedAt: new Date(shopifyProduct.updated_at)
        },
        create: {
          tenantId: tenant.id,
          shopifyProductId: BigInt(shopifyProduct.id),
          title: shopifyProduct.title,
          status: shopifyProduct.status || null,
          createdAt: new Date(shopifyProduct.created_at),
          updatedAt: new Date(shopifyProduct.updated_at)
        }
      });
    }

    console.log(`Synced ${products.length} products`);

    // Sync Orders
    console.log(`Syncing orders for tenant ${tenantId}`);
    const orders = await fetchAllPages(tenant, 'orders');
    
    for (const shopifyOrder of orders) {
      // Find customer if order has customer data
      let customerId = null;
      if (shopifyOrder.customer && shopifyOrder.customer.id) {
        const customer = await prisma.customer.findUnique({
          where: {
            tenantId_shopifyCustomerId: {
              tenantId: tenant.id,
              shopifyCustomerId: BigInt(shopifyOrder.customer.id)
            }
          }
        });
        customerId = customer?.id || null;
      }

      // Create or update order
      const order = await prisma.order.upsert({
        where: {
          tenantId_shopifyOrderId: {
            tenantId: tenant.id,
            shopifyOrderId: BigInt(shopifyOrder.id)
          }
        },
        update: {
          orderNumber: shopifyOrder.order_number?.toString() || null,
          customerId,
          totalPrice: parseFloat(shopifyOrder.total_price || 0),
          currency: shopifyOrder.currency || 'USD',
          financialStatus: shopifyOrder.financial_status || null,
          processedAt: shopifyOrder.processed_at ? new Date(shopifyOrder.processed_at) : null
        },
        create: {
          tenantId: tenant.id,
          shopifyOrderId: BigInt(shopifyOrder.id),
          orderNumber: shopifyOrder.order_number?.toString() || null,
          customerId,
          totalPrice: parseFloat(shopifyOrder.total_price || 0),
          currency: shopifyOrder.currency || 'USD',
          financialStatus: shopifyOrder.financial_status || null,
          processedAt: shopifyOrder.processed_at ? new Date(shopifyOrder.processed_at) : null,
          createdAt: new Date(shopifyOrder.created_at),
          updatedAt: new Date(shopifyOrder.updated_at)
        }
      });

      // Delete existing order items and recreate them
      await prisma.orderItem.deleteMany({
        where: {
          tenantId: tenant.id,
          orderId: order.id
        }
      });

      // Create order items
      if (shopifyOrder.line_items && Array.isArray(shopifyOrder.line_items)) {
        for (const lineItem of shopifyOrder.line_items) {
          // Find product if line item has product_id
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
              orderId: order.id,
              productId,
              quantity: lineItem.quantity || 0,
              price: parseFloat(lineItem.price || 0)
            }
          });
        }
      }
    }

    console.log(`Synced ${orders.length} orders`);
    console.log(`Full sync completed for tenant ${tenantId}`);

    return {
      customers: customers.length,
      products: products.length,
      orders: orders.length
    };
  } catch (error) {
    console.error(`Error during full sync for tenant ${tenantId}:`, error);
    throw error;
  }
}

