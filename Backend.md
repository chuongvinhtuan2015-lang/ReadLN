================================================================================
KIẾN TRÚC BACKEND NODE.JS (EXPRESS/TYPESCRIPT) - DỰ ÁN READLN
Tiêu chuẩn: NIST CSF 1.1 | MySQL Native | Anti-Scraping | Anti-Copy | Anti-DDoS
================================================================================

## 1. CẤU TRÚC THƯ MỤC DỰ ÁN (readln-backend)

```text
readln-backend/
├── .env.example                         # Khai báo PORT, DATABASE_URL, JWT_SECRET, CLIENT_ORIGIN
├── package.json                         # express, prisma/@prisma/client (hoặc mysql2), bcrypt, jsonwebtoken, cors, helmet, zod
├── tsconfig.json                        # Cấu hình TypeScript Strict Mode
├── prisma/                              # Quản lý ORM & Migration MySQL
│   └── schema.prisma                    # Định nghĩa 11 bảng chuẩn theo database.txt
└── src/
    ├── server.ts                        # Entry point: Khởi chạy Express HTTP server & kết nối Database
    ├── app.ts                           # Khởi tạo Express App, gắn middleware bảo mật toàn cục
    │
    ├── config/                          # NƠI THIẾT LẬP CẤU HÌNH HỆ THỐNG
    │   ├── db.ts                        # Khai báo Instance Prisma Client / MySQL Connection Pool
    │   ├── env.ts                       # Validate & Load các biến môi trường
    │   └── security.ts                  # Hằng số bảo mật (Max login fail: 5, Lockout mins: 15, Nonce Window: 300s)
    │
    ├── controllers/                     # BỘ ĐIỀU KHIỂN NHIỆM VỤ (REQUEST/RESPONSE HANDLING)
    │   ├── authController.ts            # Đăng ký, Đăng nhập (Set HttpOnly Cookie), Đổi mật khẩu, Reset Pass
    │   ├── storyController.ts           # Lấy danh sách truyện, chi tiết truyện, tủ truyện cá nhân
    │   ├── chapterController.ts         # Lấy nội dung chương (Mã hóa RAM + chèn Thủy vân tàng hình)
    │   ├── commentController.ts         # Bình luận (Kiểm tra xss, rate limit, honeypot)
    │   ├── ratingController.ts          # Đánh giá 1-5 sao (Tự động tính điểm trung bình)
    │   └── admin/                       # NHÓM CONTROLLER QUẢN TRỊ VIÊN
    │       ├── adminDashboardController.ts # Thống kê cảnh báo an ninh 24h & chỉ số hệ thống
    │       ├── adminStoryController.ts     # Thêm/Sửa/Xóa mềm (is_deleted) truyện & chương
    │       ├── adminUserController.ts      # Quản lý tài khoản, khóa IP, đổi quyền Role
    │       ├── adminLogController.ts       # Truy xuất audit_logs & công cụ giải mã Watermark
    │       └── adminOperationController.ts # Bật/Tắt Kill-Switch, Khôi phục rác, Export DB Backup
    │
    ├── middlewares/                     # BỘ LỌC BẢO MẬT & KIỂM SOÁT LUỒNG (SECURITY MIDDLEWARES)
    │   ├── authMiddleware.ts            # [PROTECT] Bắt JWT từ HttpOnly Cookie & gán req.user
    │   ├── rbacMiddleware.ts            # [PROTECT] Phân quyền truy cập theo Role (READER, AUTHOR, ADMIN)
    │   ├── rateLimiter.ts               # [ANTI-DDOS] Giới hạn số request/phút theo IP (Lưu bộ nhớ/MySQL)
    │   ├── antiScrapeMiddleware.ts      # [ANTI-SCRAPE] Xác thực Timestamp + Nonce (chặn replay attack)
    │   ├── antiBotMiddleware.ts         # [ANTI-BOT] Bẫy Honeypot & kiểm tra User-Agent / Webdriver
    │   ├── lockdownMiddleware.ts        # [RESPOND] Chặn truy cập ghi dữ liệu khi bật Kill-Switch (Lockdown)
    │   ├── ipBlacklistMiddleware.ts     # [RESPOND] Kiểm tra IP có nằm trong ip_blacklists hay không
    │   ├── auditLogger.ts               # [DETECT] Ghi nhật ký tự động vào bảng audit_logs
    │   └── validate.ts                  # [PROTECT] Validate Schema dữ liệu đầu vào bằng Zod
    │
    ├── services/                        # NƠI XỬ LÝ LOGIC NGHIỆP VỤ CỐT LÕI (BUSINESS LOGIC)
    │   ├── authService.ts               # Xử lý băm Argon2/Bcrypt, mã hóa token, đếm failed_login_attempts
    │   ├── storyService.ts              # Truy vấn danh sách truyện, tính lượt xem view_count
    │   ├── chapterService.ts            # Đọc chương từ MySQL + Chèn Watermark nhị phân + Mã hóa payload
    │   ├── watermarkService.ts          # Nhúng Unicode Zero-Width (0x200B, 0x200C) & Giải mã User ID
    │   ├── cryptoService.ts             # Mã hóa nội dung text trong RAM trước khi gửi về Client
    │   └── securityService.ts           # Quản lý IP Blacklist, Trigger Kill-Switch, Cleanup Logs
    │
    ├── utils/                           # THƯ VIỆN TIỆN ÍCH DÙNG CHUNG
    │   ├── logger.ts                    # Log sự kiện ra Console & File
    │   ├── sanitize.ts                  # [PROTECT] Lọc sạch mã độc XSS từ input text
    │   └── response.ts                  # Chuẩn hóa định dạng JSON trả về ({ success, data, error, timestamp })
    │
    └── routes/                          # ĐỊNH TUYẾN ĐƯỜNG DẪN API
        ├── authRoutes.ts                # /api/auth/*
        ├── storyRoutes.ts               # /api/stories/*
        ├── chapterRoutes.ts             # /api/chapters/*
        ├── commentRoutes.ts             # /api/comments/*
        └── adminRoutes.ts               # /api/admin/*
```

