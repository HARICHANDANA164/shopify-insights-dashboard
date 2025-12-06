# Shopify Development Store Setup Guide

## Step 1: Create Free Shopify Development Store

### Option A: Shopify Partners (Recommended)

1. **Sign up for Shopify Partners** (Free)
   - Go to: https://partners.shopify.com/
   - Click "Sign up" or "Log in"
   - Create a free account

2. **Create Development Store**
   - After logging in, go to "Stores" → "Add store"
   - Select "Development store"
   - Fill in:
     - Store name: `My Test Store` (or any name)
     - Store purpose: Select "Development store"
     - Store URL: Choose a unique URL (e.g., `my-test-store-123`)
   - Click "Create development store"

3. **Access Your Store**
   - You'll be redirected to your store admin
   - URL will be: `https://your-store-name.myshopify.com/admin`

### Option B: Free Trial (14 days)

1. Go to: https://www.shopify.com/free-trial
2. Sign up with email
3. Complete store setup
4. You'll have 14 days to test

## Step 2: Set Currency to Indian Rupees (INR)

1. **In Shopify Admin:**
   - Go to: Settings → Store details
   - Find "Store currency"
   - Change to: **Indian rupee (₹)**
   - Click "Save"

2. **Verify Currency:**
   - Go to: Settings → Payments
   - Check currency is set to INR

## Step 3: Add Dummy Products

### Method 1: Manual (Quick)

1. **In Shopify Admin:**
   - Go to: Products → Add product
   - Add products like:
     - **Product 1:**
       - Title: `Wireless Headphones`
       - Price: `₹2,999.00`
       - Description: `Premium wireless headphones`
       - Status: Active
     - **Product 2:**
       - Title: `Smart Watch`
       - Price: `₹4,999.00`
       - Description: `Fitness tracking smartwatch`
     - **Product 3:**
       - Title: `Laptop Stand`
       - Price: `₹1,499.00`
       - Description: `Ergonomic laptop stand`
   - Click "Save" for each product

### Method 2: Bulk Import (Faster)

1. **Create CSV file** (`products.csv`):
   ```csv
   Handle,Title,Body (HTML),Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Grams,Variant Inventory Tracker,Variant Inventory Qty,Variant Inventory Policy,Variant Fulfillment Service,Variant Price,Variant Compare At Price,Variant Requires Shipping,Variant Taxable,Variant Barcode,Image Src,Image Position,Image Alt Text,Gift Card,SEO Title,SEO Description,Google Shopping / Google Product Category,Google Shopping / Gender,Google Shopping / Age Group,Google Shopping / MPN,Google Shopping / AdWords Grouping,Google Shopping / AdWords Labels,Google Shopping / Condition,Google Shopping / Custom Product,Google Shopping / Custom Label 0,Google Shopping / Custom Label 1,Google Shopping / Custom Label 2,Google Shopping / Custom Label 3,Google Shopping / Custom Label 4,Variant Image,Variant Weight Unit,Variant Tax Code,Cost per item,Status
   wireless-headphones,Wireless Headphones,Premium wireless headphones,Electronics,Electronics,headphones,TRUE,Default Title,Default Title,WH-001,200,shopify,10,deny,manual,2999.00,3999.00,TRUE,TRUE,,https://via.placeholder.com/500,1,Headphones,FALSE,,,,,,,,,,,,,,,,,kg,,2999.00,active
   smart-watch,Smart Watch,Fitness tracking smartwatch,Electronics,Electronics,watch,TRUE,Default Title,Default Title,SW-001,150,shopify,15,deny,manual,4999.00,5999.00,TRUE,TRUE,,https://via.placeholder.com/500,1,Smart Watch,FALSE,,,,,,,,,,,,,,,,,kg,,4999.00,active
   laptop-stand,Laptop Stand,Ergonomic laptop stand,Accessories,Accessories,stand,TRUE,Default Title,Default Title,LS-001,500,shopify,20,deny,manual,1499.00,1999.00,TRUE,TRUE,,https://via.placeholder.com/500,1,Laptop Stand,FALSE,,,,,,,,,,,,,,,,,kg,,1499.00,active
   phone-case,Phone Case,Protective phone case,Accessories,Accessories,case,TRUE,Default Title,Default Title,PC-001,50,shopify,30,deny,manual,599.00,999.00,TRUE,TRUE,,https://via.placeholder.com/500,1,Phone Case,FALSE,,,,,,,,,,,,,,,,,kg,,599.00,active
   bluetooth-speaker,Bluetooth Speaker,Portable wireless speaker,Electronics,Electronics,speaker,TRUE,Default Title,Default Title,BS-001,300,shopify,12,deny,manual,2499.00,3499.00,TRUE,TRUE,,https://via.placeholder.com/500,1,Bluetooth Speaker,FALSE,,,,,,,,,,,,,,,,,kg,,2499.00,active
   ```

