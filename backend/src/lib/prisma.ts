/**
 * Prisma Client
 * Database ORM client instance
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Prisma client singleton
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection error handling
prisma.$on('error', (e: any) => {
  logger.error('Prisma error:', e);
});

export default prisma;
