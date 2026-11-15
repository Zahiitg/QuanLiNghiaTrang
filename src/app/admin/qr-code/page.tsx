"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Printer, QrCode as QrIcon, CheckCircle2 } from "lucide-react";
import QRCode from "qrcode";

export default function AdminQrCodePage() {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const targetUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nghiatrangtrada.vn";

  useEffect(() => {
    QRCode.toDataURL(targetUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: "#1A2B49",
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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="print:hidden">
        <Link
          href="/admin"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-pastel-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Quay lại trang Quản trị</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8 text-center">
        {/* Printable Section Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-pastel-blue-50 border border-pastel-blue-200 text-pastel-blue-700 rounded-full text-xs font-medium">
            <QrIcon className="w-3.5 h-3.5" />
            <span>MÃ QR TRA CỨU CÔNG CỘNG CHÍNH THỨC</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase">
            UBND THÀNH PHỐ PLEIKU — UBND XÃ BIỂN HỒ
          </h2>
          <h3 className="text-xl sm:text-2xl font-bold text-pastel-blue-700 uppercase">
            NGHĨA TRANG TRÀ ĐA
          </h3>
          <p className="text-xs text-slate-500">
            Quét mã QR bằng điện thoại để tra cứu vị trí mộ phần và nhận chỉ dẫn đường
          </p>
        </div>

        {/* The QR Code Container */}
        <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-pastel-blue-200 inline-block mx-auto shadow-inner">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Mã QR tra cứu Nghĩa trang Trà Đa"
              className="w-64 h-64 sm:w-80 sm:h-80 mx-auto rounded-xl shadow-sm bg-white p-2"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-xs text-slate-400">
              Đang tạo mã QR độ phân giải cao...
            </div>
          )}
          <p className="mt-3 font-mono text-xs text-slate-600 font-bold tracking-wide">
            {targetUrl}
          </p>
        </div>

        {/* Usage guidelines */}
        <div className="max-w-md mx-auto text-xs text-slate-500 space-y-1 text-left bg-pastel-blue-50/50 p-4 rounded-xl border border-pastel-blue-100">
          <p className="font-semibold text-slate-800">Quy cách dán biển bảng:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>In khổ giấy A4 hoặc A3 ép plastic hoặc in mica chống nước.</li>
            <li>Đặt tại: Cổng chào chính, Bảng tin BQL và các ngã rẽ vào từng Khu (A1 - A8).</li>
            <li>Thân nhân có thể dùng ứng dụng Camera hoặc Zalo để quét trực tiếp.</li>
          </ul>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="flex flex-wrap items-center justify-center gap-3 print:hidden pt-2">
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download="Ma_QR_Nghia_Trang_Tra_Da.png"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-pastel-blue-600 hover:bg-pastel-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Tải file ảnh chất lượng cao (.PNG)</span>
            </a>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In biển bảng ngay (Khổ A4)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
