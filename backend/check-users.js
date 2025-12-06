// Quick script to check if users exist in database
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking database...\n');
    
    // Check if database is accessible
    await prisma.$connect();
    console.log('✅ Database connected\n');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`📊 Total users: ${userCount}`);
    
    if (userCount > 0) {
      // List all users (without passwords)
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          tenantId: true,
          createdAt: true
        }
      });
      
      console.log('\n👥 Users in database:');
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      });
    } else {
      console.log('\n⚠️  No users found in database.');
      console.log('💡 You need to sign up first!');
    }
    
    // Count tenants
    const tenantCount = await prisma.tenant.count();
    console.log(`\n🏢 Total tenants: ${tenantCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Run: npm run prisma:migrate');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

