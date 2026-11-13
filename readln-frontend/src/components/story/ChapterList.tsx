import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock } from 'lucide-react';
import { formatRelativeTime } from '../../lib/dateUtils';

export interface ChapterItem {
  id: string | number;
  chapter_number: number;
  title: string;
  word_count?: number;
  created_at?: string;
}

interface ChapterListProps {
  storyId: string | number;
  chapters: ChapterItem[];
}

export const ChapterList: React.FC<ChapterListProps> = ({ storyId, chapters }) => {
  return (
    <div id="chapter-list" className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-6 mb-8">
      <div className="pb-3 mb-4 border-b border-[#DFDCD4]">
        <h2 className="text-lg font-bold text-[#1F2421] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#2D5A4C]" />
          Danh Sách Chương ({chapters.length})
        </h2>
      </div>

      {chapters.length === 0 ? (
        <p className="text-center py-8 text-sm text-[#5C635E]">Truyện chưa có chương nào được đăng.</p>
      ) : (
        /* Khối riêng dài vừa phải (max-h-96 / max-h-[420px]), đưa chuột vào cuộn danh sách, đưa ra ngoài cuộn web */
        <div className="max-h-[380px] overflow-y-auto pr-2 space-y-2 overscroll-contain">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {chapters.map((chap) => (
              <Link
                key={chap.id}
                to={`/stories/${storyId}/chapters/${chap.id}`}
                className="flex items-center justify-between p-3 rounded-[2px] bg-[#F6F4EF] hover:bg-[#EAE6DD] border border-[#DFDCD4] transition-colors group"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="text-sm font-medium text-[#1F2421] group-hover:text-[#2D5A4C] truncate">
                    Chương {chap.chapter_number}: {chap.title}
                  </div>
                  {chap.word_count && (
                    <div className="text-[11px] text-[#5C635E] mt-0.5">
                      {chap.word_count.toLocaleString('vi-VN')} từ
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-[#5C635E] flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeTime(chap.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
