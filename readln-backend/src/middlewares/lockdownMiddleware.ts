import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

let cachedLockdown: boolean | null = null;
let lastCheckTime = 0;

export const lockdownMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Chỉ kiểm tra các phương thức ghi dữ liệu (POST, PUT, PATCH, DELETE)
  const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

  if (!isWriteMethod) {
    return next();
  }

  // Bỏ qua các route quản trị liên quan đến admin (bao gồm bật/tắt lockdown)
  if (req.originalUrl.includes('/admin/lockdown') || req.originalUrl.includes('/admin/operations/lockdown')) {
    return next();
  }

  try {
    const now = Date.now();
    // Cache 5 giây để giảm tải truy vấn MySQL
    if (cachedLockdown === null || now - lastCheckTime > 5000) {
      const setting = await prisma.system_settings.findUnique({
        where: { setting_key: 'is_lockdown_mode' },
      });
      cachedLockdown = setting?.setting_value === 'true';
      lastCheckTime = now;
    }

    if (cachedLockdown) {
      return res.status(503).json({
        success: false,
        message: 'Hệ thống đang ở chế độ bảo trì khẩn cấp (Chỉ đọc). Vui lòng thử lại sau.',
      });
    }

    next();
  } catch {
    next();
  }
};

