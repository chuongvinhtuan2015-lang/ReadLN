import React from 'react';
import { getCoverTheme } from '../../lib/palette';

interface TextCoverProps {
  title: string;
  author?: string;
  themeIndex?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TextCover: React.FC<TextCoverProps> = ({
  title,
  author = 'Khuyết danh',
  themeIndex,
  size = 'md',
  className = '',
}) => {
  // Lấy 2 chữ cái đầu của 2 từ đầu tiên (hoặc 2 chữ cái đầu của chuỗi)
  const getMonogram = (str: string) => {
    const words = str.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase() || 'LN';
  };

  const theme = getCoverTheme(themeIndex !== undefined ? themeIndex : title);
  const monogram = getMonogram(title);

  // Kích thước chuẩn tỉ lệ sách 1 : 1.45 theo skill.md
  // sm: 64x96px, md: 144x208px, lg: 192x288px
  const sizeStyles = {
    sm: 'w-[64px] h-[96px] p-1.5 text-xs',
    md: 'w-[144px] h-[208px] p-3 text-sm',
    lg: 'w-[192px] h-[288px] p-4 text-base',
  };

  const monogramSizes = {
    sm: 'text-lg tracking-widest',
    md: 'text-3xl tracking-widest',
    lg: 'text-5xl tracking-widest',
  };

  return (
    <div
      className={`relative select-none flex flex-col justify-between rounded-[2px] transition-transform duration-200 overflow-hidden shadow-none ${sizeStyles[size]} ${className}`}
      style={{
        backgroundColor: theme.bg,
        color: '#F6F4EF',
      }}
    >
      {/* Khung viền chỉ mảnh 1px có opacity-40 */}
      <div
        className="absolute inset-1.5 pointer-events-none rounded-[1px] border border-dashed"
        style={{ borderColor: theme.border, opacity: 0.4 }}
      />

      {/* Header nhỏ */}
      <div className="z-10 flex justify-between items-center opacity-60 text-[9px] uppercase tracking-wider font-mono">
        <span>READLN</span>
        <span>NOVEL</span>
      </div>

      {/* Chữ viết tắt Monogram to ở chính giữa */}
      <div className="z-10 flex flex-col items-center justify-center my-auto">
        <span className={`font-serif font-black ${monogramSizes[size]} drop-shadow-sm`}>
          {monogram}
        </span>
      </div>

      {/* Tiêu đề & Tác giả in nhỏ ở chân bìa */}
      <div className="z-10 pt-1 text-center">
        <div className="font-semibold truncate text-xs leading-tight opacity-95">
          {title}
        </div>
        {size !== 'sm' && (
          <div className="truncate text-[10px] opacity-75 mt-0.5">
            {author}
          </div>
        )}
      </div>
    </div>
  );
};

