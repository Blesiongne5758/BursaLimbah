# 🔧 Backend Integration Guide

## Overview

Panduan lengkap untuk mengintegrasikan frontend BursaLimbah.com dengan backend Next.js.

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (Upstash)
- Midtrans account
- Cloudinary account
- OpenAI API key

## 🏗️ Backend Architecture

```
Frontend (Vite + React)
    ↓
API Client (src/lib/api.ts)
    ↓
Next.js API Routes (/api/*)
    ↓
├── Prisma ORM
├── PostgreSQL Database
├── Redis Cache
├── Midtrans Payment
└── Cloudinary Storage
```

## 🚀 Step-by-Step Integration

### Step 1: Setup Next.js Backend

```bash
# Create Next.js app
npx create-next-app@latest backend --typescript --tailwind --app

cd backend

# Install dependencies
npm install next-auth@beta @auth/prisma-adapter
npm install @prisma/client bcryptjs jsonwebtoken zod
npm install midtrans-client cloudinary openai
npm install -D prisma @types/bcryptjs @types/jsonwebtoken
```

### Step 2: Setup Database

```bash
# Initialize Prisma
npx prisma init

# Copy schema from prisma/schema.prisma
# (Already created in this project)

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### Step 3: Configure Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bursalimbah"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# JWT
JWT_SECRET="your-jwt-secret-key"

# Encryption
LOCATION_ENCRYPTION_KEY="your-32-byte-hex-key"

# Midtrans
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION=false

# Cloudinary
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# Redis
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY="sk-xxxxx"
```

### Step 4: Copy API Routes

Copy API route templates from `src/backend/api-routes.ts` to your Next.js project:

```
backend/
└── app/
    └── api/
        ├── auth/
        │   ├── login/route.ts
        │   ├── register/route.ts
        │   └── [...nextauth]/route.ts
        ├── listings/
        │   └── route.ts
        ├── bookings/
        │   └── route.ts
        ├── payment/
        │   ├── create/route.ts
        │   └── webhook/route.ts
        └── admin/
            └── route.ts
```

### Step 5: Update Frontend API Client

Update `src/lib/api.ts` to point to your backend:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

### Step 6: Test Integration

```bash
# Start backend
cd backend
npm run dev

# Start frontend
npm run dev

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔐 Authentication Flow

```
1. User submits credentials
   ↓
2. Frontend calls POST /api/auth/login
   ↓
3. Backend validates with Zod
   ↓
4. Backend checks password (bcrypt)
   ↓
5. Backend generates JWT token
   ↓
6. Frontend stores token in localStorage
   ↓
7. Frontend includes token in subsequent requests
   ↓
8. Backend validates token on each request
```

## 💳 Payment Flow

```
1. User creates booking
   ↓
2. Frontend calls POST /api/payment/create
   ↓
3. Backend creates Midtrans transaction
   ↓
4. Frontend redirects to Midtrans
   ↓
5. User completes payment
   ↓
6. Midtrans sends webhook to /api/payment/webhook
   ↓
7. Backend updates booking status
   ↓
8. Frontend polls /api/payment/status
```

## 🗄️ Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_new_field

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

## 🧪 Testing Backend

```bash
# Test API endpoints
npm run test

# Test with coverage
npm run test:coverage

# Test E2E
npm run test:e2e
```

## 🚀 Deployment

### Backend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Database (Supabase)

1. Create PostgreSQL database at [supabase.com](https://supabase.com)
2. Copy connection string
3. Update `DATABASE_URL` in environment variables
4. Run migrations: `npx prisma migrate deploy`

### Redis (Upstash)

1. Create Redis database at [upstash.com](https://upstash.com)
2. Copy connection string
3. Update `REDIS_URL` in environment variables

## 🔒 Security Checklist

- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Input validation (Zod)
- [ ] Password hashing (bcrypt)
- [ ] JWT token validation
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Environment variables secured
- [ ] Database backups enabled
- [ ] Audit logging enabled

## 📊 Monitoring

### Error Tracking
```typescript
// Initialize Sentry
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring
```typescript
// Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
npx prisma db push
```

### Authentication Error
```bash
# Check NEXTAUTH_SECRET
echo $NEXTAUTH_SECRET

# Regenerate secret
openssl rand -base64 32
```

### Payment Webhook Not Working
```bash
# Check webhook URL
# Must be publicly accessible
# Use ngrok for local testing:
ngrok http 3000
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get listing by ID
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking

### Payment
- `POST /api/payment/create` - Create payment
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/status/:id` - Get payment status
- `POST /api/payment/webhook` - Midtrans webhook

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/listings` - Get all listings
- `POST /api/admin/listings/:id/moderate` - Moderate listing
- `GET /api/admin/stats` - Get platform stats

## ✅ Pre-Integration Checklist

- [ ] Backend setup complete
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] API routes implemented
- [ ] Authentication working
- [ ] Payment gateway configured
- [ ] Webhooks tested
- [ ] Security hardened
- [ ] Monitoring setup
- [ ] Documentation complete

## 🎯 Post-Integration

1. Test all API endpoints
2. Verify authentication flow
3. Test payment integration
4. Run E2E tests
5. Monitor error rates
6. Collect user feedback
7. Iterate based on analytics

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Ready for Integration
