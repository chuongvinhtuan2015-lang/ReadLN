# Skill Spec: Hướng Dẫn Thiết Kế Giao Diện Web Đọc Truyện "Warm Paper Minimalist"

## 1. TỔNG QUAN PHONG CÁCH (DESIGN PHILOSOPHY)
* **Tên phong cách:** Warm Paper Minimalist (Cổ điển tối giản - Màu giấy ấm).
* **Mục tiêu:** Tạo trải nghiệm đọc truyện dịu mắt, tập trung vào nội dung văn bản, loại bỏ hoàn toàn hiệu ứng bóng đổ phức tạp (box-shadow) hay hiệu ứng màu sặc sỡ modern app.
* **Đặc trưng cốt lõi:**
  * Thẩm mỹ dạng sách giấy / báo chí cổ điển.
  * Đường kẻ phân cách mảnh 1px (`border`).
  * Góc bo cực nhỏ (`rounded-[2px]`), các nút phẳng (flat button).
  * Sử dụng bìa chữ Monogram tự động (Text Cover) thay vì hình ảnh quảng cáo lộn xộn.

---

## 2. BẢNG MÀU CHUẨN (DESIGN TOKENS)

Khi thiết kế hoặc viết code, BẮT BUỘC tuân thủ đúng bảng màu Hex sau:

```javascript
const PALETTE = {
  bg: '#F6F4EF',          // Màu nền toàn trang (Giấy ngà ấm dịu mắt)
  surface: '#EFECE6',     // Màu nền card / container phụ
  surfaceHover: '#E7E3DC',// Màu hover card / container
  border: '#DFDCD4',      // Màu đường kẻ phân cách 1px
  text: '#1F2421',        // Màu chữ chính (Đen than/Chì dịu)
  textMuted: '#5C635E',   // Màu chữ phụ (Xám tro/Slate)
  accent: '#2D5A4C',      // Màu nhấn chủ đạo (Xanh rêu trầm / Forest Green)
  accentHover: '#23473C', // Màu nhấn khi hover
  secondaryBtn: '#E6E2D8',// Nút bấm phụ
  tagBg: '#EAE6DD',       // Nút/Thẻ Tag thể loại
};
```

### Bảng màu Bìa chữ Monogram (Cover Themes):
Dùng cho component Bìa chữ tự động:
* **Forest Green:** BG `#2D5A4C`, Border `#7BA395`
* **Slate Blue:** BG `#3B4A54`, Border `#8A9DA9`
* **Deep Mocha:** BG `#4A3F35`, Border `#9E8D7F`
* **Burgundy:** BG `#5C3A3A`, Border `#BA8888`
* **Dark Jade:** BG `#334842`, Border `#7AA396`

---

## 3. QUY CHUẨN TYPOGRAPHY & SPACING

* **Font Family:** Ưu tiên font Sans-Serif hiện đại, nét đứng, rõ ràng (`Open Sans`, `Inter`, system sans-serif). TUYỆT ĐỐI KHÔNG dùng font Serif kiểu bay bướm mỏi mắt.
* **Cỡ chữ chuẩn:**
  * Body chung: `16px`, `line-height: 1.6` đến `1.7`.
  * Văn bản đọc truyện: `19px` (cho phép tùy chỉnh từ `15px` đến `25px`), `line-height: 1.85`, khoảng cách đoạn `indent-6`.
* **Border Radius:** Đồng bộ `rounded-[2px]` cho toàn bộ hệ thống (Button, Input, Card, Tag). Không dùng `rounded-lg` hay `rounded-full` ngoại trừ nút icon rất nhỏ.
* **Đường viền (Border):** Sử dụng `border border-[#DFDCD4]` để bao quanh các phần tử nội dung thay vì dùng `box-shadow`.

---

## 4. CÁC COMPONENT CỐT LÕI (CORE COMPONENTS)

### 4.1. Component Bìa Chữ Monogram (Text Cover)
Thay vì load hình ảnh thật, tạo khối bìa hình chữ nhật chuẩn tỉ lệ cuốn sách ($1:1.45$):
* **Cấu trúc:** Khung màu tối theo bảng màu Cover Themes. Viền trong mảnh ($1\text{px}$) có `opacity-40`.
* **Nội dung:** 
  * Header/Footer nhỏ chữ in hoa: `READLN / NOVEL`.
  * Chữ viết tắt Monogram to chính giữa (Lấy 2 chữ cái đầu của tiêu đề tác phẩm).
  * Tiêu đề & Tác giả in nhỏ ở chân bìa.
* **Size:** `sm` ($64\times 96\text{px}$), `md` ($144\times 208\text{px}$), `lg` ($192\times 288\text{px}$).

