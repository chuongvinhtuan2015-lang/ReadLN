import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { auditLogger } from '../middlewares/auditLogger';

const router = Router();

router.post('/register', authRateLimiter, auditLogger('AUTH_REGISTER'), AuthController.register);
router.post('/login', authRateLimiter, auditLogger('AUTH_LOGIN'), AuthController.login);
router.get('/me', requireAuth, AuthController.getCurrentUser);
router.post('/logout', AuthController.logout);

export default router;

