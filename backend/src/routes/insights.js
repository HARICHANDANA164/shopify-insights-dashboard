import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper to parse date range
function parseDateRange(req) {
  const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago
  const to = req.query.to ? new Date(req.query.to) : new Date(); // Default: now

  // Set tim e to start/end of day
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return { from, to };
}

// GET /insights/summary
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { from, to } = parseDateRange(req);

    // Get total customers (all time)
    const totalCustomers = await prisma.customer.count({
      where: { tenantId }
    });

    // Get orders and revenue in date range
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        processedAt: {
          gte: from,
          lte: to
        }
      },
      select: {
        totalPrice: true
      }
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get currency from first order (or default to USD)
    const firstOrder = orders[0];
    const currency = firstOrder?.currency || 'USD';

    res.json({
      totalCustomers,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      currency,
      dateRange: {
        from: from.toISOString(),
        to: to.toISOString()
      }
    });
  } catch (error) {
    console.error('Summary insights error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /insights/orders-by-date
router.get('/orders-by-date', requireAuth, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { from, to } = parseDateRange(req);

    // Get all orders in date range
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        processedAt: {
          gte: from,
          lte: to
        }
      },
      select: {
        processedAt: true,
        totalPrice: true
      }
    });

    // Group by date
    const dateMap = new Map();

    orders.forEach(order => {
      if (!order.processedAt) return;
      
      const dateStr = order.processedAt.toISOString().split('T')[0];
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr, orders: 0, revenue: 0 });
      }

      const entry = dateMap.get(dateStr);
      entry.orders += 1;
      entry.revenue += order.totalPrice;
    });

    // Convert to array and sort by date
    const result = Array.from(dateMap.values())
      .map(entry => ({
        date: entry.date,
        orders: entry.orders,
        revenue: Math.round(entry.revenue * 100) / 100
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json(result);
  } catch (error) {
    console.error('Orders by date error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /insights/top-customers
router.get('/top-customers', requireAuth, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { from, to } = parseDateRange(req);
    const limit = parseInt(req.query.limit) || 5;

    // Get all orders in date range with customer info
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        processedAt: {
          gte: from,
          lte: to
        },
        customerId: {
          not: null
        }
      },
      include: {
        customer: true
      }
    });

    // Aggregate by customer
    const customerMap = new Map();

    orders.forEach(order => {
      if (!order.customer) return;

      const customerId = order.customer.id;

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          firstName: order.customer.firstName || '',
          lastName: order.customer.lastName || '',
          email: order.customer.email || '',
          total_spent: 0,
          orders_count: 0
        });
      }

      const entry = customerMap.get(customerId);
      entry.total_spent += order.totalPrice;
      entry.orders_count += 1;
    });

    // Convert to array, sort by total_spent, and limit
    const result = Array.from(customerMap.values())
      .map(entry => ({
        id: entry.id,
        firstName: entry.firstName,
        lastName: entry.lastName,
        email: entry.email,
        total_spent: Math.round(entry.total_spent * 100) / 100,
        orders_count: entry.orders_count
      }))
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, limit);

    res.json(result);
  } catch (error) {
    console.error('Top customers error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /insights/revenue-trend
router.get('/revenue-trend', requireAuth, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { from, to } = parseDateRange(req);
    const period = req.query.period || 'day'; // 'day', 'week', 'month'

    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        processedAt: {
          gte: from,
          lte: to
        }
      },
      select: {
        processedAt: true,
        totalPrice: true
      },
      orderBy: {
        processedAt: 'asc'
      }
    });

    const trendMap = new Map();

    orders.forEach(order => {
      if (!order.processedAt) return;
      
      let key;
      const date = new Date(order.processedAt);
      
      if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (period === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!trendMap.has(key)) {
        trendMap.set(key, { period: key, revenue: 0, orders: 0 });
      }

      const entry = trendMap.get(key);
      entry.revenue += order.totalPrice;
      entry.orders += 1;
    });

    const result = Array.from(trendMap.values())
      .map(entry => ({
        period: entry.period,
        revenue: Math.round(entry.revenue * 100) / 100,
        orders: entry.orders
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    res.json(result);
  } catch (error) {
    console.error('Revenue trend error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /insights/top-products
router.get('/top-products', requireAuth, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { from, to } = parseDateRange(req);
    const limit = parseInt(req.query.limit) || 5;

    const orderItems = await prisma.orderItem.findMany({
      where: {
        tenantId,
        order: {
          processedAt: {
            gte: from,
            lte: to
          }
        },
        productId: {
          not: null
        }
      },
      include: {
        product: true,
        order: true
      }
    });

    const productMap = new Map();

    orderItems.forEach(item => {
      if (!item.product) return;

      const productId = item.product.id;

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          id: productId,
          title: item.product.title,
          quantity: 0,
          revenue: 0,
          orders: new Set()
        });
      }

      const entry = productMap.get(productId);
      entry.quantity += item.quantity;
      entry.revenue += item.price * item.quantity;
      entry.orders.add(item.orderId);
    });

    const result = Array.from(productMap.values())
      .map(entry => ({
        id: entry.id,
        title: entry.title,
        quantity: entry.quantity,
        revenue: Math.round(entry.revenue * 100) / 100,
        orders_count: entry.orders.size
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    res.json(result);
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /insights/conversion-metrics
router.get('/conversion-metrics', requireAuth, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { from, to } = parseDateRange(req);

    // Get total customers
    const totalCustomers = await prisma.customer.count({
      where: { tenantId }
    });

    // Get customers who made orders in date range
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        processedAt: {
          gte: from,
          lte: to
        },
        customerId: {
          not: null
        }
      },
      select: {
        customerId: true
      },
      distinct: ['customerId']
    });

    const activeCustomers = orders.length;
    const conversionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

    // Get average days between orders for repeat customers
    // Simplified: Get orders grouped by customer in date range
    const customerOrders = await prisma.order.findMany({
      where: {
        tenantId,
        processedAt: {
          gte: from,
          lte: to,
          not: null
        },
        customerId: {
          not: null
        }
      },
      select: {
        customerId: true,
        processedAt: true
      },
      orderBy: {
        processedAt: 'asc'
      }
    });

    let totalDaysBetween = 0;
    let repeatCustomerCount = 0;

    // Group orders by customer
    const customerOrderMap = new Map();
    customerOrders.forEach(order => {
      if (!order.customerId || !order.processedAt) return;
      
      const customerId = order.customerId;
      if (!customerOrderMap.has(customerId)) {
        customerOrderMap.set(customerId, []);
      }
      customerOrderMap.get(customerId).push(order.processedAt);
    });

    // Calculate days between orders for repeat customers
    customerOrderMap.forEach((dates, customerId) => {
      if (dates.length > 1) {
        repeatCustomerCount++;
        // Sort dates to ensure correct order
        dates.sort((a, b) => new Date(a) - new Date(b));
        for (let i = 1; i < dates.length; i++) {
          const daysDiff = (new Date(dates[i]) - new Date(dates[i - 1])) / (1000 * 60 * 60 * 24);
          totalDaysBetween += daysDiff;
        }
      }
    });

    const avgDaysBetweenOrders = repeatCustomerCount > 0 
      ? totalDaysBetween / repeatCustomerCount 
      : 0;

    res.json({
      totalCustomers,
      activeCustomers,
      conversionRate: Math.round(conversionRate * 100) / 100,
      repeatCustomers: repeatCustomerCount,
      avgDaysBetweenOrders: Math.round(avgDaysBetweenOrders * 100) / 100
    });
  } catch (error) {
    console.error('Conversion metrics error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;

