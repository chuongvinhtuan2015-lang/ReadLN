import React, { useMemo } from 'react';
import { decodeChapterContent } from '../../lib/contentDecoder';
import { injectWatermarkIntoParagraphs } from '../../lib/watermark';
import { useAuth } from '../../contexts/AuthContext';

interface ChapterContentProps {
  rawContent: string;
  fontSize: number;
  theme: 'paper' | 'white' | 'dark';
}

export const ChapterContent: React.FC<ChapterContentProps> = ({
  rawContent,
  fontSize,
  theme,
}) => {
  const { user } = useAuth();

  // 1. Giải mã dữ liệu trong RAM (Anti-Scrape)
  const decodedText = useMemo(() => {
    return decodeChapterContent(rawContent);
  }, [rawContent]);

  // 2. Tách đoạn và nhúng thủy vân tàng hình zero-width (NIST CSF: Protect / Detect)
  const paragraphs = useMemo(() => {
    const rawParagraphs = decodedText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    return injectWatermarkIntoParagraphs(rawParagraphs, user?.id || 'ANON_USER');
  }, [decodedText, user]);

  const themeStyles = {
    paper: 'bg-[#F6F4EF] text-[#1F2421] border-[#DFDCD4]',
    white: 'bg-[#FFFFFF] text-[#111827] border-[#E5E7EB]',
    dark: 'bg-[#181A1B] text-[#D8D4CF] border-[#2E3235]',
  };

  return (
    <div
      className={`border rounded-[2px] p-6 sm:p-10 transition-colors duration-200 select-none ${themeStyles[theme]}`}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: '1.85',
      }}
    >
      {paragraphs.map((p, index) => (
        <p
          key={index}
          className="mb-5 indent-6 text-justify leading-relaxed"
          style={{ letterSpacing: '0.01em' }}
        >
          {p}
        </p>
      ))}
    </div>
  );
};

