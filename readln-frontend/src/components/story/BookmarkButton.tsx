import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface BookmarkButtonProps {
  storyId: string | number;
  initialBookmarked?: boolean;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  storyId,
  initialBookmarked = false,
  className = '',
}) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const toggleBookmark = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để lưu truyện vào tủ cá nhân.');
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const res = await api.post('/users/bookmarks', { storyId });
      if (res.data?.success) {
        setIsBookmarked(res.data.data?.bookmarked ?? !isBookmarked);
      }
    } catch {
      alert('Không thể lưu tủ truyện lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleBookmark}
      disabled={loading}
      className={`px-3 py-1.5 rounded-[2px] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isBookmarked
          ? 'bg-[#2D5A4C] text-[#F6F4EF]'
          : 'bg-[#E6E2D8] hover:bg-[#DFDCD4] text-[#1F2421]'
      } ${className}`}
    >
      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
      <span>{isBookmarked ? 'Đã lưu' : 'Lưu tủ'}</span>
    </button>
  );
};

