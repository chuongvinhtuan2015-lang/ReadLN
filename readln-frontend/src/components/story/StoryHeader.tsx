import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Star, BookOpen, Clock } from 'lucide-react';
import { TextCover } from './TextCover';
import { formatRelativeTime } from '../../lib/dateUtils';

interface StoryHeaderProps {
  story: {
    id: string | number;
    title: string;
    author?: string;
    description?: string;
    genres?: Array<{ id: number; name: string; slug: string } | string>;
    views?: number;
    rating?: number;
    totalRatings?: number;
    wordCount?: number;
    updatedAt?: string;
    firstChapterId?: string | number;
  };
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export const StoryHeader: React.FC<StoryHeaderProps> = ({
  story,
  onBookmark,
  isBookmarked = false,
}) => {
  return (
    <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Cột trái: Bìa sách cỡ lớn lg */}
        <div className="flex-shrink-0 flex justify-center">
          <TextCover title={story.title} author={story.author} size="lg" />
        </div>

        {/* Cột phải: Thông tin & Thao tác */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {story.genres?.map((g, idx) => {
                const name = typeof g === 'string' ? g : g.name;
                const slug = typeof g === 'string' ? '' : g.slug;
                return (
                  <Link
                    key={idx}
                    to={slug ? `/categories?genre=${slug}` : '/categories'}
                    className="bg-[#EAE6DD] hover:bg-[#2D5A4C] hover:text-[#F6F4EF] text-[#4A504C] px-2.5 py-1 rounded-[2px] text-xs transition-colors cursor-pointer"
                  >
                    {name}
                  </Link>
                );
              })}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2421] mb-2 leading-tight">
              {story.title}
            </h1>

            <p className="text-sm text-[#5C635E] mb-4">
              Tác giả: <span className="font-medium text-[#1F2421]">{story.author || 'Đang cập nhật'}</span>
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              {story.firstChapterId ? (
                <Link
                  to={`/stories/${story.id}/chapters/${story.firstChapterId}`}
                  className="bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] px-5 py-2 rounded-[2px] text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  Đọc Từ Đầu
                </Link>
              ) : (
                <a
                  href="#chapter-list"
                  className="bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] px-5 py-2 rounded-[2px] text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  Đọc Từ Đầu
                </a>
              )}
              <button
                type="button"
                onClick={onBookmark}
                className={`px-4 py-2 rounded-[2px] text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                  isBookmarked
                    ? 'bg-[#2D5A4C] text-[#F6F4EF]'
                    : 'bg-[#E6E2D8] hover:bg-[#DFDCD4] text-[#1F2421]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Đã Lưu Tủ Truyện' : 'Lưu Tủ Truyện'}
              </button>
            </div>
          </div>

          {/* Dải Chỉ Số 4 Cột chuẩn skill.md 4.2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#DFDCD4] bg-[#F6F4EF] rounded-[2px] text-center">
            <div className="p-2.5 border-b sm:border-b-0 border-r border-[#DFDCD4]">
              <div className="text-[11px] text-[#5C635E] flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> Cập nhật
              </div>
              <div className="text-sm font-bold text-[#1F2421] mt-0.5">
                {formatRelativeTime(story.updatedAt)}
              </div>
            </div>

            <div className="p-2.5 border-b sm:border-b-0 sm:border-r border-[#DFDCD4]">
              <div className="text-[11px] text-[#5C635E]">Số từ</div>
              <div className="text-sm font-bold text-[#1F2421] mt-0.5">
                {(story.wordCount || 125400).toLocaleString('vi-VN')}
              </div>
            </div>

            <div className="p-2.5 border-r border-[#DFDCD4]">
              <div className="text-[11px] text-[#5C635E] flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-[#2D5A4C]" /> Đánh giá
              </div>
              <div className="text-sm font-bold text-[#1F2421] mt-0.5">
                {story.rating || 4.8} / {story.totalRatings || 50}
              </div>
            </div>

            <div className="p-2.5">
              <div className="text-[11px] text-[#5C635E]">Lượt xem</div>
              <div className="text-sm font-bold text-[#1F2421] mt-0.5">
                {(story.views || 8920).toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mô tả tóm tắt truyện */}
      {story.description && (
        <div className="mt-6 pt-5 border-t border-[#DFDCD4] text-sm text-[#1F2421] leading-relaxed">
          <h2 className="text-xs font-bold text-[#5C635E] uppercase tracking-wider mb-2">Giới thiệu tác phẩm</h2>
          <p className="whitespace-pre-line">{story.description}</p>
        </div>
      )}
    </div>
  );
};

