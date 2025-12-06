# Shopify Multi-Tenant Data Ingestion & Insights Service

A complete full-stack application for ingesting and analyzing Shopify store data with multi-tenant support. Each Shopify store operates as an isolated tenant with its own data and configuration.

**Live Demo**: [Deployed URL - Update with your deployment link]

## 🎯 Project Overview

This service provides:
- **Multi-tenant architecture**: Each Shopify store = one tenant, data isolated by `tenantId`
- **Data ingestion**: Automated sync from Shopify Admin API (customers, products, orders)
- **Real-time webhooks**: Shopify webhooks for instant data updates
- **Analytics dashboard**: Comprehensive insights including KPIs, revenue trends, conversion metrics
- **Authentication**: JWT-based auth with email/password, signup, and password reset
- **Automated sync**: Hourly cron job + webhooks to keep data up-to-date

## 🛠️ Tech Stack

### Backend
- **Node.js 20 LTS**
- **Express.js** - Web framework
- **Prisma ORM** - Database ORM for clean multi-tenant handling
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client for Shopify API
- **node-cron** - Scheduled tasks
- **nodemailer** - Email service

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Chart.js + react-chartjs-2** - Data visualization

## 📋 Assumptions

1. **Database Architecture**: Single PostgreSQL database with schema-level multi-tenancy (all tenants share database, isolated by `tenantId` column)
2. **Shopify Integration**: Using Shopify Admin REST API (2024-10 version)
3. **Authentication**: Email/password with JWT tokens (no OAuth)
4. **Data Sync**: Combination of polling (hourly cron) and webhooks (real-time)
5. **Scale**: Designed for < 1000 tenants initially
6. **Data Retention**: No automatic data deletion or archival
7. **Email Service**: SMTP-based (Gmail, SendGrid, Mailgun supported)
8. **Deployment**: Single-region deployment (no multi-region)
9. **Shopify Store**: Assumes tenant has Admin API access token
10. **Webhook Security**: HMAC verification recommended but optional for development

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation including:
- High-level system architecture diagram
- Component architecture
- Data flow diagrams
- Multi-tenancy strategy
- Security architecture
- Scalability considerations

### Quick Architecture Overview

```
Frontend (React) → Backend (Express) → Prisma ORM → PostgreSQL
                                    ↓
                            Shopify Admin API
                            Shopify Webhooks
```

**Multi-Tenancy**: All database queries filtered by `tenantId` extracted from JWT token.

## 📁 Project Structure

```
shopify-mt-xeno/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── index.js                 # Express server entry point
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js              # Registration, login, password reset
│   │   │   ├── tenant.js            # Tenant Shopify config
│   │   │   ├── ingest.js            # Data sync endpoints
│   │   │   ├── insights.js          # Analytics endpoints
│   │   │   └── webhooks.js          # Shopify webhook receiver
│   │   └── services/
│   │       ├── shopifyService.js    # Shopify API integration
│   │       └── emailService.js       # Email service
│   └── prisma/
│       └── schema.prisma            # Database schema
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   └── client.js            # Axios client with JWT
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── ResetPassword.jsx
│       │   └── Dashboard.jsx
│       └── components/
│           ├── KpiCards.jsx
│           ├── OrdersChart.jsx
│           ├── RevenueTrendChart.jsx
│           ├── TopCustomersTable.jsx
│           ├── TopProductsTable.jsx
│           └── ConversionMetrics.jsx
│
├── ARCHITECTURE.md                  # Detailed architecture docs
├── TROUBLESHOOTING.md              # Troubleshooting guide
└── README.md                        # This file
```

## 🚀 Setup Instructions

### Prerequisites

