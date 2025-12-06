# Shopify Store Setup - Step by Step

## The Error You're Seeing

**"Shopify store not found. Check if shop domain 'admintest.myshopify.com' is correct."**

This means the shop domain doesn't exist or is incorrect.

## Solution: Create a Shopify Development Store

### Step 1: Sign Up for Shopify Partners (FREE)

1. Go to: **https://partners.shopify.com/**
2. Click **"Sign up"** (or "Log in" if you have an account)
3. Fill in:
   - Email address
   - Password
   - Name
4. Verify your email

### Step 2: Create Development Store

1. After logging in, click **"Stores"** in left menu
2. Click **"Add store"** button
3. Select **"Development store"**
4. Fill in:
   - **Store name**: `My Test Store` (or any name)
   - **Store purpose**: Select "Development store"
   - **Store URL**: Choose a unique name (e.g., `my-test-shop-123`)
     - This becomes: `my-test-shop-123.myshopify.com`
5. Click **"Create development store"**

### Step 3: Get Your Shop Domain

After creating the store:

1. You'll be redirected to your store admin
2. Look at the URL: `https://my-test-shop-123.myshopify.com/admin`
3. Your **shop domain** is: `my-test-shop-123.myshopify.com`
   - **NOT** the full URL
   - **NOT** with `https://`
   - **NOT** with `/admin`
   - Just: `my-test-shop-123.myshopify.com`

### Step 4: Set Currency to INR (Rupees)

1. In Shopify Admin, go to: **Settings** → **Store details**
2. Find **"Store currency"**
3. Change to: **Indian rupee (₹)**
4. Click **"Save"**

### Step 5: Add Dummy Data

#### Add Products:

1. Go to: **Products** → **Add product**
2. Add products like:
   - **Wireless Headphones** - Price: `₹2,999.00`
   - **Smart Watch** - Price: `₹4,999.00`
   - **Laptop Stand** - Price: `₹1,499.00`
3. Click **"Save"** for each

#### Add Customers:

1. Go to: **Customers** → **Add customer**
2. Add 2-3 customers with names and emails
3. Click **"Save"**

#### Create Orders:

1. Go to: **Orders** → **Create order**
2. Select a customer
3. Add products
4. Mark as **Paid**
5. Click **"Create order"**

### Step 6: Get Admin API Access Token

1. In Shopify Admin: **Settings** → **Apps and sales channels**
2. Scroll down, click **"Develop apps"**
3. Click **"Create an app"**
4. Name: `Data Ingestion App`
5. Click **"Create app"**
6. Click **"Configure Admin API scopes"**
7. Select these scopes:
   - ✅ `read_products`
   - ✅ `read_orders`
   - ✅ `read_customers`
8. Click **"Save"**
9. Click **"Install app"**
10. Click **"Install"** to confirm
11. You'll see **"Admin API access token"**
12. Click **"Reveal token once"**
13. **Copy the token** (starts with `shpat_`)

### Step 7: Test Your Connection

Before configuring in your app, test the connection:

```powershell
cd backend
npm run test:shopify your-store-name.myshopify.com shpat_your_token_here
```

Replace:
- `your-store-name.myshopify.com` with your actual shop domain
- `shpat_your_token_here` with your actual access token

If test passes, you'll see:
```
✅ Connection successful!
✅ Found X products
✅ Found X customers
✅ Found X orders
```

### Step 8: Configure in Your App

1. Go to: http://localhost:3000/shopify-config
2. Enter:
   - **Shop Domain**: `your-store-name.myshopify.com` (from Step 3)
   - **Access Token**: `shpat_xxxxx` (from Step 6)
3. Click **"Save Configuration"**
4. Go to Dashboard
5. Click **"Sync Now"**

## Common Mistakes

### ❌ Wrong Shop Domain Formats:
- `admin@test.myshopify.com` (has email)
- `https://my-store.myshopify.com` (has protocol)
- `my-store.myshopify.com/admin` (has path)
- `my store.myshopify.com` (has spaces)

### ✅ Correct Format:
- `my-store.myshopify.com`
- `test-shop-123.myshopify.com`
- `my-shop.myshopify.com`

## Quick Checklist

- [ ] Shopify Partners account created
- [ ] Development store created
- [ ] Shop domain noted (e.g., `my-store.myshopify.com`)
- [ ] Currency set to INR (₹)
- [ ] Products added (at least 2-3)
- [ ] Customers added (at least 2-3)
- [ ] Orders created (at least 1-2)
- [ ] Custom app created
- [ ] API scopes configured
- [ ] App installed
- [ ] Access token copied
- [ ] Connection tested (npm run test:shopify)
- [ ] Configured in app (/shopify-config)
- [ ] Sync successful

## Still Getting "Store not found"?

1. **Double-check shop domain:**
   - Go to your Shopify admin
   - Look at the URL
   - Copy only the domain part (before `/admin`)

2. **Test connection manually:**
   ```powershell
   npm run test:shopify your-store.myshopify.com your-token
   ```

3. **Verify store exists:**
   - Try accessing: `https://your-store.myshopify.com` in browser
   - If it doesn't load, store might not exist

4. **Check for typos:**
   - Common: `admintest` vs `admin-test`
   - Make sure no spaces or special characters

## Need Help?

If you're still stuck:
1. Run: `npm run check:shopify` to see current config
2. Run: `npm run test:shopify <domain> <token>` to test connection
3. Check backend console for detailed error messages

