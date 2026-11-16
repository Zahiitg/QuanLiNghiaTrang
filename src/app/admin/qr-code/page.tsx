"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Printer,
  QrCode as QrIcon,
  CheckCircle2,
  Globe,
  Wifi,
  AlertCircle,
  ExternalLink,
  Edit3
} from "lucide-react";
import QRCode from "qrcode";

export default function AdminQrCodePage() {
  // Mặc định lấy từ URL môi trường hoặc URL hiện tại của trình duyệt
  const [targetUrl, setTargetUrl] = useState("http://192.168.1.75:3000");
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    // Nếu đang chạy trên trình duyệt, có thể lấy origin
    if (typeof window !== "undefined") {
      const currentHost = window.location.origin;
      // Nếu không phải localhost thì ưu tiên host thật (như link Vercel)
      if (!currentHost.includes("localhost")) {
        setTargetUrl(currentHost);
      }
    }
  }, []);

  // Tái tạo mã QR mỗi khi targetUrl thay đổi
  useEffect(() => {
    if (!targetUrl) return;
    QRCode.toDataURL(targetUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: "#1E3A8A",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [targetUrl]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="print:hidden">
        <Link
          href="/admin"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Quay lại trang Quản trị</span>
        </Link>
      </div>

      {/* Cấu hình đường link tạo QR (Ẩn khi in ấn) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Cấu Hình Đường Link Cho Mã QR
            </h3>
          </div>
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
            QR Tự Động Cập Nhật
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Đường link trang web khi quét mã QR:
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              placeholder="https://..."
            />
          </div>

          {/* Chọn nhanh mẫu URL */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-500 font-medium">Bấm để đổi nhanh mục đích:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTargetUrl("http://192.168.1.75:3000")}
                className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition ${
                  targetUrl.includes("192.168.1.75")
                    ? "bg-blue-600 text-white border-blue-600 font-bold shadow-2xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Thử nghiệm điện thoại (Cùng mạng Wi-Fi: 192.168.1.75:3000)</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetUrl("https://nghiatrangtrada.vn")}
                className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition ${
                  targetUrl === "https://nghiatrangtrada.vn"
                    ? "bg-blue-600 text-white border-blue-600 font-bold shadow-2xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Tên miền chính thức (nghiatrangtrada.vn)</span>
              </button>
            </div>
          </div>

          {/* Cảnh báo giải thích nguyên nhân */}
          {targetUrl === "https://nghiatrangtrada.vn" && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Lưu ý:</strong> Tên miền <code>nghiatrangtrada.vn</code> hiện tại chưa được kích hoạt trên Internet nên điện thoại quét sẽ báo lỗi. Để quét thử nghiệm bằng điện thoại ngay bây giờ, bạn hãy chọn nút <strong>"Thử nghiệm điện thoại (192.168.1.75:3000)"</strong> ở trên!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Khung Biển Bảng In Ấn A4 (Chuẩn UBND & BQL) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 text-center print:border-none print:shadow-none print:p-0">
        {/* Tiêu đề in ấn */}
        <div className="space-y-2 border-b border-slate-100 pb-6 print:border-none">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold print:hidden">
            <QrIcon className="w-3.5 h-3.5" />
            <span>MÃ QR TRA CỨU CÔNG CỘNG CHÍNH THỨC</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 uppercase tracking-tight">
            BAN QUẢN LÝ DỊCH VỤ CÔNG QUY NHƠN — SỞ XÂY DỰNG TỈNH GIA LAI
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-700 uppercase tracking-tight">
            NGHĨA TRANG TRÀ ĐA
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Dùng Camera điện thoại hoặc Zalo quét mã QR để tra cứu sơ đồ vị trí mộ phần và nhận chỉ dẫn đường tới nghĩa trang
          </p>
        </div>

        {/* Khung Chứa Mã QR */}
        <div className="p-6 bg-slate-50/80 rounded-3xl border-2 border-dashed border-blue-200 inline-block mx-auto shadow-inner">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Mã QR tra cứu Nghĩa trang Trà Đa"
              className="w-64 h-64 sm:w-80 sm:h-80 mx-auto rounded-2xl shadow-md bg-white p-3"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-xs text-slate-400">
              Đang tạo mã QR độ phân giải cao...
            </div>
          )}

          <div className="mt-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">Đường dẫn liên kết:</span>
            <p className="font-mono text-xs sm:text-sm text-blue-800 font-bold tracking-wide break-all">
              {targetUrl}
            </p>
          </div>
        </div>

        {/* Hướng dẫn dán biển bảng */}
        <div className="max-w-md mx-auto text-xs text-slate-500 space-y-1 text-left bg-blue-50/60 p-4 rounded-2xl border border-blue-100 print:hidden">
          <p className="font-bold text-slate-800">Quy cách dán biển bảng:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>In khổ giấy A4 hoặc A3 ép plastic hoặc in mica chống nước ngoài trời.</li>
            <li>Đặt tại: Cổng chào chính, Bảng tin BQL và các ngã rẽ vào từng Khu (A1 - A8).</li>
            <li>Thân nhân có thể dùng ứng dụng Camera hoặc Zalo để quét trực tiếp.</li>
          </ul>
        </div>

        {/* Các nút tải ảnh và in */}
        <div className="flex flex-wrap items-center justify-center gap-3 print:hidden pt-2">
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download="Ma_QR_Nghia_Trang_Tra_Da.png"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-[0.99]"
            >
              <Download className="w-4 h-4" />
              <span>Tải File Ảnh (.PNG) Nét Cao</span>
            </a>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In Biển Bảng Ngay (Khổ A4)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
