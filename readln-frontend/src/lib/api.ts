import axios from 'axios';

// NIST CSF 1.1: HttpOnly Cookie, Nonce/Timestamp, xử lý 429 & 503
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Nhận & gửi HttpOnly cookie an toàn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chống cào & Replay Attack bằng Timestamp + Nonce ngẫu nhiên
api.interceptors.request.use((config) => {
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  
  config.headers['X-Request-Timestamp'] = timestamp;
  config.headers['X-Request-Nonce'] = nonce;
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Bắt mã phản hồi khẩn cấp hoặc Rate Limit
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 429) {
        window.dispatchEvent(new CustomEvent('app:rate-limit', { detail: { retryAfter: error.response.headers['retry-after'] || 60 } }));
      } else if (error.response.status === 503) {
        window.dispatchEvent(new CustomEvent('app:lockdown', { detail: { message: error.response.data?.message || 'Hệ thống đang bảo trì khẩn cấp (Chỉ đọc).' } }));
      }
    }
    return Promise.reject(error);
  }
);

export default api;