### 4.2. Dải Chỉ Số 4 Cột (4-Column Metric Stats Bar)
Xuất hiện ở Block Tiêu Điểm và Trang Chi Tiết:
* Khung chia làm 4 phần bằng nhau bằng viền dọc `border-r border-[#DFDCD4]`.
* Mỗi phần gồm 2 dòng:
  * Dòng 1 (Nhãn): Chữ nhỏ `12px`, màu `#5C635E` (Ví dụ: "Lần cuối", "Số từ", "Đánh giá", "Lượt xem").
  * Dòng 2 (Giá trị): Chữ in đậm `font-bold`, màu `#1F2421` (Ví dụ: "462,516", "4.75 / 40").

### 4.3. Nút Bấm Phẳng (Flat Button System)
* **Primary Button:** Nền `#2D5A4C`, chữ `#F6F4EF`, hover `#23473C`. Không viền, không bóng đổ.
* **Secondary Button:** Nền `#E6E2D8`, chữ `#1F2421`, hover `#DFDCD4`.
* **Tag Button:** Nền `#EAE6DD`, chữ `#4A504C`, hover `#DFDCD4`, size `12px`.

---

## 5. BỐ TRÍ MÀN HÌNH (LAYOUT SPECIFICATIONS)

### 5.1. Header / Navigation Bar
* Sticky top, chiều cao `h-16`, viền dưới `border-b border-[#DFDCD4]`, nền `#F6F4EF`.
* Bên trái: Logo ô vuông `#2D5A4C` chữ "R" trắng + Tiêu đề "ReadLN" & Tagline.
* Giữa: Menu điều hướng đơn giản.
* Bên phải: Input tìm kiếm (Nền `#EFECE6`, không viền, focus viền `#2D5A4C`) + Nút "Tủ truyện" kèm badge số lượng.

### 5.2. Trang Chủ (Home View)
* Container chính: `max-w-5xl mx-auto px-4`.
* **Hero Block (Tiêu Điểm):** Card lớn nền `#EFECE6`, viền `#DFDCD4`.
  * Trái: Bìa Monogram size `lg`.
  * Phải: Tiêu đề lớn (`text-2xl sm:text-3xl`), dải tag thể loại, thông tin tác giả, cặp nút Action (Đọc tiếp / Lưu tủ), và Dải Chỉ Số 4 Cột.
  * Đáy card: Đoạn tóm tắt ngắn 2 dòng (`line-clamp-2`).
* **Danh sách "Mới cập nhật":** Thanh lọc danh mục nằm ngang + Danh sách dòng phân cách bằng viền ngang `divide-y divide-[#DFDCD4]`. Mỗi dòng chứa bìa size `sm`, tiêu đề, mô tả ngắn 1 dòng, tên chương mới và thời gian.

### 5.3. Trang Chi Tiết Tác Phẩm (Detail View)
* Header thông tin chi tiết (Bìa `lg` + Thông tin tác giả/dịch giả + Nút thao tác + Dải Chỉ Số 4 Cột + Khung tóm tắt định dạng rõ ràng).
* **Mục Lục Chương:** Card riêng biệt liệt kê các chương với số từ và ngày đăng, hover đổi màu nền `#EAE6DD`.
* **Khung Bàn Luận:** Form nhập bình luận phẳng + Danh sách comment với tên user in đậm và thời gian đăng.

### 5.4. Trang Đọc Chương (Reader View)
* Container hẹp: `max-w-3xl mx-auto`.
* **Thanh điều khiển đọc:** Nút về mục lục + Bộ tăng giảm cỡ chữ (A- / A+) hiển thị số `px` trực tiếp.
* **Khung nội dung văn bản:**
  * Nền nhạt `#EFECE6/50`, viền `#DFDCD4`, padding lớn (`p-6 sm:p-8`).
  * Font Sans-serif, cỡ chữ động (`19px` chuẩn), khoảng cách dòng `line-height: 1.85`.
  * Tích hợp cơ chế chống copy / bảo vệ bản quyền (Chặn Right Click, thêm Unicode ẩn zero-width).
* Footer điều hướng chương trước/sau.

---

## 6. QUY TẮC THỰC THI CHO AI (SYSTEM PROMPT DIRECTIVE)

Khi AI nhận yêu cầu tạo mới hoặc sửa đổi UI này:
1. **LUÔN NÓI KHÔNG VỚI:** `shadow-md`, `shadow-lg`, font Serif (như Times New Roman/Georgia cho phần đọc văn bản), màu sắc quá rực (Bright Red, Neon Blue), bo góc tròn lớn (`rounded-xl`, `rounded-full`).
2. **LUÔN NÓI CÓ VỚI:** `border border-[#DFDCD4]`, `bg-[#F6F4EF]`, `bg-[#EFECE6]`, `rounded-[2px]`, font Sans-Serif sạch sẽ, Bìa chữ Monogram tối giản.
3. **TRẢI NGHIỆM ĐỌC:** Ưu tiên tương phản vừa phải (chữ đen chì `#1F2421` trên nền giấy `#F6F4EF`) để người dùng không mỏi mắt khi đọc lâu.