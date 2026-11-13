import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const auditLogger = (actionName?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body) {
      res.send = originalSend;

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const statusCode = res.statusCode;
      const action = actionName || `${req.method} ${req.baseUrl}${req.path}`;
      const userId = req.user?.id || null;

      // Không ghi log nếu là health check hoặc tài nguyên tĩnh
      if (!req.originalUrl.includes('/api/health')) {
        prisma.audit_logs.create({
          data: {
            user_id: userId,
            client_ip: clientIp,
            user_agent: userAgent,
            action,
            status_code: statusCode,
            details: {
              method: req.method,
              url: req.originalUrl,
              query: req.query,
            },
          },
        }).catch(() => {});
      }

      return res.send(body);
    };

    next();
  };
};

