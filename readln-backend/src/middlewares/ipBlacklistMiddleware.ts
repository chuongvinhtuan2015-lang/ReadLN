import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const ipBlacklistMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '127.0.0.1';

  try {
    const blocked = await prisma.ip_blacklists.findFirst({
      where: {
        ip_address: clientIp,
        OR: [
          { blocked_until: null }, // Cấm vĩnh viễn
          { blocked_until: { gt: new Date() } }, // Còn trong thời hạn cấm
        ],
      },
    });

    if (blocked) {
      return res.status(403).json({
        success: false,
        message: `Địa chỉ IP của bạn đã bị chặn. Lý do: ${blocked.reason}`,
      });
    }

    next();
  } catch {
    next();
  }
};

