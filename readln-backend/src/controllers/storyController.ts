import { Request, Response } from 'express';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

export class StoryController {
  /**
   * Lấy danh sách truyện (Hỗ trợ sort: 'latest' | 'views', lọc theo thể loại)
   */
  static async getStories(req: Request, res: Response) {
    try {
      const { sort = 'latest', genre, search } = req.query;

      let orderBy: any = { updated_at: 'desc' };
      if (sort === 'views') {
        orderBy = { view_count: 'desc' };
      }

      const where: any = {
        is_deleted: false,
      };

      if (genre) {
        where.story_genres = {
          some: {
            genres: {
              slug: String(genre),
            },
          },
        };
      }

      if (search) {
        where.OR = [
          { title: { contains: String(search) } },
          { author_name: { contains: String(search) } },
        ];
      }

      const stories = await prisma.stories.findMany({
        where,
        orderBy,
        include: {
          story_genres: {
            include: {
              genres: true,
            },
          },
          chapters: {
            where: { is_deleted: false },
            select: { id: true, chapter_number: true, title: true, created_at: true },
            orderBy: { chapter_number: 'desc' },
            take: 1,
          },
          ratings: {
            select: { score: true },
          },
        },
      });

      // Chuyển đổi BigInt view_count sang Number an toàn
      const formatted = stories.map((s) => {
        const totalVotes = s.ratings.length;
        const avgRating = totalVotes > 0 ? (s.ratings.reduce((acc, cur) => acc + cur.score, 0) / totalVotes) : 5.0;

        return {
          id: s.id,
          title: s.title,
          slug: s.slug,
          author: s.author_name,
          description: s.summary,
          views: Number(s.view_count),
          rating: Number(avgRating.toFixed(1)),
          totalRatings: totalVotes,
          updatedAt: s.updated_at,
          genres: s.story_genres.map((sg) => sg.genres.name),
          latestChapter: s.chapters[0] ? `Chương ${s.chapters[0].chapter_number}: ${s.chapters[0].title}` : 'Chưa có',
        };
      });

      return sendSuccess(res, formatted);
    } catch (error) {
      return sendError(res, 'Không thể tải danh sách truyện.', 500, error);
    }
  }

  /**
   * Lấy chi tiết 1 bộ truyện kèm danh sách chương
   */
  static async getStoryDetail(req: Request, res: Response) {
    try {
      const { idOrSlug } = req.params;

      const story = await prisma.stories.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
          is_deleted: false,
        },
        include: {
          story_genres: { include: { genres: true } },
          chapters: {
            where: { is_deleted: false },
            select: { id: true, chapter_number: true, title: true, word_count: true, created_at: true },
            orderBy: { chapter_number: 'asc' },
          },
          ratings: { select: { score: true } },
        },
      });

      if (!story) {
        return sendError(res, 'Không tìm thấy bộ truyện.', 404);
      }

      // Tăng view_count
      await prisma.stories.update({
        where: { id: story.id },
        data: { view_count: { increment: 1 } },
      });

      const totalVotes = story.ratings.length;
      const avgRating = totalVotes > 0 ? (story.ratings.reduce((acc, cur) => acc + cur.score, 0) / totalVotes) : 5.0;
      const totalWords = story.chapters.reduce((acc, c) => acc + c.word_count, 0);

      let isBookmarked = false;
      if (req.user) {
        const bm = await prisma.bookmarks.findUnique({
          where: {
            user_id_story_id: {
              user_id: req.user.id,
              story_id: story.id,
            },
          },
        });
        isBookmarked = !!bm;
      }

      const result = {
        id: story.id,
        title: story.title,
        slug: story.slug,
        author: story.author_name,
        description: story.summary,
        views: Number(story.view_count) + 1,
        rating: Number(avgRating.toFixed(1)),
        totalRatings: totalVotes,
        wordCount: totalWords,
        updatedAt: story.updated_at,
        isBookmarked,
        genres: story.story_genres.map((sg) => ({
          id: sg.genres.id,
          name: sg.genres.name,
          slug: sg.genres.slug,
        })),
        chapters: story.chapters.map((c) => ({
          id: c.id,
          chapter_number: c.chapter_number,
          title: c.title,
          word_count: c.word_count,
          created_at: c.created_at,
        })),
      };

      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, 'Lỗi lấy chi tiết truyện.', 500, error);
    }
  }

  /**
   * Lấy danh sách toàn bộ thể loại từ MySQL
   */
  static async getGenres(req: Request, res: Response) {
    try {
      const genres = await prisma.genres.findMany({
        orderBy: { name: 'asc' },
      });
      return sendSuccess(res, genres);
    } catch (error) {
      return sendError(res, 'Không thể tải danh sách thể loại.', 500, error);
    }
  }
}

