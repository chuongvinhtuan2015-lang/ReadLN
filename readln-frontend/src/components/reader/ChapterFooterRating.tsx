import React, { useState } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import api from '../../lib/api';

interface ChapterFooterRatingProps {
  storyId: string | number;
  chapterId: string | number;
}

export const ChapterFooterRating: React.FC<ChapterFooterRatingProps> = ({
  storyId,
  chapterId,
}) => {
  const [rated, setRated] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number>(0);

  const handleRate = async (score: number) => {
    setSelectedScore(score);
    setRated(true);
    try {
      await api.post(`/stories/${storyId}/chapters/${chapterId}/rate`, { score });
    } catch {
      // Ignored
    }
  };

  return (
    <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-6 text-center mt-8">
      <h3 className="text-sm font-bold text-[#1F2421] mb-2">Bạn thấy chương này thế nào?</h3>
      <p className="text-xs text-[#5C635E] mb-4">Đánh giá nhanh để ủng hộ tác giả / người dịch</p>

      {rated ? (
        <div className="text-xs text-[#2D5A4C] font-semibold">
          Cảm ơn bạn đã gửi đánh giá {selectedScore} sao!
        </div>
      ) : (
        <div className="flex justify-center items-center gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => handleRate(score)}
              className="p-1 text-[#5C635E] hover:text-[#2D5A4C] transition-colors"
            >
              <Star className="w-6 h-6 hover:fill-current" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-[#DFDCD4] flex justify-center">
        <a
          href={`/stories/${storyId}#chapter-list`}
          className="text-xs text-[#5C635E] hover:text-[#2D5A4C] flex items-center gap-1 font-medium"
        >
          <MessageCircle className="w-3.5 h-3.5" /> Thảo luận về chương này
        </a>
      </div>
    </div>
  );
};

