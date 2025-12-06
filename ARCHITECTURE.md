# Architecture Documentation

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │  Mobile App  │  │  API Client  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼─────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
          ┌─────────────────▼─────────────────┐
          │      FRONTEND (React + Vite)      │
          │  - Authentication UI              │
          │  - Dashboard & Analytics          │
          │  - Chart Visualizations           │
          └─────────────────┬─────────────────┘
                            │
                            │ HTTP/REST API
                            │
          ┌─────────────────▼─────────────────┐
          │   BACKEND (Node.js + Express)     │
          │  ┌─────────────────────────────┐  │
          │  │   API Routes Layer          │  │
          │  │  - /auth (JWT)              │  │
          │  │  - /tenant (Config)          │  │
          │  │  - /ingest (Sync)            │  │
          │  │  - /insights (Analytics)     │  │
          │  │  - /webhooks (Shopify)       │  │
          │  └──────────┬────────────────────┘  │
          │            │                        │
          │  ┌─────────▼────────────────────┐  │
          │  │   Business Logic Layer       │  │
          │  │  - Auth Middleware           │  │
          │  │  - Shopify Service          │  │
          │  │  - Email Service            │  │
          │  └─────────┬────────────────────┘  │
          │            │                        │
          │  ┌─────────▼────────────────────┐  │
          │  │   Data Access Layer          │  │
          │  │  - Prisma ORM                │  │
          │  └─────────┬────────────────────┘  │
          └────────────┼────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │   DATABASE (PostgreSQL)  │
          │  - Multi-tenant schema   │
          │  - Tenant isolation     │
          └─────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │   EXTERNAL SERVICES     │
          │  ┌──────────────────┐   │
          │  │  Shopify Admin   │   │
          │  │  API (REST)      │   │
          │  └──────────────────┘   │
          │  ┌──────────────────┐   │
          │  │  Shopify Webhooks│   │
          │  │  (Real-time)     │   │
          │  └──────────────────┘   │
          │  ┌──────────────────┐   │
          │  │  SMTP Server     │   │
          │  │  (Email)         │   │
          │  └──────────────────┘   │
          └──────────────────────────┘
```

## Component Architecture

### Frontend Architecture

```
frontend/
├── src/
│   ├── pages/              # Route pages
│   │   ├── Login.jsx       # Authentication
│   │   ├── Signup.jsx     # User registration
│   │   ├── Dashboard.jsx   # Main analytics dashboard
│   │   └── ...
│   ├── components/         # Reusable components
│   │   ├── KpiCards.jsx   # Key metrics display
│   │   ├── OrdersChart.jsx # Time series charts
│   │   ├── RevenueTrendChart.jsx # Revenue trends
│   │   └── ...
│   ├── api/
│   │   └── client.js      # Axios client with JWT
│   └── App.jsx            # Router configuration
```

### Backend Architecture

```
backend/
├── src/
│   ├── routes/            # API endpoints
│   │   ├── auth.js       # Authentication routes
│   │   ├── tenant.js     # Tenant configuration
│   │   ├── ingest.js     # Data sync endpoints
│   │   ├── insights.js   # Analytics endpoints
│   │   └── webhooks.js   # Shopify webhooks
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification
│   ├── services/
│   │   ├── shopifyService.js # Shopify API integration
│   │   └── emailService.js   # Email notifications
│   └── index.js          # Express server setup
└── prisma/
    └── schema.prisma     # Database schema
```

## Data Flow

### 1. Authentication Flow

```
User → Frontend (Login) 
  → POST /auth/login 
  → Backend (Verify credentials)
  → Generate JWT Token
  → Return token to frontend
  → Store in localStorage
  → Attach to subsequent requests
```

### 2. Data Ingestion Flow

#### Polling (Cron Job)
```
Cron Scheduler (Hourly)
  → Fetch all tenants with Shopify config
  → For each tenant:
    → Call Shopify Admin API
    → Fetch customers, products, orders
    → Upsert into database (tenantId isolation)
```

#### Webhook (Real-time)
```
Shopify Event (order created)
  → POST /webhooks/shopify
  → Verify webhook signature
  → Identify tenant by shop domain
  → Process webhook payload
  → Upsert specific record
  → Return 200 (acknowledge)
```

### 3. Analytics Flow

```
Frontend Dashboard
  → User selects date range
  → Multiple parallel API calls:
    → GET /insights/summary
    → GET /insights/orders-by-date
    → GET /insights/top-customers
    → GET /insights/revenue-trend
    → GET /insights/top-products
    → GET /insights/conversion-metrics
  → Backend queries database (filtered by tenantId)
  → Aggregate and calculate metrics
  → Return JSON response
  → Frontend renders charts and tables
