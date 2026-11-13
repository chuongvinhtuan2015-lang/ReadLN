import React, { useState, useEffect } from 'react';
import { ScrollText, Filter, RefreshCw } from 'lucide-react';
import { WatermarkDecoder } from '../../components/admin/WatermarkDecoder';
import api from '../../lib/api';

interface LogItem {
  id: number;
  user_id: string | null;
  client_ip: string;
  action: string;
  status_code: number;
  details: any;
  time: string;
}

export const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [filterAction, setFilterAction] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs', {
        params: { action: filterAction },
      });
      setLogs(res.data.data || []);
    } catch {
      console.error('Không thể tải nhật ký an ninh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#DFDCD4]">
        <h1 className="text-xl font-bold text-[#1F2421]">Audit Logs & Truy Vết An Ninh</h1>
      </div>

      {/* Công cụ giải mã Zero-width Watermark để truy vết kẻ leak truyện */}
      <WatermarkDecoder />

      {/* Bảng Audit Logs */}
      <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-[#2D5A4C]" />
            <h3 className="text-base font-bold text-[#1F2421]">Nhật Ký Hành Động Hệ Thống (Audit Logs từ MySQL)</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              className="p-1 hover:bg-[#DFDCD4] rounded-[2px] text-[#5C635E] transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#5C635E]" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="p-1 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs text-[#1F2421]"
              >
                <option value="ALL">Tất cả hành động</option>
                <option value="AUTH">Xác thực tài khoản (AUTH)</option>
                <option value="RATE_LIMIT">Chặn Rate-Limit</option>
                <option value="BOT">Bẫy Bot Honeypot</option>
                <option value="SCRAPE">Cào dữ liệu (SCRAPE)</option>
                <option value="ADMIN">Tác vụ Quản trị</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DFDCD4] text-[#5C635E]">
                <th className="py-2 px-3">Thời gian</th>
                <th className="py-2 px-3">Hành động</th>
                <th className="py-2 px-3">Địa chỉ IP</th>
                <th className="py-2 px-3">Tài khoản (ID)</th>
                <th className="py-2 px-3 text-right">HTTP Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFDCD4]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#5C635E]">
                    {loading ? 'Đang truy xuất nhật ký từ MySQL...' : 'Không có log phù hợp bộ lọc.'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#EAE6DD]">
                    <td className="py-2.5 px-3 font-mono text-[#5C635E] whitespace-nowrap">{log.time}</td>
                    <td className="py-2.5 px-3 font-bold text-[#1F2421]">
                      {log.action}
                      {log.details && (
                        <span className="block text-[10px] font-normal text-[#5C635E] truncate max-w-xs font-mono">
                          {typeof log.details === 'object'
                            ? (log.details.url ? `${log.details.method || ''} ${log.details.url}` : JSON.stringify(log.details))
                            : String(log.details)}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-red-800">{log.client_ip}</td>
                    <td className="py-2.5 px-3 text-[#5C635E] font-mono">{log.user_id ? log.user_id.slice(0, 8) + '...' : 'Guest / System'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded-[2px] ${
                        log.status_code < 400 ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                      }`}>
                        {log.status_code}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

