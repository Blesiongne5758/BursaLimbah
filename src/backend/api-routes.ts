/**
 * Next.js API Route Templates
 * Ready to deploy as Next.js API routes
 * 
 * To use: Copy these files to a Next.js project's app/api/ directory
 */

// ============================================
// app/api/auth/login/route.ts
// ============================================
/*
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { loginSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipTier: user.membershipTier,
        kycStatus: user.kycStatus,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
*/

// ============================================
// app/api/auth/register/route.ts
// ============================================
/*
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
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
      where: { email },
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
      },
    });

    return NextResponse.json(
      { 
        message: 'Registrasi berhasil',
        userId: user.id 
      },
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
*/

// ============================================
// app/api/listings/route.ts
// ============================================
/*
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { listingSchema } from '@/lib/validators';
import { encryptCoords, hashLocation } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: any = {
      status: 'PUBLISHED',
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Remove sensitive data
    const sanitizedListings = listings.map(listing => ({
      ...listing,
      encryptedCoords: undefined,
      seller: {
        id: listing.seller.id,
        name: listing.seller.name,
        membershipTier: listing.seller.membershipTier,
      },
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

export async function POST(req: NextRequest) {
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
      },
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
*/

// ============================================
// app/api/payment/create/route.ts
// ============================================
/*
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function POST(req: NextRequest) {
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
      include: { seller: true },
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
        pickupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Create Midtrans transaction
    const parameter = {
      transaction_details: {
        order_id: booking.id,
        gross_amount: downPayment,
      },
      customer_details: {
        first_name: session.user.name,
        email: session.user.email,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      bookingId: booking.id,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      downPayment,
      totalPrice,
      platformFee,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat transaksi' },
      { status: 500 }
    );
  }
}
*/

// ============================================
// app/api/payment/webhook/route.ts
// ============================================
/*
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    
    // Verify Midtrans signature
    const signature = req.headers.get('x-midtrans-signature') || '';
    const expectedSignature = crypto
      .createHash('sha512')
      .update(body + process.env.MIDTRANS_SERVER_KEY)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const notification = JSON.parse(body);
    const { order_id, transaction_status } = notification;

    // Update booking status
    const booking = await prisma.booking.findUnique({
      where: { id: order_id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    let escrowStatus = booking.escrowStatus;
    let status = booking.status;

    if (transaction_status === 'capture') {
      if (notification.fraud_status === 'accept') {
        escrowStatus = 'HOLD';
        status = 'PAID_DP';
      }
    } else if (transaction_status === 'settlement') {
      escrowStatus = 'HOLD';
      status = 'PAID_DP';
    } else if (transaction_status === 'deny' || transaction_status === 'expire' || transaction_status === 'cancel') {
      escrowStatus = 'REFUNDED';
      status = 'BOOKED';
    }

    await prisma.booking.update({
      where: { id: order_id },
      data: { escrowStatus, status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
*/

export {};
