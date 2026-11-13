import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { TextCover } from '../../components/story/TextCover';
import api from '../../lib/api';

export const AdminStoriesPage: React.FC = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stories');
      if (res.data?.success && res.data?.data) {
        setStories(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải truyện admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa mềm (is_deleted = true) bộ truyện "${title}"?`)) {
      try {
        await api.delete(`/admin/stories/${id}`);
        setStories(stories.filter((s) => s.id !== id));
        alert('Đã xóa mềm truyện thành công. Bạn có thể khôi phục tại mục Vận Hành Khẩn Cấp!');
      } catch {
        alert('Không thể xóa truyện lúc này.');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#DFDCD4]">
        <div>
          <h1 className="text-xl font-bold text-[#1F2421]">Quản Lý Truyện & Chương</h1>
        </div>
        <button
          onClick={() => alert('Tính năng thêm truyện giao diện đang cập nhật!')}
          className="bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] px-3.5 py-2 rounded-[2px] text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Thêm Truyện Mới
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#5C635E]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D5A4C] mb-2" />
          <span className="text-xs">Đang tải danh sách truyện từ MySQL...</span>
        </div>
      ) : stories.length === 0 ? (
        <div className="py-20 text-center text-[#5C635E] text-sm">
          Không có truyện nào trong cơ sở dữ liệu.
        </div>
      ) : (
        <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DFDCD4] text-[#5C635E]">
                <th className="p-3">Bìa</th>
                <th className="p-3">Tên tác phẩm</th>
                <th className="p-3">Tác giả</th>
                <th className="p-3">Số chương</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFDCD4]">
              {stories.map((s) => (
                <tr key={s.id} className="hover:bg-[#EAE6DD]">
                  <td className="p-3">
                    <TextCover title={s.title} size="sm" />
                  </td>
                  <td className="p-3 font-bold text-[#1F2421]">{s.title}</td>
                  <td className="p-3 text-[#5C635E]">{s.author}</td>
                  <td className="p-3 text-[#1F2421] font-semibold">{s.chaptersCount} chương</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-[2px] font-semibold">
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(s.id, s.title)}
                      className="text-red-700 hover:text-red-900 inline-flex items-center gap-1 p-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa mềm
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
