import React, { useState } from 'react';
import { AlertOctagon, Power } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface KillSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KillSwitchModal: React.FC<KillSwitchModalProps> = ({ isOpen, onClose }) => {
  const { isLockdownMode, setLockdownMode } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      const nextState = !isLockdownMode;
      await api.post('/admin/lockdown', { enable: nextState });
      setLockdownMode(nextState);
      onClose();
    } catch {
      alert('Không thể thực hiện tác vụ khẩn cấp!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] max-w-md w-full p-6">
        <div className="flex items-center gap-3 text-red-700 mb-4">
          <AlertOctagon className="w-6 h-6 flex-shrink-0" />
          <h3 className="text-base font-bold text-[#1F2421]">
            Xác nhận {isLockdownMode ? 'Hủy Bỏ' : 'Kích Hoạt'} Kill-Switch?
          </h3>
        </div>

        <p className="text-xs text-[#5C635E] mb-6 leading-relaxed">
          {isLockdownMode
            ? 'Hệ thống sẽ mở lại các tính năng ghi dữ liệu: Đăng nhập, Tạo tài khoản, Viết bình luận, Đánh giá sao.'
            : 'Toàn bộ API ghi dữ liệu sẽ bị vô hiệu hóa (HTTP 503). Người dùng chỉ có thể đọc truyện. Dùng trong trường hợp hệ thống bị tấn công spam hoặc DDoS diện rộng.'}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[2px] bg-[#E6E2D8] text-xs font-medium text-[#1F2421] hover:bg-[#DFDCD4]"
          >
            Đóng
          </button>
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-4 py-2 rounded-[2px] text-xs font-medium text-[#F6F4EF] flex items-center gap-1.5 ${
              isLockdownMode ? 'bg-[#2D5A4C] hover:bg-[#23473C]' : 'bg-[#5C3A3A] hover:bg-[#4A2F2F]'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {loading ? 'Đang xử lý...' : isLockdownMode ? 'Mở lại bình thường' : 'Kích hoạt Khẩn cấp'}
          </button>
        </div>
      </div>
    </div>
  );
};

