import express from 'express';
import { runTenantFullSync } from '../services/shopifyService.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /ingest/full-sync
router.post('/full-sync', requireAuth, async (req, res) => {
  try {
    const { tenantId } = req.user;

    const result = await runTenantFullSync(tenantId);

    res.json({
      status: 'ok',
      message: 'Full sync completed',
      synced: result
    });
  } catch (error) {
    console.error('Full sync error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = error.message || 'Sync failed';
    let statusCode = 500;
    
    if (error.message.includes('missing Shopify configuration')) {
      statusCode = 400;
      errorMessage = 'Shopify store not configured. Please configure your Shopify store first.';
    } else if (error.message.includes('Invalid Shopify API credentials')) {
      statusCode = 401;
      errorMessage = 'Invalid Shopify API credentials. Please check your access token.';
    } else if (error.message.includes('Shopify store not found')) {
      statusCode = 404;
      errorMessage = error.message;
    } else if (error.message.includes('rate limit')) {
      statusCode = 429;
      errorMessage = 'Shopify API rate limit exceeded. Please wait a moment and try again.';
    }
    
    res.status(statusCode).json({
      error: 'Sync failed',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;

