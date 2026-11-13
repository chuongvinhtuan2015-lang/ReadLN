import React, { useState, useEffect } from 'react';
import { RotateCcw, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

interface TrashItem {
  id: string | number;
  type: 'STORY' | 'CHAPTER' | 'COMMENT';
  title: string;
  deleted_at: string;
}

export const TrashRestoreTable: React.FC = () => {
  const [trashList, setTrashList] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | number | null>(null);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/trash');
      setTrashList(res.data.data || []);
    } catch {
      console.error('Không thể tải thùng rác');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (item: TrashItem) => {
    if (!window.confirm(`Xác nhận khôi phục ${item.type}: "${item.title}"?`)) return;
    setRestoringId(item.id);
    try {
      await api.post('/admin/restore', {
        type: item.type,
        id: item.id,
      });
      setTrashList(trashList.filter((t) => t.id !== item.id));
      alert('Đã khôi phục dữ liệu (is_deleted = false) thành công!');
    } catch {
      alert('Không thể khôi phục mục này.');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-[#2D5A4C]" />
          <h3 className="text-base font-bold text-[#1F2421]">Khôi Phục Dữ Liệu Xóa Mềm (NIST CSF: Recover - MySQL)</h3>
        </div>
        <button
          onClick={fetchTrash}
          className="p-1 hover:bg-[#DFDCD4] rounded-[2px] text-[#5C635E] transition-colors"
          title="Làm mới"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>



      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#DFDCD4] text-[#5C635E]">
              <th className="py-2 px-3">Loại</th>
              <th className="py-2 px-3">Tiêu đề / Nội dung</th>
              <th className="py-2 px-3">Thời gian xóa</th>
              <th className="py-2 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFDCD4]">
            {trashList.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[#5C635E]">
                  {loading ? 'Đang truy vấn thùng rác...' : 'Thùng rác trống. Không có bản ghi nào bị xóa mềm.'}
                </td>
              </tr>
            ) : (
              trashList.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="hover:bg-[#EAE6DD]">
                  <td className="py-2.5 px-3">
                    <span className="bg-[#EAE6DD] text-[#4A504C] px-2 py-0.5 rounded-[2px] text-[10px] font-bold">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#1F2421]">{item.title}</td>
                  <td className="py-2.5 px-3 text-[#5C635E] font-mono">
                    {new Date(item.deleted_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleRestore(item)}
                      disabled={restoringId === item.id}
                      className="bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] px-3 py-1 rounded-[2px] text-xs font-medium inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3 h-3 ${restoringId === item.id ? 'animate-spin' : ''}`} />
                      {restoringId === item.id ? 'Đang khôi phục...' : 'Khôi phục'}
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
