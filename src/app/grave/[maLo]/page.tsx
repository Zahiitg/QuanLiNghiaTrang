import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { formatDateVN } from "@/lib/vietnamese";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Navigation,
  Building2,
  QrCode as QrIcon,
  Download,
  Share2,
  Layers,
  Compass,
  ShieldCheck,
  PhoneCall
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
      // Tuyệt đối bảo mật: Ẩn CCCD, SĐT, Người liên hệ, Quyết định cấp đất
    },
  });

  if (!grave) {
    notFound();
  }

  const headersList = headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") || host.includes("192.168.") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const graveDetailUrl = `${baseUrl}/grave/${encodeURIComponent(grave.maLo)}`;

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
    console.error("Lỗi sinh QR:", e);
  }

  const cemeteryName = "Nghĩa trang Trà Đa, Xã Biển Hồ, Tỉnh Gia Lai";
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    cemeteryName
  )}`;

  const matchLo = grave.maLo.match(/MTA(\d+)/i);
  const loName = matchLo ? `Lô MT.A${matchLo[1]}` : "Lô MT.A7";

  const getStatusBadge = (status: string) => {
    if (status === "Mai táng") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-600 mr-2"></span>
          Đã Mai táng
        </span>
      );
    }
    if (status === "Mộ chờ") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
          Mộ chờ (Sinh phần)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
        Lô đất trống
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Nút quay lại */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Quay lại trang tra cứu</span>
        </Link>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
          Mã định danh GIS: <strong>{grave.maLo}</strong>
        </span>
      </div>

      {/* CityWork / HueCIT Style: Bố cục 2 cột chuyên nghiệp */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (7 Cột): Hồ Sơ Số Điện Tử Mộ Phần */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header Hồ Sơ */}
          <div className="border-b border-slate-100 pb-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 font-mono">
                {grave.maLo}
              </span>
              {getStatusBadge(grave.trangThai)}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {grave.nguoiDuocCap}
              </h1>
              <p className="text-xs text-slate-500">
                Hồ sơ an táng đã số hóa • Nghĩa trang Trà Đa (Xã Biển Hồ, Gia Lai)
              </p>
            </div>
          </div>

          {/* Bảng Dữ Liệu Chi Tiết */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Ngày sinh / Năm sinh:</span>
              <p className="text-sm font-bold text-slate-800">{formatDateVN(grave.ngaySinh)}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Ngày mất / Năm mất:</span>
              <p className="text-sm font-bold text-slate-800">
                {grave.trangThai === "Mộ chờ" ? (
                  <span className="text-amber-700 font-medium">Chưa mất (Hồ sơ mộ chờ)</span>
                ) : (
                  formatDateVN(grave.ngayMat)
                )}
              </p>
            </div>
          </div>

          {/* Vị Trí Địa Chính Phân Lô */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Vị trí trên sơ đồ quy hoạch:</span>
              </span>
              <span className="font-mono font-bold text-blue-700">{loName} · {grave.maLo}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Phần mộ nằm tại <strong>{loName}</strong> (thuộc phân bố quy hoạch 32 Lô: MT.A1 – A32), Nghĩa trang Trà Đa (Xã Biển Hồ, tỉnh Gia Lai). Khi đến nơi, quý thân nhân xuất trình Mã lô tại cổng để được cán bộ quản trang dẫn đường đến đúng vị trí.
            </p>
          </div>

          {/* Mã QR Định Danh Số (HueCIT Feature) */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
            {qrCodeDataUrl && (
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex-shrink-0 text-center">
                <img
                  src={qrCodeDataUrl}
                  alt={`Mã QR ${grave.maLo}`}
                  className="w-28 h-28 rounded-xl mx-auto"
                />
              </div>
            )}

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="inline-flex items-center space-x-1 text-xs font-bold text-blue-700">
                <QrIcon className="w-3.5 h-3.5" />
                <span>MÃ QR ĐỊNH DANH PHẦN MỘ</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Quét mã để mở trực tiếp hồ sơ này trên điện thoại hoặc chia sẻ cho người thân trong dòng họ qua Zalo/Facebook.
              </p>
              {qrCodeDataUrl && (
                <a
                  href={qrCodeDataUrl}
                  download={`Ma_QR_${grave.maLo}.png`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tải ảnh mã QR</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (5 Cột): Bản Đồ Số GIS & Chỉ Đường (CityWork Feature) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Bản Đồ Không Gian Nghĩa Trang</span>
              </h3>
              <span className="text-[11px] text-slate-400">Xã Biển Hồ, Gia Lai</span>
            </div>

            {/* Khung Bản Đồ */}
            <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
              <iframe
                title="Bản đồ vị trí Nghĩa trang Trà Đa"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=Ngh%C4%A9a+trang+Tr%C3%A0+%C4%90a,+X%C3%A3+Bi%E1%BB%83n+H%E1%BB%93,+Gia+Lai&t=&z=15&ie=UTF8&iwloc=&output=embed"
              />
            </div>

            {/* Nút Điều Hướng Lộ Trình Thông Minh */}
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.99]"
            >
              <Navigation className="w-4 h-4" />
              <span>CHỈ ĐƯỜNG ĐẾN NGHĨA TRANG TRÀ ĐA (MAPS)</span>
            </a>

            <div className="text-[11px] text-slate-500 text-center">
              Tọa độ trung tâm: <strong>14.020° N, 108.040° E</strong> (Xã Biển Hồ)
            </div>
          </div>

          {/* Hộp Thông Tin Hỗ Trợ Tiếp Đón */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-800 font-bold">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Ban Quản lý dịch vụ công Quy Nhơn (Nghĩa trang Trà Đa)</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Cơ quan tiếp nhận hồ sơ: Ban Quản lý dịch vụ công Quy Nhơn. Nếu cần hỗ trợ khẩn cấp tại hiện trường, vui lòng gặp trực tiếp cán bộ thường trực tại cổng nghĩa trang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
