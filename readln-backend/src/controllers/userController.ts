import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

export class UserController {
  /**
   * Lấy danh sách tủ truyện (Bookmarks) của user hiện tại từ MySQL
   */
  static async getBookmarks(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Vui lòng đăng nhập.', 401);
      }

      const bookmarks = await prisma.bookmarks.findMany({
        where: { user_id: req.user.id },
        include: {
          stories: {
            include: {
              story_genres: { include: { genres: true } },
              chapters: {
                where: { is_deleted: false },
                select: { id: true, chapter_number: true, title: true },
                orderBy: { chapter_number: 'desc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      const formatted = bookmarks.map((b) => ({
        id: b.stories.id,
        title: b.stories.title,
        slug: b.stories.slug,
        author: b.stories.author_name,
        genres: b.stories.story_genres.map((sg) => sg.genres.name),
        lastChapter: b.stories.chapters[0] ? `Chương ${b.stories.chapters[0].chapter_number}: ${b.stories.chapters[0].title}` : 'Chưa có',
        savedAt: b.created_at,
      }));

      return sendSuccess(res, formatted);
    } catch (error) {
      return sendError(res, 'Không thể tải tủ truyện.', 500, error);
    }
  }

  /**
   * Thêm hoặc xóa bookmark
   */
  static async toggleBookmark(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Vui lòng đăng nhập.', 401);
      }
      const { storyId } = req.body;
      if (!storyId) return sendError(res, 'Thiếu storyId.', 400);

      const existing = await prisma.bookmarks.findUnique({
        where: {
          user_id_story_id: {
            user_id: req.user.id,
            story_id: storyId,
          },
        },
      });

      if (existing) {
        await prisma.bookmarks.delete({
          where: {
            user_id_story_id: {
              user_id: req.user.id,
              story_id: storyId,
            },
          },
        });
        return sendSuccess(res, { bookmarked: false }, 'Đã xóa khỏi tủ truyện.');
      } else {
        await prisma.bookmarks.create({
          data: {
            user_id: req.user.id,
            story_id: storyId,
          },
        });
        return sendSuccess(res, { bookmarked: true }, 'Đã thêm vào tủ truyện.');
      }
    } catch (error) {
      return sendError(res, 'Lỗi thao tác tủ truyện.', 500, error);
    }
  }

  /**
   * Đổi mật khẩu tài khoản
   */
  static async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Vui lòng đăng nhập.', 401);
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return sendError(res, 'Vui lòng điền mật khẩu hiện tại và mật khẩu mới.', 400);
      }

      if (newPassword.length < 8) {
        return sendError(res, 'Mật khẩu mới phải có ít nhất 8 ký tự.', 400);
      }

      const user = await prisma.users.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return sendError(res, 'Người dùng không tồn tại.', 404);
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return sendError(res, 'Mật khẩu hiện tại không chính xác.', 400);
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.users.update({
        where: { id: user.id },
        data: { password_hash: newHash },
      });

      return sendSuccess(res, null, 'Đổi mật khẩu thành công!');
    } catch (error) {
      return sendError(res, 'Không thể đổi mật khẩu lúc này.', 500, error);
    }
  }
}

