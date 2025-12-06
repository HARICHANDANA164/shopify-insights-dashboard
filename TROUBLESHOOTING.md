# Troubleshooting Guide

## Registration Failed Error

If you're seeing "Registration failed" when trying to sign up, follow these steps:

### Step 1: Install Dependencies

Make sure all dependencies are installed:

```powershell
cd backend
npm install
```

### Step 2: Generate Prisma Client

The Prisma client must be generated before the app can run:

```powershell
npm run prisma:generate
```

### Step 3: Run Database Migrations

Create the database tables:

```powershell
npm run prisma:migrate
```

**Note:** Make sure your PostgreSQL database is running and your `.env` file has the correct `DATABASE_URL`.

### Step 4: Check Environment Variables

Ensure your `backend/.env` file has:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/shopify_mt?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=4000
```

### Step 5: Check Backend Server Logs

When you try to register, check the backend console for detailed error messages. Common errors:

- **"PrismaClientKnownRequestError"**: Database connection issue or migration not run
- **"JWT_SECRET is not defined"**: Missing JWT_SECRET in .env
- **"Can't reach database server"**: PostgreSQL not running or wrong DATABASE_URL

### Step 6: Verify Database Connection

Test if your database is accessible:

```powershell
# In backend directory
npx prisma db pull
```

If this fails, check:
- PostgreSQL service is running
- Database `shopify_mt` exists
- DATABASE_URL credentials are correct

## Common Issues

### Issue: "Prisma client not generated"
**Solution:** Run `npm run prisma:generate`

### Issue: "Table does not exist"
**Solution:** Run `npm run prisma:migrate`

### Issue: "Connection refused"
**Solution:** 
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check firewall settings

### Issue: "JWT_SECRET is required"
**Solution:** Add JWT_SECRET to your .env file

## Still Having Issues?

1. Check backend console for error messages
2. Verify all environment variables are set
3. Ensure PostgreSQL is running
4. Try restarting the backend server after running migrations

