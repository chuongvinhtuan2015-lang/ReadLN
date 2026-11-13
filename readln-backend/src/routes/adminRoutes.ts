import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/rbacMiddleware';
import { auditLogger } from '../middlewares/auditLogger';

const router = Router();

// Toàn bộ route admin yêu cầu đăng nhập & quyền ADMIN (RBAC)
router.use(requireAuth, requireRole('ADMIN'));

// Dashboard stats
router.get('/dashboard', AdminController.getDashboardStats);

// Quản lý truyện & xóa mềm
router.get('/stories', AdminController.getStories);
router.delete('/stories/:id', auditLogger('ADMIN_DELETE_STORY'), AdminController.softDeleteStory);

// Quản lý users
router.get('/users', AdminController.getUsers);
router.post('/users/:id/toggle', auditLogger('ADMIN_TOGGLE_USER'), AdminController.toggleUserStatus);

// Audit logs
router.get('/logs', AdminController.getAuditLogs);

// Watermark decoder
router.post('/decode-watermark', auditLogger('ADMIN_DECODE_WATERMARK'), AdminController.decodeWatermark);

// Kill-Switch Lockdown
router.post('/lockdown', auditLogger('ADMIN_TOGGLE_LOCKDOWN'), AdminController.toggleLockdown);

// Quản lý IP Blacklist
router.get('/blacklists', AdminController.getBlacklists);
router.post('/blacklists', auditLogger('ADMIN_BLOCK_IP'), AdminController.blockIp);
router.delete('/blacklists/:id', auditLogger('ADMIN_UNBLOCK_IP'), AdminController.unblockIp);

// Quản lý rác & khôi phục xóa mềm
router.get('/trash', AdminController.getTrash);
router.post('/restore', auditLogger('ADMIN_RESTORE_ITEM'), AdminController.restoreItem);

// Sao lưu cơ sở dữ liệu
router.post('/backup', auditLogger('ADMIN_TRIGGER_BACKUP'), AdminController.triggerBackup);

export default router;
