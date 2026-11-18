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
  Menu,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Eye,
  EyeOff,
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
// Dừng hoạt động (A1–A7) | Đang hoạt động (A8) | Dự kiến đưa vào hoạt động (A9–A32)
// A7 là khu duy nhất đang có dữ liệu số hóa (dù đã dừng hoạt động)
type LotStatus = "stopped" | "active" | "planned";

interface LotTab {
  key: string;
  label: string;
  status: LotStatus | "all";
  hasData?: boolean; // true nếu khu này đã có dữ liệu số hóa
}

const LOT_TABS: LotTab[] = [
  { key: "ALL", label: "Tất cả", status: "all" },
  // A1–A6: dừng hoạt động, chưa có dữ liệu
  ...Array.from({ length: 6 }, (_, i) => ({
    key: `A${i + 1}`,
    label: `A${i + 1}`,
    status: "stopped" as LotStatus,
    hasData: false,
  })),
  // A7: dừng hoạt động nhưng có dữ liệu số hóa
  { key: "A7", label: "A7", status: "stopped" as LotStatus, hasData: true },
  // A8: đang hoạt động
  { key: "A8", label: "A8", status: "active" as LotStatus, hasData: false },
  // A9–A32: dự kiến đưa vào hoạt động
  ...Array.from({ length: 24 }, (_, i) => ({
    key: `A${i + 9}`,
    label: `A${i + 9}`,
    status: "planned" as LotStatus,
    hasData: false,
  })),
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [viewMode, setViewMode] = useState<"LIST" | "MAP">("LIST");
  const [results, setResults] = useState<GraveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── Ẩn/hiện thông tin ngày sinh & ngày mất (Private Mode) ────────────────
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());

  const toggleReveal = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Bộ lọc nâng cao (Sort & Advanced Filter) ──────────────────────────────
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "NAME_AZ" | "NAME_ZA">("NEWEST");
  const [filterYear, setFilterYear] = useState<"ALL" | "BEFORE_2000" | "AFTER_2000">("ALL");

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
  }, [searchTerm, filterStatus, selectedZone, sortBy, filterYear]);

  // Đếm số lượng bộ lọc đang kích hoạt ngoài mặc định
  const activeFilterCount = (sortBy !== "NEWEST" ? 1 : 0) + (filterYear !== "ALL" ? 1 : 0);

  // ── Lọc + sắp xếp dữ liệu ────────────────────────────────────────────────
  const filteredResults = useMemo(() => {
    // 1. Lọc theo Phân khu
    let list = results.filter((item) => {
      if (selectedZone === "ALL") return true;
      const lotNum = selectedZone.replace("A", "");
      return item.maLo.toLowerCase().startsWith(`mta${lotNum}`);
    });

    // 2. Lọc theo Năm mất: Trước 2000 hoặc Sau 2000
    if (filterYear === "BEFORE_2000") {
      list = list.filter((item) => {
        if (!item.ngayMat) return false;
        const y = new Date(item.ngayMat).getFullYear();
        return !isNaN(y) && y < 2000;
      });
    } else if (filterYear === "AFTER_2000") {
      list = list.filter((item) => {
        if (!item.ngayMat) return false;
        const y = new Date(item.ngayMat).getFullYear();
        return !isNaN(y) && y >= 2000;
      });
    }

    // 3. Sắp xếp theo lựa chọn
    return [...list].sort((a, b) => {
      // Ưu tiên mộ Trống luôn ở sau cùng trong mọi kiểu sắp xếp
      const aIsTrong = a.trangThai === "Trống";
      const bIsTrong = b.trangThai === "Trống";
      if (aIsTrong && !bIsTrong) return 1;
      if (!aIsTrong && bIsTrong) return -1;

      if (sortBy === "NEWEST") {
        return (b.stt ?? 0) - (a.stt ?? 0);
      }
      if (sortBy === "OLDEST") {
        return (a.stt ?? 0) - (b.stt ?? 0);
      }
      if (sortBy === "NAME_AZ") {
        return a.nguoiDuocCap.localeCompare(b.nguoiDuocCap, "vi");
      }
      if (sortBy === "NAME_ZA") {
        return b.nguoiDuocCap.localeCompare(a.nguoiDuocCap, "vi");
      }
      return 0;
    });
  }, [results, selectedZone, sortBy, filterYear]);

  // ── Thông tin KPI theo khu đang chọn ─────────────────────────────────────
  const kpiData = useMemo(() => {
    const src = filteredResults;
    const total = src.length;
    const maiTang = src.filter((r) => r.trangThai === "Mai táng").length;
    const caiTang = src.filter((r) => r.trangThai === "Mộ cải táng").length;
    const moCho = src.filter((r) => r.trangThai === "Mộ chờ").length;
    const trong = src.filter((r) => r.trangThai === "Trống").length;
    return { total, maiTang, caiTang, moCho, trong };
  }, [filteredResults]);

  // Kiểm tra khu đang chọn có dữ liệu không
  const selectedLotInfo = useMemo(() => {
    if (selectedZone === "ALL") return null;
    return LOT_TABS.find((t) => t.key === selectedZone) ?? null;
  }, [selectedZone]);

  const selectedZoneHasData =
    selectedZone === "ALL" ||
    (selectedLotInfo?.hasData === true) ||
    filteredResults.length > 0;

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

  const getStatusBadge = (status: string) => {
    if (status === "Mai táng") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
          Đã Mai táng
        </span>
      );
    }
    if (status === "Mộ cải táng") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
          Mộ cải táng
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
        Khu mộ trống
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

  // Label tên khu đang chọn
  const selectedZoneLabel =
    selectedZone === "ALL" ? "Tất cả các khu" : `Lô MT.${selectedZone}`;

  return (
    <div className="w-full min-h-[calc(100vh-65px)]">
      {/* ── Nút nổi mở Menu Phân Khu trên Mobile & Tablet (< lg) ── */}
      <div className="lg:hidden sticky top-[65px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 active:scale-95 transition"
        >
          <Menu className="w-4 h-4" />
          <span>Danh Sách 32 Phân Khu</span>
        </button>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
          {selectedZoneLabel}
        </span>
      </div>

      <div className="flex w-full">
        {/* ═══════════════════════════════════════════════════════════════════
            SIDEBAR ĐIỀU HƯỚNG BÊN TRÁI (Bám sát mép trái toàn trang)
        ═══════════════════════════════════════════════════════════════════ */}
        {/* Backdrop che mờ màn hình khi mở menu trên Mobile */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
            lg:static lg:z-0 lg:translate-x-0 lg:min-h-screen lg:flex-shrink-0
            ${mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Header của Sidebar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Phân Khu Nghĩa Trang</span>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
            <p className="text-[11px] text-slate-500 px-1">
              Quy hoạch tổng thể: <strong>32 Lô (MT.A1 – A32)</strong>
            </p>

            {/* Nút Chọn Tất cả */}
            <button
              onClick={() => {
                setSelectedZone("ALL");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${selectedZone === "ALL"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
            >
              <span className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${selectedZone === "ALL" ? "bg-white" : "bg-blue-600"}`}></span>
                <span>Tất cả các khu</span>
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${selectedZone === "ALL" ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"}`}>
                32
              </span>
            </button>

            {/* Lưới các Lô từ MT.A1 đến MT.A32 */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
                Danh sách lô an táng
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {LOT_TABS.filter((t) => t.key !== "ALL").map((tab) => {
                  const isActive = selectedZone === tab.key;
                  const isOperating = tab.status === "active";
                  const isStopped = tab.status === "stopped";
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setSelectedZone(tab.key);
                        setMobileSidebarOpen(false);
                      }}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition border ${isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : isOperating
                          ? "bg-blue-50/70 text-blue-900 border-blue-200 hover:bg-blue-100/80"
                          : isStopped
                            ? "bg-slate-100/80 text-slate-600 border-slate-200 hover:bg-slate-200/80"
                            : "bg-white text-slate-500 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      title={
                        isOperating
                          ? "Đang hoạt động"
                          : isStopped
                            ? "Dừng hoạt động"
                            : "Dự kiến đưa vào hoạt động"
                      }
                    >
                      <span>MT.{tab.label}</span>
                      {isOperating ? (
                        <span
                          className={`w-2 h-2 rounded-full ${isActive ? "bg-white" : "bg-emerald-500 animate-pulse"
                            }`}
                          title="Đang hoạt động"
                        ></span>
                      ) : isStopped ? (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white/60" : "bg-slate-400"
                            }`}
                          title="Dừng hoạt động"
                        ></span>
                      ) : (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white/60" : "bg-amber-400"
                            }`}
                          title="Dự kiến đưa vào hoạt động"
                        ></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chú giải trạng thái ở chân Sidebar */}
          <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">
              Trạng thái vận hành lô
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Đang hoạt động</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Dừng hoạt động</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Dự kiến đưa vào hoạt động</span>
            </div>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════════════════════════
            NỘI DUNG CHÍNH (BÊN PHẢI)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* BANNER HEADER */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Thông tin giới thiệu chi tiết */}
              <div className="space-y-3 flex-1 min-w-0 max-w-3xl">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Hệ Thống Thông Tin Quản Lý Nghĩa Trang Đô Thị</span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  CỔNG TRA CỨU THÔNG TIN MỘ PHẦN TẠI NGHĨA TRANG TRÀ ĐA
                </h1>

                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-1.5 text-justify">
                  <p>
                    Hệ thống chuyển đổi số toàn diện do <strong>Ban Quản lý dịch vụ công Quy Nhơn - Sở Xây dựng tỉnh Gia Lai</strong> triển khai tại xã Biển Hồ. Ứng dụng tích hợp công nghệ GIS nhằm số hóa cơ sở dữ liệu hồ sơ an táng, quản lý hiện trạng quỹ đất minh bạch và chính xác theo từng phân khu.
                  </p>
                  <p className="hidden sm:block">
                    Hỗ trợ thân nhân tra cứu thông tin nhanh chóng theo họ tên, ngày mất hoặc mã định danh lô mộ; tích hợp bản đồ số dẫn đường GPS đến tận vị trí phần mộ và xuất mã QR số hóa cho từng hồ sơ quản lý.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                  <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      Phân bố: <strong>Tổng cộng 32 Lô (MT.A1 – A32)</strong>
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

              {/* KPI widget – thay đổi theo khu đang chọn */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 sm:p-5 flex lg:flex-col justify-between gap-4 flex-shrink-0 min-w-[180px]">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    HIỆN TRẠNG SỐ HÓA
                  </span>
                  {/* Tên khu đang xem */}
                  <div className="text-[11px] font-semibold text-blue-600 truncate">
                    {selectedZoneLabel}
                  </div>

                  {/* Nếu khu chưa có dữ liệu → hiển thị thông báo */}
                  {!selectedZoneHasData ? (
                    <div className="flex items-center gap-1.5 mt-2 text-amber-600">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-xs font-semibold">Đang cập nhật dữ liệu</span>
                    </div>
                  ) : (
                    <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                      {kpiData.total}{" "}
                      <span className="text-xs font-medium text-slate-500">
                        phần mộ
                      </span>
                    </div>
                  )}
                </div>

                {selectedZoneHasData && (
                  <div className="space-y-1.5 text-xs border-l lg:border-l-0 lg:border-t border-slate-200 pl-4 lg:pl-0 lg:pt-3">
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-slate-500">Đã mai táng:</span>
                      <strong className="text-blue-600">{kpiData.maiTang}</strong>
                    </div>
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-slate-500">Mộ cải táng:</span>
                      <strong className="text-purple-600">{kpiData.caiTang}</strong>
                    </div>
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-slate-500">Mộ chờ:</span>
                      <strong className="text-amber-600">{kpiData.moCho}</strong>
                    </div>
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-slate-500">Khu mộ trống:</span>
                      <strong className="text-emerald-600">{kpiData.trong}</strong>
                    </div>
                  </div>
                )}
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
                  { key: "Mộ cải táng", label: "Mộ cải táng", cls: "purple" },
                  { key: "Mộ chờ", label: "Mộ chờ (Sinh phần)", cls: "amber" },
                  {
                    key: "Trống",
                    label: "Khu mộ trống",
                    cls: "emerald",
                  },
                ].map((btn) => {
                  const active = filterStatus === btn.key;
                  const colorMap: Record<string, string> = {
                    blue: active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    purple: active
                      ? "bg-purple-600 text-white shadow-sm"
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
                      className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${colorMap[btn.cls]
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
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${viewMode === "LIST"
                    ? "bg-white text-blue-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Dạng Danh Sách</span>
                </button>
                <button
                  onClick={() => setViewMode("MAP")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${viewMode === "MAP"
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
                    <span>Đã mai táng ({kpiData.maiTang})</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span>Mộ cải táng ({kpiData.caiTang})</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span>Mộ chờ ({kpiData.moCho})</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span>Khu mộ trống ({kpiData.trong})</span>
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
              {/* Header kết quả + Nút Bộ Lọc */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm font-bold text-slate-800 px-1">
                <div className="flex items-center space-x-2">
                  <span>Hồ sơ mộ phần phù hợp</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {filteredResults.length} kết quả
                  </span>
                  {filteredResults.length > 0 && (
                    <span className="text-slate-400 font-normal text-xs hidden md:inline">
                      — Trang {currentPage}/{totalPages}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  {loading && (
                    <span className="text-blue-600 text-xs font-normal animate-pulse mr-2">
                      Đang nạp dữ liệu...
                    </span>
                  )}

                  {/* Nút bật/tắt Bộ Lọc Nâng Cao */}
                  <button
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${showFilterPanel || activeFilterCount > 0
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Bộ lọc</span>
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold flex items-center justify-center ml-0.5">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* BẢNG BỘ LỌC NÂNG CAO (Accordion trượt xuống khi bấm) */}
              {showFilterPanel && (
                <div className="bg-white p-4 rounded-2xl border border-blue-200/90 shadow-sm space-y-3.5 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2 text-slate-800 font-bold">
                      <ArrowUpDown className="w-4 h-4 text-blue-600" />
                      <span>Tùy Chọn Lọc & Sắp Xếp Dữ Liệu</span>
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => {
                          setSortBy("NEWEST");
                          setFilterYear("ALL");
                        }}
                        className="inline-flex items-center space-x-1 text-slate-500 hover:text-blue-600 font-semibold text-[11px] transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Đặt lại mặc định</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* 1. Sắp xếp thứ tự (4 trường lọc) */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">
                        Thứ tự sắp xếp
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { key: "NEWEST", label: "Mới nhất trước" },
                          { key: "OLDEST", label: "Cũ nhất trước" },
                          { key: "NAME_AZ", label: "Tên (A → Z)" },
                          { key: "NAME_ZA", label: "Tên (Z → A)" },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => setSortBy(opt.key as any)}
                            className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition border ${sortBy === opt.key
                              ? "bg-blue-50 text-blue-700 border-blue-300 font-bold shadow-2xs"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Lọc theo Năm mất */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">
                        Lọc theo Năm mất
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { key: "ALL", label: "Tất cả các năm" },
                          { key: "BEFORE_2000", label: "Trước năm 2000" },
                          { key: "AFTER_2000", label: "Sau năm 2000" },
                        ].map((item) => (
                          <button
                            key={item.key}
                            onClick={() => setFilterYear(item.key as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${filterYear === item.key
                              ? "bg-blue-50 text-blue-700 border-blue-300 font-bold shadow-2xs"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid thẻ hồ sơ */}
              {pagedResults.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {pagedResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/grave/${encodeURIComponent(item.maLo)}`}
                        className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2.5">
                          {/* Header thẻ */}
                          <div className="flex items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
                            <div className="flex items-center space-x-1">
                              <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                                {item.maLo}
                              </span>
                              <span className="text-[10px] text-blue-800 bg-blue-50/80 px-1.5 py-0.5 rounded font-semibold">
                                {getLoName(item.maLo)}
                              </span>
                            </div>
                            {getStatusBadge(item.trangThai)}
                          </div>

                          {/* Tên người được cấp */}
                          <div>
                            <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {item.nguoiDuocCap}
                            </h3>
                            <p className="text-[11px] text-slate-500 pt-0.5 truncate">
                              Hồ sơ an táng số hóa • Nghĩa trang Trà Đa
                            </p>
                          </div>

                          {/* Ngày sinh / mất (Chế độ riêng tư với icon con mắt bật/tắt) */}
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1 text-[11px] text-slate-600 relative">
                            <div className="flex justify-between items-center pr-6">
                              <span className="text-slate-400">Ngày sinh:</span>
                              <strong className="text-slate-700 font-mono">
                                {revealedIds.has(item.id)
                                  ? formatDate(item.ngaySinh)
                                  : item.ngaySinh
                                    ? "••••••••••"
                                    : "—"}
                              </strong>
                            </div>
                            <div className="flex justify-between items-center pr-6">
                              <span className="text-slate-400">
                                {item.trangThai === "Trống"
                                  ? "Hiện trạng:"
                                  : "Ngày mất:"}
                              </span>
                              {item.trangThai === "Mộ chờ" ? (
                                <span className="text-amber-700 font-semibold">
                                  Mộ chờ (Sinh phần)
                                </span>
                              ) : item.trangThai === "Mộ cải táng" ? (
                                <span className="text-purple-700 font-semibold">
                                  Đã cải táng
                                </span>
                              ) : item.trangThai === "Trống" ? (
                                <span className="text-emerald-700 font-semibold">
                                  Khu mộ trống
                                </span>
                              ) : (
                                <strong className="text-slate-700 font-mono">
                                  {revealedIds.has(item.id)
                                    ? formatDate(item.ngayMat)
                                    : item.ngayMat
                                      ? "••••••••••"
                                      : "—"}
                                </strong>
                              )}
                            </div>

                            {/* Nút con mắt bật/tắt hiển thị thông tin riêng tư */}
                            {item.trangThai !== "Trống" && (
                              <button
                                type="button"
                                onClick={(e) => toggleReveal(item.id, e)}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition border border-transparent hover:border-slate-200"
                                title={
                                  revealedIds.has(item.id)
                                    ? "Ẩn ngày sinh/ngày mất"
                                    : "Xem ngày sinh/ngày mất"
                                }
                              >
                                {revealedIds.has(item.id) ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Nút xem hồ sơ */}
                        <div className="pt-1.5 flex items-center justify-between text-[11px] font-bold text-blue-600 border-t border-slate-100">
                          <span className="text-slate-400 font-normal">
                            Chi tiết & Maps
                          </span>
                          <div className="inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                            <span>Xem hồ sơ</span>
                            <ArrowRight className="w-3.5 h-3.5" />
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
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition border ${currentPage === p
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
                  {!selectedZoneHasData ? (
                    /* Khu chưa có dữ liệu */
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto text-amber-400">
                        <RefreshCw className="w-7 h-7 animate-spin" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">
                        Đang cập nhật dữ liệu
                      </h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Dữ liệu số hóa cho <strong>{selectedZoneLabel}</strong> hiện
                        đang được cập nhật. Vui lòng quay lại sau hoặc liên hệ Ban
                        Quản lý nghĩa trang để được hỗ trợ tra cứu trực tiếp.
                      </p>
                    </>
                  ) : (
                    /* Có dữ liệu nhưng không tìm thấy kết quả phù hợp bộ lọc */
                    <>
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
                    </>
                  )}
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
      </div>

    </div>
  );
}
