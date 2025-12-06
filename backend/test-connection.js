// Quick test script to verify backend setup
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

async function testConnection() {
  console.log('🔍 Testing Backend Setup...\n');

  // Test 1: Environment Variables
  console.log('1. Checking environment variables...');
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  let allSet = true;
  
  for (const key of required) {
    if (process.env[key]) {
      console.log(`   ✅ ${key} is set`);
    } else {
      console.log(`   ❌ ${key} is MISSING`);
      allSet = false;
    }
  }

  if (!allSet) {
    console.log('\n❌ Please set missing environment variables in .env file');
    process.exit(1);
  }

  // Test 2: Database Connection
  console.log('\n2. Testing database connection...');
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('   ✅ Database connection successful');
    
    // Test 3: Check if tables exist
    console.log('\n3. Checking database tables...');
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('tenants', 'users', 'customers', 'products', 'orders')
    `;
    console.log(`   ✅ Found ${tableCount[0].count} required tables`);
    
  } catch (error) {
    console.log('   ❌ Database connection failed');
    console.log('   Error:', error.message);
    console.log('\n   💡 Make sure:');
    console.log('      - PostgreSQL is running');
    console.log('      - DATABASE_URL is correct');
    console.log('      - Database "shopify_mt" exists');
    console.log('      - Run: npm run prisma:migrate');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n✅ All checks passed! Backend is ready.');
  console.log('\n💡 Next steps:');
  console.log('   1. Start backend: npm run dev');
  console.log('   2. Start frontend: cd ../frontend && npm run dev');
  console.log('   3. Open http://localhost:3000');
}

testConnection().catch(console.error);

