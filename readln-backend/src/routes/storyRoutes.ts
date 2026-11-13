import { Router } from 'express';
import { StoryController } from '../controllers/storyController';
import { CommentController } from '../controllers/commentController';
import { RatingController } from '../controllers/ratingController';
import { requireAuth } from '../middlewares/authMiddleware';
import { auditLogger } from '../middlewares/auditLogger';

const router = Router();

router.get('/genres', StoryController.getGenres);
router.get('/', StoryController.getStories);
router.get('/:idOrSlug', StoryController.getStoryDetail);

// Bình luận truyện
router.get('/:storyId/comments', CommentController.getComments);
router.post('/:storyId/comments', requireAuth, auditLogger('CREATE_COMMENT'), CommentController.createComment);

// Đánh giá sao truyện
router.post('/:storyId/rate', requireAuth, auditLogger('RATE_STORY'), RatingController.rateStory);

export default router;

