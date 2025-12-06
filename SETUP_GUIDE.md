# Complete Setup & Run Guide

Follow these steps in order to get the app running.

## Prerequisites Check

1. **Node.js 20** installed
   ```powershell
   node --version
   # Should show v20.x.x
   ```

2. **PostgreSQL** installed and running
   - Check if PostgreSQL service is running
   - Default port: 5432

3. **Database created**
   - Database name: `shopify_mt`
   - Or use the one in your DATABASE_URL

## Step-by-Step Setup

### Step 1: Backend Setup

1. **Navigate to backend folder**
   ```powershell
   cd backend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Create .env file** (if not exists)
   - Copy the template below and create `.env` file in `backend/` folder
   - **IMPORTANT**: Update `DATABASE_URL` with your PostgreSQL password

   ```env
   # Database - UPDATE THE PASSWORD!
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/shopify_mt?schema=public"

   # JWT Secret (keep this secret!)
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

   # Server Port
   PORT=4000

   # Email Configuration (optional - only needed for password reset)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER=""
   SMTP_PASSWORD=""
   SMTP_FROM=""
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Test connection** (optional but recommended)
   ```powershell
   npm run test:connection
   ```
   This will verify your database connection and environment variables.

5. **Generate Prisma Client**
   ```powershell
   npm run prisma:generate
   ```

6. **Run Database Migrations**
   ```powershell
   npm run prisma:migrate
   ```
   This creates all the database tables.

7. **Start Backend Server**
   ```powershell
   npm run dev
   ```
   
   You should see:
   ```
   Server running on http://localhost:4000
   Health check: http://localhost:4000/health
   ```

   **Keep this terminal open!**

### Step 2: Frontend Setup

1. **Open a NEW terminal window** (keep backend running)

2. **Navigate to frontend folder**
   ```powershell
   cd frontend
   ```

3. **Install dependencies**
   ```powershell
   npm install
   ```

4. **Create .env file**
   - Create `.env` file in `frontend/` folder
   - Add this line:
   ```env
   VITE_API_URL=http://localhost:4000
   ```

5. **Start Frontend Server**
   ```powershell
   npm run dev
   ```
   
   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:3000/
   ```

   **Keep this terminal open too!**

### Step 3: Verify Everything Works

1. **Test Backend Health**
   - Open browser: http://localhost:4000/health
   - Should show: `{"status":"ok","timestamp":"..."}`

2. **Test Frontend**
   - Open browser: http://localhost:3000
   - Should show login page

3. **Create Account**
   - Click "Sign Up"
   - Enter:
     - Tenant Name: `My Store`
     - Email: `test@example.com`
     - Password: `password123` (at least 6 characters)
   - Click "Sign Up"
   - Should redirect to dashboard

## Quick Start Commands (After Initial Setup)

Once everything is set up, you only need:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

## Troubleshooting

### Backend won't start

1. **Check .env file exists** in `backend/` folder
2. **Check DATABASE_URL** - make sure password is correct
3. **Check PostgreSQL is running**
4. **Check port 4000 is not in use**

### Frontend won't connect

1. **Check backend is running** on http://localhost:4000/health
2. **Check .env file** in `frontend/` folder has `VITE_API_URL=http://localhost:4000`
3. **Restart frontend** after changing .env

### Database errors

1. **Run migrations again:**
   ```powershell
   cd backend
   npm run prisma:migrate
   ```

2. **Check database exists:**
   - Open pgAdmin or psql
   - Verify `shopify_mt` database exists

### "JWT_SECRET is not set"

- Make sure `.env` file exists in `backend/` folder
- Check it has `JWT_SECRET=...` line
- Restart backend server

## Project Structure

```
shopify-mt-xeno/
├── backend/
│   ├── .env              ← CREATE THIS with your config
│   ├── src/
│   └── prisma/
│
└── frontend/
    ├── .env              ← CREATE THIS with VITE_API_URL
    └── src/
```

## Next Steps After Setup

1. **Sign up** with a new account
2. **Configure Shopify** (optional):
   - Get Shopify Admin API token
   - Call `PUT /tenant/shopify-config` with shop domain and token
3. **Sync data** from Shopify
4. **View dashboard** with analytics

## Production Deployment

For production, see the deployment section in README.md

