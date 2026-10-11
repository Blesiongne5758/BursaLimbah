# 🔧 Backend Setup Guide

## Overview

Panduan lengkap untuk setup backend BursaLimbah.com menggunakan Next.js, Prisma, PostgreSQL, dan NextAuth.js.

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, untuk caching)
- Midtrans account (untuk payment)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Create Next.js app
npx create-next-app@latest backend --typescript --tailwind --app

cd backend

# Install core dependencies
npm install next-auth@beta @auth/prisma-adapter
npm install @prisma/client bcryptjs jsonwebtoken zod
npm install midtrans-client cloudinary

# Install dev dependencies
npm install -D prisma @types/bcryptjs @types/jsonwebtoken
```

### 2. Setup Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bursalimbah"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Encryption
LOCATION_ENCRYPTION_KEY="your-32-byte-hex-key-here"

# Midtrans
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION=false

# Cloudinary
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# Redis (optional)
REDIS_URL="redis://localhost:6379"
```

### 3. Setup Prisma

```bash
# Initialize Prisma
npx prisma init

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

## 🗄️ Database Schema

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  SELLER
  BUYER
  ADMIN
}

enum Tier {
  PERSONAL
  SMALL_BUSINESS
  CORPORATE
}

enum KYCStatus {
  PENDING
  VERIFIED
  REJECTED
}

enum WasteCategory {
  PLASTIC
  PAPER
  METAL
  ELECTRONIC
  ORGANIC
  B3
  INDUSTRIAL
  TEXTILE
  CONSTRUCTION
}

enum ListingStatus {
  DRAFT
  PUBLISHED
  NEGOTIATING
  SOLD
  ARCHIVED
}

enum EscrowStatus {
  PENDING
  HOLD
  RELEASED
  REFUNDED
}

enum PaymentMethod {
  MIDTRANS
  XENDIT
  BANK_TRANSFER
}

enum PickupMethod {
  SELF
  COURIER
}

model User {
  id              String   @id @default(cuid())
  email           String   @unique
  phone           String?
  passwordHash    String
  name            String
  role            Role     @default(USER)
  membershipTier  Tier     @default(PERSONAL)
  kycStatus       KYCStatus @default(PENDING)
  companyInfo     CompanyInfo?
  listings        Listing[]
  bookings        Booking[]
  conversations   ConversationParticipant[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model CompanyInfo {
  userId          String   @id
  user            User     @relation(fields: [userId], references: [id])
  companyName     String
  npwp            String?
  nib             String?
  businessLicense String?
  industrySector  String?
}

model Listing {
  id              String   @id @default(cuid())
  sellerId        String
  seller          User     @relation(fields: [sellerId], references: [id])
  category        WasteCategory
  subCategory     String
  title           String
  description     String
  quantity        Float
  unit            String
  basePrice       Decimal
  negotiable      Boolean  @default(true)
  city            String
  province        String
  encryptedCoords String
  locationHash    String
  status          ListingStatus @default(DRAFT)
  aiGenerated     Boolean  @default(false)
  bookings        Booking[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Booking {
  id              String   @id @default(cuid())
  listingId       String
  listing         Listing  @relation(fields: [listingId], references: [id])
  buyerId         String
  buyer           User     @relation(fields: [buyerId], references: [id])
  pickupDate      DateTime
  downPayment     Decimal
  finalPrice      Decimal?
  quantity        Float
  pricePerKg      Decimal
  totalPrice      Decimal
  paymentMethod   PaymentMethod
  escrowStatus    EscrowStatus @default(PENDING)
  pickupMethod    PickupMethod
  courierId       String?
  validation      Validation?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Validation {
  bookingId       String   @id
  booking         Booking  @relation(fields: [bookingId], references: [id])
  actualQuantity  Float
  actualPhotos    String[]
  finalPrice      Decimal
  conditionNotes  String?
  validatedById   String
  validatedAt     DateTime @default(now())
}

model Conversation {
  id              String   @id @default(cuid())
  participants    ConversationParticipant[]
  aiAgent         Boolean  @default(false)
  context         Json?
  messages        Message[]
  createdAt       DateTime @default(now())
}

model ConversationParticipant {
  userId          String
  conversationId  String
  user            User     @relation(fields: [userId], references: [id])
  conversation    Conversation @relation(fields: [conversationId], references: [id])
  
  @@id([userId, conversationId])
}

model Message {
  id              String   @id @default(cuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id])
  senderId        String?
  isAI            Boolean  @default(false)
  content         String
  toolCalls       Json?
  read            Boolean  @default(false)
  createdAt       DateTime @default(now())
}
```

