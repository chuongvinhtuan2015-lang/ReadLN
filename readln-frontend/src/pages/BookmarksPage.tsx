import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookOpen, Trash2, Loader2 } from 'lucide-react';
import { TextCover } from '../components/story/TextCover';
import api from '../lib/api';

interface BookmarkItem {
  id: string;
  title: string;
  slug: string;
  author: string;
  genres: string[];
  lastChapter: string;
  savedAt: string;
}

export const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/bookmarks');
      if (res.data?.success && res.data?.data) {
        setBookmarks(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải tủ truyện:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemove = async (storyId: string) => {
    try {
      await api.post('/users/bookmarks', { storyId });
      setBookmarks(bookmarks.filter((b) => b.id !== storyId));
    } catch {
      alert('Không thể bỏ lưu lúc này.');
    }
  };

  return (
    <div>
      <div className="pb-4 mb-6 border-b border-[#DFDCD4] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1F2421] flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#2D5A4C]" /> Tủ Truyện Cá Nhân
          </h1>
        </div>
        <span className="text-xs bg-[#EAE6DD] text-[#4A504C] px-2.5 py-1 rounded-[2px] font-semibold">
          {bookmarks.length} tác phẩm
        </span>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#5C635E]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D5A4C] mb-2" />
          <span className="text-sm">Đang tải tủ truyện từ MySQL...</span>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="py-20 text-center text-[#5C635E] text-sm">
          Tủ truyện của bạn đang trống. Hãy bấm "Lưu tủ" tại các bộ truyện yêu thích!
        </div>
      ) : (
        <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] divide-y divide-[#DFDCD4]">
          {bookmarks.map((b) => (
            <div key={b.id} className="p-4 flex items-center gap-4 hover:bg-[#EAE6DD] transition-colors">
              <TextCover title={b.title} size="sm" />
              <div className="flex-1 min-w-0">
                <Link to={`/stories/${b.id}`} className="text-sm font-bold text-[#1F2421] hover:text-[#2D5A4C] truncate block">
                  {b.title}
                </Link>
                <div className="text-xs text-[#5C635E] mt-0.5">Tác giả: {b.author}</div>
                <div className="text-xs text-[#2D5A4C] font-medium mt-1">Mới nhất: {b.lastChapter}</div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/stories/${b.id}`}
                  className="px-3 py-1.5 rounded-[2px] bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] text-xs font-medium flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Xem tiếp
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemove(b.id)}
                  className="p-1.5 text-[#5C635E] hover:text-red-700 transition-colors cursor-pointer"
                  title="Bỏ lưu khỏi tủ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
