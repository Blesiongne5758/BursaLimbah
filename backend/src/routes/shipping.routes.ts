/**
 * Shipping Routes
 * Shipping calculation and tracking
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route GET /api/shipping/calculate
 * @desc Calculate shipping cost
 * @access Public
 */
router.get(
  '/calculate',
  asyncHandler(async (req: Request, res: Response) => {
    const { origin, destination, weight } = req.query;

    // Mock shipping calculation (in production, integrate with RajaOngkir)
    const baseCost = Number(weight) * 2.5; // Rp 2.5/gram
    const distanceMultiplier = origin === destination ? 1 : 1.5;

    const options = [
      {
        courier: 'JNE',
        service: 'REG',
        cost: Math.round(baseCost * distanceMultiplier),
        estimate: '2-3 hari',
      },
      {
        courier: 'JNE',
        service: 'YES',
        cost: Math.round(baseCost * distanceMultiplier * 1.8),
        estimate: '1 hari',
      },
      {
        courier: 'SiCepat',
        service: 'HALU',
        cost: Math.round(baseCost * distanceMultiplier * 0.9),
        estimate: '2-4 hari',
      },
      {
        courier: 'Anteraja',
        service: 'REG',
        cost: Math.round(baseCost * distanceMultiplier * 0.85),
        estimate: '3-5 hari',
      },
    ];

    res.json({
      success: true,
      data: options,
    });
  })
);

/**
 * @route GET /api/shipping/track/:waybill
 * @desc Track shipment
 * @access Public
 */
router.get(
  '/track/:waybill',
  asyncHandler(async (req: Request, res: Response) => {
    // Mock tracking (in production, integrate with courier API)
    const tracking = {
      waybill: req.params.waybill,
      status: 'In Transit',
      history: [
        {
          date: '2024-11-18 08:00',
          desc: 'Pickup dari seller',
          location: 'Surabaya',
        },
        {
          date: '2024-11-18 14:00',
          desc: 'Dalam perjalanan ke hub',
          location: 'Surabaya Hub',
        },
        {
          date: '2024-11-19 06:00',
          desc: 'Transit di hub utama',
          location: 'Jakarta Hub',
        },
      ],
    };

    res.json({
      success: true,
      data: tracking,
    });
  })
);

export default router;
