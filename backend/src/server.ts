/**
 * BursaLimbah.com - Backend Server
 * Express.js + TypeScript Backend Application
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';

// Import routes
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import chatRoutes from './routes/chat.routes';
import kycRoutes from './routes/kyc.routes';
import shippingRoutes from './routes/shipping.routes';
import healthRoutes from './routes/health.routes';

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again after 15 minutes.',
});
app.use('/api/auth/login', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// REQUEST LOGGING
// ============================================

app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  
  next();
});

// ============================================
// API ROUTES
// ============================================

// Health check
app.use('/api/health', healthRoutes);

// Authentication
app.use('/api/auth', authRoutes);

// Users
app.use('/api/users', userRoutes);

// Listings
app.use('/api/listings', listingRoutes);

// Bookings
app.use('/api/bookings', bookingRoutes);

// Payments
app.use('/api/payments', paymentRoutes);

// KYC
app.use('/api/kyc', kycRoutes);

// Shipping
app.use('/api/shipping', shippingRoutes);

// Chat
app.use('/api/chat', chatRoutes);

// Admin
app.use('/api/admin', adminRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const PORT = config.port || 3000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Test Redis connection
    await redis.ping();
    logger.info('✅ Redis connected successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${config.env}`);
      logger.info(`🌐 API URL: ${config.apiUrl}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

startServer();

export default app;
