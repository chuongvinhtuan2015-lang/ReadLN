import React, { useState } from 'react';
import { MessageSquare, Send, ShieldAlert } from 'lucide-react';
import { sanitizeHtml } from '../../lib/sanitize';
import { useAuth } from '../../contexts/AuthContext';
import { HoneypotField } from '../ui/HoneypotField';
import { formatRelativeTime } from '../../lib/dateUtils';
import api from '../../lib/api';

export interface CommentItem {
  id: string | number;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  storyId: string | number;
  comments: CommentItem[];
  onCommentAdded?: (newComment: CommentItem) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  storyId,
  comments,
  onCommentAdded,
}) => {
  const { user, isLockdownMode } = useAuth();
  const [content, setContent] = useState('');
  const [honeypotValue, setHoneypotValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockdownMode) {
      setErrorMsg('Hệ thống đang trong chế độ Chỉ Đọc khẩn cấp.');
      return;
    }
    // Bẫy Bot Honeypot
    if (honeypotValue) {
      console.warn('Bot detected by Honeypot!');
      return;
    }
    if (!content.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Làm sạch XSS trước khi hiển thị & gửi
      const cleaned = sanitizeHtml(content);
      const res = await api.post(`/stories/${storyId}/comments`, { content: cleaned });
      const newComment: CommentItem = res.data?.comment || {
        id: Date.now(),
        user_name: user?.username || 'Bạn',
        content: cleaned,
        created_at: 'Vừa xong',
      };
      if (onCommentAdded) onCommentAdded(newComment);
      setContent('');
    } catch {
      setErrorMsg('Không thể đăng bình luận lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-6">
      <h2 className="text-lg font-bold text-[#1F2421] flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-[#2D5A4C]" />
        Bình Luận & Thảo Luận ({comments.length})
      </h2>

      {/* Form viết bình luận */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <HoneypotField value={honeypotValue} onChange={setHoneypotValue} />
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isLockdownMode ? 'Bình luận bị tạm khóa do hệ thống bảo trì...' : 'Chia sẻ cảm nghĩ của bạn về tác phẩm...'}
              disabled={isSubmitting || isLockdownMode}
              rows={3}
              className="w-full p-3 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-sm focus:outline-none focus:border-[#2D5A4C] placeholder-[#5C635E] transition-colors resize-none disabled:bg-[#DFDCD4]"
            />
          </div>

          {errorMsg && (
            <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim() || isLockdownMode}
              className="bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] px-4 py-2 rounded-[2px] text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-center text-sm text-[#5C635E] mb-6">
          Vui lòng <a href="/login" className="text-[#2D5A4C] font-semibold underline">đăng nhập</a> để tham gia thảo luận.
        </div>
      )}

      {/* Danh sách bình luận */}
      <div className="divide-y divide-[#DFDCD4]">
        {comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#5C635E]">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        ) : (
          comments.map((cm) => (
            <div key={cm.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-[#1F2421]">{cm.user_name}</span>
                <span className="text-[11px] text-[#5C635E]">{formatRelativeTime(cm.created_at)}</span>
              </div>
              <div
                className="text-sm text-[#1F2421] leading-relaxed break-words"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(cm.content) }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