---

## 2. ÁNH XẠ CƠ SỞ DỮ LIỆU MYSQL (SCHEMA INTEGRATION)

Dựa trên file `database.txt`, Backend sử dụng ORM (Prisma) hoặc `mysql2` để làm việc với 11 bảng chuẩn:

1. **`users`**: Lưu trữ `password_hash`, theo dõi `failed_login_attempts` và `lockout_until` chống Brute-force.
2. **`password_resets`**: Quản lý Token khôi phục mật khẩu (băm SHA-256).
3. **`genres` & `story_genres`**: Danh mục thể loại truyện (slug chuẩn URL).
4. **`stories`**: Lưu thông tin bộ truyện, `view_count` (`BIGINT`), hỗ trợ `is_deleted` (Soft delete).
5. **`chapters`**: Lưu nội dung chữ dung lượng lớn (`MEDIUMTEXT`), `word_count`, `is_deleted`.
6. **`bookmarks`**: Tủ truyện cá nhân (`user_id`, `story_id`).
7. **`ratings`**: Đánh giá 1-5 sao duy nhất cho mỗi cặp `user_id` - `story_id`.
8. **`comments`**: Bình luận truyện/chương, hỗ trợ cờ `is_flagged` và `is_deleted`.
9. **`audit_logs`**: Nhật ký an ninh hệ thống (`client_ip`, `user_agent`, `action`, `status_code`, `details` kiểu JSON).
10. **`ip_blacklists`**: Danh sách IP bị cấm kèm lý do và thời gian hết hạn (`blocked_until`).
11. **`system_settings`**: Nút bật tắt chế độ khẩn cấp (`is_lockdown_mode`) và định mức Rate Limit (`rate_limit_per_minute`).

---

## 3. TRIỂN KHAI BẢO MẬT THEO 5 TRỤ CỘT NIST CSF 1.1

### 3.1. IDENTIFY (Nhận diện Tài sản & Quản lý Truy cập)
* **Phân định ranh giới API:**
  * **Public Endpoints:** `GET /api/stories`, `GET /api/stories/:slug`, `GET /api/stories/:slug/chapters/:num`.
  * **Authenticated Endpoints:** `POST /api/comments`, `POST /api/ratings`, `POST /api/bookmarks`, `POST /api/auth/change-password`.
  * **Admin Endpoints:** `ALL /api/admin/*` (Yêu cầu `role === 'ADMIN'`).
* **Identity Management:** Nhận diện người dùng qua JWT lưu trong `HttpOnly Cookie`, kết hợp kiểm tra trạng thái tài khoản (`lockout_until` chưa hết hạn).

### 3.2. PROTECT (Bảo vệ Hệ thống, Nội dung & Chống Sao chép)
1. **Chống cào dữ liệu chương (`chapterService.ts` & `antiScrapeMiddleware.ts`):**
   * **Mã hóa dữ liệu RAM:** Nội dung chương từ MySQL không bao giờ trả về dưới dạng Plain Text. Backend sử dụng thuật toán mã hóa nhẹ (ví dụ: AES-128 hoặc Obfuscation kèm Session Key) mã hóa chuỗi chữ trước khi JSON serialize.
   * **Xác thực Request Kép (Timestamp + Nonce):** Mọi API đọc chương phải gửi kèm header `X-Request-Timestamp` và `X-Request-Nonce`. Middleware kiểm tra nếu timestamp lệch quá 300 giây hoặc Nonce đã từng xuất hiện -> Từ chối với lỗi `403 Forbidden`.
2. **Thủy vân tàng hình vết dầu (`watermarkService.ts`):**
   * Khi trả về nội dung chương cho một `user_id` (hoặc IP khách nếu chưa đăng nhập), Backend mã hóa ID đó thành chuỗi Unicode Zero-Width (`\u200B` = 0, `\u200C` = 1, `\u200D` = ngắt).
   * Chèn ngẫu nhiên các cụm Unicode này vào giữa các từ trong văn bản. Khi kẻ xấu copy/cào bài đăng lên trang khác, chuỗi ẩn này vẫn dính theo văn bản.
