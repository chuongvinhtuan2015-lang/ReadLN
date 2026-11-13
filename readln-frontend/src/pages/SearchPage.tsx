import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, BookOpen, Loader2 } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { TextCover } from '../components/story/TextCover';
import api from '../lib/api';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Áp dụng useDebounce 400ms chống spam truy vấn lên máy chủ MySQL
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    const searchStories = async () => {
      if (!debouncedSearch.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/stories?search=${encodeURIComponent(debouncedSearch.trim())}`);
        if (res.data?.success && res.data?.data) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Lỗi tìm kiếm:', err);
      } finally {
        setLoading(false);
      }
    };

    searchStories();
  }, [debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div>
      <div className="pb-4 mb-6 border-b border-[#DFDCD4]">
        <h1 className="text-xl font-bold text-[#1F2421]">Tìm Kiếm Truyện</h1>
      </div>

      {/* Input tìm kiếm lớn */}
      <div className="relative max-w-xl mx-auto mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Nhập tên truyện, tên tác giả hoặc từ khóa..."
          className="w-full p-3 pl-10 bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] text-sm text-[#1F2421] focus:outline-none focus:border-[#2D5A4C] transition-colors"
        />
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5C635E]" />
      </div>

      {/* Kết quả tìm kiếm từ MySQL */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-[#5C635E]">
          <Loader2 className="w-6 h-6 animate-spin text-[#2D5A4C] mb-2" />
          <span className="text-xs">Đang tìm kiếm trong cơ sở dữ liệu...</span>
        </div>
      ) : debouncedSearch ? (
        <div>
          <div className="text-xs text-[#5C635E] mb-4">
            Kết quả tìm kiếm cho: <strong className="text-[#1F2421]">"{debouncedSearch}"</strong> ({results.length} tác phẩm)
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#5C635E]">
              Không tìm thấy tác phẩm nào phù hợp với từ khóa của bạn.
            </div>
          ) : (
            <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] divide-y divide-[#DFDCD4]">
              {results.map((story) => (
                <div key={story.id} className="p-4 flex items-center gap-4 hover:bg-[#EAE6DD] transition-colors">
                  <TextCover title={story.title} size="sm" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/stories/${story.id}`} className="text-sm font-bold text-[#1F2421] hover:text-[#2D5A4C] truncate block">
                      {story.title}
                    </Link>
                    <div className="text-xs text-[#5C635E] mt-0.5">Tác giả: {story.author}</div>
                    <p className="text-xs text-[#5C635E] truncate mt-1">
                      {story.description || 'Chưa có tóm tắt'}
                    </p>
                  </div>
                  <Link
                    to={`/stories/${story.id}`}
                    className="px-3 py-1.5 rounded-[2px] bg-[#2D5A4C] text-[#F6F4EF] text-xs font-medium flex items-center gap-1 hover:bg-[#23473C]"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Xem
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-xs text-[#5C635E]">
          Nhập từ khóa phía trên để bắt đầu tìm kiếm.
        </div>
      )}
    </div>
  );
};
