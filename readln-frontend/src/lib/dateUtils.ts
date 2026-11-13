/**
 * Định dạng thời gian thân thiện theo phút, giờ, ngày, tuần, tháng, năm
 * Xử lý timezone đồng nhất giữa MySQL DATETIME local và UTC ISO String
 */
export function formatRelativeTime(dateInput: string | number | Date | undefined): string {
  if (!dateInput) return 'Vừa xong';

  let dateMs: number;
  if (typeof dateInput === 'string') {
    // Nếu chuỗi kết thúc bằng .000Z nhưng bản chất là thời gian địa phương (+07:00) từ MySQL
    // Chuyển đổi bỏ đuôi 'Z' để Date parser đọc theo giờ local của máy khách
    const cleanStr = dateInput.replace(/Z$/i, '');
    dateMs = new Date(cleanStr).getTime();
  } else if (dateInput instanceof Date) {
    dateMs = dateInput.getTime();
  } else {
    dateMs = Number(dateInput);
  }

  if (isNaN(dateMs)) return 'Vừa xong';

  const nowMs = Date.now();
  let diffMs = nowMs - dateMs;

  // Nếu chênh lệch âm (do lệch vài giây hoặc timezone), xử lý là vừa xong hoặc điều chỉnh
  if (diffMs < 0) {
    // Nếu chênh lệch trong vòng 10 giây
    if (diffMs > -10000) {
      return 'Vừa xong';
    }
    // Nếu vẫn lệch âm do múi giờ UTC vs Local (7 tiếng)
    if (diffMs < -6 * 3600 * 1000) {
      diffMs += 7 * 3600 * 1000;
    }
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSec < 60) {
    return 'Vừa xong';
  } else if (diffMin < 60) {
    return `${diffMin} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} tuần trước`;
  } else if (diffMonths < 12) {
    return `${diffMonths} tháng trước`;
  } else {
    return `${diffYears} năm trước`;
  }
}


