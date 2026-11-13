import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Type,
  X,
  Check,
  Edit2,
  Minus,
  Plus,
  Loader2,
} from 'lucide-react';
import { AntiCopyWrapper } from '../../components/reader/AntiCopyWrapper';
import { CommentSection, type CommentItem } from '../../components/story/CommentSection';
import { TextCover } from '../../components/story/TextCover';
import { decodeChapterContent } from '../../lib/contentDecoder';
import api from '../../lib/api';

export const ChapterReaderPage: React.FC = () => {
  const { storyId = '', chapterId = '' } = useParams();

  // Dữ liệu chương & truyện thật từ MySQL
  const [chapter, setChapter] = useState<any>(null);
  const [story, setStory] = useState<any>(null);
  const [chaptersList, setChaptersList] = useState<any[]>([]);
  const [decodedText, setDecodedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Các state tùy chỉnh đọc
  const [fontSize, setFontSize] = useState<number>(19); // Cỡ chữ (px)
  const [fontFamily, setFontFamily] = useState<string>('sans'); // 'sans' | 'serif' | 'mono'
  const [lineHeight, setLineHeight] = useState<number>(1.85); // Khoảng cách dòng (tỉ lệ)
  const [paddingX, setPaddingX] = useState<number>(80); // Mặc định rộng 2 bên hơn (80px)
  const [theme, setTheme] = useState<'paper' | 'white' | 'dark' | 'sepia'>('paper');

  // Popup tùy biến (A) và Drawer mục lục bên trái (i)
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTocDrawer, setShowTocDrawer] = useState(false);

  // Danh sách bình luận chương
  const [comments, setComments] = useState<CommentItem[]>([]);

  // Tải dữ liệu chương và truyện từ Backend MySQL
  useEffect(() => {
    const fetchChapter = async () => {
      if (!chapterId) return;
      setLoading(true);
      try {
        // 1. Gọi API nội dung chương thật (đã được backend mã hóa RAM + nhúng Thủy vân)
        const res = await api.get(`/chapters/${chapterId}`);
        if (res.data?.success && res.data?.data) {
          const chapData = res.data.data;
          setChapter(chapData);
          setStory(chapData.story);

          // Giải mã nội dung chương trong RAM (Anti-Scraping)
          const plain = decodeChapterContent(chapData.content);
          setDecodedText(plain);
        }

        // 2. Lấy danh sách toàn bộ chương của truyện cho Drawer mục lục
        if (storyId) {
          const resStory = await api.get(`/stories/${storyId}`);
          if (resStory.data?.success && resStory.data?.data) {
            setChaptersList(resStory.data.data.chapters || []);
          }
        }

        // 3. Lấy bình luận của chương này
        if (storyId) {
          const resComments = await api.get(`/stories/${storyId}/comments?chapterId=${chapterId}`);
          if (resComments.data?.success && resComments.data?.data) {
            setComments(resComments.data.data);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải chương từ MySQL:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId, storyId]);

  const handleCommentAdded = (newCm: CommentItem) => {
    setComments([newCm, ...comments]);
  };

  // Bộ màu nền liền mạch toàn trang
  const themeBgClasses = {
    paper: 'bg-[#F6F4EF] text-[#1F2421]',
    white: 'bg-[#FFFFFF] text-[#111827]',
    dark: 'bg-[#181A1B] text-[#D8D4CF]',
    sepia: 'bg-[#F4ECD8] text-[#3E2723]',
  };

  const fontFamilyClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  // Xác định chương trước / chương sau từ danh sách
  const currentIndex = chaptersList.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? chaptersList[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < chaptersList.length - 1 ? chaptersList[currentIndex + 1] : null;

  return (
    <AntiCopyWrapper>
      <div
        className={`min-h-screen w-full transition-colors duration-200 select-none relative ${themeBgClasses[theme]} ${fontFamilyClasses[fontFamily as keyof typeof fontFamilyClasses]}`}
      >
        {/* LỚP OVERLAY NỀN: Bấm vào giữa màn hình thì tự động đóng mục lục hoặc cài đặt */}
        {(showTocDrawer || showSettingsModal) && (
          <div
            onClick={() => {
              setShowTocDrawer(false);
              setShowSettingsModal(false);
            }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity cursor-pointer"
          />
        )}

        {/* CỤM PHÍM NỔI BÊN PHẢI (TO HƠN RÕ RỆT: w-12 h-12) */}
        <aside className="fixed right-4 sm:right-7 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center bg-[#EFECE6]/95 dark:bg-[#23272A]/95 backdrop-blur-sm border border-[#DFDCD4] dark:border-[#383C40] rounded-[2px] shadow-lg divide-y divide-[#DFDCD4] dark:divide-[#383C40]">
          {/* 1. Lùi chương */}
          {prevChapter ? (
            <Link
              to={`/stories/${storyId}/chapters/${prevChapter.id}`}
              className="w-12 h-12 flex items-center justify-center text-[#1F2421] dark:text-[#EAE6DD] hover:bg-[#DFDCD4] dark:hover:bg-[#2E3235] transition-colors"
              title={`Chương trước: ${prevChapter.title}`}
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
          ) : (
            <div className="w-12 h-12 flex items-center justify-center opacity-30 cursor-not-allowed">
              <ChevronLeft className="w-6 h-6" />
            </div>
          )}

          {/* 2. Home (Trang chủ) */}
          <Link
            to="/"
            className="w-12 h-12 flex items-center justify-center text-[#1F2421] dark:text-[#EAE6DD] hover:bg-[#DFDCD4] dark:hover:bg-[#2E3235] transition-colors"
            title="Trang chủ"
          >
            <Home className="w-5 h-5" />
          </Link>

          {/* 3. Nút A: Mở cài đặt (Cỡ chữ, Font, Lề px, Theme, Khoảng cách dòng) */}
          <button
            onClick={() => {
              setShowSettingsModal(!showSettingsModal);
              setShowTocDrawer(false);
            }}
            className={`w-12 h-12 flex items-center justify-center font-bold text-base transition-colors ${
              showSettingsModal
                ? 'bg-[#2D5A4C] text-[#F6F4EF]'
                : 'text-[#1F2421] dark:text-[#EAE6DD] hover:bg-[#DFDCD4] dark:hover:bg-[#2E3235]'
            }`}
            title="Tùy chỉnh đọc (Font, cỡ chữ, theme, lề px, khoảng cách dòng)"
          >
            A
          </button>

          {/* 4. Nút i: Mở Drawer mục lục truyện bên trái */}
          <button
            onClick={() => {
              setShowTocDrawer(!showTocDrawer);
              setShowSettingsModal(false);
            }}
            className={`w-12 h-12 flex items-center justify-center font-serif italic font-bold text-base transition-colors ${
              showTocDrawer
                ? 'bg-[#2D5A4C] text-[#F6F4EF]'
                : 'text-[#1F2421] dark:text-[#EAE6DD] hover:bg-[#DFDCD4] dark:hover:bg-[#2E3235]'
            }`}
            title="Mục lục chương"
          >
            i
          </button>

          {/* 5. Tới chương */}
          {nextChapter ? (
            <Link
              to={`/stories/${storyId}/chapters/${nextChapter.id}`}
              className="w-12 h-12 flex items-center justify-center text-[#1F2421] dark:text-[#EAE6DD] hover:bg-[#DFDCD4] dark:hover:bg-[#2E3235] transition-colors"
              title={`Chương sau: ${nextChapter.title}`}
            >
              <ChevronRight className="w-6 h-6" />
            </Link>
          ) : (
            <div className="w-12 h-12 flex items-center justify-center opacity-30 cursor-not-allowed">
              <ChevronRight className="w-6 h-6" />
            </div>
          )}
        </aside>

        {/* POPUP BẢNG TÙY BIẾN "A" */}
        {showSettingsModal && (
          <div className="fixed right-18 sm:right-22 top-1/2 -translate-y-1/2 z-50 w-80 sm:w-88 bg-[#EFECE6] dark:bg-[#23272A] border border-[#DFDCD4] dark:border-[#383C40] rounded-[2px] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFDCD4] dark:border-[#383C40]">
              <span className="text-xs font-bold text-[#1F2421] dark:text-[#EAE6DD] uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[#2D5A4C]" /> Tùy chỉnh đọc
              </span>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-[#5C635E] hover:text-[#1F2421] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cỡ chữ */}
            <div>
              <div className="text-xs text-[#5C635E] dark:text-[#8A9DA9] mb-1.5 font-medium">Cỡ chữ (px)</div>
              <div className="flex items-center justify-between bg-[#F6F4EF] dark:bg-[#181A1B] border border-[#DFDCD4] dark:border-[#383C40] rounded-[2px] p-1">
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                  className="w-8 h-8 flex items-center justify-center bg-[#E6E2D8] dark:bg-[#2E3235] text-[#1F2421] dark:text-white rounded-[2px] hover:bg-[#DFDCD4]"
                  title="Giảm 1px"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min={12}
                    max={40}
                    value={fontSize}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 12 && val <= 40) {
                        setFontSize(val);
                      }
                    }}
                    className="w-12 h-7 text-center font-mono font-bold text-sm bg-white dark:bg-[#23272A] text-[#1F2421] dark:text-white border border-[#DFDCD4] dark:border-[#383C40] rounded-[2px] focus:outline-none focus:border-[#2D5A4C]"
                  />
                  <span className="text-xs font-mono text-[#5C635E]">px</span>
                </div>
                <button
                  onClick={() => setFontSize(Math.min(40, fontSize + 1))}
                  className="w-8 h-8 flex items-center justify-center bg-[#E6E2D8] dark:bg-[#2E3235] text-[#1F2421] dark:text-white rounded-[2px] hover:bg-[#DFDCD4]"
                  title="Tăng 1px"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chỉnh lề 2 bên theo px: Ô vuông nhập được ở giữa + 2 nút tăng giảm 1px hai bên */}
            <div>
              <div className="text-xs text-[#5C635E] dark:text-[#8A9DA9] mb-1.5 font-medium">Khoảng cách lề 2 bên (px)</div>
              <div className="flex items-center justify-between bg-[#F6F4EF] dark:bg-[#181A1B] border border-[#DFDCD4] dark:border-[#383C40] rounded-[2px] p-1">
                <button
                  onClick={() => setPaddingX(Math.max(10, paddingX - 1))}
                  className="w-8 h-8 flex items-center justify-center bg-[#E6E2D8] dark:bg-[#2E3235] text-[#1F2421] dark:text-white rounded-[2px] hover:bg-[#DFDCD4]"
                  title="Giảm 1px"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={paddingX}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 10 && val <= 300) {
                        setPaddingX(val);
                      }
                    }}
                    className="w-14 h-7 text-center font-mono font-bold text-sm bg-white dark:bg-[#23272A] text-[#1F2421] dark:text-white border border-[#DFDCD4] dark:border-[#383C40] rounded-[2px] focus:outline-none focus:border-[#2D5A4C]"
                  />
                  <span className="text-xs font-mono text-[#5C635E]">px</span>
                </div>
                <button
                  onClick={() => setPaddingX(Math.min(300, paddingX + 1))}
                  className="w-8 h-8 flex items-center justify-center bg-[#E6E2D8] dark:bg-[#2E3235] text-[#1F2421] dark:text-white rounded-[2px] hover:bg-[#DFDCD4]"
                  title="Tăng 1px"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Khoảng cách dòng */}
            <div>
              <div className="text-xs text-[#5C635E] dark:text-[#8A9DA9] mb-1.5 font-medium">Khoảng cách dòng</div>
              <div className="flex items-center justify-between bg-[#F6F4EF] dark:bg-[#181A1B] border border-[#DFDCD4] dark:border-[#383C40] rounded-[2px] p-1">
                <button
                  onClick={() => setLineHeight(Number(Math.max(1.2, lineHeight - 0.1).toFixed(2)))}
                  className="w-8 h-8 flex items-center justify-center bg-[#E6E2D8] dark:bg-[#2E3235] text-[#1F2421] dark:text-white rounded-[2px] hover:bg-[#DFDCD4]"
                  title="Giảm khoảng cách dòng"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center justify-center">
                  <input
                    type="number"
                    step="0.1"
                    min={1.2}
                    max={3.0}
                    value={lineHeight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 1.2 && val <= 3.0) {
                        setLineHeight(Number(val.toFixed(2)));
                      }
                    }}
                    className="w-14 h-7 text-center font-mono font-bold text-sm bg-white dark:bg-[#23272A] text-[#1F2421] dark:text-white border border-[#DFDCD4] dark:border-[#383C40] rounded-[2px] focus:outline-none focus:border-[#2D5A4C]"
                  />
                </div>
                <button
                  onClick={() => setLineHeight(Number(Math.min(3.0, lineHeight + 0.1).toFixed(2)))}
                  className="w-8 h-8 flex items-center justify-center bg-[#E6E2D8] dark:bg-[#2E3235] text-[#1F2421] dark:text-white rounded-[2px] hover:bg-[#DFDCD4]"
                  title="Tăng khoảng cách dòng"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Font chữ */}
            <div>
              <div className="text-xs text-[#5C635E] dark:text-[#8A9DA9] mb-1.5 font-medium">Font chữ</div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'sans', label: 'Sans' },
                  { id: 'serif', label: 'Serif' },
                  { id: 'mono', label: 'Mono' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id)}
                    className={`py-1.5 rounded-[2px] text-xs transition-colors border ${
                      fontFamily === f.id
                        ? 'bg-[#2D5A4C] border-[#2D5A4C] text-[#F6F4EF] font-bold'
                        : 'bg-[#F6F4EF] dark:bg-[#181A1B] border-[#DFDCD4] dark:border-[#383C40] text-[#1F2421] dark:text-[#EAE6DD]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Màu nền (Theme) */}
            <div>
              <div className="text-xs text-[#5C635E] dark:text-[#8A9DA9] mb-1.5 font-medium">Màu nền trang đọc</div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'paper', bg: '#F6F4EF', label: 'Giấy' },
                  { id: 'sepia', bg: '#F4ECD8', label: 'Sepia' },
                  { id: 'white', bg: '#FFFFFF', label: 'Trắng' },
                  { id: 'dark', bg: '#181A1B', label: 'Tối' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`py-1.5 rounded-[2px] text-xs font-medium border flex items-center justify-center gap-1 transition-all ${
                      theme === t.id
                        ? 'border-[#2D5A4C] ring-1 ring-[#2D5A4C] font-bold text-[#1F2421]'
                        : 'border-[#DFDCD4] dark:border-[#383C40] text-[#5C635E]'
                    }`}
                    style={{ backgroundColor: t.bg }}
                  >
                    {theme === t.id && <Check className="w-3 h-3 text-[#2D5A4C]" />}
                    <span className={t.id === 'dark' ? 'text-gray-200' : 'text-gray-900'}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DRAWER MỤC LỤC CHƯƠNG BÊN TRÁI "i" (Lấy từ MySQL) */}
        {showTocDrawer && (
          <div className="fixed inset-y-0 left-0 z-50 w-76 sm:w-84 bg-[#FFFFFF] dark:bg-[#1E2022] border-r border-[#DFDCD4] dark:border-[#383C40] shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            {/* Header thông tin truyện: Bấm vào để về lại trang chi tiết truyện */}
            {story && (
              <Link
                to={`/stories/${story.id}`}
                className="bg-[#111315] text-white p-4 flex items-center gap-3.5 hover:bg-[#1a1d20] transition-colors border-b border-[#282C30] group"
                title="Bấm để về trang thông tin chi tiết truyện"
              >
                <TextCover title={story.title} author={story.author_name} size="sm" className="w-[52px] h-[74px] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold leading-snug group-hover:text-[#7BA395] transition-colors line-clamp-2">
                    {story.title}
                  </h3>
                  <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
                    <Edit2 className="w-3 h-3 text-[#7BA395]" />
                    <span className="truncate">{story.author_name}</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Danh sách các Chương lấy trực tiếp từ MySQL */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs text-[#1F2421] dark:text-[#EAE6DD]">
              <div className="font-bold text-sm text-[#1F2421] dark:text-white mb-2">
                Danh Sách Chương ({chaptersList.length})
              </div>
              <div className="space-y-1">
                {chaptersList.map((c) => (
                  <Link
                    key={c.id}
                    to={`/stories/${storyId}/chapters/${c.id}`}
                    onClick={() => setShowTocDrawer(false)}
                    className={`block p-2 rounded-[2px] transition-colors ${
                      chapterId === c.id
                        ? 'bg-[#2D5A4C] text-[#F6F4EF] font-bold'
                        : 'hover:bg-[#EAE6DD] dark:hover:bg-[#2A2E33]'
                    }`}
                  >
                    Chương {c.chapter_number}: {c.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KHÔNG GIAN NỘI DUNG ĐỌC */}
        <main
          className="mx-auto w-full py-12 transition-all duration-150"
          style={{
            paddingLeft: `max(20px, ${paddingX}px)`,
            paddingRight: `max(20px, ${paddingX}px)`,
          }}
        >
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-[#5C635E]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D5A4C] mb-2" />
              <span className="text-sm">Đang tải và giải mã nội dung chương từ MySQL...</span>
            </div>
          ) : !chapter ? (
            <div className="py-20 text-center text-[#5C635E] text-sm">
              Không tìm thấy chương truyện.
            </div>
          ) : (
            <>
              {/* Header chương */}
              <header className="text-center mb-10 pb-6 border-b border-current/10">
                <div className="text-sm font-semibold tracking-wide opacity-80 mb-1">
                  {story?.title}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                  {chapter.title}
                </h1>
                <div className="text-xs opacity-60">
                  {comments.length} Bình luận - Độ dài: {chapter.word_count?.toLocaleString('vi-VN')} từ
                </div>
              </header>

              {/* Nội dung bài đọc thuần (đã giải mã từ RAM của MySQL) */}
              <article
                className="select-none text-justify"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}`,
                }}
              >
                {decodedText.split('\n').map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;
                  return (
                    <p
                      key={index}
                      className="mb-6 indent-0"
                      style={{ lineHeight: `${lineHeight}` }}
                    >
                      {trimmed}
                    </p>
                  );
                })}
              </article>

              {/* Chuyển chương cuối trang */}
              <footer className="mt-12 pt-8 border-t border-current/10 flex items-center justify-between mb-10">
                {prevChapter ? (
                  <Link
                    to={`/stories/${storyId}/chapters/${prevChapter.id}`}
                    className="px-4 py-2 text-xs font-semibold rounded-[2px] bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" /> Chương trước
                  </Link>
                ) : (
                  <div className="opacity-30 text-xs px-4 py-2">Đầu danh sách</div>
                )}

                <Link
                  to={`/stories/${storyId}`}
                  className="text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
                >
                  Về trang truyện
                </Link>

                {nextChapter ? (
                  <Link
                    to={`/stories/${storyId}/chapters/${nextChapter.id}`}
                    className="px-4 py-2 text-xs font-semibold rounded-[2px] bg-[#2D5A4C] text-[#F6F4EF] hover:bg-[#23473C] transition-colors flex items-center gap-1.5"
                  >
                    Chương sau <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="opacity-30 text-xs px-4 py-2">Hết chương</div>
                )}
              </footer>

              {/* Khung Bình Luận kết nối MySQL */}
              <div className="mt-10">
                <CommentSection
                  storyId={storyId}
                  comments={comments}
                  onCommentAdded={handleCommentAdded}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </AntiCopyWrapper>
  );
};
