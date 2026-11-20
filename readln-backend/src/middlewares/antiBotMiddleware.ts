import { Request, Response, NextFunction } from 'express';
import { AutoResponseService } from '../services/autoResponseService';

export const antiBotMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Kiểm tra trường bẫy Honeypot trong body
  if (req.body && req.body.company_website) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '127.0.0.1';

    // DETECT -> TỰ ĐỘNG RESPOND
    await AutoResponseService.handleThreatEvent(clientIp, 'BOT_HONEYPOT_TRIGGER', 'Điền vào honeypot company_website');

    return res.status(403).json({
      success: false,
      message: 'Yêu cầu của bạn bị từ chối do phát hiện hành vi tự động.',
    });
  }

  next();
};

