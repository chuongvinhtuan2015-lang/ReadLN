import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { HoneypotField } from '../../components/ui/HoneypotField';
import api from '../../lib/api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Chặn Bot

    if (password.length < 8) {
      setError('Mật khẩu phải chứa ít nhất 8 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', { username, email, password });
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký tài khoản thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-[#1F2421]">Tạo Tài Khoản Mới</h1>
          <p className="text-xs text-[#5C635E] mt-1">Gia nhập cộng đồng đọc Light Novel Warm Paper</p>
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
            <label className="block text-xs font-semibold text-[#1F2421] mb-1">Tên hiển thị</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="NguyenVanA"
              className="w-full p-2.5 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs focus:outline-none focus:border-[#2D5A4C]"
            />
          </div>

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
            <label className="block text-xs font-semibold text-[#1F2421] mb-1">Mật khẩu (tối thiểu 8 ký tự)</label>
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

          <div>
            <label className="block text-xs font-semibold text-[#1F2421] mb-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pr-10 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs focus:outline-none focus:border-[#2D5A4C]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-[#5C635E] hover:text-[#1F2421]"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] rounded-[2px] text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Đang tạo...' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#DFDCD4] text-center text-xs text-[#5C635E]">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-[#2D5A4C] font-semibold hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
