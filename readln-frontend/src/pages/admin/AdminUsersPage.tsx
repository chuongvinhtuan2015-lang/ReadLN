import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data?.success && res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id: string) => {
    try {
      const res = await api.post(`/admin/users/${id}/toggle`);
      if (res.data?.success) {
        setUsers(users.map((u) => (u.id === id ? { ...u, status: res.data.data.status } : u)));
      }
    } catch {
      alert('Không thể cập nhật trạng thái người dùng.');
    }
  };

  return (
    <div>
      <div className="pb-4 mb-6 border-b border-[#DFDCD4]">
        <h1 className="text-xl font-bold text-[#1F2421]">Quản Lý Người Dùng & Phân Quyền (RBAC)</h1>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#5C635E]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D5A4C] mb-2" />
          <span className="text-xs">Đang tải danh sách người dùng từ MySQL...</span>
        </div>
      ) : (
        <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DFDCD4] text-[#5C635E]">
                <th className="p-3">Người dùng</th>
                <th className="p-3">Email</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFDCD4]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#EAE6DD]">
                  <td className="p-3 font-bold text-[#1F2421]">{u.username}</td>
                  <td className="p-3 text-[#5C635E]">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-[#2D5A4C] text-[#F6F4EF]' : 'bg-[#EAE6DD] text-[#4A504C]'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold ${
                      u.status === 'Hoạt động' ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[2px] font-medium transition-colors ${
                        u.status === 'Hoạt động'
                          ? 'bg-[#5C3A3A] hover:bg-[#4A2F2F] text-[#F6F4EF]'
                          : 'bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF]'
                      }`}
                    >
                      {u.status === 'Hoạt động' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {u.status === 'Hoạt động' ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
