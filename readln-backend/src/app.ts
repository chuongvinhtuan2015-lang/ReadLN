import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { ipBlacklistMiddleware } from './middlewares/ipBlacklistMiddleware';
import { lockdownMiddleware } from './middlewares/lockdownMiddleware';
import { antiBotMiddleware } from './middlewares/antiBotMiddleware';
import { authMiddleware } from './middlewares/authMiddleware';

// Import Routes
import authRoutes from './routes/authRoutes';
import storyRoutes from './routes/storyRoutes';
import chapterRoutes from './routes/chapterRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';

export const createApp = () => {
  const app = express();

  // 1. Cấu hình bảo mật HTTP Headers với Helmet
  app.use(helmet());

  // 2. Cấu hình CORS chặt chẽ chỉ cho Frontend
  app.use(cors({
    origin: ENV.CLIENT_ORIGIN,
    credentials: true,
  }));

  // 3. Body Parser & Cookie Parser
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(ENV.COOKIE_SECRET));

  // 4. Chuỗi Middleware Bảo Mật NIST CSF 1.1 Toàn Cục
  app.use(ipBlacklistMiddleware); // [RESPOND] Chặn IP danh sách đen
  app.use(globalRateLimiter);     // [ANTI-DDOS] Giới hạn tần suất request
  app.use(lockdownMiddleware);    // [RESPOND] Khóa ghi khi Kill-Switch bật
  app.use(antiBotMiddleware);     // [ANTI-BOT] Bẫy bot Honeypot
  app.use(authMiddleware);        // [IDENTIFY] Xác thực phiên người dùng từ Cookie

  // 5. Khai báo các API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/stories', storyRoutes);
  app.use('/api/chapters', chapterRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      standards: 'NIST CSF 1.1 Compliant',
    });
  });

  return app;
};

