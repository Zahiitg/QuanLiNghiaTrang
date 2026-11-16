"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  X,
  Layers,
  LayoutGrid,
  Map as MapIcon,
  Compass,
  Navigation,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface GraveItem {
  id: number;
  stt: number | null;
  maLo: string;
  trangThai: string;
  nguoiDuocCap: string;
  ngaySinh: string | null;
  ngayMat: string | null;
}

const PAGE_SIZE = 20;

// ─── Cấu hình 32 Lô MT.A1–A32 ────────────────────────────────────────────────
// A1–A7: Đã sử dụng | A8: Đang sử dụng | A9–A32: Quy hoạch
type LotStatus = "used" | "active" | "planned";

interface LotTab {
  key: string;
  label: string;
  status: LotStatus | "all";
}

const LOT_TABS: LotTab[] = [
  { key: "ALL", label: "Tất cả", status: "all" },
  ...Array.from({ length: 7 }, (_, i) => ({
    key: `A${i + 1}`,
    label: `A${i + 1}`,
    status: "used" as LotStatus,
  })),
  { key: "A8", label: "A8", status: "active" },
  ...Array.from({ length: 24 }, (_, i) => ({
    key: `A${i + 9}`,
    label: `A${i + 9}`,
    status: "planned" as LotStatus,
  })),
];export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [viewMode, setViewMode] = useState<"LIST" | "MAP">("LIST");
  const [results, setResults] = useState<GraveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch dữ liệu ─────────────────────────────────────────────────────────
  const fetchGraves = async (query: string, status: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/graves?q=${encodeURIComponent(query)}&status=${status}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.graves || []);
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGraves(searchTerm, filterStatus);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  // Reset trang khi bộ lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, selectedZone]);

  // ── Lọc + sắp xếp (Mộ đã cấp mới nhất đến cũ trước, mộ trống sau cùng) ───
  const filteredResults = useMemo(() => {
    const zoneFiltered = results.filter((item) => {
      if (selectedZone === "ALL") return true;
      const lotNum = selectedZone.replace("A", "");
      return item.maLo.toLowerCase().startsWith(`mta${lotNum}`);
    });
    return [...zoneFiltered].sort((a, b) => {
      const aIsTrong = a.trangThai === "Trống";
      const bIsTrong = b.trangThai === "Trống";
      if (aIsTrong && !bIsTrong) return 1;
      if (!aIsTrong && bIsTrong) return -1;
      return (b.stt ?? 0) - (a.stt ?? 0);
    });
  }, [results, selectedZone]);

  // ── Phân trang ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const pagedResults = filteredResults.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getLoName = (maLo: string) => {
    const match = maLo.match(/MTA(\d+)/i);
    return match ? `Lô MT.A${match[1]}` : "Lô MT.A7";
  };

  const countMaiTang = results.filter((r) => r.trangThai === "Mai táng").length;
  const countMoCho = results.filter((r) => r.trangThai === "Mộ chờ").length;
  const countTrong = results.filter((r) => r.trangThai === "Trống").length;

  const getStatusBadge = (status: string) => {
    if (status === "Mai táng") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
          Đã Mai táng
        </span>
      );
    }
    if (status === "Mộ chờ") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          Mộ chờ (Sinh phần)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        Lô đất trống
      </span>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
      return `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return "—";
    }
  };

  // ── Tạo page number range hiển thị ───────────────────────────────────────
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════
          BANNER HEADER
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Hệ Thống Thông Tin Địa Lý (GIS) Quản Lý Nghĩa Trang Đô Thị</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Cổng Tra Cứu Thông Tin Mộ Phần Tại Nghĩa Trang Trà Đa
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ứng dụng công nghệ bản đồ số hóa quy hoạch phân lô, quản lý hiện
              trạng sử dụng đất an táng và hỗ trợ thân nhân tra cứu vị trí, chỉ
              đường thông minh tại xã Biển Hồ, tỉnh Gia Lai.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Phân bố:{" "}
                  <strong>Tổng cộng 32 Lô (Tên Lô: MT.A1 – A32)</strong>
                </span>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Điều hướng: <strong>Google Maps GPS</strong>
                </span>
              </div>
            </div>
          </div>

          {/* KPI widget */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 sm:p-5 flex lg:flex-col justify-between gap-4 flex-shrink-0">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                HIỆN TRẠNG SỐ HÓA
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                {results.length}{" "}
                <span className="text-xs font-medium text-slate-500">
                  phần mộ
                </span>
              </div>
            </div>
            <div className="space-y-1 text-xs border-l lg:border-l-0 lg:border-t border-slate-200 pl-4 lg:pl-0 lg:pt-3">
              <div className="flex justify-between items-center gap-3">
                <span className="text-slate-500">Đã mai táng:</span>
                <strong className="text-blue-600">{countMaiTang}</strong>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-slate-500">Mộ chờ:</span>
                <strong className="text-amber-600">{countMoCho}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PHÂN KHU: NGHĨA TRANG TRÀ ĐA — Tab Lô MT.A1–A32
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Tiêu đề phân khu */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-slate-50">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-sm text-slate-800">
              Phân Khu: Nghĩa trang Trà Đa
            </span>
            <span className="text-xs text-slate-400 font-normal">
              — 32 Lô (MT.A1 – A32)
            </span>
          </div>
        </div>

        {/* Tab Lô — thanh cuộn ngang, tất cả tab đồng kích cỡ */}
        <div className="overflow-x-auto scrollbar-hide px-4 py-3">
          <div className="flex items-center gap-1.5 w-max">
            {LOT_TABS.map((tab) => {
              const isActive = selectedZone === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedZone(tab.key)}
                  className={`px-3.5 py-1.5 rounded-xl transition text-xs font-semibold whitespace-nowrap min-w-[56px] text-center ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200"
                  }`}
                >
                  {tab.key === "ALL" ? "Tất cả" : `MT.${tab.label}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          THANH TÌM KIẾM & BỘ LỌC TRẠNG THÁI
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-10 py-3.5 sm:py-4 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
            placeholder="Tra cứu theo Họ tên người mất, Mã định danh lô mộ (VD: Nguyễn Đức Kiệt, MTA7-572)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Lọc trạng thái + View toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {[
              { key: "ALL", label: "Tất cả trạng thái", cls: "blue" },
              { key: "Mai táng", label: "Đã Mai táng", cls: "blue" },
              { key: "Mộ chờ", label: "Mộ chờ (Sinh phần)", cls: "amber" },
              {
                key: "Trống",
                label: "Lô đất trống",
                cls: "emerald",
              },
            ].map((btn) => {
              const active = filterStatus === btn.key;
              const colorMap: Record<string, string> = {
                blue: active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                amber: active
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                emerald: active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              };
              return (
                <button
                  key={btn.key}
                  onClick={() => setFilterStatus(btn.key)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
                    colorMap[btn.cls]
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>

          {/* View Mode toggle */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start lg:self-auto text-xs font-semibold">
            <button
              onClick={() => setViewMode("LIST")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === "LIST"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Dạng Danh Sách</span>
            </button>
            <button
              onClick={() => setViewMode("MAP")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === "MAP"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Sơ Đồ Bản Đồ Số</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CHẾ ĐỘ BẢN ĐỒ GIS
      ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === "MAP" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <MapIcon className="w-5 h-5 text-blue-600" />
                <span>Bản Đồ Không Gian Số Hóa Nghĩa Trang Trà Đa (Xã Biển Hồ, Gia Lai)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Hiển thị sơ đồ phân bố tổng cộng 32 Lô (Tên Lô: MT.A1 – A32)
                và vị trí tiếp nhận an táng tại Lô MT.A7
              </p>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Ngh%C4%A9a+trang+Tr%C3%A0+%C4%90a,+X%C3%A3+Bi%E1%BB%83n+H%E1%BB%93,+Gia+Lai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Mở Google Maps Dẫn Đường Thực Tế</span>
            </a>
          </div>

          <div className="w-full h-96 sm:h-[480px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-inner">
            <iframe
              title="Sơ đồ bản đồ số Nghĩa trang Trà Đa"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=Ngh%C4%A9a+trang+Tr%C3%A0+%C4%90a,+X%C3%A3+Bi%E1%BB%83n+H%E1%BB%93,+Gia+Lai&t=&z=16&ie=UTF8&iwloc=&output=embed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-bold text-slate-700">Chú thích phân loại:</span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>Lô đã mai táng ({countMaiTang})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Lô mộ chờ / sinh phần ({countMoCho})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Lô dự trữ / chưa sử dụng</span>
              </span>
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              Tọa độ trung tâm: 14.020° N, 108.040° E
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CHẾ ĐỘ DANH SÁCH HỒ SƠ
      ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === "LIST" && (
        <div className="space-y-4">
          {/* Header kết quả */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 px-1">
            <div className="flex items-center space-x-2">
              <span>Hồ sơ mộ phần phù hợp</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {filteredResults.length} kết quả
              </span>
              {filteredResults.length > 0 && (
                <span className="text-slate-400 font-normal text-xs">
                  — Trang {currentPage}/{totalPages} (sắp xếp: mới nhất trước)
                </span>
              )}
            </div>
            {loading && (
              <span className="text-blue-600 text-xs font-normal animate-pulse">
                Đang nạp dữ liệu...
              </span>
            )}
          </div>

          {/* Grid thẻ hồ sơ */}
          {pagedResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pagedResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/grave/${encodeURIComponent(item.maLo)}`}
                    className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Header thẻ */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                            {item.maLo}
                          </span>
                          <span className="text-[11px] text-blue-800 bg-blue-50/80 px-2 py-0.5 rounded font-semibold">
                            {getLoName(item.maLo)}
                          </span>
                        </div>
                        {getStatusBadge(item.trangThai)}
                      </div>

                      {/* Tên người được cấp */}
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.nguoiDuocCap}
                        </h3>
                        <p className="text-xs text-slate-500 pt-0.5">
                          Hồ sơ an táng số hóa • Nghĩa trang Trà Đa
                        </p>
                      </div>

                      {/* Ngày sinh / mất */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Ngày sinh:</span>
                          <strong className="text-slate-700">
                            {formatDate(item.ngaySinh)}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">
                            {item.trangThai === "Trống"
                              ? "Hiện trạng:"
                              : "Ngày mất:"}
                          </span>
                          {item.trangThai === "Mộ chờ" ? (
                            <span className="text-amber-700 font-semibold">
                              Mộ chờ
                            </span>
                          ) : item.trangThai === "Trống" ? (
                            <span className="text-emerald-700 font-semibold">
                              Lô đất dự trữ (Sẵn sàng cấp)
                            </span>
                          ) : (
                            <strong className="text-slate-700">
                              {formatDate(item.ngayMat)}
                            </strong>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Nút xem hồ sơ */}
                    <div className="pt-2 flex items-center justify-between text-xs font-bold text-blue-600 border-t border-slate-100">
                      <span className="text-slate-400 font-normal">
                        Chi tiết & Maps
                      </span>
                      <div className="inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                        <span>Xem hồ sơ</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* ── PHÂN TRANG ────────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-4 pb-2">
                  {/* Nút Trước */}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Trước
                  </button>

                  {/* Số trang */}
                  {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-slate-400 text-xs"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p as number)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition border ${
                          currentPage === p
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Nút Sau */}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Sau
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Thông tin trang */}
              {totalPages > 1 && (
                <p className="text-center text-xs text-slate-400">
                  Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredResults.length)}{" "}
                  trong tổng số {filteredResults.length} hồ sơ
                </p>
              )}
            </>
          ) : hasSearched && !loading ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <HelpCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Không tìm thấy hồ sơ phù hợp
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Vui lòng kiểm tra lại chính tả hoặc mã lô. Bạn cũng có thể
                liên hệ trực tiếp BQL tại cổng nghĩa trang để được hỗ trợ kiểm
                tra sổ lưu trữ cũ.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          KHỐI HƯỚNG DẪN QUY TRÌNH
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/60 rounded-3xl border border-blue-100 p-6 sm:p-8 space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <span>Quy Trình Hướng Dẫn Thăm Viếng & Tra Cứu Nghĩa Trang Trà Đa</span>
          </h3>
          <p className="text-xs text-slate-600">
            Hỗ trợ người dân tiếp cận thông tin nhanh chóng, thuận tiện và
            chính xác nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              Quét QR hoặc Tra Cứu
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Quét mã QR tại cổng chào hoặc nhập họ tên trên website để tìm
              chính xác Mã lô đất an táng.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              Định Vị & Dẫn Đường
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bấm nút &quot;Dẫn đường đến Nghĩa trang&quot; để Google Maps chỉ
              lộ trình ngắn nhất từ vị trí hiện tại của bạn.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              Lưu Mã QR Phần Mộ
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tải ảnh mã QR riêng của phần mộ để chia sẻ cho người thân trong
              gia đình hoặc gắn lên bia mộ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
