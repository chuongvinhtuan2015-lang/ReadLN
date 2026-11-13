# BÁO CÁO & THUYẾT TRÌNH BẢO VỆ ĐỒ ÁN: READLN WEB
## HIỆN THỰC HÓA 5 TRỤ CỘT BẢO MẬT THEO KHUNG TIÊU CHUẨN NIST CSF 1.1

> **Đề tài:** Nền tảng Đọc Tiểu Thuyết Trực Tuyến ReadLN (`readln-web`)  
> **Ngôn ngữ & Công nghệ:** React 19 + TypeScript + Vite (Frontend) | Express + Prisma ORM + MySQL (Backend)  
> **Triết lý thiết kế:** Warm Paper Minimalist & NIST Cybersecurity Framework (CSF) Version 1.1  

---

## 📌 CÔNG THỨC TRÌNH BÀY CHO TỪNG TIÊU CHÍ
Mỗi trụ cột được cấu trúc theo 3 phần rõ ràng:
1. **Mục tiêu trụ cột (NIST CSF 1.1)**: Chuẩn yêu cầu bảo vệ điều gì.
2. **Web ReadLN đã làm gì để thỏa mãn**: Chi tiết mã nguồn, công nghệ và cơ chế đã code thực tế trong dự án.
3. **Lời thoại gợi ý khi thuyết trình**: Ngắn gọn, súc tích, tự tin trả lời hội đồng.

---

### TRỤ CỘT 1: IDENTIFY (Nhận Diện Tài Sản, Bề Mặt Tấn Công & Rủi Ro)

#### 1. Mục tiêu tiêu chuẩn:
Xác định danh mục tài sản, luồng dữ liệu nhạy cảm, bề mặt tấn công của hệ thống và đánh giá các lỗ hổng bảo mật tiềm ẩn.

#### 2. ReadLN đã làm gì để thỏa mãn:
* **Phân loại 3 phân vùng tài nguyên & dữ liệu rõ ràng trong Database MySQL (`readln_db`):**
  * *Vùng Công Khai (Public):* Bảng `stories`, `chapters`, `genres` – ai cũng có thể xem và đọc.
  * *Vùng Người Dùng (Authenticated User):* Bảng `users`, `bookmarks`, `ratings`, `comments` – chỉ truy cập được khi đã đăng nhập và được xác thực quyền chủ sở hữu.
  * *Vùng Quản Trị Hệ Thống (Administrative/Critical):* Bảng `audit_logs`, `ip_blacklists`, `system_settings` – cách ly tuyệt đối bằng phân quyền RBAC `ADMIN`.
