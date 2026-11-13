import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể đổi mật khẩu lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-8">
        <h1 className="text-xl font-bold text-[#1F2421] mb-1 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#2D5A4C]" /> Đổi Mật Khẩu
        </h1>
        <p className="text-xs text-[#5C635E] mb-6">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn</p>

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-[2px] text-xs text-green-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Đổi mật khẩu thành công!</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-[2px] text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F2421] mb-1">Mật khẩu hiện tại</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pr-10 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs focus:outline-none focus:border-[#2D5A4C]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-[#5C635E] hover:text-[#1F2421]"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2421] mb-1">Mật khẩu mới (tối thiểu 8 ký tự)</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pr-10 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs focus:outline-none focus:border-[#2D5A4C]"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-[#5C635E] hover:text-[#1F2421]"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2421] mb-1">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pr-10 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs focus:outline-none focus:border-[#2D5A4C]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-[#5C635E] hover:text-[#1F2421]"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] rounded-[2px] text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
};

