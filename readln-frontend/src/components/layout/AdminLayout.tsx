import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Shield, LayoutDashboard, BookText, Users, ScrollText, Wrench, ArrowLeft } from 'lucide-react';
import { LockdownBanner } from './LockdownBanner';

export const AdminLayout: React.FC = () => {
  const menuItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Tổng quan (Dashboard)', end: true },
    { to: '/admin/stories', icon: BookText, label: 'Quản lý Truyện & Chương' },
    { to: '/admin/users', icon: Users, label: 'Người dùng & Phân quyền' },
    { to: '/admin/logs', icon: ScrollText, label: 'Nhật ký Audit Logs & Truy vết' },
    { to: '/admin/operations', icon: Wrench, label: 'Tác vụ Khẩn cấp & Sao lưu' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4EF] text-[#1F2421]">
      <LockdownBanner />
      <header className="h-14 bg-[#2D5A4C] text-[#F6F4EF] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wide">ReadLN - Admin Control Center (NIST CSF 1.1)</span>
        </div>
        <Link
          to="/"
          className="text-xs bg-[#23473C] hover:bg-[#1b372f] px-3 py-1.5 rounded-[2px] flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Về trang đọc
        </Link>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-3 flex-shrink-0 self-start">
          <div className="text-[11px] font-bold text-[#5C635E] uppercase tracking-wider px-3 py-2">
            Điều hành hệ thống
          </div>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-[2px] text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#2D5A4C] text-[#F6F4EF]'
                      : 'text-[#1F2421] hover:bg-[#EAE6DD]'
                  }`
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Nội dung quản trị */}
        <div className="flex-1 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

