export const SECURITY_CONFIG = {
  MAX_LOGIN_FAILURES: 5,           // Tối đa 5 lần đăng nhập sai
  LOCKOUT_DURATION_MINUTES: 15,    // Khóa tạm 15 phút nếu dính brute-force
  NONCE_WINDOW_SECONDS: 300,       // Thời hạn 300 giây của Timestamp + Nonce chống cào
  JWT_EXPIRES_IN: '7d',            // Thời hạn token 7 ngày
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
};

