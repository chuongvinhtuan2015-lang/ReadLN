import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, Star, Eye, Loader2 } from 'lucide-react';
import { TextCover } from '../components/story/TextCover';
import { formatRelativeTime } from '../lib/dateUtils';
import api from '../lib/api';

interface Story {
  id: string;
  title: string;
  slug: string;
  author: string;
  description: string;
  genres: string[];
  views: number;
  rating: number;
  totalRatings: number;
  wordCount?: number;
  updatedAt: string;
  latestChapter: string;
}

export const HomePage: React.FC = () => {
  const [filterType, setFilterType] = useState<'latest' | 'most_viewed'>('latest');
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Gọi API lấy dữ liệu thật từ MySQL Backend
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const sortParam = filterType === 'latest' ? 'latest' : 'views';
        const res = await api.get(`/stories?sort=${sortParam}`);
        if (res.data?.success && res.data?.data) {
          setStories(res.data.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải truyện từ MySQL:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [filterType]);

  return (
    <div className="space-y-6">
      {/* Thanh tiêu đề & 2 tùy chọn Mới Nhất / Đọc Nhiều */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFDCD4]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2421]">
            Khám Phá Truyện
          </h1>
        </div>

        {/* 2 Tùy chọn nút to rõ: Mới Nhất / Đọc Nhiều */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setFilterType('latest')}
            className={`px-4 py-2.5 rounded-[2px] text-sm sm:text-base font-semibold flex items-center gap-2 transition-colors border ${
              filterType === 'latest'
                ? 'bg-[#2D5A4C] border-[#2D5A4C] text-[#F6F4EF]'
                : 'bg-[#EAE6DD] border-[#DFDCD4] text-[#4A504C] hover:bg-[#DFDCD4]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Mới Nhất</span>
          </button>

          <button
            onClick={() => setFilterType('most_viewed')}
            className={`px-4 py-2.5 rounded-[2px] text-sm sm:text-base font-semibold flex items-center gap-2 transition-colors border ${
              filterType === 'most_viewed'
                ? 'bg-[#2D5A4C] border-[#2D5A4C] text-[#F6F4EF]'
                : 'bg-[#EAE6DD] border-[#DFDCD4] text-[#4A504C] hover:bg-[#DFDCD4]'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Đọc Nhiều</span>
          </button>
        </div>
      </div>

      {/* Hiển thị trạng thái đang tải hoặc danh sách truyện thật từ MySQL */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#5C635E]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D5A4C] mb-2" />
          <span className="text-sm">Đang tải dữ liệu từ máy chủ MySQL...</span>
        </div>
      ) : stories.length === 0 ? (
        <div className="py-20 text-center text-[#5C635E] text-sm">
          Chưa có truyện nào trong cơ sở dữ liệu.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {stories.map((story) => (
            <Link
              key={story.id}
              to={`/stories/${story.id}`}
              className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-4 flex flex-col items-center hover:bg-[#EAE6DD] transition-colors group text-center"
            >
              {/* Bìa cỡ vừa md (144x208px) */}
              <TextCover title={story.title} author={story.author} size="md" className="mb-3.5" />

              <div className="w-full flex flex-col flex-1 justify-between">
                <div>
                  {/* Tên truyện to rõ text-base */}
                  <h2 className="text-base sm:text-lg font-bold text-[#1F2421] group-hover:text-[#2D5A4C] transition-colors line-clamp-2 leading-snug">
                    {story.title}
                  </h2>

                  {/* Tác giả */}
                  <p className="text-xs sm:text-sm text-[#5C635E] mt-1 truncate">
                    {story.author}
                  </p>
                </div>

                {/* Thông số hiển thị: Lượt xem hoặc Thời gian */}
                <div className="mt-3 pt-2.5 border-t border-[#DFDCD4] flex items-center justify-between text-xs sm:text-sm font-medium">
                  {filterType === 'most_viewed' ? (
                    <span className="text-[#2D5A4C] font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {story.views.toLocaleString('vi-VN')} lượt đọc
                    </span>
                  ) : (
                    <span className="text-[#5C635E] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2D5A4C]" />
                      {formatRelativeTime(story.updatedAt)}
                    </span>
                  )}

                  <span className="text-[#1F2421] font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#2D5A4C] fill-[#2D5A4C]" />
                    {story.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