```

## Multi-Tenancy Strategy

### Database-Level Isolation

All business tables include a `tenantId` foreign key:

```sql
-- Example: Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  shopify_order_id BIGINT,
  total_price DECIMAL,
  ...
  UNIQUE(tenant_id, shopify_order_id)
);
```

### Application-Level Enforcement

1. **JWT Token**: Contains `tenantId` in payload
2. **Middleware**: Extracts `tenantId` from token
3. **All Queries**: Automatically filtered by `tenantId`
4. **No Cross-Tenant Access**: Impossible at application level

### Tenant Onboarding

```
1. User registers → Creates Tenant + User
2. User logs in → Receives JWT with tenantId
3. User configures Shopify:
   → PUT /tenant/shopify-config
   → Stores shopDomain + accessToken
4. System syncs data:
   → Uses tenantId for all operations
   → Data completely isolated
```

## Security Architecture

### Authentication & Authorization

- **JWT Tokens**: Stateless authentication
- **Token Expiry**: 7 days
- **Password Hashing**: bcryptjs (10 rounds)
- **Password Reset**: Secure token-based flow

### Data Protection

- **Tenant Isolation**: Enforced at database and application level
- **SQL Injection**: Prevented by Prisma ORM
- **XSS Protection**: React automatically escapes
- **CORS**: Configured for frontend domain only

### API Security

- **Rate Limiting**: (To be implemented)
- **Webhook Verification**: HMAC signature validation
- **Environment Variables**: Secrets never in code

## Scalability Considerations

### Current Architecture

- **Single Database**: All tenants share PostgreSQL instance
- **Synchronous Processing**: API calls block until complete
- **In-Memory State**: No session storage needed (JWT)

### Future Scalability

1. **Database Sharding**: Partition by tenantId
2. **Caching Layer**: Redis for frequently accessed data
3. **Message Queue**: RabbitMQ for async webhook processing
4. **Load Balancing**: Multiple backend instances
5. **CDN**: Static frontend assets

## Technology Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Email**: Nodemailer
- **Scheduling**: node-cron

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router
- **HTTP Client**: Axios
- **Charts**: Chart.js + react-chartjs-2

### Infrastructure
- **Database**: PostgreSQL (single instance, multi-tenant)
- **Deployment**: Render/Heroku/Railway (recommended)
- **Email**: SMTP (Gmail, SendGrid, etc.)

## API Endpoints Summary

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Sign in
- `POST /auth/forgot-password` - Request reset
- `POST /auth/reset-password` - Reset password

### Tenant Management
- `PUT /tenant/shopify-config` - Configure Shopify store

### Data Ingestion
- `POST /ingest/full-sync` - Manual sync trigger

### Analytics
- `GET /insights/summary` - Key metrics
- `GET /insights/orders-by-date` - Time series data
- `GET /insights/top-customers` - Top customers
- `GET /insights/revenue-trend` - Revenue trends
- `GET /insights/top-products` - Product performance
- `GET /insights/conversion-metrics` - Conversion analytics

### Webhooks
- `POST /webhooks/shopify` - Shopify webhook receiver

## Database Schema

See `backend/prisma/schema.prisma` for complete schema definition.

Key models:
- **Tenant**: Store configuration
- **User**: Authentication
- **Customer**: Shopify customers
- **Product**: Shopify products
- **Order**: Shopify orders
- **OrderItem**: Order line items
- **Event**: Custom events (bonus)
- **PasswordResetToken**: Password reset tokens

## Deployment Architecture

### Recommended: Render.com

```
┌─────────────────┐
│  Render.com     │
│                 │
│  ┌───────────┐  │
│  │ Frontend  │  │  (Static site)
│  │ (Vite)    │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │ Backend   │  │  (Node.js service)
│  │ (Express) │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │ PostgreSQL│  │  (Managed database)
│  └───────────┘  │
└─────────────────┘
```

### Environment Variables

**Backend:**
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `SMTP_*` (for email)
- `FRONTEND_URL`

**Frontend:**
- `VITE_API_URL`

## Assumptions

1. **Single Database**: All tenants share one PostgreSQL database with schema-level isolation
2. **Shopify Admin API**: Using REST API (not GraphQL)
3. **Email Service**: SMTP-based (Gmail, SendGrid, etc.)
4. **Deployment**: Single region deployment
5. **Scale**: Designed for < 1000 tenants initially
6. **Data Retention**: No automatic data deletion
7. **Webhooks**: Optional but recommended for real-time sync

## Next Steps for Production

1. **Add Rate Limiting**: Protect APIs from abuse
2. **Implement Caching**: Redis for frequently accessed data
3. **Add Monitoring**: Error tracking (Sentry), logging (Winston)
4. **Database Optimization**: Indexes, connection pooling
5. **Webhook Queue**: Process webhooks asynchronously
6. **Backup Strategy**: Automated database backups
7. **CI/CD Pipeline**: Automated testing and deployment
8. **Load Testing**: Verify performance under load
9. **Security Audit**: Penetration testing
10. **Documentation**: API documentation (Swagger/OpenAPI)

