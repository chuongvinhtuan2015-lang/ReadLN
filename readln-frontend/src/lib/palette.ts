export const PALETTE = {
  bg: '#F6F4EF',          // Nền toàn trang (Giấy ngà ấm)
  surface: '#EFECE6',     // Nền card / container phụ
  surfaceHover: '#E7E3DC',// Hover card / container
  border: '#DFDCD4',      // Đường kẻ phân cách 1px
  text: '#1F2421',        // Chữ chính (Đen than/chì dịu)
  textMuted: '#5C635E',   // Chữ phụ (Xám tro/Slate)
  accent: '#2D5A4C',      // Màu nhấn (Xanh rêu trầm / Forest Green)
  accentHover: '#23473C', // Hover nhấn
  secondaryBtn: '#E6E2D8',// Nút bấm phụ
  tagBg: '#EAE6DD',       // Nút/Thẻ Tag thể loại
};

export const COVER_THEMES = [
  { name: 'Forest Green', bg: '#2D5A4C', border: '#7BA395' },
  { name: 'Slate Blue', bg: '#3B4A54', border: '#8A9DA9' },
  { name: 'Deep Mocha', bg: '#4A3F35', border: '#9E8D7F' },
  { name: 'Burgundy', bg: '#5C3A3A', border: '#BA8888' },
  { name: 'Dark Jade', bg: '#334842', border: '#7AA396' },
];

export function getCoverTheme(seed: string | number = 0) {
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COVER_THEMES.length;
  return COVER_THEMES[index];
}

