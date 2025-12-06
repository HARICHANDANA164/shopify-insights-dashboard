# Database Connection Fix

## The Problem

Your backend can't connect to PostgreSQL. The error shows:
```
Can't reach database server at `localhost:5432`
```

## Solutions (Try in Order)

### Solution 1: Start PostgreSQL Service

**Windows:**
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "PostgreSQL" service
4. Right-click → Start (if stopped)
5. Make sure it's set to "Automatic" startup

**Or use Command Prompt (as Administrator):**
```cmd
net start postgresql-x64-XX
```
(Replace XX with your PostgreSQL version number)

### Solution 2: Check PostgreSQL is Running

```powershell
# Check if PostgreSQL is listening on port 5432
Test-NetConnection -ComputerName localhost -Port 5432
```

If it says "TcpTestSucceeded: False", PostgreSQL is not running.

### Solution 3: Verify Database Exists

1. Open **pgAdmin** (PostgreSQL GUI tool)
2. Connect to your PostgreSQL server
3. Check if database `shopify_mt` exists
4. If not, create it:
   ```sql
   CREATE DATABASE shopify_mt;
   ```

**Or use psql command line:**
```powershell
psql -U postgres
# Then in psql:
CREATE DATABASE shopify_mt;
\q
```

### Solution 4: Check DATABASE_URL in .env

Open `backend/.env` and verify:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/shopify_mt?schema=public"
```

**Important:**
- Replace `YOUR_PASSWORD` with your actual PostgreSQL password
- Make sure port is `5432` (or your PostgreSQL port)
- Make sure database name is `shopify_mt`

### Solution 5: Test Connection Manually

```powershell
# Try connecting with psql
psql -U postgres -d shopify_mt -h localhost -p 5432
```

If this fails, your PostgreSQL is not accessible.

### Solution 6: Use Different Port

If PostgreSQL is on a different port, update `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/shopify_mt?schema=public"
```

## Quick Fix Checklist

- [ ] PostgreSQL service is running
- [ ] Database `shopify_mt` exists
- [ ] `.env` has correct DATABASE_URL with correct password
- [ ] Port 5432 is not blocked by firewall
- [ ] PostgreSQL is listening on localhost

## After Fixing

1. **Test connection:**
   ```powershell
   cd backend
   npm run test:connection
   ```

2. **If test passes, run migrations:**
   ```powershell
   npm run prisma:migrate
   ```

3. **Start backend:**
   ```powershell
   npm run dev
   ```

## Alternative: Use SQLite for Testing (Quick Workaround)

If you can't get PostgreSQL working, you can temporarily use SQLite:

1. Change `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. Update `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. Run migrations:
   ```powershell
   npm run prisma:migrate
   ```

**Note:** SQLite is for testing only. Use PostgreSQL for production.

