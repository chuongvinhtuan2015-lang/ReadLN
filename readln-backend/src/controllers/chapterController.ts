import { Request, Response } from 'express';
import prisma from '../config/db';
import { WatermarkService } from '../services/watermarkService';
import { CryptoService } from '../services/cryptoService';
import { sendSuccess, sendError } from '../utils/response';

export class ChapterController {
  /**
   * Lấy nội dung chương (Đọc chương)
   * Tự động:
   * 1. Nhúng Thủy vân tàng hình chứa User ID hoặc IP
   * 2. Mã hóa dữ liệu trong RAM trước khi gửi (Anti-Scraping)
   */
  static async getChapterContent(req: Request, res: Response) {
    try {
      const { chapterId } = req.params;

      const chapter = await prisma.chapters.findFirst({
        where: { id: chapterId, is_deleted: false },
        include: {
          stories: {
            select: { id: true, title: true, author_name: true },
          },
        },
      });

      if (!chapter) {
        return sendError(res, 'Chương truyện không tồn tại hoặc đã bị xóa.', 404);
      }

      // 1. Nhúng Watermark (User ID nếu đăng nhập, hoặc IP nếu đọc ẩn danh)
      const identifier = req.user?.id || (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || 'ANON_CLIENT';
      const watermarkedText = WatermarkService.inject(chapter.content, identifier);

      // 2. Mã hóa RAM trước khi trả về
      const encryptedPayload = CryptoService.obfuscate(watermarkedText);

      return sendSuccess(res, {
        id: chapter.id,
        chapter_number: chapter.chapter_number,
        title: chapter.title,
        word_count: chapter.word_count,
        updated_at: chapter.updated_at,
        story: chapter.stories,
        content: encryptedPayload, // Đã mã hóa, Frontend dùng contentDecoder.ts để giải mã
      });
    } catch (error) {
      return sendError(res, 'Không thể tải nội dung chương.', 500, error);
    }
  }
}

