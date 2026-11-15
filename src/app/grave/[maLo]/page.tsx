import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateVN } from "@/lib/vietnamese";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Navigation,
  Building2,
  QrCode as QrIcon,
  Share2,
  Download,
  Info
} from "lucide-react";
import QRCode from "qrcode";

interface Props {
  params: {
    maLo: string;
  };
}

export default async function GraveDetailPage({ params }: Props) {
  const maLoDecoded = decodeURIComponent(params.maLo);

  const grave = await prisma.graveRecord.findFirst({
    where: {
      maLo: maLoDecoded,
      isArchived: false,
    },
    select: {
      id: true,
      stt: true,
      maLo: true,
      trangThai: true,
      nguoiDuocCap: true,
      ngaySinh: true,
      ngayMat: true,
      // Bảo mật tuyệt đối: Không truy vấn CCCD, SĐT, Người liên hệ, Quyết định cấp đất!
    },
  });

  if (!grave) {
    notFound();
  }

  // Tạo URL dẫn thẳng đến trang chi tiết mộ này
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nghiatrangtrada.vn";
  const graveDetailUrl = `${baseUrl}/grave/${encodeURIComponent(grave.maLo)}`;

  // Sinh mã QR riêng cho phần mộ này
  let qrCodeDataUrl = "";
  try {
    qrCodeDataUrl = await QRCode.toDataURL(graveDetailUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#1E3A8A",
        light: "#FFFFFF",
      },
    });
  } catch (e) {
    console.error("Lỗi sinh QR mộ:", e);
  }

  // Tọa độ chỉ đường tới Nghĩa trang Trà Đa (TP. Pleiku, Gia Lai)
  const cemeteryName = "Nghĩa trang Trà Đa, Xã Biển Hồ, TP. Pleiku, Gia Lai";
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    cemeteryName
  )}`;

  const getStatusBadge = (status: string) => {
    if (status === "Mai táng") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
          Đã Mai táng
        </span>
      );
    }
    if (status === "Mộ chờ") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
          Mộ chờ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
        Lô Trống
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 bg-white hover:bg-blue-50/50 px-3 py-1.5 rounded-xl border border-slate-200 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Quay lại trang tìm kiếm</span>
        </Link>
      </div>

      {/* Main Memorial Card - Thiết kế phong cách Trang Trọng & Tôn Kính */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Card Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
                HỒ SƠ MỘ PHẦN SỐ HÓA
              </span>
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-medium">
                {grave.trangThai === "Mai táng" ? "Đã Tiếp Nhận An Táng" : "Đăng Ký Mộ Chờ"}
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {grave.nguoiDuocCap}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 flex items-center space-x-2">
                <span>Nghĩa trang Trà Đa (TP. Pleiku)</span>
                <span>•</span>
                <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-white">
                  {grave.maLo}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Status & Vital Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center text-xs font-semibold text-slate-400 space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>NĂM SINH / NGÀY SINH</span>
              </div>
              <p className="text-lg font-bold text-slate-800">
                {formatDateVN(grave.ngaySinh)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center text-xs font-semibold text-slate-400 space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>NĂM MẤT / NGÀY MẤT</span>
              </div>
              <p className="text-lg font-bold text-slate-800">
                {grave.trangThai === "Mộ chờ" ? (
                  <span className="text-amber-700 font-medium text-base">Chưa mất (Hồ sơ mộ chờ)</span>
                ) : (
                  formatDateVN(grave.ngayMat)
                )}
              </p>
            </div>
          </div>

          {/* Location Details Box */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Vị trí phân khu an táng</span>
              </div>
              <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                Mã lô: {grave.maLo}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Phần mộ thuộc <strong>Khu A7</strong>, Nghĩa trang Trà Đa. Khi quý thân nhân tới cổng chính, vui lòng đọc <strong>Mã lô {grave.maLo}</strong> cho cán bộ quản trang để được hỗ trợ hướng dẫn trực tiếp đến vị trí phần mộ.
            </p>
          </div>

          {/* Individual QR Code for this Grave */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-6">
            {qrCodeDataUrl && (
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex-shrink-0 text-center">
                <img
                  src={qrCodeDataUrl}
                  alt={`Mã QR ${grave.maLo}`}
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-xl mx-auto"
                />
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  {grave.maLo}
                </span>
              </div>
            )}

            <div className="space-y-3 text-center sm:text-left flex-1">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700">
                  <QrIcon className="w-4 h-4" />
                  <span>MÃ QR ĐỊNH DANH PHẦN MỘ NÀY</span>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-slate-800">
                  Lưu hoặc Chia sẻ cho Gia đình, Dòng họ
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Con cháu hoặc người thân ở xa có thể quét mã QR này bằng Camera hoặc Zalo để mở ngay hồ sơ và nhận chỉ dẫn đường tới nghĩa trang.
                </p>
              </div>

              {qrCodeDataUrl && (
                <a
                  href={qrCodeDataUrl}
                  download={`Ma_QR_${grave.maLo}.png`}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Tải ảnh mã QR này về máy</span>
                </a>
              )}
            </div>
          </div>

          {/* Map & Directions Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Bản đồ & Dẫn đường tới Nghĩa trang Trà Đa</span>
              </h3>
            </div>

            {/* Embedded Google Map */}
            <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
              <iframe
                title="Bản đồ Nghĩa trang Trà Đa"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=Ngh%C4%A9a+trang+Tr%C3%A0+%C4%90a,+X%C3%A3+Bi%E1%BB%83n+H%E1%BB%93,+Th%C3%A0nh+ph%E1%BB%91+Pleiku,+Gia+Lai&t=&z=15&ie=UTF8&iwloc=&output=embed"
              />
            </div>

            {/* Big Action Button */}
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-[0.99]"
            >
              <Navigation className="w-4 h-4" />
              <span>MỞ GOOGLE MAPS DẪN ĐƯỜNG ĐẾN NGHĨA TRANG TRÀ ĐA</span>
            </a>
          </div>
        </div>
      </div>

      {/* Support Contact Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Ban Quản lý Nghĩa trang TP. Pleiku — UBND xã Biển Hồ</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Mọi thắc mắc cần giải đáp về hồ sơ, quy trình cấp đất an táng hoặc hỗ trợ dẫn đường tại thực địa, quý thân nhân vui lòng liên hệ bộ phận một cửa tại UBND xã Biển Hồ hoặc cán bộ quản trang trực tại cổng nghĩa trang.
        </p>
      </div>
    </div>
  );
}
