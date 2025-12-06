# Sync Troubleshooting Guide

## Common Sync Errors and Solutions

### Error: "Shopify store not configured"

**Problem:** You haven't configured your Shopify store yet.

**Solution:**
1. Go to Dashboard → Click "Configure Shopify"
2. Enter your shop domain (e.g., `my-store.myshopify.com`)
3. Enter your Admin API access token
4. Click "Save Configuration"
5. Try syncing again

---

### Error: "Invalid shop domain format"

**Problem:** Shop domain is in wrong format.

**Correct Format:**
- ✅ `my-store.myshopify.com`
- ✅ `test-shop.myshopify.com`

**Wrong Formats:**
- ❌ `admin@test.myshopify.com` (has email)
- ❌ `https://my-store.myshopify.com` (has protocol - will be auto-removed)
- ❌ `my-store` (missing .myshopify.com)
- ❌ `my store.myshopify.com` (has spaces)

**Solution:**
- Use format: `your-store-name.myshopify.com`
- No email addresses
- No special characters except hyphens
- Must end with `.myshopify.com`

---

### Error: "Invalid Shopify API credentials"

**Problem:** Access token is wrong or expired.

**Solution:**
1. Go to Shopify Admin → Settings → Apps and sales channels
2. Click "Develop apps"
3. Find your app → Click "API credentials"
4. Copy the Admin API access token (starts with `shpat_`)
5. Update in your app configuration

---

### Error: "Shopify store not found"

**Problem:** Shop domain doesn't exist or is incorrect.

**Solution:**
1. Verify your shop domain in Shopify admin URL
2. It should be: `https://your-store.myshopify.com/admin`
3. Use only: `your-store.myshopify.com` (without https://)
4. Make sure store is active

---

### Error: "Access denied" or "403 Forbidden"

**Problem:** API token doesn't have required permissions.

**Solution:**
1. Go to Shopify Admin → Apps → Your app
2. Click "Configure Admin API scopes"
3. Make sure these are selected:
   - ✅ `read_products`
   - ✅ `read_orders`
   - ✅ `read_customers`
4. Save and reinstall the app
5. Get new access token

---

### Error: "Rate limit exceeded"

**Problem:** Too many API requests to Shopify.

**Solution:**
- Wait 1-2 minutes
- Try syncing again
- The app automatically delays requests to avoid rate limits

---

### Error: "Cannot connect to Shopify store"

**Problem:** Network issue or shop domain is wrong.

**Solution:**
1. Check your internet connection
2. Verify shop domain is correct
3. Try accessing `https://your-store.myshopify.com` in browser
4. If it doesn't load, the store might not exist

---

## How to Check Your Configuration

Run this command in backend folder:

```powershell
npm run check:shopify
```

This will show:
- ✅ If Shopify is configured
- ✅ Your shop domain
- ❌ If configuration is missing

---

## Step-by-Step Fix

### 1. Check Current Config
```powershell
cd backend
npm run check:shopify
```

### 2. If Not Configured or Wrong Domain:

**Option A: Use UI**
1. Go to http://localhost:3000/shopify-config
2. Enter correct shop domain
3. Enter access token
4. Save

**Option B: Use API**
```bash
curl -X PUT http://localhost:4000/tenant/shopify-config \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shopDomain": "your-store.myshopify.com",
    "accessToken": "shpat_xxxxx"
  }'
```

### 3. Verify Configuration
```powershell
npm run check:shopify
```

### 4. Try Sync Again
- Go to dashboard
- Click "Sync Now"
- Check error message if it fails

---

## Getting Shopify Credentials

### Step 1: Create Development Store
1. Go to https://partners.shopify.com/
2. Sign up (free)
3. Create development store

### Step 2: Get API Token
1. In Shopify Admin: Settings → Apps and sales channels
2. Click "Develop apps" (bottom)
3. Click "Create an app"
4. Name: "Data Ingestion App"
5. Configure Admin API scopes:
   - `read_products`
   - `read_orders`
   - `read_customers`
6. Install app
7. Copy Admin API access token

### Step 3: Get Shop Domain
- From your Shopify admin URL: `https://your-store.myshopify.com/admin`
- Shop domain is: `your-store.myshopify.com`

---

## Testing Your Configuration

After configuring, test with:

```powershell
# Check config
npm run check:shopify

# Try manual sync via API
curl -X POST http://localhost:4000/ingest/full-sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Still Having Issues?

1. **Check backend console** - Look for detailed error messages
2. **Check browser console** (F12) - See network errors
3. **Verify Shopify store** - Make sure it's active and accessible
4. **Test API token** - Try accessing Shopify API directly:
   ```bash
   curl https://your-store.myshopify.com/admin/api/2024-10/products.json \
     -H "X-Shopify-Access-Token: YOUR_TOKEN"
   ```

If this works, your token is valid. If not, regenerate the token.