2. **Import in Shopify:**
   - Go to: Products → Import
   - Upload the CSV file
   - Click "Upload and continue"
   - Review and click "Import products"

## Step 4: Create Dummy Customers

1. **In Shopify Admin:**
   - Go to: Customers → Add customer
   - Add customers:
     - **Customer 1:**
       - First name: `Raj`
       - Last name: `Kumar`
       - Email: `raj.kumar@example.com`
       - Phone: `+91 9876543210`
     - **Customer 2:**
       - First name: `Priya`
       - Last name: `Sharma`
       - Email: `priya.sharma@example.com`
       - Phone: `+91 9876543211`
     - **Customer 3:**
       - First name: `Amit`
       - Last name: `Patel`
       - Email: `amit.patel@example.com`
       - Phone: `+91 9876543212`
   - Click "Save" for each

## Step 5: Create Dummy Orders

1. **In Shopify Admin:**
   - Go to: Orders → Create order
   - Create orders:
     - **Order 1:**
       - Customer: Select `Raj Kumar`
       - Add product: `Wireless Headphones` (Qty: 1)
       - Add product: `Phone Case` (Qty: 2)
       - Shipping: `₹50.00`
       - Total: Should show `₹4,198.00` (₹2,999 + ₹1,198 + ₹50)
       - Mark as: Paid
     - **Order 2:**
       - Customer: Select `Priya Sharma`
       - Add product: `Smart Watch` (Qty: 1)
       - Shipping: `₹50.00`
       - Total: `₹5,049.00`
       - Mark as: Paid
     - **Order 3:**
       - Customer: Select `Amit Patel`
       - Add product: `Laptop Stand` (Qty: 1)
       - Add product: `Bluetooth Speaker` (Qty: 1)
       - Shipping: `₹100.00`
       - Total: `₹4,098.00`
       - Mark as: Paid
   - Click "Create order" for each

## Step 6: Get Admin API Access Token

1. **Create Custom App:**
   - In Shopify Admin, go to: Settings → Apps and sales channels
   - Click "Develop apps" (at bottom)
   - Click "Create an app"
   - Name: `Data Ingestion App`
   - Click "Create app"

2. **Configure API Scopes:**
   - Click "Configure Admin API scopes"
   - Select these scopes:
     - ✅ `read_products`
     - ✅ `read_orders`
     - ✅ `read_customers`
     - ✅ `read_analytics` (optional)
   - Click "Save"

3. **Install App:**
   - Click "Install app"
   - Click "Install" to confirm

4. **Get Access Token:**
   - After installation, you'll see "Admin API access token"
   - Click "Reveal token once"
   - **Copy this token** - you'll need it!

## Step 7: Configure in Your App

1. **Login to your app** (http://localhost:3000)

2. **Get your store domain:**
   - From Shopify admin URL: `https://your-store-name.myshopify.com`
   - Store domain: `your-store-name.myshopify.com`

3. **Configure Shopify:**
   - You can use the API directly or create a simple UI
   - Use this endpoint:
   ```bash
   PUT http://localhost:4000/tenant/shopify-config
   Headers: Authorization: Bearer YOUR_JWT_TOKEN
   Body: {
     "shopDomain": "your-store-name.myshopify.com",
     "accessToken": "shpat_xxxxx"
   }
   ```

   Or use curl:
   ```bash
   curl -X PUT http://localhost:4000/tenant/shopify-config \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "shopDomain": "your-store-name.myshopify.com",
       "accessToken": "shpat_xxxxx"
     }'
   ```

## Step 8: Sync Data

1. **Manual Sync:**
   - In your app dashboard, click "Sync Now" button
   - Or call: `POST http://localhost:4000/ingest/full-sync`

2. **Verify Data:**
   - Check dashboard shows:
     - Products with ₹ prices
     - Customers
     - Orders with INR currency

## Step 9: Verify Currency Display

The app should automatically:
- ✅ Store currency from Shopify (INR)
- ✅ Display prices with ₹ symbol
- ✅ Calculate revenue in rupees
- ✅ Show order totals in INR

## Troubleshooting

### "Invalid API credentials"
- Check shop domain is correct (include `.myshopify.com`)
- Verify access token is correct
- Make sure app is installed and has correct scopes

### "No data synced"
- Check Shopify store has products/orders/customers
- Verify API token has read permissions
- Check backend console for errors

### "Currency not showing correctly"
- Verify Shopify store currency is set to INR
- Check database has correct currency field
- Frontend should format based on currency code

## Next Steps

1. ✅ Store created with INR currency
2. ✅ Dummy data added
3. ✅ API token obtained
4. ✅ App configured
5. ✅ Data synced
6. ✅ Dashboard showing ₹ prices

Your multi-tenant Shopify data ingestion service is now ready!

