import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/db';
import { ENV } from '../config/env';
import { SECURITY_CONFIG } from '../config/security';
import { sendSuccess, sendError } from '../utils/response';

export class AuthController {
  /**
   * Đăng ký tài khoản mới
   */
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return sendError(res, 'Vui lòng điền đầy đủ tên, email và mật khẩu.', 400);
      }

      if (password.length < 8) {
        return sendError(res, 'Mật khẩu phải chứa ít nhất 8 ký tự.', 400);
      }

      const existing = await prisma.users.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existing) {
        return sendError(res, 'Email hoặc tên người dùng đã tồn tại.', 409);
      }

      const password_hash = await bcrypt.hash(password, 10);
      const user = await prisma.users.create({
        data: {
          id: uuidv4(),
          username,
          email,
          password_hash,
          role: 'READER',
        },
      });

      return sendSuccess(res, { id: user.id, username: user.username, email: user.email }, 'Đăng ký tài khoản thành công', 201);
    } catch (error) {
      return sendError(res, 'Không thể đăng ký tài khoản lúc này.', 500, error);
    }
  }

  /**
   * Đăng nhập + Thiết lập HttpOnly Cookie + Chống Brute Force
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 'Vui lòng cung cấp email và mật khẩu.', 400);
      }

      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        return sendError(res, 'Email hoặc mật khẩu không chính xác.', 401);
      }

      // Kiểm tra lockout_until
      if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
        const remainingMinutes = Math.ceil((new Date(user.lockout_until).getTime() - Date.now()) / 60000);
        return sendError(res, `Tài khoản tạm thời bị khóa do nhập sai nhiều lần. Hãy thử lại sau ${remainingMinutes} phút.`, 429);
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        const newFailCount = user.failed_login_attempts + 1;
        let updateData: any = { failed_login_attempts: newFailCount };

        if (newFailCount >= SECURITY_CONFIG.MAX_LOGIN_FAILURES) {
          updateData.lockout_until = new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000);
        }

        await prisma.users.update({
          where: { id: user.id },
          data: updateData,
        });

        return sendError(res, 'Email hoặc mật khẩu không chính xác.', 401);
      }

      // Reset số lần đăng nhập sai khi thành công
      await prisma.users.update({
        where: { id: user.id },
        data: { failed_login_attempts: 0, lockout_until: null },
      });

      // Tạo JWT Token
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Thiết lập HttpOnly Cookie bảo mật
      res.cookie('token', token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: SECURITY_CONFIG.COOKIE_MAX_AGE,
      });

      return sendSuccess(res, {
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
      }, 'Đăng nhập thành công');
    } catch (error) {
      return sendError(res, 'Lỗi đăng nhập hệ thống.', 500, error);
    }
  }

  /**
   * Lấy thông tin phiên hiện tại
   */
  static async getCurrentUser(req: Request, res: Response) {
    if (!req.user) {
      return sendError(res, 'Chưa đăng nhập.', 401);
    }
    return sendSuccess(res, { user: req.user });
  }

  /**
   * Đăng xuất xóa Cookie
   */
  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return sendSuccess(res, null, 'Đã đăng xuất thành công.');
  }
}

