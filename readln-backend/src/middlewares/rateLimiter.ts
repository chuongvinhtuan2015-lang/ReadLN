import rateLimit from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 120, // Tối đa 120 request / phút / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 15, // Tối đa 15 lần thử đăng nhập/đăng ký
  message: {
    success: false,
    message: 'Quá nhiều lần thử xác thực. Vui lòng thử lại sau 15 phút.',
  },
});

