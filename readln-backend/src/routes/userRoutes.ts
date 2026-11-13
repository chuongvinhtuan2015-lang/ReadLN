import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { requireAuth } from '../middlewares/authMiddleware';
import { auditLogger } from '../middlewares/auditLogger';

const router = Router();

// Toàn bộ route /api/users yêu cầu đăng nhập
router.use(requireAuth);

router.get('/bookmarks', UserController.getBookmarks);
router.post('/bookmarks', UserController.toggleBookmark);
router.post('/change-password', auditLogger('USER_CHANGE_PASSWORD'), UserController.changePassword);

export default router;

