/**
 * Health Check Routes
 * Server health and status monitoring
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

const router = Router();

/**
 * @route GET /api/health
 * @desc Check server health
 * @access Public
 */
router.get('/', async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  };

  res.json(health);
});

/**
 * @route GET /api/health/detailed
 * @desc Detailed health check with dependencies
 * @access Public
 */
router.get('/detailed', async (req: Request, res: Response) => {
  const checks = {
    server: { status: 'ok' },
    database: { status: 'unknown' },
    redis: { status: 'unknown' },
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database.status = 'ok';
  } catch (error) {
    checks.database.status = 'error';
  }

  // Check Redis
  try {
    await redis.ping();
    checks.redis.status = 'ok';
  } catch (error) {
    checks.redis.status = 'error';
  }

  const allOk = Object.values(checks).every((check) => check.status === 'ok');

  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
});

/**
 * @route GET /api/health/memory
 * @desc Check memory usage
 * @access Public
 */
router.get('/memory', (req: Request, res: Response) => {
  const memory = process.memoryUsage();

  res.json({
    status: 'ok',
    memory: {
      rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memory.external / 1024 / 1024)} MB`,
    },
  });
});

export default router;
