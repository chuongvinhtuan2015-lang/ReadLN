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
* **Phân loại 3 phân vùng tài nguyên & dữ liệu rõ ràng trong Database MySQL:**
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
  * Lưu trữ JWT Token trong **`HttpOnly, SameSite=None, Secure Cookie`** – bảo vệ phiên đăng nhập an toàn giữa các domain, chặn đứng hoàn toàn nguy cơ tin tặc đánh cắp token qua tấn công XSS.
  * Cơ chế phòng chống tấn công dò mật khẩu (Brute Force): Tự động ghi nhận `failed_login_attempts`, nếu nhập sai quá 5 lần sẽ khóa tài khoản trong 15 phút (`lockout_until`).
* **Kiểm soát truy cập dựa trên vai trò (RBAC - Role-Based Access Control):**
  * Middleware `rbacMiddleware` kiểm tra nghiêm ngặt quyền hạn giữa `READER`, `AUTHOR` và `ADMIN` trước khi chạm vào API quản trị.
* **Chống tiêm mã độc (Anti-Injection & XSS Sanitization):**
  * Sử dụng Prisma ORM với cơ chế Parameterized Queries, loại bỏ 100% rủi ro SQL Injection.
  * Lọc sạch nội dung bình luận (`comments`) qua thư viện `DOMPurify` / `sanitize-html` trước khi lưu vào MySQL và trước khi render ra DOM để chống Stored XSS.
* **Bẫy Bot tự động (Honeypot Trap):**
  * Tại form Đăng ký, Đăng nhập và Bình luận đều nhúng trường ẩn `HoneypotField`. Người dùng thật không nhìn thấy trường này, nhưng spam bot tự động điền dữ liệu sẽ lập tức kích hoạt chu trình tự động cô lập.
* **Bảo vệ Bản Quyền Nội Dung Chống Cào Dữ Liệu (Anti-Scraping & Anti-Copy):**
  * **Obfuscation RAM Encryption:** Nội dung chương truyện trong bảng `chapters` được mã hóa Base64 nhị phân UTF-8 an toàn ngay trong bộ nhớ trước khi truyền về client, ngăn chặn các công cụ cào tự động đọc lướt HTML thuần.
  * **AntiCopyWrapper:** Vô hiệu hóa chuột phải, chặn các phím tắt sao chép nội dung (`Ctrl+C`, `Ctrl+U`, `F12`, `Ctrl+S`).
  * **Zero-Width Unicode Watermark:** Tự động chèn mã nhị phân tàng hình (sử dụng các ký tự độ rộng bằng 0 như `\u200B`, `\u200C`) chứa mã định danh người dùng (`user.id`) vào xen kẽ nội dung chương. Khi văn bản bị copy lậu ra các trang web khác, người dùng hoàn toàn không nhìn thấy nhưng Admin có thể trích xuất chính xác tài khoản đã leak truyện.

#### 3. Lời trình bày thuyết minh:
> *"Tại trụ cột **Protect**, thay vì chỉ bảo vệ mức hạ tầng, em xây dựng 3 lớp phòng vệ trực tiếp trong ứng dụng: Bảo vệ tài khoản bằng `HttpOnly Cookie` và khóa tự động khi bị dò mật khẩu; bảo vệ tính toàn vẹn dữ liệu bằng kiểm soát XSS/Honeypot; và đặc biệt nhất là giải pháp bản quyền kép: mã hóa nội dung chương trong RAM kết hợp nhúng thủy vân tàng hình Unicode theo từng User ID để chống nạn cào trộm truyện."*

---

### TRỤ CỘT 3: DETECT (Phát Hiện Bất Thường & Giám Sát An Ninh)

#### 1. Mục tiêu tiêu chuẩn:
Triển khai các cơ chế giám sát liên tục để kịp thời phát hiện các dấu hiệu tấn công, hành vi bất thường và rò rỉ dữ liệu.

#### 2. ReadLN đã làm gì để thỏa mãn:
* **Nhật ký an ninh tập trung (`audit_logs` trong MySQL):**
  * Mọi hành vi nhạy cảm trên hệ thống (đăng nhập thất bại `AUTH_FAILED` HTTP 401, bẫy bot `BOT_HONEYPOT_TRIGGER` HTTP 403, vi phạm tần suất `RATE_LIMIT_BLOCK` HTTP 429, cào truyện `READ_CHAPTER`, các tác vụ Admin) đều được middleware `auditLogger` tự động lưu lại vào MySQL kèm: Địa chỉ IP thực tế (`client_ip`), User Agent, đường dẫn, HTTP status và thời gian chính xác.