3. **Bảo mật Xác thực & Chống Brute-force (`authService.ts`):**
   * Đăng nhập sai lần thứ 1-4: Tăng `failed_login_attempts`.
   * Đăng nhập sai lần thứ 5: Đặt `lockout_until = CURRENT_TIMESTAMP + 15 MINUTE`. Trả về mã lỗi `429` kèm thời gian còn lại.
   * Cookie an toàn: `res.cookie('token', jwt, { httpOnly: true, secure: true, sameSite: 'lax' })`.
4. **Chống XSS & Data Pollution (`sanitize.ts`):**
   * Mọi trường dữ liệu text do người dùng gửi lên (`comments`, `title`, `summary`) bắt buộc chạy qua hàm lọc loại bỏ thẻ `<script>`, `onerror`, `javascript:`.

### 3.3. DETECT (Phát hiện Bất thường & Giám sát An ninh)
1. **Tự động ghi Audit Log (`auditLogger.ts`):**
   * Mọi sự kiện nhạy cảm (Đăng nhập thất bại, Thay đổi quyền, Xóa mềm dữ liệu, Bật Kill-Switch, Bị chặn 429) tự động tạo 1 bản ghi vào bảng `audit_logs` gồm IP, User Agent, Action, Status Code và Details (JSON).
2. **Phát hiện hành vi cào truyện hàng loạt:**
   * Nếu 1 địa chỉ IP gọi API lấy chương quá 30 chương trong vòng 1 phút, hệ thống tự động đánh dấu cờ nghi vấn và gửi log cảnh báo cấp độ `WARNING` vào `audit_logs`.
3. **Giải mã Thủy vân phục vụ điều tra (`adminLogController.ts`):**
   * Cung cấp API `POST /api/admin/decode-watermark` nhận vào đoạn text bị leak, quét tìm các ký tự Unicode Zero-Width, chuyển đổi lại thành `user_id` ban đầu để Admin xử lý.

### 3.4. RESPOND (Phản ứng & Ngăn chặn Sự cố Khẩn cấp)
1. **Nút khóa khẩn cấp Kill-Switch (`lockdownMiddleware.ts`):**
   * Khi Admin kích hoạt `is_lockdown_mode = 'true'` trong `system_settings`:
   * Toàn bộ request có phương thức `POST`, `PUT`, `PATCH`, `DELETE` từ phía Client sẽ bị chặn ngay lập tức ở Middleware với mã HTTP `503 Service Unavailable` và thông báo `"Hệ thống đang ở chế độ bảo trì khẩn cấp (Chỉ đọc)"`.
   * Luồng đọc truyện (`GET /api/stories/*`) vẫn hoạt động bình thường.
2. **Chặn IP tức thì (`ipBlacklistMiddleware.ts`):**
   * Đặt ở đầu chuỗi Middleware của Express. Mọi request đến từ IP nằm trong bảng `ip_blacklists` (và chưa hết hạn `blocked_until`) đều bị từ chối ngay lập tức với mã HTTP `403 Forbidden`.

### 3.5. RECOVER (Phục hồi Dữ liệu & Hoạt động)
1. **Khôi phục dữ liệu qua Soft Delete:**
   * Các lệnh xóa truyện, xóa chương, xóa bình luận thực chất chỉ cập nhật `is_deleted = 1`.
   * Admin có thể xem danh sách rác qua API `GET /api/admin/trash` và khôi phục nguyên trạng qua API `POST /api/admin/restore`.
2. **Khôi phục mật khẩu an toàn (`password_resets`):**
   * Token reset mật khẩu gửi qua email chỉ lưu dạng SHA-256 Hash trong database, có thời hạn 15 phút và chỉ được dùng đúng 1 lần (`used = 1`).

---

## 4. HƯỚNG DẪN CODE CHI TIẾT CHO AI (SYSTEM DIRECTIVES)

Khi yêu cầu AI viết code cho bất kỳ file nào trong thư mục `readln-backend/src`, bắt buộc AI tuân thủ các quy tắc sau:

1. **Bắt lỗi toàn cục:** Mọi Async Controller phải được bọc trong khối `try...catch` hoặc dùng `express-async-handler`.
2. **Không tiết lộ thông tin nhạy cảm:** Trả về lỗi dạng chuẩn `{ success: false, message: "..." }`. Không bao giờ trả stack trace hay câu truy vấn SQL thô ra Response HTTP.
3. **Sử dụng Prepared Statement / Prisma:** Tuyệt đối không cộng chuỗi SQL trực tiếp để chống triệt để SQL Injection.
4. **Header an toàn:** Khởi tạo `helmet()` và cấu hình CORS chỉ cho phép miền của Frontend (`CLIENT_ORIGIN`) gửi credentials (`credentials: true`).
5. **Kiểu dữ liệu BigInt:** Với cột `view_count` kiểu `BIGINT`, luôn chuyển đổi sang dạng `Number` hoặc `String` trước khi trả về JSON để tránh lỗi mã hóa Node.js.