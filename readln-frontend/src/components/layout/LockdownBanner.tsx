import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LockdownBanner: React.FC = () => {
  const { isLockdownMode } = useAuth();

  if (!isLockdownMode) return null;

  return (
    <div className="bg-[#5C3A3A] text-[#F6F4EF] py-2 px-4 text-xs font-medium border-b border-[#BA8888] flex items-center justify-center gap-2">
      <AlertOctagon className="w-4 h-4 text-red-200 animate-pulse" />
      <span>
        <strong>CHẾ ĐỘ KHẨN CẤP:</strong> Hệ thống đang kích hoạt Kill-Switch Chỉ Đọc (Read-Only). Đăng nhập, bình luận và đánh giá tạm thời bị khóa.
      </span>
    </div>
  );
};

