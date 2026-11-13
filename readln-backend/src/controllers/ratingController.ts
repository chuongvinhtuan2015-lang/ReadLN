import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

export class RatingController {
  /**
   * Đánh giá 1 - 5 sao
   */
  static async rateStory(req: Request, res: Response) {
    try {
      const { storyId } = req.params;
      const { score } = req.body;

      if (!req.user) {
        return sendError(res, 'Vui lòng đăng nhập để đánh giá.', 401);
      }

      const numericScore = parseInt(score, 10);
      if (isNaN(numericScore) || numericScore < 1 || numericScore > 5) {
        return sendError(res, 'Điểm đánh giá phải từ 1 đến 5 sao.', 400);
      }

      await prisma.ratings.upsert({
        where: {
          uq_story_user_rating: {
            story_id: storyId,
            user_id: req.user.id,
          },
        },
        update: {
          score: numericScore,
        },
        create: {
          id: uuidv4(),
          story_id: storyId,
          user_id: req.user.id,
          score: numericScore,
        },
      });

      return sendSuccess(res, null, 'Cảm ơn bạn đã gửi đánh giá!');
    } catch (error) {
      return sendError(res, 'Lỗi đánh giá truyện.', 500, error);
    }
  }
}

