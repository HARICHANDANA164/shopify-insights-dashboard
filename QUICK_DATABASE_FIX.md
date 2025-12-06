# Quick Database Fix - Choose One Option

## Option 1: Start PostgreSQL (Recommended)

### Step 1: Start PostgreSQL Service

**Method A - Using Services:**
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find service named like "postgresql-x64-XX" or "PostgreSQL"
4. Right-click → **Start**
5. Right-click → Properties → Set Startup type to **Automatic**

**Method B - Using PowerShell (Run as Administrator):**
```powershell
# Find PostgreSQL service name
Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}

# Start it (replace SERVICE_NAME with actual name)
Start-Service -Name "postgresql-x64-XX"
```

### Step 2: Create Database

Open **pgAdmin** or use command line:

```powershell
# Using psql (if in PATH)
psql -U postgres
# Then type:
CREATE DATABASE shopify_mt;
\q
```

### Step 3: Verify Connection

```powershell
cd backend
npm run test:connection
```

---

## Option 2: Use SQLite (Quick Testing - 2 Minutes)

If you can't get PostgreSQL working right now, use SQLite for testing:

### Step 1: Update Prisma Schema

Edit `backend/prisma/schema.prisma`:

Change this:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

To this:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Step 2: Update .env

Edit `backend/.env`:

Change:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shopify_mt?schema=public"
```

To:
```env
DATABASE_URL="file:./dev.db"
```

### Step 3: Reset and Migrate

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### Step 4: Test

```powershell
npm run test:connection
npm run dev
```

**Note:** SQLite works for testing but use PostgreSQL for production!

---

## Which Option Should You Choose?

- **Option 1** if: You want to use PostgreSQL (production-ready)
- **Option 2** if: You just want to test the app quickly right now

