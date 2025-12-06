import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// PUT /tenant/shopify-config
router.put('/shopify-config', requireAuth, async (req, res) => {
  try {
    const { shopDomain, accessToken } = req.body;
    const { tenantId } = req.user;

    if (!shopDomain || !accessToken) {
      return res.status(400).json({ error: 'shopDomain and accessToken are required' });
    }

    // Validate shop domain format
    const shopDomainTrimmed = shopDomain.trim();
    if (!shopDomainTrimmed.includes('.myshopify.com')) {
      return res.status(400).json({ 
        error: 'Invalid shop domain format. Must be: your-store.myshopify.com',
        hint: 'Shop domain should end with .myshopify.com (e.g., my-store.myshopify.com)'
      });
    }

    // Remove protocol if present
    let cleanDomain = shopDomainTrimmed.replace(/^https?:\/\//, '');
    // Remove trailing slash
    cleanDomain = cleanDomain.replace(/\/$/, '');
    
    // Validate it's a proper myshopify.com domain
    if (!/^[a-zA-Z0-9-]+\.myshopify\.com$/.test(cleanDomain)) {
      return res.status(400).json({ 
        error: 'Invalid shop domain format',
        hint: 'Shop domain should be like: your-store.myshopify.com (no email, no special characters except hyphens)'
      });
    }

    // Update tenant with Shopify config
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        shopDomain: cleanDomain,
        shopifyAccessToken: accessToken.trim()
      }
    });

    res.json({
      message: 'Shopify configuration updated',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        shopDomain: tenant.shopDomain
      }
    });
  } catch (error) {
    console.error('Shopify config update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

