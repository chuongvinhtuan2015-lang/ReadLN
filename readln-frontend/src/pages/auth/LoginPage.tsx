import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { HoneypotField } from '../../components/ui/HoneypotField';
import api from '../../lib/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLockdownMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockdownMode) {
      setError('Hệ thống đang trong chế độ Chỉ Đọc khẩn cấp. Không thể đăng nhập.');
      return;
    }
    if (honeypot) return; // Chặn Bot

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success && res.data?.data?.user) {
        login(res.data.data.user);
        navigate('/');
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setCooldown(30);
        setError('Bạn đã nhập sai quá nhiều lần. Vui lòng chờ 30 giây.');
      } else {
        setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-8">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-[2px] bg-[#2D5A4C] text-[#F6F4EF] flex items-center justify-center font-bold text-xl mx-auto mb-2 font-serif">
            R
          </div>
          <h1 className="text-xl font-bold text-[#1F2421]">Đăng Nhập Tài Khoản</h1>
          <p className="text-xs text-[#5C635E] mt-1">Truy cập để lưu truyện và tham gia bình luận</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-[2px] text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <HoneypotField value={honeypot} onChange={setHoneypot} />

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

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-[#1F2421]">Mật khẩu</label>
              <Link to="/forgot-password" className="text-[11px] text-[#2D5A4C] hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pr-10 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs focus:outline-none focus:border-[#2D5A4C]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#5C635E] hover:text-[#1F2421]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cooldown > 0 || isLockdownMode}
            className="w-full py-2.5 bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] rounded-[2px] text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#DFDCD4] text-center text-xs text-[#5C635E]">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-[#2D5A4C] font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
