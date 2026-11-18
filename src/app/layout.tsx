import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nghĩa trang Trà Đa - Xã Biển Hồ, Gia Lai | Cổng Tra cứu Mộ phần Trực tuyến",
  description: "Hệ thống số hóa và tra cứu hồ sơ mộ phần Nghĩa trang Trà Đa, xã Biển Hồ, tỉnh Gia Lai.",
  keywords: ["nghĩa trang trà đa", "nghiatrangtrada", "nghĩa trang biển hồ gia lai", "biển hồ", "tra cứu mộ phần gia lai"],
  authors: [{ name: "Ban Quản lý dịch vụ công Quy Nhơn - Sở Xây dựng tỉnh Gia Lai" }],
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
        {/* Navigation / Header */}
        <header className="sticky top-0 z-40 overflow-hidden shadow-lg">
          {/* Dải trang trí trên cùng */}
          <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400" />
          {/* Thân header */}
          <div
            className="relative"
            style={{
              background: "linear-gradient(135deg, #1a3fa8 0%, #2e56e1 45%, #1e4bd8 100%)",
            }}
          >
            {/* Hoa văn trang trí nền */}
            <div className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 50%, #fff 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-2.5 sm:py-3 flex items-center">
              <a href="/" className="flex items-center space-x-3.5 group">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center text-xl sm:text-2xl shadow-md group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                  🏛️
                </div>
                {/* Text */}
                <div>
                  <h1 className="text-base sm:text-lg lg:text-xl font-black tracking-wide text-white uppercase leading-tight drop-shadow-sm">
                    Nghĩa Trang Trà Đa – Gia Lai
                  </h1>
                  <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-yellow-300/90 uppercase mt-0.5">
                    Cổng tra cứu thông tin mộ phần trực tuyến
                  </p>
                </div>
              </a>
            </div>
          </div>
          {/* Dải trang trí dưới cùng */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full bg-slate-50/50">{children}</main>

        {/* Footer - Đồng bộ màu xanh dương thương hiệu #2e56e1 */}
        <footer className="bg-[#2e56e1] border-t border-blue-400/30 text-blue-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-white/15 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                  <span>🏛️ Ban Quản lý dịch vụ công Quy Nhơn - Sở Xây dựng tỉnh Gia Lai</span>
                </h4>
                <p className="text-blue-100/90 leading-relaxed">
                  Đơn vị chịu trách nhiệm quy hoạch, quản lý quỹ đất an táng và hỗ trợ thân nhân thăm viếng theo quy định.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">📍 Địa chỉ & Liên hệ</h4>
                <p className="text-blue-100/90 leading-relaxed">
                  <strong className="text-white">Vị trí nghĩa trang:</strong> Xã Biển Hồ, tỉnh Gia Lai<br />
                  <strong className="text-white">Cơ quan tiếp nhận hồ sơ:</strong> Ban Quản lý dịch vụ công Quy Nhơn
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">🕒 Giờ làm việc</h4>
                <p className="text-blue-100/90 leading-relaxed">
                  24/7 Bộ phận quản trang thường trực tất cả các ngày trong tuần.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center text-center text-xs text-blue-200/90 pt-2">
              <p>© 2026 Hệ thống Quản lý Nghĩa trang Trà Đa (quanlynghiatrang.vercel.app)</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
