import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nghĩa trang Trà Đa - TP. Pleiku | Cổng Tra cứu Mộ phần Trực tuyến",
  description: "Hệ thống số hóa và tra cứu hồ sơ mộ phần Nghĩa trang TP. Pleiku (Nghĩa trang Trà Đa), UBND xã Biển Hồ, tỉnh Gia Lai.",
  keywords: ["nghĩa trang trà đa", "nghiatrangtrada", "nghĩa trang pleiku", "biển hồ", "tra cứu mộ phần gia lai"],
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
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-slate-50 to-blue-50/20 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
        {/* Top Announcement Bar */}
        <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 text-center border-b border-slate-800 tracking-wide font-medium flex items-center justify-center space-x-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Hệ Thống Dữ Liệu Số Hóa Chính Thức — Xã Biển Hồ, Tỉnh Gia Lai</span>
        </div>

        {/* Navigation / Header - Gradient Xanh Dương Sang Trọng */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md border-b border-blue-500/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <a href="/" className="flex items-center space-x-3.5 group">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl shadow-inner group-hover:scale-105 transition-all duration-200">
                🏛️
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-none">
                    NGHĨA TRANG TRÀ ĐA
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold tracking-wider text-blue-100 uppercase">
                    Gia Lai
                  </span>
                </div>
                <p className="text-xs text-blue-100/90 font-normal">
                  Cổng Tra Cứu Thông Tin Mộ Phần Trực Tuyến
                </p>
              </div>
            </a>

            {/* Right Badge */}
            <div className="flex items-center space-x-2">
              <div className="text-xs text-blue-50 font-medium hidden sm:flex items-center space-x-2 bg-white/15 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Dữ Liệu Đang Hoạt Động</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-100 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <span>🏛️ Ban Quản lý dịch vụ công Quy Nhơn - Sở Xây dựng tỉnh Gia Lai</span>
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  Đơn vị chịu trách nhiệm quy hoạch, quản lý quỹ đất an táng và hỗ trợ thân nhân thăm viếng theo quy định.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">📍 Địa chỉ & Liên hệ</h4>
                <p className="text-slate-500 leading-relaxed">
                  <strong>Vị trí nghĩa trang:</strong> Xã Biển Hồ, TP. Pleiku, tỉnh Gia Lai<br />
                  <strong>Cơ quan tiếp nhận hồ sơ:</strong> Ban Quản lý dịch vụ công Quy Nhơn
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">🕒 Giờ làm việc</h4>
                <p className="text-slate-500 leading-relaxed">
                  24/7 Bộ phận quản trang thường trực tất cả các ngày trong tuần.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-2 gap-2">
              <p>© 2026 Hệ thống Quản lý Nghĩa trang Trà Đa (nghiatrangtrada.vn)</p>
              <p className="flex items-center space-x-3">
                <span>Phiên bản v2.0 (Supabase Cloud)</span>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
