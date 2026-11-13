import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { TextCover } from '../../components/story/TextCover';
import api from '../../lib/api';

interface Genre {
  id: number;
  name: string;
  slug: string;
}

export const CategoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get('genre') || 'all';

  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>(genreParam);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cập nhật activeSlug khi param trên URL thay đổi
  useEffect(() => {
    setActiveSlug(searchParams.get('genre') || 'all');
  }, [searchParams]);

  // 1. Tải danh sách thể loại từ MySQL
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.get('/stories/genres');
        if (res.data?.success && res.data?.data) {
          setGenres(res.data.data);
        }
      } catch (err) {
        console.error('Lỗi tải thể loại:', err);
      }
    };
    fetchGenres();
  }, []);

  // 2. Tải danh sách truyện theo thể loại chọn
  useEffect(() => {
    const fetchStoriesByGenre = async () => {
      setLoading(true);
      try {
        const url = activeSlug === 'all' ? '/stories' : `/stories?genre=${activeSlug}`;
        const res = await api.get(url);
        if (res.data?.success && res.data?.data) {
          setStories(res.data.data);
        }
      } catch (err) {
        console.error('Lỗi tải truyện theo thể loại:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStoriesByGenre();
  }, [activeSlug]);

  const handleSelectGenre = (slug: string) => {
    setActiveSlug(slug);
    if (slug === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ genre: slug });
    }
  };

  return (
    <div>
      <div className="pb-4 mb-6 border-b border-[#DFDCD4]">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2421]">Khám Phá Theo Thể Loại</h1>
      </div>

      {/* Dải Tag thể loại lấy từ MySQL */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleSelectGenre('all')}
          className={`px-3 py-1.5 rounded-[2px] text-xs font-medium transition-colors ${
            activeSlug === 'all'
              ? 'bg-[#2D5A4C] text-[#F6F4EF]'
              : 'bg-[#EAE6DD] text-[#4A504C] hover:bg-[#DFDCD4]'
          }`}
        >
          Tất cả
        </button>

        {genres.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelectGenre(cat.slug)}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-medium transition-colors ${
              activeSlug === cat.slug
                ? 'bg-[#2D5A4C] text-[#F6F4EF]'
                : 'bg-[#EAE6DD] text-[#4A504C] hover:bg-[#DFDCD4]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Lưới truyện thật từ MySQL */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#5C635E]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D5A4C] mb-2" />
          <span className="text-sm">Đang lọc truyện theo thể loại từ MySQL...</span>
        </div>
      ) : stories.length === 0 ? (
        <div className="py-20 text-center text-[#5C635E] text-sm">
          Chưa có tác phẩm nào thuộc thể loại này.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {stories.map((item) => (
            <Link
              key={item.id}
              to={`/stories/${item.id}`}
              className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-3 flex flex-col items-center hover:bg-[#EAE6DD] transition-colors group"
            >
              <TextCover title={item.title} author={item.author} size="md" className="mb-3" />
              <div className="w-full text-center">
                <div className="text-xs sm:text-sm font-bold text-[#1F2421] group-hover:text-[#2D5A4C] truncate">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#5C635E] mt-0.5 truncate">
                  {item.genres?.join(', ') || item.author}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