* **Trung tâm giám sát thời gian thực trên `AdminDashboardPage`:**
  * Bảng điều khiển quản trị thống kê trực quan các cuộc tấn công trong 24 giờ qua (số lượt bị chặn Rate-limit, số lượt nhập sai mật khẩu, số IP đang nằm trong danh sách đen) giúp quản trị viên nắm bắt ngay tình trạng an ninh.
* **Bộ lọc và phân tích Audit Logs (`AdminLogsPage`):**
  * Cho phép Admin lọc nhanh theo từng loại hành vi nguy hiểm (`AUTH`, `RATE_LIMIT`, `BOT`, `SCRAPE`, `ADMIN`) để điều tra nguồn gốc tấn công.
* **Công cụ giải mã truy vết bản quyền (`WatermarkDecoder`):**
  * Khi phát hiện truyện bị đăng trái phép ở diễn đàn bên ngoài, Admin chỉ cần dán đoạn văn bản đó vào công cụ. Hệ thống sẽ phân tích các bit Zero-Width ẩn và truy vấn trực tiếp cơ sở dữ liệu MySQL để hiển thị: User ID, Username, Email và Quyền hạn của thủ phạm đã sao chép chương đó.

#### 3. Lời trình bày thuyết minh:
> *"Ở trụ cột **Detect**, toàn bộ các sự kiện bất thường đều được ghi nhận tự động vào bảng `audit_logs`. Quản trị viên có bảng điều khiển trực quan để theo dõi các đợt tấn công trong 24h. Đặc biệt, công cụ Watermark Decoder cho phép Admin truy vết ngược từ một đoạn văn bản copy trên mạng để tìm ra chính xác danh tính tài khoản đã tuồn dữ liệu ra ngoài."*

---

### TRỤ CỘT 4: RESPOND (Tự Động Phản Ứng Dựa Trên Dấu Hiệu Phát Hiện - DETECT to RESPOND)

#### 1. Mục tiêu tiêu chuẩn:
Có biện pháp hành động và ứng phó tức thì khi sự cố an ninh hoặc tấn công xảy ra. Đặc biệt, **chu trình phản ứng (RESPOND) phải vận hành TỰ ĐỘNG dựa trên kết quả phát hiện bất thường (DETECT)** để cô lập nguy cơ mà không cần chờ con người can thiệp thủ công.

#### 2. ReadLN đã làm gì để thỏa mãn:
Hệ thống xây dựng dịch vụ phản ứng tự động **`AutoResponseService`** liên kết trực tiếp với tầng phát hiện `DETECT`:
* **Tự động chặn IP khi kích hoạt Bẫy Bot Honeypot (Zero-Tolerance Response):**
  * *Phát hiện (Detect):* Client gửi request có điền giá trị vào trường ẩn `company_website`.
  * *Tự động phản ứng (Respond):* Hệ thống tự động ghi IP vào bảng `ip_blacklists` với thời hạn khóa 24 giờ, đồng thời ghi log hành vi `AUTO_RESPOND_BLOCK_IP`. Mọi request tiếp theo từ IP này bị ngắt ngay tại cổng với mã HTTP `403 Forbidden`.
* **Tự động chặn IP khi tấn công dò mật khẩu (Brute-Force Auto-Mitigation):**
  * *Phát hiện (Detect):* Một IP gửi sai thông tin đăng nhập từ 5 lần trở lên trong vòng 5 phút.
  * *Tự động phản ứng (Respond):* `AutoResponseService` tự động đưa IP đó vào danh sách đen khóa 2 giờ, ngăn chặn kẻ tấn công đổi sang dò tài khoản khác trên cùng một địa chỉ mạng.
* **Tự động nâng cấp mức phạt khi vi phạm Rate Limit liên tiếp (Progressive Rate-Limit Penalty):**
  * *Phát hiện (Detect):* Một IP cố tình spam và nhận mã HTTP 429 liên tục 3 lần trong vòng 3 phút.
  * *Tự động phản ứng (Respond):* Hệ thống tự động nâng mức phạt từ hạn chế tốc độ (HTTP 429) lên **chặn hoàn toàn truy cập (HTTP 403 trong 1 giờ)**.
