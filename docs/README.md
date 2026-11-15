# Hệ thống Quản lý Nghĩa trang Trà Đa (TP. Pleiku - Gia Lai)

> **Cổng tra cứu hồ sơ mộ phần trực tuyến & Phân hệ quản lý nội bộ dành cho Ban Quản lý Nghĩa trang TP. Pleiku và UBND xã Biển Hồ.**  
> Phiên bản SRS áp dụng: **SRS v2.0 (16/11/2026)**  
> Tên miền chính thức: **nghiatrangtrada.vn**

---

## 1. Công nghệ Sử dụng (Tech Stack)

- **Frontend & Fullstack Framework:** Next.js 14+ (App Router, Server & Client Components)
- **Thiết kế & Giao diện:** Tailwind CSS với bộ nhận diện màu **Pastel Blue (Xanh dương pastel)** & **White (Trắng thanh tịnh)** theo chuẩn tâm linh, nhẹ nhàng, trang nhã.
- **Cơ sở dữ liệu:** PostgreSQL (môi trường sản xuất trên VPS) / SQLite (môi trường phát triển cục bộ `file:./dev.db`) qua **Prisma ORM**.
- **Bản đồ:** Tích hợp Google Maps Embed API và liên kết điều hướng trực tiếp Google Maps / Apple Maps.
- **Xử lý Excel:** SheetJS (`xlsx`) đọc/ghi khớp 100% định dạng file `CẤP ĐẤT NGHĨA TRANG 2026.xlsx`.
- **Mã QR:** Module `qrcode` sinh mã QR chính thức phục vụ in biển bảng đặt tại cổng nghĩa trang.

---

## 2. Cấu trúc Thư mục

```
Quanli_NghiaTrang/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Khung giao diện dùng chung (Header, Footer chuẩn)
│   │   ├── page.tsx                  # Cổng Tra cứu Công khai (Mobile-first cho thân nhân)
│   │   ├── grave/[maLo]/page.tsx     # Chi tiết Mộ phần & Chỉ đường Google Maps (ẩn CCCD, SĐT)
│   │   ├── admin/
│   │   │   ├── page.tsx              # Dashboard Quản trị & Bảng dữ liệu 14 cột
│   │   │   ├── login/page.tsx        # Trang đăng nhập cán bộ BQL
│   │   │   └── qr-code/page.tsx      # Quản lý & In ấn Mã QR cổng nghĩa trang
│   │   └── api/
│   │       ├── graves/route.ts       # API tìm kiếm công khai (Fuzzy search không dấu)
│   │       ├── admin/
│   │       │   ├── login/route.ts    # Xác thực phiên cán bộ
│   │       │   ├── graves/route.ts   # CRUD đầy đủ cho Admin
│   │       │   └── logout/route.ts   # Đăng xuất
│   │   └── globals.css
│   └── lib/
│       ├── prisma.ts                 # Prisma Client Singleton
│       └── vietnamese.ts             # Thuật toán tìm kiếm tiếng Việt không dấu
├── prisma/
│   └── schema.prisma                 # Cấu trúc bảng grave_records phẳng khớp Excel 1:1
├── scripts/
│   └── seed-excel.js                 # Script nạp tự động 185 hồ sơ Khu A7 từ Excel
├── docs/                             # Thư mục tài liệu dự án
│   ├── CẤP ĐẤT NGHĨA TRANG 2026.xlsx # File dữ liệu hồ sơ gốc Khu A7
│   ├── Lo MT A7 đc.pdf               # Bản vẽ / sơ đồ vị trí Lô A7
│   ├── SRS_QuanLiNghiaTrangTraDa.md  # Tài liệu đặc tả yêu cầu phiên bản 2.0
│   └── README.md                     # Hướng dẫn chi tiết dự án
└── package.json
```

---

## 3. Hướng dẫn Khởi chạy Hệ thống

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Đồng bộ cấu trúc Database
```bash
npx prisma db push
```

### Bước 3: Nạp 185 hồ sơ thực tế từ file Excel vào cơ sở dữ liệu
```bash
node scripts/seed-excel.js
```

### Bước 4: Khởi chạy máy chủ phát triển
```bash
npm run dev
```

Truy cập hệ thống:
- Cổng tra cứu thân nhân: `http://localhost:3000`
- Cổng quản trị cán bộ: `http://localhost:3000/admin` (Mặc định: `admin` / `admin123`)
- Tải & In mã QR: `http://localhost:3000/admin/qr-code`
