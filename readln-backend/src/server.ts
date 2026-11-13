import { createApp } from './app';
import { ENV } from './config/env';
import { logger } from './utils/logger';
import prisma from './config/db';

const app = createApp();

async function startServer() {
  try {
    // Kiểm tra kết nối MySQL
    await prisma.$connect();
    logger.info('✅ Đã kết nối cơ sở dữ liệu MySQL (readln_db) thành công!');

    app.listen(ENV.PORT, () => {
      logger.info(`🚀 ReadLN Backend Server đang chạy tại: http://localhost:${ENV.PORT}`);
      logger.info(`🛡️ Tiêu chuẩn an ninh: NIST CSF 1.1 | Anti-Scrape | Anti-Copy | Anti-DDoS`);
    });
  } catch (error) {
    logger.error('❌ Lỗi kết nối Database MySQL:', error);
    process.exit(1);
  }
}

startServer();
