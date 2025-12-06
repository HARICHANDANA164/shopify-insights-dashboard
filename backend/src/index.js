import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { runTenantFullSync } from './services/shopifyService.js';

// Import routes
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenant.js';
import ingestRoutes from './routes/ingest.js';
import insightsRoutes from './routes/insights.js';
import webhookRoutes from './routes/webhooks.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in environment variables!');
  console.error('Please set JWT_SECRET in your .env file');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set in environment variables!');
  console.error('Please set DATABASE_URL in your .env file');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/tenant', tenantRoutes);
app.use('/ingest', ingestRoutes);
app.use('/insights', insightsRoutes);
app.use('/webhooks', webhookRoutes);

// Cron job: Run every hour to sync all tenants
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled sync for all tenants...');
  
  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        shopifyAccessToken: {
          not: null
        }
      }
    });

    console.log(`Found ${tenants.length} tenants with Shopify config`);

    for (const tenant of tenants) {
      try {
        await runTenantFullSync(tenant.id);
        console.log(`Successfully synced tenant ${tenant.id}`);
      } catch (error) {
        console.error(`Failed to sync tenant ${tenant.id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in scheduled sync:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

