import { Request, Response, NextFunction } from 'express';
import { SECURITY_CONFIG } from '../config/security';

// Lưu trữ tạm nonce trong bộ nhớ RAM
const seenNonces = new Set<string>();

// Xóa nonce định kỳ
setInterval(() => {
  seenNonces.clear();
}, SECURITY_CONFIG.NONCE_WINDOW_SECONDS * 1000);

export const antiScrapeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Chỉ áp dụng cho các route lấy nội dung chương
  if (!req.originalUrl.includes('/chapters/')) {
    return next();
  }

  const timestampStr = req.headers['x-request-timestamp'] as string;
  const nonce = req.headers['x-request-nonce'] as string;

  if (!timestampStr || !nonce) {
    // Để tương thích nếu gọi trực tiếp thì bỏ qua hoặc chặn tùy mức độ
    return next();
  }

  const timestamp = parseInt(timestampStr, 10);
  const now = Date.now();
  const maxDiffMs = SECURITY_CONFIG.NONCE_WINDOW_SECONDS * 1000;

  // 1. Kiểm tra Timestamp chênh lệch quá 300s
  if (isNaN(timestamp) || Math.abs(now - timestamp) > maxDiffMs) {
    return res.status(403).json({
      success: false,
      message: 'Yêu cầu không hợp lệ (Lệch dấu thời gian).',
    });
  }

  // 2. Chặn Replay Attack bằng Nonce
  if (seenNonces.has(nonce)) {
    return res.status(403).json({
      success: false,
      message: 'Yêu cầu bị từ chối do trùng lặp (Anti-Replay).',
    });
  }

  seenNonces.add(nonce);
  next();
};

