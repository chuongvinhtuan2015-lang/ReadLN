import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const isDev = process.env.NODE_ENV !== 'production';

// Trong chế độ DEV (Vite dev server), Vite bắt buộc cần 'unsafe-inline' cho React Refresh HMR hook.
// Khi build production / preview, các script đều là file tĩnh đã bundle ('self').
const scriptSrc = isDev ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'";

const securityHeaders = {
  'Content-Security-Policy': `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self' http://localhost:5000 ws://localhost:5173 http://localhost:5173; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';`,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    headers: securityHeaders,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5173,
    headers: securityHeaders,
  },
});
