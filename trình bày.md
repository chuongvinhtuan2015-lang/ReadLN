# BÁO CÁO & THUYẾT TRÌNH BẢO VỆ ĐỒ ÁN: READLN WEB
## HIỆN THỰC HÓA 5 TRỤ CỘT BẢO MẬT THEO KHUNG TIÊU CHUẨN NIST CSF 1.1

> **Đề tài:** Nền tảng Đọc Tiểu Thuyết Trực Tuyến ReadLN (`readln-web`)  
> **Ngôn ngữ & Công nghệ:** React 19 + TypeScript + Vite (Frontend) | Express + Prisma ORM + MySQL (Backend)  
> **Triết lý thiết kế:** Warm Paper Minimalist & NIST Cybersecurity Framework (CSF) Version 1.1  

---

## 📌 CÔNG THỨC TRÌNH BÀY CHO TỪNG TIÊU CHÍ
Mỗi trụ cột được cấu trúc theo 3 phần ngắn gọn, đúng trọng tâm:
1. **Nội dung chính trên Slide:** Các đầu việc chính đã thực hiện.
2. **Chi tiết mã nguồn & cơ chế trên Web ReadLN:** Minh chứng kỹ thuật.
3. **Lời thoại gợi ý khi thuyết trình:** Câu trả lời tự tin, mạch lạc trước hội đồng.

---

### TRỤ CỘT 1: IDENTIFY (Nhận Diện)

#### 1. Trên Slide ghi gì:
* **Quét lỗ hổng bằng OWASP ZAP:** Rà quét bề mặt tấn công ứng dụng web (Active & Passive Scan).
* **Bổ sung HTTP Security Headers:** Khắc phục triệt để các cảnh báo bảo mật trình duyệt (`X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`).

