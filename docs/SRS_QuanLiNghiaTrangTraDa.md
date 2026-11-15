# SRS — Hệ thống Quản lý Nghĩa trang Trà Đa
**Software Requirements Specification (SRS)**
**Phiên bản:** 2.0 (Complete Specification)
**Ngày:** 16/11/2026
**Dự án:** Web App Quản lý Nghĩa trang TP. Pleiku (Nghĩa trang Trà Đa)
**Người lập:** Business Analyst
**Khách hàng:** Ban quản lý Nghĩa trang TP. Pleiku / UBND xã Biển Hồ

| Phiên bản | Ngày | Thay đổi |
| :--- | :--- | :--- |
| v1.0 | 15/11/2026 | Phiên bản khởi tạo |
| v1.1 | 15/11/2026 | Chuẩn hóa 1 mộ — 1 người liên hệ duy nhất |
| v1.2 | 15/11/2026 | Xác nhận Tech Stack chính thức; cập nhật cấu trúc 9 Khu (A1–A9); phân tích file Excel thực tế `CẤP ĐẤT NGHĨA TRANG 2026.xlsx`; thêm cột Dân tộc / Quyết định cấp đất; bỏ tọa độ GPS từng mộ; cập nhật mô hình Maps; xác nhận In-house IT; xác nhận domain `nghiatrangtrada.vn` |
| v2.0 | 16/11/2026 | **Hoàn chỉnh SRS:** Giải quyết 100% Open Issues (A8, A1–A6, mô hình self-coded); Bổ sung chuẩn Thiết kế Giao diện UI/UX (Trắng & Xanh dương pastel, phong cách trang nhã, tối giản, thanh tịnh) |

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mục tiêu
Xây dựng một Web Application (Responsive — hoạt động tốt trên máy tính lẫn điện thoại di động) nhằm **số hóa toàn bộ công tác quản lý hồ sơ mộ phần** tại Nghĩa trang Trà Đa, đồng thời cung cấp **cổng tra cứu công khai** cho thân nhân người đã khuất.

### 1.2 Thông tin nghĩa trang

