import React, { useState, useEffect } from 'react';
import { Ban, Plus, Trash2, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

interface BlacklistEntry {
  id: number;
  ip_address: string;
  reason: string;
  created_at: string;
}

export const IpBlacklistTable: React.FC = () => {
  const [list, setList] = useState<BlacklistEntry[]>([]);
  const [newIp, setNewIp] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchBlacklist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/blacklists');
      setList(res.data.data || []);
    } catch {
      console.error('Không thể tải danh sách blacklist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/admin/blacklists', {
        ip_address: newIp.trim(),
        reason: reason.trim() || 'Chặn thủ công bởi Quản trị viên',
      });
      setNewIp('');
      setReason('');
      fetchBlacklist();
    } catch {
      alert('Không thể chặn IP này. Vui lòng kiểm tra lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn mở khóa IP này?')) return;
    try {
      await api.delete(`/admin/blacklists/${id}`);
      setList(list.filter((item) => item.id !== id));
    } catch {
      alert('Không thể mở khóa IP này.');
    }
  };

  return (
    <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ban className="w-5 h-5 text-red-700" />
          <h3 className="text-base font-bold text-[#1F2421]">Danh Sách Đen IP (NIST CSF: Respond - MySQL)</h3>
        </div>
        <button
          onClick={fetchBlacklist}
          className="p-1 hover:bg-[#DFDCD4] rounded-[2px] text-[#5C635E] transition-colors"
          title="Làm mới"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={newIp}
          onChange={(e) => setNewIp(e.target.value)}
          placeholder="Địa chỉ IP (VD: 1.2.3.4)"
          className="flex-1 p-2 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs focus:outline-none focus:border-[#2D5A4C]"
          required
        />
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Lý do chặn"
          className="flex-1 p-2 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs focus:outline-none focus:border-[#2D5A4C]"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#5C3A3A] hover:bg-[#4A2F2F] text-[#F6F4EF] px-4 py-2 rounded-[2px] text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> {submitting ? 'Đang thêm...' : 'Chặn IP'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#DFDCD4] text-[#5C635E]">
              <th className="py-2 px-3">IP</th>
              <th className="py-2 px-3">Lý do</th>
              <th className="py-2 px-3">Thời gian ghi nhận</th>
              <th className="py-2 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFDCD4]">
            {list.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[#5C635E]">
                  {loading ? 'Đang tải danh sách đen...' : 'Hiện chưa có IP nào bị chặn.'}
                </td>
              </tr>
            ) : (
              list.map((item) => (
                <tr key={item.id} className="hover:bg-[#EAE6DD]">
                  <td className="py-2.5 px-3 font-mono font-bold text-red-800">{item.ip_address}</td>
                  <td className="py-2.5 px-3 text-[#1F2421]">{item.reason}</td>
                  <td className="py-2.5 px-3 text-[#5C635E] font-mono">
                    {new Date(item.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-700 hover:text-red-900 p-1"
                      title="Mở khóa IP"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


