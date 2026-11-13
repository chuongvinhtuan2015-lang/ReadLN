import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const antiBotMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Kiểm tra trường bẫy Honeypot trong body
  if (req.body && req.body.company_website) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '127.0.0.1';

    // Đưa IP vào danh sách đen do bot tự động submit form
    try {
      await prisma.ip_blacklists.upsert({
        where: { ip_address: clientIp },
        update: {
          reason: 'Bẫy Bot Honeypot: Tự động điền trường ẩn',
          blocked_until: new Date(Date.now() + 24 * 3600 * 1000), // Khóa 24h
        },
        create: {
          ip_address: clientIp,
          reason: 'Bẫy Bot Honeypot: Tự động điền trường ẩn',
          blocked_until: new Date(Date.now() + 24 * 3600 * 1000),
        },
      });
    } catch {
      // Ignored
    }

    return res.status(403).json({
      success: false,
      message: 'Yêu cầu của bạn bị từ chối do phát hiện hành vi tự động.',
    });
  }

  next();
};

