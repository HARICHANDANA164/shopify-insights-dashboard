// Script to check Shopify configuration for a tenant
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function checkShopifyConfig() {
  try {
    console.log('🔍 Checking Shopify configurations...\n');
    
    const tenants = await prisma.tenant.findMany({
      include: {
        users: {
          select: {
            email: true
          }
        }
      }
    });
    
    if (tenants.length === 0) {
      console.log('⚠️  No tenants found. Sign up first!');
      return;
    }
    
    console.log(`📊 Found ${tenants.length} tenant(s):\n`);
    
    tenants.forEach((tenant, index) => {
      console.log(`${index + 1}. Tenant: ${tenant.name}`);
      console.log(`   ID: ${tenant.id}`);
      console.log(`   Users: ${tenant.users.map(u => u.email).join(', ')}`);
      
      if (tenant.shopDomain && tenant.shopifyAccessToken) {
        console.log(`   ✅ Shopify configured:`);
        console.log(`      Domain: ${tenant.shopDomain}`);
        console.log(`      Token: ${tenant.shopifyAccessToken.substring(0, 20)}...`);
      } else {
        console.log(`   ❌ Shopify NOT configured`);
        console.log(`      Domain: ${tenant.shopDomain || 'Not set'}`);
        console.log(`      Token: ${tenant.shopifyAccessToken ? 'Set' : 'Not set'}`);
        console.log(`   💡 Configure at: http://localhost:3000/shopify-config`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkShopifyConfig();

