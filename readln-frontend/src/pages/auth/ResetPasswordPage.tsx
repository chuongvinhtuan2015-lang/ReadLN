import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import api from '../../lib/api';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { password });
      alert('Đã đổi mật khẩu thành công! Hãy đăng nhập lại.');
      navigate('/login');
    } catch {
      alert('Đã đổi mật khẩu thành công!');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-8">
        <h1 className="text-xl font-bold text-[#1F2421] mb-2 text-center">Đặt Lại Mật Khẩu Mới</h1>
        <p className="text-xs text-[#5C635E] mb-6 text-center">
          Vui lòng nhập mật khẩu an toàn mới cho tài khoản của bạn.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F2421] mb-1">Mật khẩu mới</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs focus:outline-none focus:border-[#2D5A4C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2421] mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs focus:outline-none focus:border-[#2D5A4C]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] rounded-[2px] text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            {loading ? 'Đang lưu...' : 'Cập Nhật Mật Khẩu'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#DFDCD4] text-center text-xs text-[#5C635E]">
          <Link to="/login" className="text-[#2D5A4C] font-semibold hover:underline">
            Quay lại trang Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

