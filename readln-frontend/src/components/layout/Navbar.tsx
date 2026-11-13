import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bookmark, User, Shield, LogOut, KeyRound, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#F6F4EF] border-b border-[#DFDCD4] transition-colors">
      <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        {/* Bên trái: Logo + Tiêu đề ReadLN */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-[2px] bg-[#2D5A4C] flex items-center justify-center text-[#F6F4EF] font-bold font-serif text-lg leading-none shadow-none group-hover:bg-[#23473C] transition-colors">
              R
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-[#1F2421] leading-none">
                ReadLN
              </div>
              <div className="text-[10px] text-[#5C635E] tracking-wider uppercase font-mono mt-0.5">
                Paper Light Novel
              </div>
            </div>
          </Link>

          {/* Menu điều hướng */}
          <nav className="hidden md:flex items-center gap-4 ml-6 text-xs font-medium text-[#5C635E]">
            <Link to="/" className="hover:text-[#2D5A4C] transition-colors">Trang chủ</Link>
            <Link to="/categories" className="hover:text-[#2D5A4C] transition-colors">Thể loại</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-[#2D5A4C] font-semibold flex items-center gap-1 hover:underline">
                <Shield className="w-3.5 h-3.5" /> Quản trị
              </Link>
            )}
          </nav>
        </div>

        {/* Giữa & Phải: Search bar + Tủ truyện + User Dropdown */}
        <div className="flex items-center gap-3">
          {/* Input Tìm kiếm */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 lg:w-60">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm tên truyện, tác giả..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] text-[#1F2421] focus:outline-none focus:border-[#2D5A4C] placeholder-[#5C635E] transition-colors"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#5C635E]" />
          </form>

          {/* Nút Tủ truyện */}
          <Link
            to="/bookmarks"
            className="h-8 px-3 rounded-[2px] bg-[#E6E2D8] hover:bg-[#DFDCD4] text-[#1F2421] text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Tủ truyện đã lưu"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#5C635E]" />
            <span className="hidden sm:inline">Tủ truyện</span>
          </Link>

          {/* User Menu: Bỏ nút đăng xuất bên ngoài, bấm vào user để xổ menu Đổi Pass & Đăng Xuất */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="h-8 px-3 rounded-[2px] bg-[#E6E2D8] hover:bg-[#DFDCD4] text-[#1F2421] text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#2D5A4C]" />
                <span className="max-w-[100px] truncate">{user.username}</span>
                <ChevronDown className={`w-3 h-3 text-[#5C635E] transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] shadow-lg py-1 z-50 text-xs">
                  <Link
                    to="/change-password"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[#1F2421] hover:bg-[#DFDCD4] transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#2D5A4C]" />
                    <span>Đổi mật khẩu</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-red-700 hover:bg-[#DFDCD4] transition-colors border-t border-[#DFDCD4]"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-700" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="h-8 px-3 rounded-[2px] bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
