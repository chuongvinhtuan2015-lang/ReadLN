import { Router } from 'express';
import { ChapterController } from '../controllers/chapterController';
import { antiScrapeMiddleware } from '../middlewares/antiScrapeMiddleware';
import { auditLogger } from '../middlewares/auditLogger';

const router = Router();

// Lấy nội dung chương (có chống cào timestamp/nonce + nhúng watermark + mã hóa RAM)
router.get('/:chapterId', antiScrapeMiddleware, auditLogger('READ_CHAPTER'), ChapterController.getChapterContent);

export default router;

