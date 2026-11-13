import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, message: string = 'Thành công', statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: Date.now(),
  });
}

export function sendError(res: Response, message: string = 'Đã có lỗi xảy ra', statusCode: number = 500, errorDetails?: any) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && errorDetails ? { error: errorDetails } : {}),
    timestamp: Date.now(),
  });
}

