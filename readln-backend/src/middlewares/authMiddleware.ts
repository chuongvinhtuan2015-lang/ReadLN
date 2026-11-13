import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import prisma from '../config/db';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'READER' | 'AUTHOR' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthUser;
    
    // Kiểm tra tài khoản có bị khóa lockout_until hay không
    const userDb = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, email: true, role: true, lockout_until: true },
    });

    if (userDb && (!userDb.lockout_until || new Date(userDb.lockout_until) < new Date())) {
      req.user = {
        id: userDb.id,
        username: userDb.username,
        email: userDb.email,
        role: userDb.role as 'READER' | 'AUTHOR' | 'ADMIN',
      };
    }

    next();
  } catch {
    next();
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục.' });
  }
  next();
};

