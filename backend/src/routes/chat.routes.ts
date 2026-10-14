/**
 * Chat Routes
 * AI chat and conversation management
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route POST /api/chat/agent
 * @desc Send message to AI agent
 * @access Private
 */
router.post(
  '/agent',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { messages, context } = req.body;

    // Mock AI response (in production, integrate with OpenAI)
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

    let response = '';
    let toolCalls: any[] = [];

    if (lastMessage.includes('cari') || lastMessage.includes('listing')) {
      response = 'Saya menemukan beberapa listing yang cocok dengan kriteria Anda. Apakah Anda ingin melihat detailnya?';
      toolCalls = [{ name: 'searchListings', args: {} }];
    } else if (lastMessage.includes('harga') || lastMessage.includes('estimasi')) {
      response = 'Berdasarkan data pasar saat ini, harga rata-rata untuk limbah plastik PP adalah Rp 4.500/kg. Apakah Anda ingin mengetahui lebih detail?';
      toolCalls = [{ name: 'calculatePrice', args: { category: 'PLASTIC' } }];
    } else if (lastMessage.includes('regulasi') || lastMessage.includes('izin')) {
      response = 'Untuk limbah B3, Anda memerlukan izin dari KLHK. Apakah Anda sudah memiliki izin tersebut?';
      toolCalls = [{ name: 'getWasteRegulation', args: { wasteType: 'B3' } }];
    } else {
      response = 'Saya siap membantu Anda! Saya bisa membantu mencari listing, menghitung estimasi harga, atau memberikan informasi tentang regulasi limbah. Ada yang bisa saya bantu?';
    }

    res.json({
      success: true,
      data: {
        content: response,
        toolCalls,
      },
    });
  })
);

/**
 * @route GET /api/chat/history
 * @desc Get chat history
 * @access Private
 */
router.get(
  '/history',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    // Mock chat history
    const history = [
      {
        id: '1',
        senderId: 'ai',
        senderName: 'Asisten BursaLimbah',
        content: 'Halo! Saya asisten AI BursaLimbah. Ada yang bisa saya bantu?',
        isAI: true,
        timestamp: new Date().toISOString(),
      },
    ];

    res.json({
      success: true,
      data: history,
    });
  })
);

export default router;