* **Tự động kích hoạt Nút Khẩn Cấp Kill-Switch khi phát hiện DDoS Botnet phân tán:**
  * *Phát hiện (Detect):* Nếu hệ thống phát hiện từ 10 IP khác nhau cùng đồng loạt vi phạm Rate Limit / tấn công trong vòng 60 giây (dấu hiệu của mạng botnet phân tán).
  * *Tự động phản ứng (Respond):* `AutoResponseService` **tự động kích hoạt cờ `is_lockdown_mode = true`** trong bảng `system_settings`. Toàn bộ ứng dụng ngay lập tức chuyển sang chế độ **Chỉ Đọc (Read-Only - HTTP 503 cho mọi thao tác ghi)** để bảo toàn toàn vẹn cơ sở dữ liệu.
* **Can thiệp thủ công bổ trợ:** Quản trị viên vẫn có toàn quyền chủ động thêm/xóa IP blacklist hoặc bật/tắt Kill-Switch tại trang quản trị `AdminOperationsPage`.

#### 3. Lời trình bày thuyết minh:
> *"Tại trụ cột **Respond**, điểm đặc biệt nhất của ReadLN là cơ chế **Phản ứng tự động khép kín dựa trên dữ liệu phát hiện (DETECT to RESPOND)**: Khi phát hiện bot điền bẫy Honeypot hoặc dò mật khẩu quá 5 lần, hệ thống lập tức tự động đưa IP vào Blacklist chặn truy cập 403; khi phát hiện dấu hiệu DDoS phân tán từ nhiều IP trong 1 phút, hệ thống tự động kích hoạt chế độ Kill-Switch Chỉ Đọc để bảo vệ cơ sở dữ liệu mà không cần chờ quản trị viên can thiệp thủ công."*

---

### TRỤ CỘT 5: RECOVER (Phục Hồi Dữ Liệu & Khôi Phục Vận Hành Thực Tế)

#### 1. Mục tiêu tiêu chuẩn:
Khôi phục nguyên trạng các dịch vụ, chức năng và dữ liệu đã bị ảnh hưởng sau khi xảy ra sự cố hoặc thao tác nhầm lẫn.

#### 2. ReadLN đã làm gì để thỏa mãn:
* **Xuất Bản Sao Lưu MySQL Hoàn Chỉnh Thực Tế (`BackupService` & `BackupTriggerCard`):**
  * Không chỉ là nút mô phỏng, dịch vụ `BackupService` kết nối trực tiếp vào MySQL, quét và kết xuất toàn bộ schema và dữ liệu của tất cả các bảng (`genres`, `stories`, `story_genres`, `chapters`, `users`, `bookmarks`, `ratings`, `comments`, `system_settings`).
  * Tự động xuất thành file chuẩn SQL (`REPLACE INTO`, thiết lập `SET FOREIGN_KEY_CHECKS = 0; SET NAMES utf8mb4;`).
  * Nén luồng dữ liệu bằng thuật toán **Gzip** (`.sql.gz`) và truyền trực tiếp về trình duyệt để quản trị viên tải bản sao lưu nguyên vẹn về máy tính trạm chỉ bằng một cú nhấp chuột.
* **Cơ chế Xóa Mềm Chống Mất Dữ Liệu (Soft Delete):**
  * Mọi hành động xóa truyện, xóa chương, hoặc ẩn bình luận trong ứng dụng **không bao giờ xóa cứng** (không dùng `DELETE FROM`) mà chỉ cập nhật cờ `is_deleted = true`.
  * Dữ liệu hoàn toàn an toàn trước các hành vi phá hoại hoặc thao tác xóa nhầm của quản trị viên.
* **Giao diện Khôi Phục Thùng Rác (Trash Restore Portal):**
  * Tại `TrashRestoreTable`, hệ thống liệt kê toàn bộ các truyện, chương và bình luận đang bị đánh dấu `is_deleted = true` trong MySQL.
  * Quản trị viên chỉ cần bấm nút **"Khôi phục"**, cờ sẽ được trả về `false` và nội dung lập tức hiển thị lại nguyên vẹn trên website.
* **Khôi phục quyền truy cập tài khoản an toàn (Password Reset Flow):**
  * Bảng `password_resets` quản lý token đặt lại mật khẩu với chuỗi băm ngẫu nhiên `token_hash`, thời hạn hết hạn `expires_at` và cờ `used = true` để đảm bảo mỗi liên kết chỉ được sử dụng duy nhất một lần.