1. **Node.js 20 LTS** - [Download](https://nodejs.org/)
2. **PostgreSQL** - [Download](https://www.postgresql.org/download/)
3. **Shopify Development Store** - [Create free store](https://partners.shopify.com/)

### Backend Setup

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Edit `.env`:
     ```env
     DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/shopify_mt?schema=public"
     JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
     PORT=4000
     
     # Email Configuration (for password reset)
     SMTP_HOST="smtp.gmail.com"
     SMTP_PORT="587"
     SMTP_SECURE="false"
     SMTP_USER="your-email@gmail.com"
     SMTP_PASSWORD="your-app-password"
     SMTP_FROM="your-email@gmail.com"
     FRONTEND_URL="http://localhost:3000"
     ```

4. **Set up database**
   ```powershell
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start the server**
   ```powershell
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```powershell
   cd frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Edit `.env`:
     ```
     VITE_API_URL=http://localhost:4000
     ```

4. **Start the development server**
   ```powershell
   npm run dev
   ```

### Shopify Store Setup

1. **Create a development store** at [partners.shopify.com](https://partners.shopify.com/)
2. **Create a custom app** in your Shopify admin
3. **Generate Admin API access token**
4. **Configure webhooks** (optional but recommended):
   - Go to Settings → Notifications → Webhooks
   - Create webhooks for: `orders/create`, `orders/update`, `customers/create`, `products/create`
   - Webhook URL: `https://your-backend-url.com/webhooks/shopify`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Create new account | No |
| POST | `/auth/login` | Sign in | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |

### Tenant Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/tenant/shopify-config` | Configure Shopify store | Yes |

**Request Body:**
```json
{
  "shopDomain": "your-store.myshopify.com",
  "accessToken": "shpat_xxxxx"
}
```

### Data Ingestion

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/ingest/full-sync` | Trigger manual full sync | Yes |

### Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/insights/summary?from=YYYY-MM-DD&to=YYYY-MM-DD` | Key metrics (customers, orders, revenue, AOV) | Yes |
| GET | `/insights/orders-by-date?from=...&to=...` | Orders and revenue by date | Yes |
| GET | `/insights/top-customers?limit=5&from=...&to=...` | Top customers by spend | Yes |
| GET | `/insights/revenue-trend?period=day&from=...&to=...` | Revenue trend (day/week/month) | Yes |
| GET | `/insights/top-products?limit=5&from=...&to=...` | Top products by revenue | Yes |
| GET | `/insights/conversion-metrics?from=...&to=...` | Conversion and retention metrics | Yes |

### Webhooks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/webhooks/shopify` | Receive Shopify webhooks | No (HMAC verified) |

## 🗄️ Database Schema

### Models

#### Tenant
- `id` (UUID, Primary Key)
- `name` (String)
- `shopDomain` (String, Unique)
- `shopifyAccessToken` (String, Optional)
- `createdAt`, `updatedAt` (Timestamps)

#### User
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `role` (String, Default: "admin")
- `tenantId` (UUID, Foreign Key → Tenant)
- `createdAt`, `updatedAt` (Timestamps)

#### Customer
- `id` (UUID, Primary Key)
- `tenantId` (UUID, Foreign Key → Tenant)
- `shopifyCustomerId` (BigInt)
- `firstName`, `lastName`, `email`, `phone` (String, Optional)
- `createdAt`, `updatedAt` (DateTime)
- **Unique**: `(tenantId, shopifyCustomerId)`

#### Product
- `id` (UUID, Primary Key)
- `tenantId` (UUID, Foreign Key → Tenant)
- `shopifyProductId` (BigInt)
- `title` (String)
- `status` (String, Optional)
- `createdAt`, `updatedAt` (DateTime)
- **Unique**: `(tenantId, shopifyProductId)`

#### Order
- `id` (UUID, Primary Key)
- `tenantId` (UUID, Foreign Key → Tenant)
- `shopifyOrderId` (BigInt)
- `orderNumber` (String, Optional)
- `customerId` (UUID, Foreign Key → Customer, Optional)
- `totalPrice` (Float)
- `currency` (String, Default: "USD")
- `financialStatus` (String, Optional)
- `processedAt` (DateTime, Optional)
- `createdAt`, `updatedAt` (Timestamps)
- **Unique**: `(tenantId, shopifyOrderId)`

#### OrderItem
- `id` (UUID, Primary Key)
- `tenantId` (UUID, Foreign Key → Tenant)
- `orderId` (UUID, Foreign Key → Order)
- `productId` (UUID, Foreign Key → Product, Optional)
- `quantity` (Int)
- `price` (Float)

#### Event (Bonus)
- `id` (UUID, Primary Key)
- `tenantId` (UUID, Foreign Key → Tenant)
- `customerId` (UUID, Foreign Key → Customer, Optional)
- `eventType` (String)
- `metadata` (JSON, Optional)
- `occurredAt` (DateTime)

#### PasswordResetToken
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → User)
- `token` (String, Unique)
- `expiresAt` (DateTime)
- `used` (Boolean, Default: false)
- `createdAt` (DateTime)

### Multi-Tenancy

All business tables (Customer, Product, Order, OrderItem, Event) include:
- `tenantId` foreign key to Tenant table
- Unique compound indexes on `(tenantId, shopifyId)` to prevent duplicates
- Cascade delete when tenant is deleted

## 🚢 Deployment Guide

### Option 1: Render.com (Recommended)

#### Backend Deployment

1. **Create PostgreSQL Database**
   - Go to Render Dashboard → New → PostgreSQL
   - Copy the `Internal Database URL`

2. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install && npm run prisma:generate`
   - Start Command: `npm run prisma:migrate && npm start`
   - Environment Variables:
     ```
     DATABASE_URL=<from PostgreSQL service>
     JWT_SECRET=<generate strong random string>
     PORT=4000
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=<your-email>
     SMTP_PASSWORD=<app-password>
     FRONTEND_URL=<your-frontend-url>
     ```

#### Frontend Deployment

1. **Create Static Site**
   - New → Static Site
   - Connect your GitHub repo
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=<your-backend-url>
     ```

### Option 2: Railway

1. **Create Project** → Add PostgreSQL → Add GitHub Repo
2. **Backend Service**:
   - Root Directory: `backend`
   - Build: `npm install && npm run prisma:generate`
   - Start: `npm run prisma:migrate && npm start`
3. **Frontend Service**:
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Start: `npm run preview`

### Option 3: Heroku

```bash
# Backend
cd backend
heroku create your-app-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your-secret
git push heroku main

# Frontend
cd frontend
heroku create your-app-frontend --buildpack https://github.com/mars/create-react-app-buildpack.git
heroku config:set VITE_API_URL=https://your-app-backend.herokuapp.com
git push heroku main
```

### Post-Deployment

1. **Run Database Migrations**
   ```bash
   heroku run npm run prisma:migrate --app your-app-backend
   ```

2. **Update Shopify Webhook URLs**
   - Update webhook URLs in Shopify admin to point to your deployed backend

## 📊 Dashboard Features

### Key Metrics (KPI Cards)
- Total Customers
- Total Orders
- Total Revenue
- Average Order Value

### Conversion Metrics
- Active Customers
- Conversion Rate
- Repeat Customers
- Average Days Between Orders

### Charts
- **Orders & Revenue Over Time**: Dual-axis line chart showing daily orders and revenue
- **Revenue Trend**: Revenue trend with period selector (Daily/Weekly/Monthly)

### Tables
- **Top Customers**: Top 5 customers by total spend
- **Top Products**: Top 5 products by revenue

### Features
- Date range filtering (default: last 30 days)
- Manual sync button
- Real-time data updates
- Responsive design

## 🔄 Data Sync Strategy

### Polling (Cron Job)
- **Frequency**: Every hour
- **Process**: Fetches all tenants with Shopify config → Full sync for each
- **Use Case**: Ensures data consistency, handles missed webhooks

### Webhooks (Real-time)
- **Events**: `orders/create`, `orders/update`, `customers/create`, `products/create`
- **Process**: Shopify → POST `/webhooks/shopify` → Upsert specific record
- **Use Case**: Instant updates for new orders, customers, products

## 🔐 Security

- **JWT Authentication**: Stateless, 7-day expiry
- **Password Hashing**: bcryptjs (10 rounds)
- **Multi-Tenant Isolation**: Enforced at database and application level
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **CORS**: Configured for frontend domain
- **Webhook Verification**: HMAC signature validation (optional)

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration
- [ ] User login
- [ ] Password reset flow
- [ ] Shopify store configuration
- [ ] Manual data sync
- [ ] Dashboard data loading
- [ ] Date range filtering
- [ ] Webhook reception (if configured)

## 📝 Known Limitations

1. **No Pagination**: Insights endpoints may be slow with very large datasets
2. **No Rate Limiting**: API endpoints not rate-limited (add for production)
3. **Single Database**: All tenants share one database (consider sharding at scale)
4. **Synchronous Webhooks**: Webhooks processed synchronously (add queue for scale)
5. **No Data Retention**: No automatic data deletion or archival
6. **No Email Verification**: Signup doesn't verify email (add for production)
7. **No RBAC**: Single admin role (add roles for production)

## 🔮 Next Steps to Productionize

1. **Performance**
   - [ ] Add Redis caching for frequently accessed data
   - [ ] Implement database connection pooling
   - [ ] Add pagination to all list endpoints
   - [ ] Optimize database queries with proper indexes

2. **Reliability**
   - [ ] Add retry logic for Shopify API calls
   - [ ] Implement webhook queue (RabbitMQ/Redis)
   - [ ] Add database backup strategy
   - [ ] Implement health checks and monitoring

3. **Security**
   - [ ] Add rate limiting (express-rate-limit)
   - [ ] Implement email verification
   - [ ] Add role-based access control (RBAC)
   - [ ] Security audit and penetration testing
   - [ ] Enable webhook HMAC verification

4. **Monitoring & Observability**
   - [ ] Add error tracking (Sentry)
   - [ ] Add logging (Winston)
   - [ ] Add metrics (Prometheus)
   - [ ] Set up alerts

5. **Developer Experience**
   - [ ] API documentation (Swagger/OpenAPI)
   - [ ] Unit and integration tests
   - [ ] CI/CD pipeline
   - [ ] Docker support

6. **Scalability**
   - [ ] Database sharding by tenant
   - [ ] Load balancing
   - [ ] CDN for static assets
   - [ ] Horizontal scaling

## 📚 Additional Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions

## 📄 License

ISC

## 👤 Author

[Your Name]

## 🤝 Contributing

This is an assignment project. For questions or issues, please create an issue in the repository.

---

**Note**: This project was built as part of an assignment to demonstrate multi-tenant architecture, API integration, and full-stack development skills.
