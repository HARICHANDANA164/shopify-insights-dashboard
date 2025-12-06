# Quick Fix Guide - Authentication Issues

## Common Issues and Solutions

### 1. "Cannot connect to server" Error

**Problem**: Frontend can't reach backend

**Solution**:
1. Make sure backend is running:
   ```powershell
   cd backend
   npm run dev
   ```
   You should see: `Server running on http://localhost:4000`

2. Check your frontend `.env` file:
   ```
   VITE_API_URL=http://localhost:4000
   ```

3. Restart frontend after changing `.env`:
   ```powershell
   cd frontend
   npm run dev
   ```

### 2. "JWT_SECRET is not set" Error

**Problem**: Backend missing JWT_SECRET

**Solution**:
1. Open `backend/.env`
2. Add this line:
   ```
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```
3. Restart backend server

### 3. "Database error" or "PrismaClientKnownRequestError"

**Problem**: Database connection issue

**Solution**:
1. Make sure PostgreSQL is running
2. Check `backend/.env` has correct DATABASE_URL:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/shopify_mt?schema=public"
   ```
3. Run migrations:
   ```powershell
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   ```

### 4. "User with this email already exists"

**Problem**: Trying to register with existing email

**Solution**: Use a different email or login instead

### 5. "Invalid credentials"

**Problem**: Wrong email or password

**Solution**: 
- Check you're using the correct email
- Try resetting password if you forgot it

## Step-by-Step Setup (Fresh Start)

1. **Backend Setup**:
   ```powershell
   cd backend
   npm install
   # Create .env file with:
   # DATABASE_URL="postgresql://postgres:password@localhost:5432/shopify_mt?schema=public"
   # JWT_SECRET="your-secret-key-here"
   # PORT=4000
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

2. **Frontend Setup** (in new terminal):
   ```powershell
   cd frontend
   npm install
   # Create .env file with:
   # VITE_API_URL=http://localhost:4000
   npm run dev
   ```

3. **Test**:
   - Open http://localhost:3000
   - Try signing up with a new email
   - If errors, check backend console for details

## Debugging Tips

1. **Check Backend Console**: Look for error messages when you try to sign up/login
2. **Check Browser Console**: Press F12, look at Console tab for errors
3. **Check Network Tab**: Press F12 → Network tab, see if requests are failing
4. **Test Backend Directly**: 
   - Open http://localhost:4000/health
   - Should return: `{"status":"ok","timestamp":"..."}`

## Still Having Issues?

1. Make sure both servers are running (backend on 4000, frontend on 3000)
2. Check all environment variables are set
3. Verify database is running and accessible
4. Check for port conflicts (something else using port 4000 or 3000)
5. Try clearing browser cache/localStorage

