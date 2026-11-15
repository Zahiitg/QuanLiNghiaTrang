import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nghĩa trang Trà Đa - TP. Pleiku | Cổng Tra cứu Mộ phần Trực tuyến",
  description: "Hệ thống quản lý và tra cứu hồ sơ mộ phần Nghĩa trang TP. Pleiku (Nghĩa trang Trà Đa), UBND xã Biển Hồ, tỉnh Gia Lai.",
  keywords: ["nghĩa trang trà đa", "nghiatrangtrada", "nghĩa trang pleiku", "biển hồ", "tra cứu mộ phần"],
  authors: [{ name: "UBND xã Biển Hồ - TP. Pleiku" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
        {/* Navigation / Header - Màu xanh dương trang nhã */}
        <header className="sticky top-0 z-40 bg-pastel-blue-600 text-white shadow-sm border-b border-pastel-blue-700/40">
          <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <a href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-lg shadow-inner group-hover:bg-white/30 transition">
                🏛️
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
                  NGHĨA TRANG TRÀ ĐA
                </h1>
                <p className="text-xs text-pastel-blue-100">UBND xã Biển Hồ • TP. Pleiku</p>
              </div>
            </a>

            {/* Phía bên phải: Hiển thị nhãn cổng thông tin chính thức, đã loại bỏ nút cán bộ */}
            <div className="text-xs text-pastel-blue-100/90 font-medium hidden sm:flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Cổng Tra Cứu Trực Tuyến</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-5xl mx-auto px-4 space-y-2">
            <p className="font-medium text-slate-700">
              Ban Quản lý Nghĩa trang TP. Pleiku — UBND xã Biển Hồ
            </p>
            <p>Địa chỉ: Xã Biển Hồ, TP. Pleiku, tỉnh Gia Lai • Hotline hỗ trợ: (0269) 3.xxx.xxx</p>
            <p className="text-slate-400">© 2026 nghiatrangtrada.vn. Phiên bản hệ thống 2.0</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
