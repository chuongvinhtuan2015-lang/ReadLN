import rateLimit from 'express-rate-limit';
import { AutoResponseService } from '../services/autoResponseService';

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 120, // Tối đa 120 request / phút / IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '127.0.0.1';
    // DETECT -> TỰ ĐỘNG RESPOND
    AutoResponseService.handleThreatEvent(clientIp, 'RATE_LIMIT_BLOCK', 'Vượt quá 120 request / phút');
    res.status(429).json({
      success: false,
      message: 'Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.',
    });
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 15, // Tối đa 15 lần thử đăng nhập/đăng ký
  handler: (req, res) => {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '127.0.0.1';
    // DETECT -> TỰ ĐỘNG RESPOND
    AutoResponseService.handleThreatEvent(clientIp, 'RATE_LIMIT_BLOCK', 'Vượt quá giới hạn xác thực (15 lần / 15 phút)');
    res.status(429).json({
      success: false,
      message: 'Quá nhiều lần thử xác thực. Vui lòng thử lại sau 15 phút.',
    });
  },
});

