import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { StoryHeader } from '../../components/story/StoryHeader';
import { ChapterList, type ChapterItem } from '../../components/story/ChapterList';
import { CommentSection, type CommentItem } from '../../components/story/CommentSection';
import { RatingWidget } from '../../components/story/RatingWidget';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

export const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [story, setStory] = useState<any>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStoryData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Lấy thông tin truyện và danh sách chương từ MySQL
        const resStory = await api.get(`/stories/${id}`);
        if (resStory.data?.success && resStory.data?.data) {
          const data = resStory.data.data;
          const chaps = data.chapters || [];
          const firstChapId = chaps.length > 0 ? chaps[0].id : undefined;
          setStory({ ...data, firstChapterId: firstChapId });
          setChapters(chaps);
          setIsBookmarked(!!data.isBookmarked);
        }

        // 2. Lấy danh sách bình luận thật từ MySQL
        const resComments = await api.get(`/stories/${id}/comments`);
        if (resComments.data?.success && resComments.data?.data) {
          setComments(resComments.data.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết truyện từ MySQL:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoryData();
  }, [id, user]);

  const handleToggleBookmark = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để lưu tác phẩm vào tủ truyện cá nhân.');
      return;
    }
    if (!story) return;

    try {
      const res = await api.post('/users/bookmarks', { storyId: story.id });
      if (res.data?.success) {
        setIsBookmarked(res.data.data?.bookmarked ?? !isBookmarked);
      }
    } catch {
      alert('Không thể lưu tủ truyện lúc này.');
    }
  };

  const handleCommentAdded = (newCm: CommentItem) => {
    setComments([newCm, ...comments]);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-[#5C635E]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5A4C] mb-2" />
        <span className="text-sm">Đang tải thông tin truyện từ MySQL...</span>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="py-20 text-center text-[#5C635E] text-sm">
        Không tìm thấy tác phẩm trong cơ sở dữ liệu.
      </div>
    );
  }

  return (
    <div>
      {/* Header thông tin chi tiết từ MySQL */}
      <StoryHeader
        story={story}
        isBookmarked={isBookmarked}
        onBookmark={handleToggleBookmark}
      />

      {/* Đánh giá nhanh */}
      <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs font-bold text-[#1F2421]">Đánh giá tác phẩm này:</span>
        <RatingWidget
          storyId={story.id}
          currentRating={story.rating}
          totalVotes={story.totalRatings}
          onRated={(score) => {
            setStory((prev: any) => ({ ...prev, rating: score, totalRatings: (prev.totalRatings || 0) + 1 }));
          }}
        />
      </div>

      {/* Mục lục chương thật từ bảng chapters */}
      <ChapterList storyId={story.id} chapters={chapters} />

      {/* Khung bình luận kết nối MySQL */}
      <CommentSection storyId={story.id} comments={comments} onCommentAdded={handleCommentAdded} />
    </div>
  );
};