## 🔐 Authentication Setup

File: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validators';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate input
        const validation = loginSchema.safeParse(credentials);
        if (!validation.success) {
          return null;
        }

        const { email, password } = validation.data;

        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
          include: { companyInfo: true }
        });

        if (!user) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          membershipTier: user.membershipTier,
          kycStatus: user.kycStatus,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.membershipTier = user.membershipTier;
        token.kycStatus = user.kycStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.membershipTier = token.membershipTier as string;
        session.user.kycStatus = token.kycStatus as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

## 📝 API Routes

### Register User

File: `app/api/auth/register/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, password, city, province, membershipTier } = validation.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        city,
        province,
        membershipTier: membershipTier as any,
        role: 'USER',
        kycStatus: 'PENDING',
      }
    });

    return NextResponse.json(
      { message: 'Registrasi berhasil', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}
```

### Get Listings

File: `app/api/listings/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: any = {
      status: 'PUBLISHED'
    };

    if (category) where.category = category;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (minPrice) where.basePrice = { gte: parseFloat(minPrice) };
    if (maxPrice) where.basePrice = { lte: parseFloat(maxPrice) };

    const listings = await prisma.listing.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            membershipTier: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Remove sensitive data
    const sanitizedListings = listings.map(listing => ({
      ...listing,
      seller: {
        id: listing.seller.id,
        name: listing.seller.name,
        membershipTier: listing.seller.membershipTier,
      }
    }));

    return NextResponse.json(sanitizedListings);
  } catch (error) {
    console.error('Get listings error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data listing' },
      { status: 500 }
    );
  }
}
```

### Create Listing

File: `app/api/listings/route.ts` (POST)

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { listingSchema } from '@/lib/validators';
import { encryptCoords, hashLocation } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validation = listingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Encrypt coordinates
    const encryptedCoords = await encryptCoords(data.lat, data.lng);
    const locationHash = await hashLocation(data.lat, data.lng);

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        sellerId: session.user.id,
        category: data.category,
        subCategory: data.subCategory,
        title: data.title,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        basePrice: data.basePrice,
        negotiable: data.negotiable,
        city: data.city,
        province: data.province,
        encryptedCoords,
        locationHash,
        status: 'PUBLISHED',
      }
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat listing' },
      { status: 500 }
    );
  }
}
```

## 💳 Payment Integration

File: `app/api/payment/create/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { listingId, quantity } = await req.json();

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing tidak ditemukan' },
        { status: 404 }
      );
    }

    // Calculate prices
    const totalPrice = Number(listing.basePrice) * quantity;
    const platformFee = totalPrice * 0.025; // 2.5%
    const downPayment = totalPrice * 0.3; // 30%

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        listingId,
        buyerId: session.user.id,
        quantity,
        pricePerKg: listing.basePrice,
        totalPrice,
        downPayment,
        paymentMethod: 'MIDTRANS',
        escrowStatus: 'PENDING',
        pickupMethod: 'SELF',
        pickupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }
    });

    // Create Midtrans transaction
    const parameter = {
      transaction_details: {
        order_id: booking.id,
        gross_amount: downPayment
      },
      customer_details: {
        first_name: session.user.name,
        email: session.user.email
      }
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      bookingId: booking.id,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      downPayment,
      totalPrice,
      platformFee
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat transaksi' },
      { status: 500 }
    );
  }
}
```

## 🔒 Security Utilities

File: `lib/security.ts`

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.LOCATION_ENCRYPTION_KEY || '';
const ALGORITHM = 'aes-256-gcm';

export async function encryptCoords(lat: number, lng: string): Promise<string> {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  const data = `${lat}:${lng}`;
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export async function decryptCoords(encrypted: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const [ivHex, authTagHex, encryptedData] = encrypted.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const [lat, lng] = decrypted.split(':').map(Number);
    return { lat, lng };
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

export async function hashLocation(lat: number, lng: string): Promise<string> {
  const data = `${lat}:${lng}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}
```

## 🚀 Deployment

### 1. Build

```bash
npm run build
```

### 2. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### 3. Setup Database

```bash
# Run migrations on production
npx prisma migrate deploy
```

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Midtrans Documentation](https://docs.midtrans.com/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Ready for Implementation