| Thuộc tính | Thông tin |
| :--- | :--- |
| **Tên thông dụng** | Nghĩa trang Trà Đa |
| **Tên hành chính** | Nghĩa trang thành phố Pleiku |
| **Địa điểm** | Xã Biển Hồ, TP. Pleiku, tỉnh Gia Lai |
| **Đơn vị quản lý** | UBND xã Biển Hồ (tiếp nhận, giải quyết thủ tục) |
| **Cơ quan chủ quản** | UBND TP. Pleiku / Sở Xây dựng tỉnh Gia Lai |
| **Diện tích** | ~12,57 ha (đang sử dụng); quy hoạch ~15 ha |
| **Loại hình** | Nghĩa trang đô thị công cộng tập trung |
| **Cơ cấu phân cấp** | Khu → Mã lô |
| **Tổng số khu** | 9 khu (A1 → A9), mỗi khu ~2 ha |
| **Tình trạng vận hành** | 8 khu đã đưa vào sử dụng (A1–A6, A7, A8); dữ liệu số hóa hiện tại từ **Khu A7 & A8** |
| **Tên miền website** | [nghiatrangtrada.vn](https://nghiatrangtrada.vn) |
| **Vận hành CNTT** | In-house IT (nhân sự CNTT nội bộ của đơn vị quản lý) |

### 1.3 Phạm vi hệ thống (Scope)

**IN SCOPE (Phiên bản 1.0):**
- Quản lý hồ sơ mộ phần (CRUD: Thêm / Sửa / Xóa / Xem)
- Tra cứu mộ công khai (tìm kiếm theo tên, mã lô)
- Nhúng bản đồ Google Maps hiển thị khu vực nghĩa trang (không cần GPS từng mộ)
- Tích hợp mã QR chung tại cổng nghĩa trang → Tra cứu
- Import dữ liệu từ file Excel (theo chuẩn cột của `CẤP ĐẤT NGHĨA TRANG 2026.xlsx`)
- Phân quyền 2 nhóm người dùng: Admin & Khách hàng/Thân nhân
- Xuất báo cáo danh sách mộ

**OUT OF SCOPE (Không thuộc phiên bản 1.0):**
- Thanh toán online / thu phí dịch vụ
- Trang tưởng niệm ảo (Virtual Memorial)
- Bản đồ 2D tương tác (sơ đồ lô mộ dạng sơ đồ rạp)
- App di động riêng (Android/iOS)
- Quản lý nhân sự / phân công công việc nội bộ
- **Tọa độ GPS từng mộ** *(loại bỏ — thay bằng Google Maps embed cấp độ nghĩa trang)*

---

## 2. NGƯỜI DÙNG & PHÂN QUYỀN

### 2.1 Các nhóm người dùng (User Roles)

| Role | Mô tả | Cần đăng nhập? |
| :--- | :--- | :---: |
| **Admin** (Quản trị viên) | Cán bộ BQL nghĩa trang, có toàn quyền quản lý hồ sơ | ✅ Có |
| **Thân nhân / Công chúng** | Người dân, thân nhân người đã khuất | ❌ Không |

### 2.2 Ma trận quyền hạn

| Chức năng | Admin | Thân nhân |
| :--- | :---: | :---: |
| Xem thông tin mộ (tóm tắt) | ✅ | ✅ |
| Tìm kiếm mộ theo tên / mã | ✅ | ✅ |
| Xem chỉ đường GPS đến mộ | ✅ | ✅ || Xem đầy đủ hồ sơ chi tiết (CCCD...) | ✅ | ❌ |
| Thêm mới hồ sơ mộ | ✅ | ❌ |
| Chỉnh sửa hồ sơ mộ | ✅ | ❌ |
| Xóa / Vô hiệu hóa hồ sơ mộ | ✅ | ❌ |
| Import dữ liệu từ Excel | ✅ | ❌ |
| Xuất báo cáo / Export Excel | ✅ | ❌ |
| Quản lý tài khoản Admin | ✅ | ❌ |
| Quản lý mã QR | ✅ | ❌ |

> [!IMPORTANT]
> Thông tin nhạy cảm như **CCCD của người đã khuất** và **số điện thoại thân nhân** chỉ hiển thị cho Admin. Giao diện tra cứu công khai của Thân nhân chỉ hiển thị: Họ tên, Ngày sinh, Ngày mất, Ngày an táng, Vị trí mộ (Mã lô).

---

## 3. CẤU TRÚC DỮ LIỆU (Data Model)

### 3.1 Cấu trúc phân cấp Nghĩa trang

```
Nghĩa trang Trà Đa (~12,57 ha — 9 khu, mỗi khu ~2 ha)
├── Khu A1  (đã sử dụng — dữ liệu cũ, nhập sau)
├── Khu A2  (đã sử dụng — dữ liệu cũ, nhập sau)
├── Khu A3  (đã sử dụng — dữ liệu cũ, nhập sau)
├── Khu A4  (đã sử dụng — dữ liệu cũ, nhập sau)
├── Khu A5  (đã sử dụng — dữ liệu cũ, nhập sau)
├── Khu A6  (đã sử dụng — dữ liệu cũ, nhập sau)
├── Khu A7  ✅ Dữ liệu có sẵn — 185 lô (MTA7-572 → MTA7-756)
│           ├── 121 lô Mai táng
│           └── 60 lô Mộ chờ
├── Khu A8  ✅ Dữ liệu có sẵn (theo file Lo MT A7 đc.pdf)
└── Khu A9  (chưa đưa vào sử dụng)
```

> [!NOTE]
> **Quy ước Mã lô (Mã mộ):** Hệ thống sử dụng nguyên mã lô có sẵn theo thực tế nghiệp vụ.
> - Khu A7: `MTA7-xxx` (ví dụ: `MTA7-572`, `MTA7-756`)
> - Khu A8: Quy ước tương tự (cần xác nhận prefix khi nhập liệu khu A8)
> - Các khu cũ (A1–A6): Giữ nguyên mã lô hiện hành khi import dữ liệu lịch sử

### 3.2 Bảng dữ liệu chính: `Hồ sơ Mộ` (grave_records)

> [!NOTE]
> Cấu trúc bảng được thiết kế **khớp 1:1 với file Excel** `CẤP ĐẤT NGHĨA TRANG 2026.xlsx` đang sử dụng thực tế, giúp việc import/export không phát sinh lỗi ánh xạ cột.

#### A. Thông tin Vị trí & Trạng thái

| Trường DB | Cột Excel tương ứng | Kiểu dữ liệu | Bắt buộc | Ghi chú |
| :--- | :--- | :--- | :---: | :--- |
| `stt` | STT | INTEGER | ✅ | Số thứ tự, tự tăng |
| `ma_lo` | Mã lô | VARCHAR(20) | ✅ | Mã định danh duy nhất. Ví dụ: `MTA7-572` |
| `trang_thai` | Trạng Thái | ENUM | ✅ | `Mai táng` / `Mộ chờ` / `Trống` |

#### B. Thông tin Người được cấp đất (Người đã khuất)

| Trường DB | Cột Excel tương ứng | Kiểu dữ liệu | Bắt buộc | Ghi chú |
| :--- | :--- | :--- | :---: | :--- |
| `nguoi_duoc_cap` | Người được cấp | NVARCHAR(100) | ✅ | Họ và tên người đã khuất / người được cấp mộ chờ |
| `cccd` | CCCD | VARCHAR(20) | ☐ | Căn cước công dân (từ hồ sơ gốc / giấy khai tử) |
| `dan_toc` | Dân tộc | VARCHAR(30) | ☐ | Ví dụ: `Kinh`, `Gia Rai` |
| `quoc_tich` | Quốc tịch | VARCHAR(30) | ☐ | Mặc định: `Việt Nam` |
| `ngay_sinh` | Ngày sinh | DATE | ☐ | Lưu dạng ngày đầy đủ; hiển thị định dạng dd/MM/yyyy |
| `ngay_mat` | Ngày mất | DATE | ☐ | Để trống nếu là Mộ chờ |
| `quyet_dinh_cap_dat` | Quyết định/Giấy giới thiệu | TEXT | ☐ | Số trích lục khai tử, đơn xin cấp mộ chờ... |
| `ghi_chu` | Ghi chú | TEXT | ☐ | Ghi chú bổ sung |

#### C. Thông tin Người liên hệ *(1 mộ — 1 người liên hệ duy nhất)*

| Trường DB | Cột Excel tương ứng | Kiểu dữ liệu | Bắt buộc | Ghi chú |
| :--- | :--- | :--- | :---: | :--- |
| `nguoi_lien_he` | Người liên hệ | NVARCHAR(100) | ✅ *(khi Mai táng)* | Họ và tên thân nhân đại diện |
| `so_dien_thoai` | SĐT | VARCHAR(15) | ✅ *(khi Mai táng)* | Số điện thoại liên hệ chính |
| `dia_chi` | Địa chỉ | NVARCHAR(200) | ☐ | Địa chỉ của người liên hệ |

> [!NOTE]
> Từ phân tích file Excel thực tế: **8/185 bản ghi thiếu số điện thoại** (chủ yếu ở hồ sơ cũ). Hệ thống cho phép để trống SĐT khi nhập liệu nhưng sẽ hiển thị cảnh báo màu vàng để Admin biết và bổ sung sau.

### 3.3 Sơ đồ quan hệ bảng (ERD tóm tắt)

```
grave_records (Bảng duy nhất — Flat Structure)
─────────────────────────────────────────────────────
 PK  id                 SERIAL
     ma_lo              VARCHAR(20) UNIQUE NOT NULL     ← Mã lô (MTA7-572...)
     trang_thai         ENUM('Mai táng','Mộ chờ','Trống')
     nguoi_duoc_cap     NVARCHAR(100)
     cccd               VARCHAR(20)
     dan_toc            VARCHAR(30)
     quoc_tich          VARCHAR(30)
     ngay_sinh          DATE
     ngay_mat           DATE
     quyet_dinh_cap_dat TEXT
     nguoi_lien_he      NVARCHAR(100)
     so_dien_thoai      VARCHAR(15)
     dia_chi            NVARCHAR(200)
     ghi_chu            TEXT
     created_at         TIMESTAMPTZ DEFAULT NOW()
     updated_at         TIMESTAMPTZ DEFAULT NOW()
     is_archived        BOOLEAN DEFAULT FALSE            ← Soft delete
─────────────────────────────────────────────────────
INDEX: ma_lo, trang_thai, nguoi_duoc_cap (pg_trgm), nguoi_lien_he
```

---

## 4. YÊU CẦU CHỨC NĂNG (Functional Requirements)

### 4.1 Module Quản trị (Admin)

#### UC-01: Đăng nhập / Đăng xuất
- **Mô tả:** Admin đăng nhập bằng tên đăng nhập + mật khẩu.
- **Luồng chính:**
  1. Admin truy cập `/admin/login`
  2. Nhập username + password
  3. Hệ thống xác thực → Chuyển đến Dashboard
- **Luồng thay thế:** Sai mật khẩu → Hiển thị lỗi, cho thử lại tối đa 5 lần → Khóa tài khoản 15 phút
- **Tiêu chí chấp nhận:** Phiên đăng nhập hết hạn sau 8 giờ không hoạt động

#### UC-02: Dashboard Tổng quan
- **Mô tả:** Màn hình chính sau khi đăng nhập, hiển thị thống kê nhanh.
- **Thông tin hiển thị:**
  - Tổng số mộ / Mộ đang trống / Mộ chờ / Đã mai táng
  - Số hồ sơ được thêm mới trong tháng
  - Shortcuts (Thêm hồ sơ nhanh, Tra cứu nhanh)

#### UC-03: Danh sách Hồ sơ Mộ
- **Mô tả:** Xem toàn bộ danh sách mộ dạng bảng biểu có thể lọc và tìm kiếm.
- **Chức năng:**
  - Hiển thị bảng dữ liệu phân trang (mặc định 50 dòng/trang)
  - **Tìm kiếm** theo: Họ tên, Mã mộ, Số CCCD, Tên thân nhân, Số điện thoại
  - **Lọc** theo: Khu, Lô, Hàng, Trạng thái mộ
  - **Sắp xếp** theo: Mã mộ, Ngày an táng, Họ tên
  - **Xuất Excel** toàn bộ hoặc theo bộ lọc hiện tại

#### UC-04: Thêm mới Hồ sơ Mộ
- **Mô tả:** Admin tạo mới một hồ sơ mộ phần.
- **Luồng chính:**
  1. Nhập Mã lô (ví dụ: `MTA7-757`) — hệ thống kiểm tra trùng lặp ngay lập tức
  2. Chọn Trạng thái: `Trống` / `Mộ chờ` / `Mai táng`
  3. Nhập thông tin người được cấp đất (Họ tên, CCCD, Dân tộc, Quốc tịch, Ngày sinh, Ngày mất, Quyết định cấp đất)
  4. Nhập thông tin Người liên hệ (Họ tên, Số điện thoại, Địa chỉ)
  5. Nhập Ghi chú nếu có
  6. Nhấn Lưu → Hệ thống xác nhận thành công
- **Validation:**
  - Mã lô phải duy nhất (không trùng lặp) — kiểm tra real-time khi nhập
  - Nếu trạng thái = `Mai táng`, trường `Người được cấp` là bắt buộc
  - Nếu thiếu Số điện thoại → hiển thị cảnh báo màu vàng (không chặn lưu)

#### UC-05: Chỉnh sửa Hồ sơ Mộ
- **Mô tả:** Admin cập nhật thông tin đã lưu.
- **Lưu ý:** Mã mộ (`ma_mo`) không được phép chỉnh sửa sau khi tạo.
- Hệ thống lưu lại **lịch sử chỉnh sửa** (audit log): ai sửa, sửa trường nào, thời gian.

#### UC-06: Xóa / Lưu trữ Hồ sơ Mộ
- **Mô tả:** Không xóa cứng (hard delete). Hồ sơ được đánh dấu `Đã lưu trữ` (soft delete), vẫn còn trong database để tra cứu lịch sử nhưng không hiển thị ở danh sách chính.
- **Phân quyền:** Chỉ Super Admin mới được thực hiện thao tác này.

#### UC-07: Import dữ liệu từ Excel
- **Mô tả:** Admin upload file Excel để nhập hàng loạt hồ sơ từ dữ liệu cũ.
- **Chuẩn file:** Hệ thống hỗ trợ trực tiếp cấu trúc file `CẤP ĐẤT NGHĨA TRANG 2026.xlsx` đang sử dụng thực tế, với các cột:
  `STT | Mã lô | Người được cấp | CCCD | Dân tộc | Quốc tịch | Ngày sinh | Ngày mất | Người liên hệ | SĐT | Địa chỉ | Quyết định/Giấy giới thiệu | Trạng Thái | Ghi chú`
- **Luồng chính:**
  1. Hệ thống cung cấp file **Template Excel mẫu** (cùng cấu trúc cột nêu trên) để tải về
  2. Admin upload file lên hệ thống
  3. Hệ thống **preview** danh sách dữ liệu sẽ được import (kèm cảnh báo nếu có dòng lỗi / thiếu SĐT)
  4. Admin xác nhận → Hệ thống import và báo cáo kết quả: X dòng thành công / Y dòng lỗi (kèm chi tiết lỗi)
- **Xử lý ngày tháng:** Tự động nhận dạng định dạng ngày dạng số Excel (serial date) và chuyển đổi sang ngày thực tế
- **Định dạng hỗ trợ:** `.xlsx`, `.xls`, `.csv`
- **Giới hạn:** Tối đa 5.000 dòng mỗi lần upload

#### UC-08: Quản lý mã QR
- **Mô tả:** Admin tạo và tải về **1 mã QR chung** cho cả nghĩa trang, trỏ về trang tra cứu công khai.
- Mã QR có thể được in ra, dán tại cổng ra vào hoặc bảng thông tin của nghĩa trang.
- Admin có thể tạo lại mã QR nếu cần (URL không đổi, chỉ tải về file hình ảnh mới).

---

### 4.2 Module Tra cứu Công khai (Thân nhân / Công chúng)

#### UC-09: Trang chủ Tra cứu
- **Mô tả:** Trang web công khai, không cần đăng nhập.
- **Nội dung:**
  - Tên và logo Nghĩa trang Trà Đa
  - Ô tìm kiếm nổi bật: *"Nhập họ tên hoặc mã mộ người thân..."*
  - Thông tin liên hệ BQL nghĩa trang

#### UC-10: Tìm kiếm Mộ phần
- **Mô tả:** Người dùng tra cứu mộ theo tên hoặc mã mộ.
- **Luồng chính:**
  1. Người dùng quét mã QR tại nghĩa trang → Mở trang web tra cứu
  2. Nhập từ khóa (Họ tên hoặc Mã mộ) → Nhấn Tìm kiếm
  3. Hệ thống hiển thị danh sách kết quả phù hợp
  4. Người dùng chọn một kết quả → Xem trang chi tiết
- **Tiêu chí tìm kiếm:** Tìm kiếm không phân biệt dấu/không dấu, tìm gần đúng (fuzzy search cho họ tên)
- **Giao diện kết quả:** Hiển thị: Họ tên, Năm sinh – Năm mất, Mã mộ, Vị trí (Khu/Lô/Hàng)

#### UC-11: Xem Chi tiết Mộ & Chỉ hướng bằng Maps
- **Mô tả:** Trang chi tiết mộ hiển thị cho thân nhân.
- **Thông tin hiển thị (công khai):**
  - Họ và tên người được cấp đất
  - Ngày sinh — Ngày mất
  - Mã lô (ví dụ: `MTA7-572`)
  - Trạng thái mộ
- **Thông tin ẨN khỏi giao diện công khai:**
  - CCCD, Số điện thoại thân nhân, Địa chỉ, Quyết định cấp đất
- **Tích hợp Google Maps (cấp độ Nghĩa trang — không cần GPS từng mộ):**
  - Hiển thị **bản đồ nhúng (Google Maps Embed)** khoanh vùng toàn khu Nghĩa trang Trà Đa
  - Nút **"Dẫn đường đến Nghĩa trang"** → Mở Google Maps / Apple Maps với điểm đến là địa chỉ Nghĩa trang Trà Đa
  - Sau khi đến nơi, thân nhân dùng thông tin `Mã lô` để hỏi nhân viên hoặc tra bảng sơ đồ tại cổng

> [!NOTE]
> **Lý do bỏ GPS từng mộ:** Việc đo GPS chính xác từng mộ trong nghĩa trang đòi hỏi khảo sát thực địa tốn kém và không thực tế ở giai đoạn đầu. Giải pháp Google Maps cấp độ nghĩa trang đáp ứng đủ nhu cầu giúp thân nhân tìm đến đúng địa điểm nghĩa trang.

---

## 5. YÊU CẦU PHI CHỨC NĂNG (Non-Functional Requirements)

### 5.1 Hiệu năng (Performance)
- Trang tra cứu công khai tải dưới **3 giây** trên kết nối 4G thông thường
- Tìm kiếm trả kết quả dưới **1 giây** với dataset lên đến 50.000 hồ sơ
- Import 5.000 dòng Excel hoàn thành trong vòng **60 giây**

### 5.2 Khả năng tương thích (Compatibility)
- **Responsive Design:** Hoạt động tốt trên màn hình máy tính (≥1024px), tablet (768px), và điện thoại (≥360px)
- **Trình duyệt hỗ trợ:** Chrome, Firefox, Safari, Edge (phiên bản mới nhất và -1)
- **Hệ điều hành di động:** Android 8+, iOS 13+

### 5.3 Bảo mật (Security)
- Mật khẩu Admin được mã hóa bcrypt (không lưu plaintext)
- Toàn bộ kết nối qua **HTTPS (TLS 1.2+)**
- Thông tin CCCD và số điện thoại **chỉ hiển thị cho Admin** đã xác thực
- Phiên đăng nhập hết hạn sau 8 giờ không hoạt động (idle timeout)
- Rate limiting cho API tra cứu công khai: tối đa 60 request/phút/IP

### 5.4 Khả năng mở rộng (Scalability)
- Hệ thống thiết kế đủ sức quản lý tối thiểu **100.000 hồ sơ mộ**
- Kiến trúc module hóa, dễ bổ sung tính năng trong các phiên bản sau (thanh toán, bản đồ 2D, app mobile...)

### 5.5 Khả dụng (Availability)
- Uptime mục tiêu: **99,5%** (downtime tối đa ~44 giờ/năm)
- Backup dữ liệu tự động hàng ngày

### 5.6 Ngôn ngữ
- Ngôn ngữ giao diện: **Tiếng Việt** (toàn bộ)

### 5.7 Tiêu chuẩn Thiết kế Giao diện (UI/UX Design Standards)
- **Phong cách tổng thể:** Tối giản (Minimalism), sạch sẽ, thông thoáng, không rườm rà hay rối mắt. Đặc thù website nghĩa trang phục vụ nhu cầu tâm linh, tưởng nhớ nên giao diện cần toát lên vẻ **trang nhã, tôn nghiêm, nhẹ nhàng và thanh tịnh**.
- **Bảng màu chủ đạo (Color Palette):**
  - **Màu nền (Background):** Trắng tinh khiết (`#FFFFFF`) kết hợp trắng xám nhạt (`#F8FAFC`) cho các card/khối thông tin, tạo chiều sâu dịu mắt.
  - **Màu chủ đạo (Primary Accent):** **Xanh dương pastel (Soft Pastel Blue)** (`#7BA4D5` / `#93C5FD`) — mang lại cảm giác an yên, hòa bình và thư thái, giảm bớt sự nặng nề tâm lý.
  - **Màu chữ (Typography Color):** Xám than đậm (`#1E293B`) cho tiêu đề và xám chì (`#475569`) cho nội dung thường. Tránh dùng màu đen tuyền `#000000` để giữ độ êm dịu cho thị giác.
  - **Màu trạng thái (Badge colors - Pastel tone):**
    - `Mai táng`: Xanh đá dịu (`#E0E7FF` nền / `#3730A3` chữ) hoặc Xám lam thanh lịch.
    - `Mộ chờ`: Vàng kem pastel (`#FEF3C7` nền / `#92400E` chữ).
    - `Trống`: Xanh ngọc pastel (`#D1FAE5` nền / `#065F46` chữ).
- **Trải nghiệm người dùng (UX):**
  - Cỡ chữ to, rõ ràng, dễ đọc cho người lớn tuổi (Base font size ≥ 16px).
  - Khoảng cách giữa các phần tử (padding, margin) rộng rãi, không dồn nén chữ.
  - Nút bấm to bản, bo góc nhẹ (border-radius: 8px - 12px), dễ chạm bằng ngón tay trên màn hình điện thoại.

---

## 6. CÔNG NGHỆ SỬ DỤNG (Confirmed Tech Stack)

> [!IMPORTANT]
> Tech Stack đã được khách hàng xác nhận chính thức. Đây là các lựa chọn **bắt buộc** áp dụng cho dự án.

| Thành phần | Công nghệ đã chọn | Lý do / Ghi chú |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (React)** | Responsive, SEO tốt cho trang tra cứu công khai; hỗ trợ SSR giúp trang tải nhanh trên điện thoại 4G |
| **Backend** | **Node.js (Express)** | Đồng bộ ngôn ngữ JS với Frontend; hệ sinh thái npm phong phú (xlsx, qrcode...) |
| **Database** | **Supabase (Cloud PostgreSQL)** | Thay thế PostgreSQL tự cài đặt: Quản trị trực quan dạng bảng như Excel, sao lưu tự động hàng ngày, hỗ trợ sẵn PostGIS và kho lưu ảnh bia mộ |
| **Maps** | **Google Maps JavaScript API** | Nhúng bản đồ khu nghĩa trang; nút Dẫn đường mở Google Maps / Apple Maps |
| **QR Code** | **qrcode (npm)** | Sinh QR trỏ về `https://nghiatrangtrada.vn` — in ra dán tại cổng nghĩa trang |
| **Import/Export Excel** | **SheetJS (xlsx)** | Đọc/ghi trực tiếp file `CẤP ĐẤT NGHĨA TRANG 2026.xlsx` |
| **Authentication** | **JWT + bcrypt** | Phiên đăng nhập stateless, mật khẩu mã hóa an toàn |
| **Hosting** | **VPS tại Việt Nam** *(Viettel IDC / FPT Cloud)* | Dữ liệu lưu trữ trong nước; latency thấp; phù hợp quy định ATTT nhà nước |
| **Tên miền** | **nghiatrangtrada.vn** | Tên miền chính thức cần đăng ký và gia hạn hàng năm |
| **Vận hành CNTT** | **In-house IT** | Nhân sự CNTT nội bộ của đơn vị quản lý chịu trách nhiệm vận hành, bảo trì server |

---

## 7. QUY TRÌNH NGHIỆP VỤ (Business Process)

### 7.1 Quy trình Tiếp nhận & Nhập hồ sơ Mai táng mới

```
Thân nhân nộp hồ sơ giấy tại UBND xã Biển Hồ
        ↓
Cán bộ tiếp nhận hồ sơ, kiểm tra giấy tờ hợp lệ
(Trích lục khai tử / Đơn xin cấp mộ chờ / Giấy giới thiệu)
        ↓
Cán bộ đăng nhập hệ thống → Thêm mới Hồ sơ Mộ
        ↓
Nhập Mã lô tiếp theo (ví dụ MTA7-757) và chọn Trạng thái
        ↓
Nhập thông tin người được cấp đất + người liên hệ
        ↓
Lưu hồ sơ → Hệ thống xác nhận thành công
        ↓
Thân nhân có thể tra cứu trực tuyến ngay lập tức tại nghiatrangtrada.vn
```

### 7.2 Quy trình Thân nhân Tra cứu Mộ tại Nghĩa trang

```
Thân nhân đến nghĩa trang, nhìn thấy biển QR tại cổng
        ↓
Quét mã QR bằng điện thoại
        ↓
Trình duyệt mở trang web nghiatrangtrada.vn
        ↓
Nhập tên người đã khuất → Tìm kiếm
        ↓
Chọn đúng hồ sơ trong danh sách kết quả
        ↓
Xem thông tin chi tiết + Mã lô
        ↓
Nhấn "Dẫn đường đến Nghĩa trang" → Google Maps mở ra
        ↓
Đến nơi → Dùng Mã lô hỏi nhân viên hoặc tra bảng sơ đồ tại cổng
```

---

## 8. GIAO DIỆN GỢI Ý (UI Wireframe Concepts)

### 8.1 Trang Tra cứu Công khai (Mobile-first)
```
┌─────────────────────────────┐
│  🏛️ NGHĨA TRANG TRÀ ĐA      │
│  nghiatrangtrada.vn          │
├─────────────────────────────┤
│                             │
│  🔍 Nhập họ tên hoặc mã lô  │
│  [________________________] │
│         [TÌM KIẾM]          │
│                             │
├─────────────────────────────┤
│  Kết quả tìm kiếm:          │
│  ┌─────────────────────┐    │
│  │ Nguyễn Văn An       │    │
│  │ 1945 - 2023         │    │
│  │ Mã lô: MTA7-572     │    │
│  │          [XEM CHI TIẾT]  │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### 8.2 Trang Chi tiết Mộ (Mobile)
```
┌─────────────────────────────┐
│  ← Quay lại                 │
├─────────────────────────────┤
│  NGUYỄN VĂN AN              │
│  Sinh: 15/03/1945           │
│  Mất: 20/08/2023            │
│  Mã lô: MTA7-572            │
│  Trạng thái: Mai táng       │
├─────────────────────────────┤
│  [🗺️ Bản đồ Google Maps     │
│      khu vực Nghĩa trang]   │
│                             │
│  [📍 DẪN ĐƯỜNG ĐẾN          │
│      NGHĨA TRANG TRÀ ĐA]   │
├─────────────────────────────┤
│  📞 Liên hệ BQL:            │
│  UBND xã Biển Hồ, TP.Pleiku │
└─────────────────────────────┘
```

---

## 9. LỘ TRÌNH TRIỂN KHAI (In-House Development Roadmap)

> Dự án được phát triển theo mô hình **Tự lập trình nội bộ (In-house Self-Coded)**, tận dụng hoàn toàn các công nghệ mã nguồn mở (Next.js, Node.js Express, PostgreSQL), không phát sinh chi phí bản quyền phần mềm thuê ngoài. Chi phí duy nhất là phí duy trì tên miền `nghiatrangtrada.vn` và máy chủ lưu trữ (VPS).

| Giai đoạn | Nội dung công việc | Kết quả đầu ra |
| :--- | :--- | :--- |
| **Phase 1A** | - Khởi tạo dự án Next.js (Frontend), Node.js Express (Backend), PostgreSQL<br>- Thiết kế bảng `grave_records` khớp 1:1 với file Excel thực tế<br>- Xây dựng trang Admin: Đăng nhập, Bảng danh sách mộ, CRUD hồ sơ<br>- Tính năng **Import dữ liệu Excel hàng loạt** (xử lý trực tiếp file `CẤP ĐẤT NGHĨA TRANG 2026.xlsx`) | Module Quản trị hoàn thiện, import thành công 185 lô Khu A7 |
| **Phase 1B** | - Xây dựng Trang tra cứu công khai (Desktop & Mobile) theo tone màu **Trắng & Xanh dương pastel**<br>- Tích hợp tìm kiếm tên tiếng Việt thông minh (không phân biệt dấu/hoa/thường)<br>- Nhúng Google Maps khu vực Nghĩa trang Trà Đa và nút Dẫn đường<br>- Tạo file mã QR chung cho cổng nghĩa trang | Trang tra cứu công chúng sẵn sàng phục vụ người dân |
| **Phase 1C** | - Kiểm thử nội bộ (UAT), rà soát bảo mật dữ liệu nhạy cảm (ẩn CCCD, SĐT)<br>- Triển khai lên VPS và trỏ tên miền chính thức `nghiatrangtrada.vn`<br>- Bàn giao tài khoản và hướng dẫn cán bộ sử dụng | Hệ thống Go-Live chính thức |
| **Phase 2** | - Tiếp nhận dữ liệu chuẩn hóa của **Khu A8** và **Khu A1–A6** (file Excel)<br>- Tiến hành import bổ sung qua giao diện Admin mà không cần sửa code | Số hóa toàn diện toàn bộ 8 khu mộ đã sử dụng |

---

## 10. TỔNG KẾT TRẠNG THÁI YÊU CẦU (Requirement Sign-Off)

> [!NOTE]
> Toàn bộ các vấn đề và câu hỏi nghiệp vụ đã được khách hàng làm rõ và chốt phương án 100%. Tài liệu SRS này là căn cứ chính thức để tiến hành lập trình và xây dựng cơ sở dữ liệu.

| # | Hạng mục | Phương án đã chốt chính thức |
| :---: | :--- | :--- |
| 1 | **Quy mô & Phân khu** | 9 khu (A1 → A9), mỗi khu ~2 ha. Hiện tại quản lý số hóa trước mắt cho Khu A7 (185 lô) và chuẩn bị nạp tiếp Khu A8. |
| 2 | **Cấu trúc dữ liệu** | Dùng Mã lô trực tiếp (`MTA7-xxx`, `MTA8-xxx`...). Bảng dữ liệu phẳng 14 cột tương thích 100% với file Excel thực tế. |
| 3 | **Người liên hệ** | Đúng 01 người liên hệ đại diện trên mỗi phần mộ. |
| 4 | **Bản đồ & Định vị** | Bỏ tọa độ GPS từng mộ. Dùng Google Maps nhúng cấp độ nghĩa trang + nút chỉ đường dẫn tới cổng Nghĩa trang Trà Đa. |
| 5 | **Mã QR** | 01 mã QR chung đặt tại cổng / bảng tin nghĩa trang trỏ về `nghiatrangtrada.vn`. |
| 6 | **Công nghệ** | Frontend: **Next.js (React)** \| Backend: **Node.js (Express/Next.js API)** \| Database: **Supabase (Cloud PostgreSQL)**. |
| 7 | **Thiết kế Giao diện** | Tối giản, trang nhã, không rối mắt. Tone màu chủ đạo: **Trắng & Xanh dương pastel**. |
| 8 | **Mô hình vận hành & Chi phí** | **In-house IT** tự code và tự vận hành nội bộ. Tên miền: `nghiatrangtrada.vn`. |
| 9 | **Dữ liệu các khu khác** | Khu A8 và Khu A1–A6 có định dạng cột tương tự file A7; sẽ được chuẩn hóa dữ liệu Excel và import dần qua tính năng Upload trên web sau khi hệ thống hoạt động. |

---

*SRS này đã hoàn thành giai đoạn Phân tích Yêu cầu (Requirement Elicitation) và sẵn sàng chuyển sang giai đoạn Thiết kế Kiến trúc & Lập trình (Design & Implementation).*
