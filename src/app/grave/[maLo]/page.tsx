import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateVN } from "@/lib/vietnamese";
import { ArrowLeft, MapPin, Calendar, Navigation, Building2, PhoneCall, CheckCircle2 } from "lucide-react";

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
      // Lưu ý: Tuyệt đối không select CCCD, sdt, địa chỉ thân nhân, quyết định cấp đất cho giao diện công khai!
    },
  });

  if (!grave) {
    notFound();
  }

  // Tọa độ khu vực Nghĩa trang Trà Đa, xã Biển Hồ, TP. Pleiku
  // Lat: ~14.020, Lng: ~108.040
  const cemeteryName = "Nghĩa trang Trà Đa, Xã Biển Hồ, TP. Pleiku, Gia Lai";
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    cemeteryName
  )}`;

  const getStatusBadge = (status: string) => {
    if (status === "Mai táng") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pastel-badge-maitangBg text-pastel-badge-maitangText border border-indigo-200">
          Đã Mai táng
        </span>
      );
    }
    if (status === "Mộ chờ") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pastel-badge-mochoBg text-pastel-badge-mochoText border border-amber-200">
          Mộ chờ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pastel-badge-trongBg text-pastel-badge-trongText border border-emerald-200">
        Trống
      </span>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-pastel-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Quay lại trang tìm kiếm</span>
        </Link>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header of card */}
        <div className="border-b border-slate-100 pb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              HỒ SƠ MỘ PHẦN
            </span>
            {getStatusBadge(grave.trangThai)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {grave.nguoiDuocCap}
          </h2>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <span className="font-mono bg-slate-100 px-2.5 py-0.5 rounded text-slate-700 font-semibold">
              {grave.maLo}
            </span>
            <span>•</span>
            <span>Nghĩa trang Trà Đa (TP. Pleiku)</span>
          </div>
        </div>

        {/* Vital statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center text-xs text-slate-400 space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Ngày sinh</span>
            </div>
            <p className="text-base font-semibold text-slate-800">
              {formatDateVN(grave.ngaySinh)}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center text-xs text-slate-400 space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Ngày mất</span>
            </div>
            <p className="text-base font-semibold text-slate-800">
              {grave.trangThai === "Mộ chờ" ? "Chưa mất (Mộ chờ)" : formatDateVN(grave.ngayMat)}
            </p>
          </div>
        </div>

        {/* Location Box */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-pastel-blue-600" />
            <span>Vị trí trên thực địa</span>
          </h3>
          <div className="p-4 bg-pastel-blue-50/60 rounded-xl border border-pastel-blue-100 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600">Mã định danh lô mộ:</span>
              <span className="font-mono text-base font-bold text-pastel-blue-900">{grave.maLo}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Theo quy hoạch nghĩa trang, phần mộ nằm tại khu vực tương ứng với mã lô trên. Thân nhân khi đến nghĩa trang vui lòng cung cấp mã này cho cán bộ thường trực để được hỗ trợ vị trí chính xác.
            </p>
          </div>
        </div>

        {/* Google Maps Embed & Navigation Button */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Bản đồ khu vực Nghĩa trang Trà Đa
          </h3>

          {/* Embedded Google Maps Container */}
          <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
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

          {/* Direct Navigation Button */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-pastel-blue-600 hover:bg-pastel-blue-700 text-white font-medium shadow-sm transition active:scale-[0.99]"
          >
            <Navigation className="w-4 h-4" />
            <span>DẪN ĐƯỜNG ĐẾN NGHĨA TRANG TRÀ ĐA (MAPS)</span>
          </a>
        </div>
      </div>

      {/* Support Contact Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs text-slate-600">
        <div className="flex items-center space-x-2 text-slate-800 font-semibold">
          <Building2 className="w-4 h-4 text-pastel-blue-600" />
          <span>Ban Quản lý Nghĩa trang TP. Pleiku (UBND xã Biển Hồ)</span>
        </div>
        <p className="leading-relaxed">
          Mọi thắc mắc về hồ sơ, quy trình cấp đất hoặc cần hỗ trợ dẫn đường tại thực địa, quý thân nhân vui lòng liên hệ phòng tiếp nhận hồ sơ tại UBND xã Biển Hồ hoặc cán bộ quản trang thường trực tại cổng nghĩa trang.
        </p>
      </div>
    </div>
  );
}