#### 2. Web ReadLN đã làm gì để thỏa mãn:
* Sử dụng công cụ quốc tế **OWASP ZAP** quét toàn bộ trang web ở cổng `5173`, phát hiện các nguy cơ tiềm ẩn về thiếu header bảo vệ.
* Cấu hình đồng bộ trong `vite.config.ts` và `index.html`:
  * `X-Frame-Options: DENY` (Chặn đứng nguy cơ tấn công Clickjacking).
  * `X-Content-Type-Options: nosniff` (Ngăn chặn trình duyệt tự ý đoán sai định dạng file MIME-sniffing).
  * `Content-Security-Policy (CSP)` định nghĩa đầy đủ directive có fallback: `default-src 'self'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `object-src 'none'`.
  * `Referrer-Policy: strict-origin-when-cross-origin` và `Permissions-Policy`.

#### 3. Lời trình bày thuyết minh:
> *"Kính thưa thầy/cô, ở trụ cột đầu tiên là **Identify**, em đã sử dụng công cụ tiêu chuẩn ngành **OWASP ZAP** để rà quét toàn diện bề mặt tấn công của website. Dựa trên kết quả quét, em đã bổ sung đầy đủ bộ HTTP Security Headers như `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` và thiết lập chính sách Content Security Policy (CSP) nghiêm ngặt để kiểm soát chặt chẽ tài nguyên được phép thực thi."*

---

### TRỤ CỘT 2: PROTECT (Bảo Vệ Chủ Động)

#### 1. Trên Slide ghi gì:
* **Mã hóa nội dung chương trong RAM (Base64 UTF-8):** Chống bot cào đọc trực tiếp văn bản thô từ HTML.
* **Chống sao chép (AntiCopy):** Khóa chuột phải, chặn các phím tắt sao chép `Ctrl+C`, `Ctrl+U`, `F12`.
* **Thủy vân ẩn truy vết (Zero-Width Watermark):** Nhúng User ID tàng hình vào văn bản để bảo vệ bản quyền.
* **Bảo vệ tài khoản:** Băm mật khẩu `Bcrypt` + `HttpOnly Cookie` chống đánh cắp phiên.

#### 2. Web ReadLN đã làm gì để thỏa mãn:
* **Obfuscation RAM Encryption (`cryptoService.ts`):** Nội dung chương truyện trong bảng `chapters` được mã hóa Base64 nhị phân an toàn trong bộ nhớ trước khi truyền về client, ngăn chặn các công cụ cào tự động đọc lướt HTML thuần.
* **AntiCopyWrapper (`AntiCopyWrapper.tsx`):** Vô hiệu hóa chuột phải (`contextmenu`), chặn các phím tắt sao chép nội dung (`Ctrl+C`, `Ctrl+U`, `F12`, `Ctrl+S`) và tắt tính năng bôi đen văn bản (`select-none`).
* **Zero-Width Unicode Watermark (`watermarkService.ts`):** Tự động chuyển đổi User ID của người đang đọc thành các ký tự nhị phân độ rộng bằng 0 (`\u200B`, `\u200C`) xen kẽ trong văn bản. Mắt thường không nhìn thấy nhưng mã định danh luôn bám theo nội dung bị copy.
* **Authentication Security (`authController.ts`):** Băm mật khẩu bằng `bcryptjs` (salt rounds 10) và lưu trữ JWT Token trong **`HttpOnly, Secure, SameSite Cookie`**, loại bỏ hoàn toàn nguy cơ bị mã độc Javascript đánh cắp token qua XSS.

#### 3. Lời trình bày thuyết minh:
> *"Tại trụ cột **Protect**, em xây dựng các lớp phòng vệ chủ động: Bảo vệ tài khoản người dùng bằng mã băm Bcrypt và lưu token trong `HttpOnly Cookie` chống đánh cắp phiên; bảo vệ bản quyền tác phẩm bằng giải pháp ba tầng: mã hóa nội dung chương trong RAM (Base64 UTF-8), khóa chuột phải cùng phím tắt sao chép (Ctrl+C, Ctrl+U, F12), và nhúng thủy vân tàng hình Unicode theo từng User ID để truy vết khi nội dung bị tuồn ra ngoài."*

---

### TRỤ CỘT 3: DETECT (Phát Hiện Bất Thường)

#### 1. Trên Slide ghi gì:
* **Bẫy Bot Honeypot:** Phát hiện bot tự động điền vào trường ẩn.
* **Giám sát tần suất truy cập (Rate Limit):** Phát hiện IP spam gửi request dồn dập (vượt quá 120 req/phút).
* **Phát hiện dò mật khẩu:** Ghi nhận các lần đăng nhập sai liên tiếp từ một IP (`AUTH_FAILED`).
* **Hệ thống Audit Logs:** Ghi nhận toàn bộ vết tích tấn công và công cụ giải mã Watermark Decoder.

#### 2. Web ReadLN đã làm gì để thỏa mãn:
* **Honeypot Trap (`antiBotMiddleware.ts`):** Đặt trường ẩn `company_website` trong các biểu mẫu đăng ký, đăng nhập và bình luận. Người dùng thật không thấy, nhưng bot tự động sẽ điền vào ➔ Hệ thống phát hiện ngay hành vi tự động.
* **Rate Limit Monitor (`rateLimiter.ts`):** Giám sát lưu lượng truy cập của từng IP theo thời gian thực (giới hạn 120 req/phút cho API chung và 15 lần/15 phút cho API xác thực).
* **Brute-Force Detection (`authController.ts`):** Theo dõi số lần nhập sai mật khẩu liên tiếp của từng IP/tài khoản và ghi nhận sự kiện `AUTH_FAILED`.
* **Audit Logs & Decoder (`auditLogger.ts` & `AdminLogsPage.tsx`):** Tự động ghi nhật ký mọi hành vi vào bảng `audit_logs` trong MySQL kèm IP, User-Agent, thời gian. Cung cấp công cụ **Watermark Decoder** để quét giải mã đoạn text nghi vấn bị cào trộm và tra cứu ra tài khoản vi phạm.

#### 3. Lời trình bày thuyết minh:
> *"Ở trụ cột **Detect**, hệ thống triển khai các cảm biến phát hiện bất thường: Dùng bẫy Honeypot để phát hiện bot tự động; dùng Rate Limiter để phát hiện các đợt spam request dồn dập; theo dõi các hành vi dò mật khẩu sai nhiều lần; và ghi nhận toàn bộ dấu vết tấn công vào bảng `audit_logs` tập trung cùng công cụ Watermark Decoder để phát hiện kẻ rò rỉ truyện."*

---

### TRỤ CỘT 4: RESPOND (Tự Động Phản Ứng Dựa Trên DETECT) 🌟

#### 1. Trên Slide ghi gì:
* **Honeypot ➔ Tự động chặn IP:** DETECT phát hiện bot điền bẫy ➔ RESPOND tự động đưa IP vào Blacklist khóa 24h và ngắt kết nối (HTTP 403).
* **Chặn IP truy cập nhiều (Spam):** DETECT phát hiện IP vi phạm Rate Limit liên tiếp ➔ RESPOND tự động nâng mức phạt lên khóa IP 1 giờ trong Blacklist.
* **Phản ứng khẩn cấp (Kill-Switch):** Khi có dấu hiệu tấn công diện rộng, kích hoạt chế độ Chỉ Đọc (Read-Only HTTP 503) để bảo toàn cơ sở dữ liệu.

#### 2. Web ReadLN đã làm gì để thỏa mãn:
* Hệ thống xây dựng dịch vụ **`AutoResponseService.ts`** vận hành khép kín theo chu trình **DETECT ➔ RESPOND tự động**:
  * **Honeypot ➔ Chặn tự động:** Khi `antiBotMiddleware` bắt được bot điền trường ẩn ➔ `AutoResponseService` lập tức tự động thêm IP đó vào bảng `ip_blacklists` khóa 24 giờ và trả về HTTP `403 Forbidden`.
  * **Spam Rate Limit ➔ Chặn tự động:** Khi một IP bị trả về mã 429 liên tiếp 3 lần trong 3 phút ➔ Hệ thống tự động nâng mức phạt, ghi IP vào `ip_blacklists` chặn hoàn toàn truy cập trong 1 giờ.
  * **Dò mật khẩu ➔ Khóa IP tự động:** Khi một IP nhập sai mật khẩu từ 5 lần trở lên trong 5 phút ➔ Tự động khóa IP đó 2 giờ.
  * **Chế độ Phong tỏa Khẩn cấp Kill-Switch (`lockdownMiddleware.ts`):** Quản trị viên có thể kích hoạt nút Kill-Switch để lập tức chuyển toàn bộ web sang chế độ **Chỉ Đọc (Read-Only - HTTP 503 cho mọi thao tác ghi `POST`, `PUT`, `DELETE`)** để bảo vệ toàn vẹn dữ liệu.

#### 3. Lời trình bày thuyết minh:
> *"Thưa thầy/cô, ở trụ cột **Respond**, hệ thống đáp ứng tiêu chuẩn phản ứng **HOÀN TOÀN TỰ ĐỘNG DỰA TRÊN DỮ LIỆU CỦA DETECT**:  
> 1. Khi DETECT phát hiện bot dính bẫy Honeypot ➔ RESPOND tự động đưa IP vào Blacklist khóa 24 giờ và ngắt kết nối với mã 403.  
> 2. Khi DETECT phát hiện IP spam request vi phạm Rate Limit liên tiếp ➔ RESPOND tự động chặn IP đó 1 giờ trong Blacklist.  
> 3. Ngoài ra, Admin có nút khẩn cấp Kill-Switch để ngay lập tức đưa web về chế độ Chỉ Đọc (HTTP 503) khi xảy ra tấn công diện rộng."*

---

### TRỤ CỘT 5: RECOVER (Phục Hồi Dữ Liệu & Vận Hành)

#### 1. Trên Slide ghi gì:
* **Khôi phục xóa mềm (Soft Delete):** Đánh dấu `is_deleted = true`, khôi phục nguyên trạng 1 chạm từ Thùng rác (`TrashRestoreTable`).
* **Sao lưu cơ sở dữ liệu (Backup MySQL):** Xuất bản dump toàn bộ dữ liệu MySQL nén Gzip (`.sql.gz`) tải thẳng về máy tính quản trị viên.

#### 2. Web ReadLN đã làm gì để thỏa mãn:
* **Cơ chế Xóa Mềm (`Soft Delete`):** Mọi thao tác xóa truyện, chương, hoặc bình luận đều không dùng lệnh `DELETE` cứng mà chỉ cập nhật cờ `is_deleted = true`. Tại giao diện `TrashRestoreTable`, Admin có thể xem danh sách và bấm nút **"Khôi phục"** (`is_deleted = false`) để đưa dữ liệu trở lại website ngay lập tức.
* **Dịch vụ Sao Lưu MySQL Thật (`BackupService.ts` & `BackupTriggerCard.tsx`):**
  * Backend quét toàn bộ dữ liệu thực tế từ 9 bảng trong MySQL, xuất thành mã SQL hoàn chỉnh (`REPLACE INTO`, có cấu hình `SET FOREIGN_KEY_CHECKS = 0; SET NAMES utf8mb4;`).
  * Tự động nén luồng dữ liệu bằng chuẩn **Gzip** (`.sql.gz`) và truyền trực tiếp về trình duyệt để quản trị viên tải file sao lưu nguyên vẹn về máy tính chỉ bằng một cú nhấp chuột.

#### 3. Lời trình bày thuyết minh:
> *"Cuối cùng ở trụ cột **Recover**, ReadLN áp dụng chính sách Xóa mềm (Soft Delete) trên toàn bộ hệ thống giúp khôi phục dữ liệu tức thì từ Thùng rác nếu bị xóa nhầm. Đặc biệt, hệ thống tích hợp tính năng **Sao lưu cơ sở dữ liệu MySQL thật**: tự động kết xuất toàn bộ dữ liệu ra file SQL nén Gzip (.sql.gz) và cho phép quản trị viên tải thẳng về máy tính để sẵn sàng phục hồi nguyên trạng hệ thống khi xảy ra sự cố."*

---

## 🎯 BẢNG TỔNG KẾT ĐỐI CHIẾU 5 TIÊU CHÍ NIST CSF 1.1 VỚI HỆ THỐNG READLN

| Tiêu chuẩn NIST CSF 1.1 | Chức năng & Thành phần trên Web ReadLN | Tệp tin / Endpoint tương ứng trong Source Code |
| :--- | :--- | :--- |
| **1. IDENTIFY** | Quét lỗ hổng bằng OWASP ZAP; Bổ sung các HTTP Security Headers (`X-Frame-Options`, `X-Content-Type-Options`, `CSP`). | `vite.config.ts`, `index.html` |
| **2. PROTECT** | Mã hóa RAM Base64 UTF-8; Chống sao chép (khóa chuột phải, `Ctrl+C`, `Ctrl+U`, `F12`); Thủy vân Zero-Width; Băm Bcrypt + HttpOnly Cookie. | `cryptoService.ts`, `AntiCopyWrapper.tsx`, `watermarkService.ts`, `authController.ts` |
| **3. DETECT** | Bẫy Bot Honeypot; Giám sát tần suất Rate Limit; Phát hiện dò mật khẩu (`AUTH_FAILED`); Audit Logs & Watermark Decoder. | `antiBotMiddleware.ts`, `rateLimiter.ts`, `auditLogger.ts`, `WatermarkDecoder.tsx` |
| **4. RESPOND** | **Tự động phản ứng từ Detect**: Honeypot ➔ Tự động chặn IP; Chặn IP truy cập nhiều (Spam Rate Limit); Nút khẩn cấp Kill-Switch (Chỉ đọc). | `autoResponseService.ts`, `antiBotMiddleware.ts`, `rateLimiter.ts`, `lockdownMiddleware.ts` |
| **5. RECOVER** | Khôi phục xóa mềm (`is_deleted = false`) qua Thùng rác; Sao lưu cơ sở dữ liệu MySQL (kết xuất file `.sql.gz` tải về máy). | `TrashRestoreTable.tsx`, `backupService.ts`, `BackupTriggerCard.tsx` |

---

## 💡 CÁCH TRẢ LỜI CÂU HỎI HỘI ĐỒNG THƯỜNG GẶP

1. **Hỏi: "Thầy yêu cầu phần RESPOND phải là tự động và dựa vào DETECT, em đã làm được chưa và hoạt động ra sao?"**  
   * **Trả lời:** *"Dạ thưa thầy, phần RESPOND của em hoạt động **hoàn toàn tự động dựa trên tín hiệu từ DETECT** thông qua `AutoResponseService`:  
     - Khi DETECT phát hiện bot điền bẫy Honeypot ➔ RESPOND lập tức tự động đưa IP vào Blacklist khóa 24h và trả mã 403.  
     - Khi DETECT phát hiện một IP spam vượt ngưỡng Rate Limit liên tiếp ➔ RESPOND tự động nâng mức phạt lên chặn IP 1 giờ trong Blacklist.  
     - Khi DETECT phát hiện một IP dò mật khẩu sai từ 5 lần trở lên ➔ RESPOND tự động khóa IP đó 2 giờ.  
     Tất cả đều diễn ra tự động trong mili-giây mà không cần Admin phải trực can thiệp thủ công."*

2. **Hỏi: "Chức năng Sao lưu (Backup) ở phần RECOVER hoạt động như thế nào?"**  
   * **Trả lời:** *"Dạ, ở phần RECOVER, em xây dựng dịch vụ `BackupService` kết nối trực tiếp vào MySQL để đọc toàn bộ cấu trúc và dữ liệu của tất cả các bảng, sinh ra file SQL chuẩn utf8mb4, nén nhị phân bằng Gzip (`.sql.gz`) và truyền trực tiếp về trình duyệt để quản trị viên tải về máy tính lưu trữ an toàn."*