* **Rà quét bề mặt tấn công với công cụ bảo mật quốc tế OWASP ZAP:**
  * Chủ động quét lỗ hổng ứng dụng web (Active & Passive Scan).
  * Phát hiện và xử lý triệt để các rủi ro về HTTP Security Headers:
    * Thêm `X-Frame-Options: DENY` (chống tấn công Clickjacking).
    * Thêm `X-Content-Type-Options: nosniff` (chống tấn công MIME-sniffing).
    * Cấu hình chính sách `Content-Security-Policy (CSP)` đầy đủ các directive có fallback: `default-src 'self'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `object-src 'none'`.
    * Cấu hình `Referrer-Policy: strict-origin-when-cross-origin` và `Permissions-Policy`.

#### 3. Lời trình bày thuyết minh:
> *"Kính thưa thầy/cô, ở trụ cột đầu tiên là **Identify**, em đã lập bản đồ tài nguyên của hệ thống thành 3 phân vùng dữ liệu với mức độ bảo vệ khác nhau trong MySQL. Đồng thời, em sử dụng công cụ tiêu chuẩn ngành **OWASP ZAP** để rà quét bề mặt tấn công của ứng dụng web, qua đó cấu hình toàn diện các HTTP Security Headers và chính sách CSP nghiêm ngặt nhằm kiểm soát chính xác nguồn tài nguyên được phép thực thi."*

---

### TRỤ CỘT 2: PROTECT (Bảo Vệ Hệ Thống & Bản Quyền Nội Dung)

#### 1. Mục tiêu tiêu chuẩn:
Xây dựng các lớp kiểm soát phòng thủ để đảm bảo tính Bảo mật (Confidentiality), Toàn vẹn (Integrity) và Sẵn sàng (Availability) của dữ liệu.

#### 2. ReadLN đã làm gì để thỏa mãn:
* **Xác thực và Quản lý phiên an toàn (Authentication & Session Security):**
  * Mật khẩu người dùng được băm an toàn bằng `bcryptjs` (salt rounds 10).
  * Lưu trữ JWT Token trong **`HttpOnly, SameSite=Lax Cookie`** – chặn đứng hoàn toàn nguy cơ tin tặc đánh cắp token phiên qua tấn công XSS.
  * Cơ chế phòng chống tấn công dò mật khẩu (Brute Force): Tự động ghi nhận `failed_login_attempts`, nếu nhập sai quá 5 lần sẽ khóa tài khoản trong 15 phút (`lockout_until`).
* **Kiểm soát truy cập dựa trên vai trò (RBAC - Role-Based Access Control):**
  * Middleware `rbacMiddleware` kiểm tra nghiêm ngặt quyền hạn giữa `READER`, `AUTHOR` và `ADMIN` trước khi chạm vào API quản trị.
* **Chống tiêm mã độc (Anti-Injection & XSS Sanitization):**
  * Sử dụng Prisma ORM với cơ chế Parameterized Queries, loại bỏ 100% rủi ro SQL Injection.
  * Lọc sạch nội dung bình luận (`comments`) qua thư viện `sanitizeHtml` / `DOMPurify` trước khi lưu vào MySQL và trước khi render ra DOM để chống Stored XSS.
* **Bẫy Bot tự động (Honeypot Trap):**
  * Tại form Đăng ký, Đăng nhập và Bình luận đều nhúng trường ẩn `HoneypotField`. Người dùng thật không nhìn thấy trường này, nhưng spam bot tự động điền dữ liệu sẽ lập tức bị chặn đứng mà không cần làm phiền người dùng bằng captcha phức tạp.
* **Bảo vệ Bản Quyền Nội Dung Chống Cào Dữ Liệu (Anti-Scraping & Anti-Copy):**
  * **Obfuscation RAM Encryption:** Nội dung chương truyện trong bảng `chapters` được mã hóa Base64 nhị phân UTF-8 an toàn ngay trong bộ nhớ trước khi truyền về client, ngăn chặn các công cụ cào tự động đọc lướt HTML thuần.
  * **AntiCopyWrapper:** Vô hiệu hóa chuột phải, chặn các phím tắt sao chép nội dung (`Ctrl+C`, `Ctrl+U`, `F12`, `Ctrl+S`).
  * **Zero-Width Unicode Watermark:** Tự động chèn mã nhị phân tàng hình (sử dụng các ký tự độ rộng bằng 0 như `\u200B`, `\u200C`) chứa mã định danh người dùng (`user.id`) vào xen kẽ nội dung chương. Khi văn bản bị copy lậu ra các trang web khác, người dùng hoàn toàn không nhìn thấy nhưng Admin có thể trích xuất chính xác tài khoản đã leak truyện.

#### 3. Lời trình bày thuyết minh:
> *"Tại trụ cột **Protect**, thay vì chỉ bảo vệ mức hạ tầng, em xây dựng 3 lớp phòng vệ trực tiếp trong ứng dụng: Bảo vệ tài khoản bằng `HttpOnly Cookie` và khóa tự động khi bị dò mật khẩu; bảo vệ tính toàn vẹn dữ liệu bằng kiểm soát XSS/Honeypot; và đặc biệt nhất là giải pháp bản quyền kép: mã hóa nội dung chương trong RAM kết hợp nhúng thủy vân tàng hình Unicode theo từng User ID để chống nạn cào trộm truyện."*

---

### TRỤ CỘT 3: DETECT (Phát Hiện Bất Thường & Truy Vết An Ninh)

#### 1. Mục tiêu tiêu chuẩn:
Triển khai các cơ chế giám sát liên tục để kịp thời phát hiện các dấu hiệu tấn công, hành vi bất thường và rò rỉ dữ liệu.

#### 2. ReadLN đã làm gì để thỏa mãn:
* **Nhật ký an ninh tập trung (`audit_logs` trong MySQL):**
  * Mọi hành vi nhạy cảm trên hệ thống (đăng nhập thất bại `AUTH_LOGIN` HTTP 401, bẫy bot `BOT_HONEYPOT_TRIGGER` HTTP 403, vi phạm tần suất `RATE_LIMIT` HTTP 429, cào truyện `READ_CHAPTER`, các tác vụ Admin) đều được middleware `auditLogger` tự động lưu lại vào MySQL kèm: Địa chỉ IP thực tế (`client_ip`), User Agent, đường dẫn, HTTP status và thời gian chính xác.
* **Trung tâm giám sát thời gian thực trên `AdminDashboardPage`:**
  * Bảng điều khiển quản trị thống kê trực quan các cuộc tấn công trong 24 giờ qua (số lượt bị chặn Rate-limit, số lượt nhập sai mật khẩu, số IP đang nằm trong danh sách đen) giúp quản trị viên nắm bắt ngay tình trạng an ninh.
* **Bộ lọc và phân tích Audit Logs (`AdminLogsPage`):**
  * Cho phép Admin lọc nhanh theo từng loại hành vi nguy hiểm (`AUTH`, `RATE_LIMIT`, `BOT`, `SCRAPE`, `ADMIN`) để điều tra nguồn gốc tấn công.
* **Công cụ giải mã truy vết bản quyền (`WatermarkDecoder`):**
  * Khi phát hiện truyện bị đăng trái phép ở diễn đàn bên ngoài, Admin chỉ cần dán đoạn văn bản đó vào công cụ. Hệ thống sẽ phân tích các bit Zero-Width ẩn và truy vấn trực tiếp cơ sở dữ liệu MySQL để hiển thị: User ID, Username, Email và Quyền hạn của thủ phạm đã sao chép chương đó.

#### 3. Lời trình bày thuyết minh:
> *"Ở trụ cột **Detect**, toàn bộ các sự kiện bất thường đều được ghi nhận tự động vào bảng `audit_logs`. Quản trị viên có bảng điều khiển trực quan để theo dõi các đợt tấn công trong 24h. Đặc biệt, công cụ Watermark Decoder cho phép Admin truy vết ngược từ một đoạn văn bản copy trên mạng để tìm ra chính xác danh tính tài khoản đã tuồn dữ liệu ra ngoài."*

---

### TRỤ CỘT 4: RESPOND (Phản Ứng Nhanh & Cô Lập Sự Cố)

#### 1. Mục tiêu tiêu chuẩn:
Có biện pháp hành động và ứng phó tức thì khi sự cố an ninh hoặc tấn công từ chối dịch vụ xảy ra để giảm thiểu tối đa thiệt hại.

#### 2. ReadLN đã làm gì để thỏa mãn:
* **Hạn chế tần suất tự động (Anti-DDoS / Anti-Brute Force Rate Limiter):**
  * Sử dụng middleware `rateLimiter` kiểm soát chặt chẽ lưu lượng:
    * API Chung: Tối đa 150 requests / 15 phút.
    * API Xác thực (Login/Register): Giới hạn nghiêm ngặt 10 requests / 15 phút.
    * Khi vượt ngưỡng, hệ thống tự động ngắt kết nối với mã lỗi HTTP `429 Too Many Requests`.
* **Cơ chế Danh Sách Đen IP Chủ Động (`ip_blacklists` trong MySQL):**
  * Quản trị viên có thể nhập địa chỉ IP khả nghi tại trang `AdminOperationsPage` kèm lý do vi phạm.
  * Middleware `ipBlacklistMiddleware` sẽ chặn đứng mọi request từ các IP này ngay từ cổng vào với mã HTTP `403 Forbidden`.
* **Nút Khẩn Cấp Phong Tỏa Toàn Hệ Thống (Emergency Kill-Switch):**
  * Trong trường hợp bị tấn công spam bot quy mô lớn hoặc nghi ngờ dữ liệu bị phá hoại, Admin kích hoạt **Kill-Switch** với 1 cú click (lưu cờ `is_lockdown_mode = true` trong bảng `system_settings`).
  * Middleware `lockdownMiddleware` sẽ lập tức chuyển toàn bộ ứng dụng sang chế độ **Chỉ Đọc (Read-Only)**:
    * Tất cả các request ghi (`POST`, `PUT`, `DELETE` như đăng nhập, bình luận, vote điểm...) đều bị ngắt lập tức với mã lỗi HTTP `503 Service Unavailable`.
    * Độc giả vẫn đọc được các chương truyện bình thường mà hệ thống không bị hư hại dữ liệu.
* **Khóa tài khoản vi phạm trực tiếp:**
  * Admin có quyền bấm khóa tài khoản người dùng ngay trên trang quản trị `AdminUsersPage` để ngắt quyền truy cập ngay lập tức.

#### 3. Lời trình bày thuyết minh:
> *"Tại trụ cột **Respond**, hệ thống đáp ứng với các cuộc tấn công qua 3 cấp độ: Cấp độ 1 là tự động chặn DDoS bằng Rate Limiter HTTP 429; Cấp độ 2 là quản lý danh sách đen IP Blacklist để chặn vĩnh viễn kẻ tấn công; và Cấp độ 3 là nút khẩn cấp Kill-Switch — chỉ cần một nút bấm, toàn bộ hệ thống sẽ chuyển sang chế độ Chỉ Đọc (HTTP 503 cho mọi thao tác ghi) để bảo toàn tuyệt đối cơ sở dữ liệu."*

---

### TRỤ CỘT 5: RECOVER (Phục Hồi Dữ Liệu & Khôi Phục Vận Hành)

#### 1. Mục tiêu tiêu chuẩn:
Khôi phục nguyên trạng các dịch vụ, chức năng và dữ liệu đã bị ảnh hưởng sau khi xảy ra sự cố hoặc thao tác nhầm lẫn.

#### 2. ReadLN đã làm gì để thỏa mãn:
* **Cơ chế Xóa Mềm Chống Mất Dữ Liệu (Soft Delete):**
  * Mọi hành động xóa truyện, xóa chương, hoặc ẩn bình luận trong ứng dụng **không bao giờ xóa cứng** (không dùng `DELETE FROM`) mà chỉ cập nhật cờ `is_deleted = true`.
  * Dữ liệu hoàn toàn an toàn trước các hành vi phá hoại hoặc thao tác xóa nhầm của quản trị viên.
* **Giao diện Khôi Phục Thùng Rác (Trash Restore Portal):**
  * Tại `TrashRestoreTable`, hệ thống liệt kê toàn bộ các truyện, chương và bình luận đang bị đánh dấu `is_deleted = true` trong MySQL.
  * Quản trị viên chỉ cần bấm nút **"Khôi phục"**, cờ sẽ được trả về `false` và nội dung lập tức hiển thị lại nguyên vẹn trên website.
* **Cơ chế Kích hoạt Sao Lưu Cơ Sở Dữ Liệu (Database Backup Trigger):**
  * Tích hợp chức năng xuất bản sao lưu MySQL (`readln_backup_latest.sql.gz`) tại `BackupTriggerCard`, cho phép xuất snapshot dữ liệu định kỳ hoặc khẩn cấp trước khi can thiệp vào các thay đổi lớn.
* **Khôi phục quyền truy cập tài khoản an toàn (Password Reset Flow):**
  * Bảng `password_resets` quản lý token đặt lại mật khẩu với chuỗi băm ngẫu nhiên `token_hash`, thời hạn hết hạn `expires_at` và cờ `used = true` để đảm bảo mỗi liên kết chỉ được sử dụng duy nhất một lần.

#### 3. Lời trình bày thuyết minh:
> *"Cuối cùng ở trụ cột **Recover**, để đảm bảo tính sẵn sàng và khả năng phục hồi dữ liệu, ReadLN áp dụng chính sách Xóa mềm (Soft Delete) trên toàn bộ hệ thống. Bất kỳ truyện hay chương nào bị xóa đều có thể khôi phục tức thì thông qua trang quản trị Thùng rác. Kết hợp cùng cơ chế sao lưu Snapshot cơ sở dữ liệu và quy trình cấp lại mật khẩu dùng một lần, hệ thống luôn sẵn sàng phục hồi về trạng thái hoạt động bình thường."*

---

## 🎯 BẢNG TỔNG KẾT ĐỐI CHIẾU 5 TIÊU CHÍ NIST CSF 1.1 VỚI HỆ THỐNG READLN

| Tiêu chuẩn NIST CSF 1.1 | Chức năng & Thành phần trên Web ReadLN | Tệp tin / Endpoint tương ứng trong Source Code |
| :--- | :--- | :--- |
| **1. IDENTIFY** | Phân loại 3 vùng dữ liệu MySQL; Quét lỗ hổng OWASP ZAP; Cấu hình HTTP Security Headers & CSP. | `vite.config.ts`, `index.html`, `prisma/schema.prisma` |
| **2. PROTECT** | HttpOnly Cookie, Brute-force lockout, RBAC, Lọc XSS sanitizeHtml, Honeypot bot trap, Mã hóa RAM, Thủy vân Zero-Width. | `authMiddleware.ts`, `watermarkService.ts`, `cryptoService.ts`, `CommentSection.tsx` |
| **3. DETECT** | Lưu vết kiểm toán `audit_logs`, Dashboard an ninh 24h, Phân tích log, Giải mã thủy vân tìm kẻ leak truyện. | `auditLogger.ts`, `AdminDashboardPage.tsx`, `WatermarkDecoder.tsx`, `adminController.ts` |
| **4. RESPOND** | Rate Limiting (429), Chặn IP Blacklist (403), Nút khẩn cấp Kill-Switch Read-Only (503). | `rateLimiter.ts`, `ipBlacklistMiddleware.ts`, `lockdownMiddleware.ts`, `KillSwitchModal.tsx` |
| **5. RECOVER** | Xóa mềm `is_deleted = true`, Khôi phục thùng rác 1-click, Sao lưu database MySQL, Khôi phục mật khẩu an toàn. | `TrashRestoreTable.tsx`, `BackupTriggerCard.tsx`, `userRoutes.ts`, `adminController.ts` |

---

## 💡 CÁCH TRẢ LỜI CÁC CÂU HỎI HỘI ĐỒNG THƯỜNG GẶP

1. **Hỏi: "Tại sao trong bảng đồ án mẫu có các công cụ hạ tầng như Wazuh, PfSense, Grafana, Suricata... mà em không cài đặt?"**  
   * **Trả lời:** *"Dạ thưa thầy/cô, các công cụ như PfSense hay Wazuh là giải pháp bảo mật ở **tầng mạng và hạ tầng máy chủ vật lý**. Trong phạm vi đồ án phát triển ứng dụng phần mềm (Web Application), em đã hiện thực hóa trọn vẹn tư duy và nguyên lý của cả 5 trụ cột NIST CSF 1.1 **trực tiếp vào mã nguồn và kiến trúc cơ sở dữ liệu** của website. Nhờ đó, ứng dụng có khả năng tự phòng thủ độc lập ngay cả khi chạy trên các môi trường máy chủ khác nhau."*

2. **Hỏi: "Em chứng minh thế nào là hệ thống của em đã thỏa mãn bước Identify?"**  
   * **Trả lời:** *"Dạ, em đã chạy rà quét trực tiếp ứng dụng bằng công cụ bảo mật quốc tế **OWASP ZAP**. Kết quả quét chứng minh hệ thống không còn bất kỳ lỗ hổng High/Critical nào, đồng thời em đã khắc phục toàn bộ các khuyến nghị về HTTP Security Headers như Anti-clickjacking (`X-Frame-Options: DENY`), Anti-sniffing (`X-Content-Type-Options: nosniff`) và thiết lập chính sách bảo mật nội dung CSP chuẩn mực."*

3. **Hỏi: "Cơ chế Thủy vân (Watermark) giải quyết bài toán gì của một web đọc truyện?"**  
   * **Trả lời:** *"Dạ, các trang web truyện thông thường chỉ có thể cấm bôi đen hoặc chặn chuột phải, nhưng kẻ trích xuất nội dung vẫn có thể copy qua DevTools hoặc Extension. Bằng cách nhúng các ký tự Zero-Width Unicode mang User ID của chính người đang đọc vào văn bản một cách tàng hình, khi truyện bị rò rỉ ra ngoài, quản trị viên chỉ cần dán đoạn văn bản đó vào công cụ giải mã của hệ thống là tìm ra chính xác tài khoản đã vi phạm để xử lý."*
