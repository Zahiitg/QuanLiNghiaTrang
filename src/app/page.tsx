"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  X,
  Compass,
  FileCheck2,
  Users
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

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [results, setResults] = useState<GraveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch dữ liệu từ API
  const fetchGraves = async (query: string, status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/graves?q=${encodeURIComponent(query)}&status=${status}`);
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

  const getStatusBadge = (status: string) => {
    if (status === "Mai táng") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
          Đã Mai táng
        </span>
      );
    }
    if (status === "Mộ chờ") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          Mộ chờ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        Trống
      </span>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return "—";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Hero Header Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-blue-50/90 border border-blue-200/80 text-blue-700 rounded-full text-xs font-medium shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Hệ Thống Tra Cứu Nghĩa Trang TP. Pleiku</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Tra Cứu Vị Trí & Hồ Sơ Mộ Phần
        </h2>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Nhập họ tên người quá cố hoặc mã định danh lô đất để tra cứu vị trí, hồ sơ an táng và chỉ dẫn đường tới Nghĩa trang Trà Đa.
        </p>

        {/* Quick KPI stats bar */}
        <div className="inline-flex items-center justify-center flex-wrap gap-4 pt-2 text-xs text-slate-500 font-medium">
          <span className="flex items-center space-x-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
            <span>185 Hồ sơ đã số hóa</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dẫn đường Google Maps</span>
          </span>
        </div>
      </div>

      {/* Search & Filter Floating Card */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/90 space-y-4">
        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-blue-500" />
          </div>

          <input
            type="text"
            className="w-full pl-12 pr-10 py-3.5 sm:py-4 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
            placeholder="Nhập họ và tên hoặc mã lô (Ví dụ: Nguyễn Đức Kiệt, MTA7-572)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              title="Xóa nội dung tìm kiếm"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters and Suggestions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Status filter tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium pl-1 hidden sm:inline">Trạng thái:</span>
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                filterStatus === "ALL"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus("Mai táng")}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                filterStatus === "Mai táng"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Đã Mai táng
            </button>
            <button
              onClick={() => setFilterStatus("Mộ chờ")}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                filterStatus === "Mộ chờ"
                  ? "bg-amber-600 text-white shadow-sm shadow-amber-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Mộ chờ
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 overflow-x-auto">
            <span className="text-slate-400">Gợi ý:</span>
            <button
              onClick={() => setSearchTerm("MTA7-572")}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-mono transition"
            >
              MTA7-572
            </button>
            <button
              onClick={() => setSearchTerm("Nguyễn")}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition"
            >
              Họ Nguyễn
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 px-1">
          <div className="flex items-center space-x-2">
            <span>Danh sách kết quả</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {results.length} hồ sơ
            </span>
          </div>

          {loading && (
            <span className="text-blue-600 text-xs font-normal animate-pulse">
              Đang tra cứu dữ liệu...
            </span>
          )}
        </div>

        {/* Results 2-Column Grid Layout */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((item) => (
              <Link
                key={item.id}
                href={`/grave/${encodeURIComponent(item.maLo)}`}
                className="group relative bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top line of card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {item.maLo}
                      </span>
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors pt-1">
                        {item.nguoiDuocCap}
                      </h3>
                    </div>
                    {getStatusBadge(item.trangThai)}
                  </div>

                  {/* Date details */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sinh: <strong className="text-slate-700">{formatDate(item.ngaySinh)}</strong></span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {item.trangThai === "Mộ chờ" ? (
                          <span className="text-amber-600 font-medium">Mộ chờ</span>
                        ) : (
                          <>Mất: <strong className="text-slate-700">{formatDate(item.ngayMat)}</strong></>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom button indicator */}
                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 font-normal">Vị trí:</span>
                    <span className="text-slate-800">Khu A7</span>
                  </span>
                  <div className="inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>Xem bản đồ & chỉ đường</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : hasSearched && !loading ? (
          <div className="bg-white p-10 sm:p-14 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy hồ sơ phù hợp</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Vui lòng kiểm tra lại chính tả họ tên hoặc mã định danh lô đất. Nếu cần tra cứu các hồ sơ cũ chưa số hóa, quý thân nhân vui lòng liên hệ trực tiếp BQL nghĩa trang.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h4 className="font-bold text-sm text-slate-800">Quét mã QR tại cổng</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Dùng điện thoại quét mã QR tại bảng thông tin cổng nghĩa trang để mở ngay trang tra cứu này mà không cần cài đặt ứng dụng.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h4 className="font-bold text-sm text-slate-800">Tra cứu & Lưu mã lô</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tìm tên người thân để lấy chính xác Mã lô (ví dụ: <strong className="font-mono text-slate-700">MTA7-572</strong>) và thông tin an táng.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h4 className="font-bold text-sm text-slate-800">Dẫn đường Maps</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nhấn nút Dẫn đường để ứng dụng Google Maps chỉ đường thẳng tới nghĩa trang. Đến nơi chỉ cần xuất trình Mã lô cho cán bộ hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
}
