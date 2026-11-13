import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } catch {
      // Ignored
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-8">
        <h1 className="text-xl font-bold text-[#1F2421] mb-2 text-center">Khôi Phục Mật Khẩu</h1>
        <p className="text-xs text-[#5C635E] mb-6 text-center">
          Nhập email đăng ký của bạn để nhận liên kết đặt lại mật khẩu một lần.
        </p>

        {sent ? (
          <div className="p-4 bg-green-100 border border-green-300 rounded-[2px] text-xs text-green-800 flex items-start gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Chúng tôi đã gửi email hướng dẫn khôi phục tới <strong>{email}</strong> nếu tài khoản tồn tại trong hệ thống.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F2421] mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@example.com"
                className="w-full p-2.5 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs focus:outline-none focus:border-[#2D5A4C]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] rounded-[2px] text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              {loading ? 'Đang gửi...' : 'Gửi Liên Kết Khôi Phục'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-[#DFDCD4] text-center text-xs text-[#5C635E]">
          <Link to="/login" className="text-[#2D5A4C] font-semibold hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

