import React, { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../lib/api';

interface RatingWidgetProps {
  storyId: string | number;
  currentRating?: number;
  totalVotes?: number;
  onRated?: (newRating: number) => void;
  disabled?: boolean;
}

export const RatingWidget: React.FC<RatingWidgetProps> = ({
  storyId,
  currentRating = 5,
  totalVotes = 0,
  onRated,
  disabled = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (score: number) => {
    if (disabled || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post(`/stories/${storyId}/rate`, { score });
      setUserRating(score);
      if (onRated) onRated(score);
    } catch {
      // Báo lỗi hoặc hiển thị toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = (hoverRating || userRating || currentRating) >= star;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled || isSubmitting}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              onMouseLeave={() => !disabled && setHoverRating(null)}
              onClick={() => handleRate(star)}
              className="p-0.5 focus:outline-none transition-transform hover:scale-110 disabled:opacity-50"
            >
              <Star
                className={`w-5 h-5 ${
                  active ? 'text-[#2D5A4C] fill-[#2D5A4C]' : 'text-[#DFDCD4]'
                }`}
              />
            </button>
          );
        })}
      </div>
      <span className="text-xs text-[#5C635E]">
        {currentRating.toFixed(1)}/5 ({totalVotes} lượt)
      </span>
    </div>
  );
};

