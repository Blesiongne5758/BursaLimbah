# 🚀 BursaLimbah Backend API

Backend API untuk BursaLimbah.com - Marketplace Perdagangan Limbah B2B & B2C di Indonesia

## 📋 Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis (ioredis)
- **Authentication:** JWT + bcrypt
- **Payment:** Midtrans
- **Storage:** Cloudinary
- **AI:** OpenAI GPT-4
- **Validation:** Zod
- **Logging:** Winston

## 🏗️ Architecture

```
backend/
├── src/
│   ├── server.ts              # Main application entry
│   ├── config/                # Configuration management
│   │   └── index.ts
│   ├── lib/                   # Database & cache clients
│   │   ├── prisma.ts
│   │   └── redis.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts           # Authentication
│   │   └── errorHandler.ts   # Error handling
│   ├── routes/                # API routes
│   │   ├── auth.routes.ts
│   │   ├── listing.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── user.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── kyc.routes.ts
│   │   ├── shipping.routes.ts
│   │   ├── chat.routes.ts
│   │   └── health.routes.ts
│   ├── services/              # Business logic
│   │   ├── auth.service.ts
│   │   ├── listing.service.ts
│   │   ├── booking.service.ts
│   │   └── payment.service.ts
│   ├── utils/                 # Utilities
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   ├── validators.ts
│   │   └── security.ts
│   └── types/                 # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
├── logs/                      # Application logs
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 🔐 Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bursalimbah

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Encryption
LOCATION_ENCRYPTION_KEY=your-32-byte-hex-key

# CORS
CORS_ORIGIN=http://localhost:5173

# Midtrans
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_IS_PRODUCTION=false

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@bursalimbah.com

# Sentry
SENTRY_DSN=https://your-sentry-dsn
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/:id` - Get user by ID

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get listing by ID
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `GET /api/listings/my` - Get my listings
- `POST /api/listings/:id/decrypt-location` - Decrypt location

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/validate` - Validate booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments/create` - Create payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/status/:bookingId` - Get payment status
- `POST /api/payments/webhook` - Midtrans webhook
- `POST /api/payments/release/:bookingId` - Release escrow
- `POST /api/payments/refund/:bookingId` - Refund payment

### KYC
- `POST /api/kyc/ktp` - Submit KTP verification
- `POST /api/kyc/npwp` - Submit NPWP verification
- `POST /api/kyc/nib` - Submit NIB verification
- `GET /api/kyc/status` - Get KYC status

### Shipping
- `GET /api/shipping/calculate` - Calculate shipping cost
- `GET /api/shipping/track/:waybill` - Track shipment

### Chat
- `POST /api/chat/agent` - Send message to AI agent
- `GET /api/chat/history` - Get chat history

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/listings` - Get all listings
- `POST /api/admin/listings/:id/moderate` - Moderate listing
- `GET /api/admin/bookings` - Get all bookings

### Health
- `GET /api/health` - Health check
- `GET /api/health/detailed` - Detailed health check
- `GET /api/health/memory` - Memory usage

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Refresh token rotation
- Password hashing with bcrypt (cost factor 12)
- Rate limiting on auth endpoints (5 attempts / 15 min)

### Authorization
- Role-based access control (USER, SELLER, BUYER, ADMIN)
- Membership tier-based feature gates
- Ownership verification for resource access

### Data Protection
- AES-256-GCM encryption for location coordinates
- SHA-256 hashing for location verification
- Encrypted PII at rest
- No sensitive data in logs

### API Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests / 15 min)
- Input validation with Zod
- XSS prevention
- CSRF protection ready

### Compliance
- UU PDP No. 27/2023 (Data Protection)
- PP No. 22/2021 (Environmental Protection)
- KLHK Regulations
- Audit logging

## 🗄️ Database Schema

### Models
- **User** - Core user entity
- **CompanyInfo** - KYB verification data
- **Listing** - Waste listing with privacy masking
- **Booking** - Transaction with escrow
- **Validation** - Post-pickup verification
- **Conversation** - Chat system
- **Message** - Individual messages
- **AuditLog** - Compliance logging

### Enums
- Role (USER, SELLER, BUYER, ADMIN)
- Tier (PERSONAL, SMALL_BUSINESS, CORPORATE)
- KYCStatus (PENDING, VERIFIED, REJECTED)
- WasteCategory (9 categories)
- ListingStatus (DRAFT, PUBLISHED, NEGOTIATING, SOLD, ARCHIVED)
- EscrowStatus (PENDING, HOLD, RELEASED, REFUNDED)
- PaymentMethod (MIDTRANS, XENDIT, BANK_TRANSFER)
- PickupMethod (SELF, COURIER)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring

### Logging
- Winston logger with multiple transports
- Console (development)
- File (error.log, combined.log)
- Structured JSON logging

### Health Checks
- `/api/health` - Basic health check
- `/api/health/detailed` - Check database & Redis
- `/api/health/memory` - Memory usage

### Metrics
- Request logging
- Error tracking
- Performance monitoring

## 🚀 Deployment

### Environment Setup

1. **Database**
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

2. **Redis**
   - Configure Redis URL in `.env`
   - Ensure Redis is running

3. **Build**
   ```bash
   npm run build
   ```

4. **Start**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 📚 API Documentation

API documentation available at:
- Swagger: `/api/docs` (coming soon)
- Postman Collection: `docs/postman_collection.json` (coming soon)

## 🛠️ Development

### Code Style

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Database

```bash
# Open Prisma Studio
npm run prisma:studio

# Reset database (development only)
npx prisma migrate reset

# Seed database
npm run prisma:seed
```

## 📝 License

UNLICENSED - Proprietary Software

## 👥 Team

- **Developer:** BursaLimbah Team
- **Contact:** support@bursalimbah.com

## 🌿 About

BursaLimbah.com adalah marketplace B2B & B2C untuk perdagangan limbah di Indonesia dengan fitur escrow payment, AI assistant, enkripsi lokasi, dan compliance regulasi KLHK.

---

**Made with 🌿 in Indonesia**
