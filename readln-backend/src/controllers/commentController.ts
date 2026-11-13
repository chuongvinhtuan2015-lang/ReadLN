import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/db';
import { sanitizeText } from '../utils/sanitize';
import { sendSuccess, sendError } from '../utils/response';

export class CommentController {
  /**
   * Lấy danh sách bình luận của truyện / chương
   */
  static async getComments(req: Request, res: Response) {
    try {
      const { storyId } = req.params;
      const { chapterId } = req.query;

      const where: any = {
        story_id: storyId,
        is_deleted: false,
      };

      if (chapterId) {
        where.chapter_id = String(chapterId);
      }

      const comments = await prisma.comments.findMany({
        where,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: { username: true },
          },
        },
      });

      const formatted = comments.map((c) => ({
        id: c.id,
        user_name: c.users.username,
        content: c.content,
        created_at: c.created_at,
        is_flagged: c.is_flagged,
      }));

      return sendSuccess(res, formatted);
    } catch (error) {
      return sendError(res, 'Không thể tải bình luận.', 500, error);
    }
  }

  /**
   * Thêm bình luận mới (Có lọc XSS qua sanitizeText)
   */
  static async createComment(req: Request, res: Response) {
    try {
      const { storyId } = req.params;
      const { chapterId, content } = req.body;

      if (!req.user) {
        return sendError(res, 'Vui lòng đăng nhập để bình luận.', 401);
      }

      if (!content || !content.trim()) {
        return sendError(res, 'Nội dung bình luận không được để trống.', 400);
      }

      // Làm sạch XSS
      const cleanContent = sanitizeText(content.trim());

      const comment = await prisma.comments.create({
        data: {
          id: uuidv4(),
          story_id: storyId,
          chapter_id: chapterId || null,
          user_id: req.user.id,
          content: cleanContent,
        },
        include: {
          users: { select: { username: true } },
        },
      });

      return sendSuccess(res, {
        id: comment.id,
        user_name: comment.users.username,
        content: comment.content,
        created_at: comment.created_at,
      }, 'Đăng bình luận thành công', 201);
    } catch (error) {
      return sendError(res, 'Không thể gửi bình luận lúc này.', 500, error);
    }
  }
}

