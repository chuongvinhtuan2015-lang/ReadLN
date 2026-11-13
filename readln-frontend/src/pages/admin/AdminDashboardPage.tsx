import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, UserX, EyeOff, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data?.success && res.data?.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Lỗi lấy thống kê admin:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#5C635E]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5A4C] mb-2" />
        <span className="text-xs">Đang tải dữ liệu an ninh từ MySQL...</span>
      </div>
    );
  }

  const sec = stats?.security24h || {};

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#DFDCD4]">
        <h1 className="text-xl font-bold text-[#1F2421]">Admin Security Dashboard (NIST CSF: Detect)</h1>
      </div>

      {/* 4 Thẻ chỉ số an ninh từ Database MySQL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-4">
          <div className="flex items-center justify-between text-[#5C635E] text-xs mb-1">
            <span>Trạng thái hệ thống</span>
            <ShieldCheck className="w-4 h-4 text-green-700" />
          </div>
          <div className="text-lg font-bold text-[#1F2421]">
            {stats?.isLockdownMode ? 'Chỉ Đọc (Lockdown)' : 'An Toàn'}
          </div>
          <div className="text-[11px] text-green-700 mt-1">NIST CSF 1.1 compliant</div>
        </div>

        <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-4">
          <div className="flex items-center justify-between text-[#5C635E] text-xs mb-1">
            <span>Truy cập bị chặn (429)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-[#1F2421]">{sec.blocked429 || 0} lần</div>
          <div className="text-[11px] text-amber-600 mt-1">Đã chặn tự động bằng Rate-limit</div>
        </div>

        <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-4">
          <div className="flex items-center justify-between text-[#5C635E] text-xs mb-1">
            <span>IP trong Danh sách đen</span>
            <UserX className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-lg font-bold text-[#1F2421]">{sec.activeBlacklists || 0} IP</div>
          <div className="text-[11px] text-red-600 mt-1">Bảng ip_blacklists MySQL</div>
        </div>

        <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-4">
          <div className="flex items-center justify-between text-[#5C635E] text-xs mb-1">
            <span>Đăng nhập thất bại (24h)</span>
            <EyeOff className="w-4 h-4 text-[#2D5A4C]" />
          </div>
          <div className="text-lg font-bold text-[#1F2421]">{sec.failedLogins || 0} lần</div>
          <div className="text-[11px] text-[#2D5A4C] mt-1">Ghi nhận từ audit_logs</div>
        </div>
      </div>

      {/* Sự kiện cảnh báo gần nhất từ bảng audit_logs MySQL */}
      <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-6">
        <h3 className="text-sm font-bold text-[#1F2421] mb-3">Sự Kiện An Ninh Gần Nhất (Audit Logs)</h3>
        {(!stats?.recentLogs || stats.recentLogs.length === 0) ? (
          <p className="text-xs text-[#5C635E]">Chưa có sự kiện cảnh báo nào.</p>
        ) : (
          <div className="space-y-2 text-xs">
            {stats.recentLogs.map((log: any) => (
              <div key={log.id} className="p-3 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] flex items-center justify-between">
                <span className="text-[#1F2421]">
                  Hành động <strong>{log.action}</strong> từ IP <code className="text-red-700 font-bold">{log.client_ip}</code>
                </span>
                <span className={`px-2 py-0.5 rounded-[2px] font-bold ${log.status_code === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  HTTP {log.status_code}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
