// Test script to verify Shopify store connection
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const shopDomain = process.argv[2] || 'admintest.myshopify.com';
const accessToken = process.argv[3] || '';

async function testConnection() {
  console.log('🔍 Testing Shopify Store Connection...\n');
  console.log(`Shop Domain: ${shopDomain}`);
  console.log(`Access Token: ${accessToken ? accessToken.substring(0, 20) + '...' : 'NOT PROVIDED'}\n`);

  if (!accessToken) {
    console.log('❌ Access token not provided');
    console.log('💡 Usage: node test-shopify-connection.js <shop-domain> <access-token>');
    process.exit(1);
  }

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const url = `https://${shopDomain}/admin/api/2024-10/shop.json`;
    
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });

    console.log('   ✅ Connection successful!');
    console.log(`   Store Name: ${response.data.shop.name}`);
    console.log(`   Store Email: ${response.data.shop.email}`);
    console.log(`   Currency: ${response.data.shop.currency}`);
    console.log(`   Domain: ${response.data.shop.domain}`);

    // Test 2: Check products
    console.log('\n2. Testing products API...');
    const productsResponse = await axios.get(`https://${shopDomain}/admin/api/2024-10/products.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });
    console.log(`   ✅ Found ${productsResponse.data.products.length} products`);

    // Test 3: Check customers
    console.log('\n3. Testing customers API...');
    const customersResponse = await axios.get(`https://${shopDomain}/admin/api/2024-10/customers.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });
    console.log(`   ✅ Found ${customersResponse.data.customers.length} customers`);

    // Test 4: Check orders
    console.log('\n4. Testing orders API...');
    const ordersResponse = await axios.get(`https://${shopDomain}/admin/api/2024-10/orders.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });
    console.log(`   ✅ Found ${ordersResponse.data.orders.length} orders`);

    console.log('\n✅ All tests passed! Your Shopify store is accessible.');
    console.log('\n💡 Next steps:');
    console.log('   1. Use this shop domain in your app: ' + shopDomain);
    console.log('   2. Use this access token in your app');
    console.log('   3. Click "Sync Now" in dashboard');

  } catch (error) {
    console.log('   ❌ Connection failed\n');
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        console.log('❌ Error: Invalid access token');
        console.log('💡 Solution: Get a new access token from Shopify Admin');
      } else if (status === 404) {
        console.log('❌ Error: Store not found');
        console.log(`💡 The shop domain "${shopDomain}" does not exist`);
        console.log('\n💡 Possible issues:');
        console.log('   1. Shop domain is incorrect (check for typos)');
        console.log('   2. Store has been deleted or deactivated');
        console.log('   3. Store URL is different');
        console.log('\n💡 How to find correct domain:');
        console.log('   - Go to your Shopify admin');
        console.log('   - Check the URL: https://YOUR-STORE.myshopify.com/admin');
        console.log('   - Use: YOUR-STORE.myshopify.com');
      } else if (status === 403) {
        console.log('❌ Error: Access denied');
        console.log('💡 Solution: Check API token has required permissions');
      } else {
        console.log(`❌ Error: ${status} - ${JSON.stringify(data)}`);
      }
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ Error: Cannot resolve domain');
      console.log(`💡 The domain "${shopDomain}" cannot be found`);
      console.log('💡 Check if the shop domain is correct');
    } else {
      console.log('❌ Error:', error.message);
    }
    
    process.exit(1);
  }
}

testConnection();