#### 3. Lời trình bày thuyết minh:
> *"Cuối cùng ở trụ cột **Recover**, để đảm bảo tính sẵn sàng và khả năng phục hồi dữ liệu, ReadLN áp dụng chính sách Xóa mềm (Soft Delete) trên toàn bộ hệ thống giúp khôi phục dữ liệu tức thì từ Thùng rác. Đặc biệt, hệ thống tích hợp tính năng **Sao lưu cơ sở dữ liệu MySQL thật**: kết xuất toàn bộ dữ liệu ra file SQL nén Gzip và cho phép quản trị viên tải thẳng về máy tính để sẵn sàng khôi phục nguyên trạng hệ thống khi xảy ra sự cố."*

---

## 🎯 BẢNG TỔNG KẾT ĐỐI CHIẾU 5 TIÊU CHÍ NIST CSF 1.1 VỚI HỆ THỐNG READLN

| Tiêu chuẩn NIST CSF 1.1 | Chức năng & Thành phần trên Web ReadLN | Tệp tin / Endpoint tương ứng trong Source Code |
| :--- | :--- | :--- |
| **1. IDENTIFY** | Phân loại 3 vùng dữ liệu MySQL; Quét lỗ hổng OWASP ZAP; Cấu hình HTTP Security Headers & CSP. | `vite.config.ts`, `index.html`, `prisma/schema.prisma` |
| **2. PROTECT** | HttpOnly Cookie, Brute-force lockout, RBAC, Lọc XSS sanitizeHtml, Honeypot bot trap, Mã hóa RAM, Thủy vân Zero-Width. | `authMiddleware.ts`, `watermarkService.ts`, `cryptoService.ts`, `CommentSection.tsx` |
| **3. DETECT** | Lưu vết kiểm toán `audit_logs`, Dashboard an ninh 24h, Phân tích log, Giải mã thủy vân tìm kẻ leak truyện. | `auditLogger.ts`, `AdminDashboardPage.tsx`, `WatermarkDecoder.tsx`, `adminController.ts` |
| **4. RESPOND** | **Tự động phản ứng từ Detect**: Auto-block IP khi dính Honeypot/Brute-force/Rate-limit; Tự động kích hoạt Kill-Switch Read-Only khi phát hiện DDoS; Quản lý IP Blacklist. | `autoResponseService.ts`, `rateLimiter.ts`, `antiBotMiddleware.ts`, `lockdownMiddleware.ts`, `KillSwitchModal.tsx` |
| **5. RECOVER** | **Sao lưu dữ liệu MySQL thật** (kết xuất SQL nén Gzip tải về máy), Xóa mềm `is_deleted = true`, Khôi phục thùng rác 1-click, Khôi phục mật khẩu an toàn. | `backupService.ts`, `BackupTriggerCard.tsx`, `TrashRestoreTable.tsx`, `userRoutes.ts`, `adminController.ts` |

---

## 💡 CÁCH TRẢ LỜI CÁC CÂU HỎI HỘI ĐỒNG THƯỜNG GẶP

1. **Hỏi: "Phần RESPOND của em hoạt động như thế nào, có liên kết với DETECT không và có tự động không?"**  
   * **Trả lời:** *"Dạ thưa thầy/cô, hệ thống RESPOND của em hoạt động **hoàn toàn tự động dựa trên tín hiệu phát hiện từ DETECT** thông qua dịch vụ `AutoResponseService`:  
     - Khi DETECT phát hiện bot điền bẫy Honeypot: RESPOND lập tức tự động đưa IP vào danh sách đen khóa 24 giờ.  
     - Khi DETECT phát hiện một IP đăng nhập sai quá 5 lần hoặc vi phạm Rate Limit liên tiếp: RESPOND tự động chặn IP đó trong 1-2 giờ.  
     - Đặc biệt, khi DETECT phát hiện tấn công phân tán từ hơn 10 IP khác nhau trong vòng 60 giây, RESPOND sẽ tự động bật nút khẩn cấp Kill-Switch chuyển web sang chế độ Chỉ Đọc (Read-Only) để bảo vệ toàn vẹn cơ sở dữ liệu."*

2. **Hỏi: "Tính năng Sao lưu cơ sở dữ liệu ở RECOVER hoạt động như thế nào?"**  
   * **Trả lời:** *"Dạ, ở phần RECOVER, em đã xây dựng dịch vụ `BackupService` kết nối trực tiếp với MySQL để đọc toàn bộ dữ liệu các bảng, tạo thành file mã SQL chuẩn (`REPLACE INTO`, có kiểm soát khóa ngoại và bảng mã `utf8mb4`), sau đó nén nhị phân bằng thuật toán Gzip (`.sql.gz`) và truyền trực tiếp về trình duyệt để quản trị viên tải về máy tính trạm lưu trữ an toàn."*
