import React from 'react';
import { Type, Moon, Sun, BookOpen } from 'lucide-react';

interface ReaderSettingsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  theme: 'paper' | 'white' | 'dark';
  onThemeChange: (theme: 'paper' | 'white' | 'dark') => void;
}

export const ReaderSettings: React.FC<ReaderSettingsProps> = ({
  fontSize,
  onFontSizeChange,
  theme,
  onThemeChange,
}) => {
  return (
    <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-3 flex flex-wrap items-center justify-between gap-4 mb-6">
      {/* Tùy chỉnh cỡ chữ (Chuẩn skill.md: từ 15px đến 25px) */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#5C635E] flex items-center gap-1">
          <Type className="w-3.5 h-3.5" /> Cỡ chữ:
        </span>
        <button
          onClick={() => onFontSizeChange(Math.max(15, fontSize - 1))}
          className="w-8 h-8 flex items-center justify-center bg-[#E6E2D8] hover:bg-[#DFDCD4] text-[#1F2421] rounded-[2px] text-xs font-bold transition-colors"
          title="Giảm cỡ chữ"
        >
          A-
        </button>
        <span className="text-xs font-mono w-10 text-center font-bold text-[#1F2421]">
          {fontSize}px
        </span>
        <button
          onClick={() => onFontSizeChange(Math.min(25, fontSize + 1))}
          className="w-8 h-8 flex items-center justify-center bg-[#E6E2D8] hover:bg-[#DFDCD4] text-[#1F2421] rounded-[2px] text-xs font-bold transition-colors"
          title="Tăng cỡ chữ"
        >
          A+
        </button>
      </div>

      {/* Tùy chỉnh màu nền */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onThemeChange('paper')}
          className={`px-3 py-1.5 rounded-[2px] text-xs font-medium flex items-center gap-1.5 border transition-colors ${
            theme === 'paper'
              ? 'bg-[#F6F4EF] border-[#2D5A4C] text-[#2D5A4C] font-bold'
              : 'bg-[#F6F4EF] border-[#DFDCD4] text-[#5C635E]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Giấy ấm
        </button>

        <button
          onClick={() => onThemeChange('white')}
          className={`px-3 py-1.5 rounded-[2px] text-xs font-medium flex items-center gap-1.5 border transition-colors ${
            theme === 'white'
              ? 'bg-white border-[#2D5A4C] text-[#2D5A4C] font-bold'
              : 'bg-white border-[#DFDCD4] text-[#5C635E]'
          }`}
        >
          <Sun className="w-3.5 h-3.5" /> Trắng
        </button>

        <button
          onClick={() => onThemeChange('dark')}
          className={`px-3 py-1.5 rounded-[2px] text-xs font-medium flex items-center gap-1.5 border transition-colors ${
            theme === 'dark'
              ? 'bg-[#181A1B] border-[#2D5A4C] text-[#EAE6DD] font-bold'
              : 'bg-[#181A1B] border-[#2E3235] text-[#8A9DA9]'
          }`}
        >
          <Moon className="w-3.5 h-3.5" /> Tối
        </button>
      </div>
    </div>
  );
};

