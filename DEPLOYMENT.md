# 🚀 Deployment Guide

## Overview

Panduan lengkap untuk deploy BursaLimbah.com ke production.

## 📋 Prerequisites

- Vercel account
- Domain name (bursalimbah.com)
- PostgreSQL database (Supabase)
- Redis (Upstash)
- Midtrans account
- Cloudinary account
- OpenAI API key

## 🏗️ Architecture

```
┌─────────────────┐
│   Cloudflare    │  ← CDN + DDoS Protection
│   (CDN/DNS)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Vercel      │  ← Frontend + API Routes
│  (Edge Network) │
└────────┬────────┘
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Supabase   │ │   Upstash    │ │  Cloudinary  │
│ (PostgreSQL) │ │   (Redis)    │ │  (Storage)   │
└──────────────┘ └──────────────┘ └──────────────┘
```

## 🚀 Step-by-Step Deployment

### 1. Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Environment Variables:**
```bash
VITE_API_URL=https://bursalimbah.com/api
VITE_MAPBOX_TOKEN=pk.xxxxx
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### 2. Backend Setup (Next.js on Vercel)

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

**Environment Variables:**
```bash
# Database
DATABASE_URL="postgresql://user:password@db.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://bursalimbah.com"
NEXTAUTH_SECRET="your-super-secret-key"

# Encryption
LOCATION_ENCRYPTION_KEY="32-byte-hex-key"

# Midtrans
MIDTRANS_SERVER_KEY="your-server-key"
MIDTRANS_CLIENT_KEY="your-client-key"
MIDTRANS_IS_PRODUCTION=true

# Cloudinary
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# Redis
REDIS_URL="redis://default:password@redis.upstash.io:6379"

# OpenAI
OPENAI_API_KEY="sk-xxxxx"

# Sentry
SENTRY_DSN="https://xxxxx@sentry.io/xxxxx"
```

### 3. Database Setup (Supabase)

```bash
# Install Prisma CLI
npm install -D prisma

# Initialize Prisma
npx prisma init

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### 4. Redis Setup (Upstash)

1. Create Redis database at [upstash.com](https://upstash.com)
2. Copy connection string
3. Add to environment variables

### 5. Storage Setup (Cloudinary)

1. Create Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get API credentials
3. Add to environment variables

### 6. Payment Setup (Midtrans)

1. Create Midtrans account at [midtrans.com](https://midtrans.com)
2. Get Server Key & Client Key
3. Configure webhook URL: `https://bursalimbah.com/api/payment/webhook`
4. Add to environment variables

### 7. Monitoring Setup (Sentry)

```bash
# Install Sentry
npm install @sentry/react @sentry/tracing

# Initialize in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxxxx@sentry.io/xxxxx",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

## 🔒 Security Checklist

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] HSTS headers configured
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Environment variables secured
- [ ] Database backups enabled
- [ ] SSL certificates valid
- [ ] DDoS protection enabled (Cloudflare)
- [ ] WAF rules configured

## 📊 Performance Checklist

- [ ] CDN enabled (Cloudflare)
- [ ] Image optimization enabled
- [ ] Code splitting implemented
- [ ] Lazy loading implemented
- [ ] Caching configured (Redis)
- [ ] Gzip compression enabled
- [ ] HTTP/2 enabled
- [ ] Edge functions deployed
- [ ] Static assets cached
- [ ] Database queries optimized

## 🧪 Testing Checklist

- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Performance audit completed
- [ ] Accessibility audit completed
- [ ] SEO audit completed

## 🚨 Monitoring

### Uptime Monitoring
- [Better Stack Uptime](https://betterstack.com/uptime)
- Monitor: https://bursalimbah.com

### Error Tracking
- [Sentry](https://sentry.io)
- Monitor: All errors in production

### Analytics
- [Google Analytics 4](https://analytics.google.com)
- Track: Page views, conversions, user behavior

### Performance
- [Vercel Analytics](https://vercel.com/analytics)
- Monitor: Core Web Vitals, load times

## 🔄 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 📝 Deployment Commands

### Frontend
```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Deploy to Vercel
vercel --prod
```

### Backend
```bash
# Development
npm run dev

# Build
npm run build

# Database migrations
npx prisma migrate deploy

# Deploy to Vercel
vercel --prod
```

### E2E Tests
```bash
# Install Playwright
npx playwright install

# Run tests
npm run test:e2e

# Run with UI
npm run test:e2e -- --ui
```

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Database Errors
```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### Deployment Errors
```bash
# Check Vercel logs
vercel logs

# Redeploy
vercel --prod --force
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [Midtrans Documentation](https://docs.midtrans.com)

## ✅ Pre-Launch Checklist

- [ ] All tests passing
- [ ] Performance optimized
- [ ] Security hardened
- [ ] Documentation complete
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Disaster recovery plan
- [ ] Legal compliance verified
- [ ] Terms & Privacy published
- [ ] Support channels ready

## 🎯 Post-Launch

1. Monitor error rates
2. Track performance metrics
3. Collect user feedback
4. Iterate based on analytics
5. Plan next features
6. Scale infrastructure as needed

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Ready for Production
