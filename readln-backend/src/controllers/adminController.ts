import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/db';
import { WatermarkService } from '../services/watermarkService';
import { sendSuccess, sendError } from '../utils/response';

export class AdminController {
  /**
   * Thống kê an ninh Dashboard (NIST CSF: Detect)
   */
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 3600 * 1000);

      const [totalStories, totalUsers, blocked429, failedLogins, activeBlacklists, settingLockdown, recentLogs] = await Promise.all([
        prisma.stories.count({ where: { is_deleted: false } }),
        prisma.users.count(),
        prisma.audit_logs.count({ where: { status_code: 429, created_at: { gte: last24h } } }),
        prisma.audit_logs.count({ where: { action: { contains: 'AUTH' }, status_code: 401, created_at: { gte: last24h } } }),
        prisma.ip_blacklists.count(),
        prisma.system_settings.findUnique({ where: { setting_key: 'is_lockdown_mode' } }),
        prisma.audit_logs.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
        }),
      ]);

      return sendSuccess(res, {
        totalStories,
        totalUsers,
        security24h: {
          blocked429,
          failedLogins,
          activeBlacklists,
        },
        isLockdownMode: settingLockdown?.setting_value === 'true',
        recentLogs: recentLogs.map((l) => ({
          id: Number(l.id),
          action: l.action,
          client_ip: l.client_ip,
          status_code: l.status_code,
          created_at: l.created_at,
        })),
      });
    } catch (error) {
      return sendError(res, 'Lỗi lấy thống kê Dashboard.', 500, error);
    }
  }

  /**
   * Quản lý truyện phía Admin: Lấy danh sách truyện từ MySQL
   */
  static async getStories(req: Request, res: Response) {
    try {
      const stories = await prisma.stories.findMany({
        where: { is_deleted: false },
        orderBy: { updated_at: 'desc' },
        include: {
          _count: {
            select: { chapters: { where: { is_deleted: false } } },
          },
        },
      });

      const formatted = stories.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        author: s.author_name,
        chaptersCount: s._count.chapters,
        status: 'Hoạt động',
        updatedAt: s.updated_at,
      }));

      return sendSuccess(res, formatted);
    } catch (error) {
      return sendError(res, 'Lỗi tải danh sách truyện quản trị.', 500, error);
    }
  }

  /**
   * Xóa mềm truyện (is_deleted = true)
   */
  static async softDeleteStory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.stories.update({
        where: { id },
        data: { is_deleted: true },
      });
      return sendSuccess(res, null, 'Đã chuyển truyện vào thùng rác (xóa mềm).');
    } catch (error) {
      return sendError(res, 'Không thể xóa truyện.', 500, error);
    }
  }

  /**
   * Quản lý người dùng: Lấy danh sách users từ MySQL
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await prisma.users.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          failed_login_attempts: true,
          lockout_until: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      });

      const formatted = users.map((u) => {
        const isLocked = u.lockout_until && new Date(u.lockout_until) > new Date();
        return {
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          status: isLocked ? 'Bị khóa' : 'Hoạt động',
          created_at: u.created_at,
        };
      });

      return sendSuccess(res, formatted);
    } catch (error) {
      return sendError(res, 'Lỗi tải danh sách người dùng.', 500, error);
    }
  }

  /**
   * Khóa / Mở khóa người dùng
   */
  static async toggleUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.users.findUnique({ where: { id } });
      if (!user) return sendError(res, 'Người dùng không tồn tại.', 404);

      const isLocked = user.lockout_until && new Date(user.lockout_until) > new Date();

      if (isLocked) {
        // Mở khóa
        await prisma.users.update({
          where: { id },
          data: { lockout_until: null, failed_login_attempts: 0 },
        });
        return sendSuccess(res, { status: 'Hoạt động' }, 'Đã mở khóa tài khoản.');
      } else {
        // Khóa 1 năm
        await prisma.users.update({
          where: { id },
          data: { lockout_until: new Date(Date.now() + 365 * 24 * 3600 * 1000) },
        });
        return sendSuccess(res, { status: 'Bị khóa' }, 'Đã khóa tài khoản thành công.');
      }
    } catch (error) {
      return sendError(res, 'Không thể thay đổi trạng thái người dùng.', 500, error);
    }
  }

  /**
   * Truy xuất Audit Logs
   */
  static async getAuditLogs(req: Request, res: Response) {
    try {
      const { limit = 50, action } = req.query;
      const where: any = {};
      if (action && action !== 'ALL') {
        where.action = { contains: String(action) };
      }

      const logs = await prisma.audit_logs.findMany({
        where,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
      });

      const formatted = logs.map((l) => ({
        id: Number(l.id),
        user_id: l.user_id,
        client_ip: l.client_ip,
        action: l.action,
        status_code: l.status_code,
        details: l.details,
        time: new Date(l.created_at).toLocaleTimeString('vi-VN') + ' ' + new Date(l.created_at).toLocaleDateString('vi-VN'),
      }));

      return sendSuccess(res, formatted);
    } catch (error) {
      return sendError(res, 'Không thể tải audit logs.', 500, error);
    }
  }

  /**
   * Giải mã Thủy vân tàng hình Zero-Width để truy vết kẻ leak truyện
   */
  static async decodeWatermark(req: Request, res: Response) {
    try {
      const { text } = req.body;
      if (!text) {
        return sendError(res, 'Vui lòng cung cấp đoạn text cần giải mã.', 400);
      }

      const userId = WatermarkService.extract(text);

      if (!userId) {
        return sendSuccess(res, { found: false, message: 'Không phát hiện thấy thủy vân ẩn trong văn bản.' });
      }

      // Tra cứu thông tin người dùng
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { id: true, username: true, email: true, role: true, created_at: true },
      });

      return sendSuccess(res, {
        found: true,
        userId,
        user: user || 'Tài khoản khách (hoặc IP ẩn danh)',
      }, 'Đã giải mã thành công thủ phạm!');
    } catch (error) {
      return sendError(res, 'Lỗi giải mã thủy vân.', 500, error);
    }
  }

  /**
   * Bật / Tắt nút khẩn cấp Kill-Switch (Chỉ đọc)
   */
  static async toggleLockdown(req: Request, res: Response) {
    try {
      const { enable } = req.body;
      const val = enable === true || enable === 'true' ? 'true' : 'false';

      await prisma.system_settings.upsert({
        where: { setting_key: 'is_lockdown_mode' },
        update: { setting_value: val },
        create: { setting_key: 'is_lockdown_mode', setting_value: val },
      });

      return sendSuccess(res, { isLockdownMode: val === 'true' }, `Đã ${val === 'true' ? 'kích hoạt' : 'tắt'} chế độ phong tỏa khẩn cấp.`);
    } catch (error) {
      return sendError(res, 'Không thể chuyển đổi trạng thái Kill-Switch.', 500, error);
    }
  }

  /**
   * Quản lý Blacklist IP
   */
  static async getBlacklists(req: Request, res: Response) {
    try {
      const list = await prisma.ip_blacklists.findMany({
        orderBy: { created_at: 'desc' },
      });
      return sendSuccess(res, list);
    } catch (error) {
      return sendError(res, 'Lỗi lấy danh sách IP chặn.', 500, error);
    }
  }

  static async blockIp(req: Request, res: Response) {
    try {
      const { ip_address, reason } = req.body;
      if (!ip_address) return sendError(res, 'Thiếu địa chỉ IP.', 400);

      const item = await prisma.ip_blacklists.upsert({
        where: { ip_address },
        update: { reason: reason || 'Chặn thủ công' },
        create: { ip_address, reason: reason || 'Chặn thủ công' },
      });

      return sendSuccess(res, item, 'Đã chặn IP thành công.');
    } catch (error) {
      return sendError(res, 'Không thể chặn IP.', 500, error);
    }
  }

  static async unblockIp(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.ip_blacklists.delete({ where: { id: Number(id) } });
      return sendSuccess(res, null, 'Đã mở khóa IP.');
    } catch (error) {
      return sendError(res, 'Lỗi mở khóa IP.', 500, error);
    }
  }

  /**
   * Danh sách rác & Khôi phục xóa mềm (NIST CSF: Recover)
   */
  static async getTrash(req: Request, res: Response) {
    try {
      const [stories, chapters, comments] = await Promise.all([
        prisma.stories.findMany({ where: { is_deleted: true }, select: { id: true, title: true, updated_at: true } }),
        prisma.chapters.findMany({ where: { is_deleted: true }, select: { id: true, title: true, updated_at: true } }),
        prisma.comments.findMany({ where: { is_deleted: true }, select: { id: true, content: true, created_at: true } }),
      ]);

      const formatted = [
        ...stories.map((s) => ({ id: s.id, type: 'STORY', title: s.title, deleted_at: s.updated_at })),
        ...chapters.map((c) => ({ id: c.id, type: 'CHAPTER', title: c.title, deleted_at: c.updated_at })),
        ...comments.map((cm) => ({ id: cm.id, type: 'COMMENT', title: cm.content.slice(0, 50), deleted_at: cm.created_at })),
      ];

      return sendSuccess(res, formatted);
    } catch (error) {
      return sendError(res, 'Lỗi tải danh sách rác.', 500, error);
    }
  }

  static async restoreItem(req: Request, res: Response) {
    try {
      const { type, id } = req.body;
      if (type === 'STORY') {
        await prisma.stories.update({ where: { id }, data: { is_deleted: false } });
      } else if (type === 'CHAPTER') {
        await prisma.chapters.update({ where: { id }, data: { is_deleted: false } });
      } else if (type === 'COMMENT') {
        await prisma.comments.update({ where: { id }, data: { is_deleted: false } });
      }

      return sendSuccess(res, null, 'Khôi phục bản ghi thành công!');
    } catch (error) {
      return sendError(res, 'Lỗi khôi phục dữ liệu.', 500, error);
    }
  }

  /**
   * Trigger backup cơ sở dữ liệu thật (NIST CSF: RECOVER)
   * Xuất file .sql hoàn chỉnh kèm nén gzip để người dùng tải về
   */
  static async triggerBackup(req: Request, res: Response) {
    try {
      const { BackupService } = await import('../services/backupService');
      const zlib = await import('zlib');
      
      const sqlContent = await BackupService.generateSqlDump();
      const compressedBuffer = zlib.gzipSync(Buffer.from(sqlContent, 'utf8'));

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const filename = `readln_mysql_backup_${dateStr}.sql.gz`;

      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', compressedBuffer.length);

      return res.send(compressedBuffer);
    } catch (error) {
      return sendError(res, 'Không thể tạo bản sao lưu cơ sở dữ liệu lúc này.', 500, error);
    }
  }
}
