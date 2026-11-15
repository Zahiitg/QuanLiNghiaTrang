"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Calendar, User, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

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

  // Tìm kiếm tự động khi người dùng nhập hoặc chọn filter
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
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  const getStatusBadge = (status: string) => {
    if (status === "Mai táng") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pastel-badge-maitangBg text-pastel-badge-maitangText border border-indigo-200">
          Mai táng
        </span>
      );
    }
    if (status === "Mộ chờ") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pastel-badge-mochoBg text-pastel-badge-mochoText border border-amber-200">
          Mộ chờ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pastel-badge-trongBg text-pastel-badge-trongText border border-emerald-200">
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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Hero / Header Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-pastel-blue-50 border border-pastel-blue-200 text-pastel-blue-700 rounded-full text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Cổng Thông Tin Tra Cứu Chính Thức</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Tra Cứu Hồ Sơ Mộ Phần
        </h2>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Nhập họ và tên người thân hoặc mã lô (ví dụ: <span className="font-semibold text-slate-700">MTA7-572</span>) để tìm kiếm vị trí và thông tin an táng tại Nghĩa trang Trà Đa.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pastel-blue-400 focus:bg-white transition"
            placeholder="Nhập họ tên hoặc mã lô..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 whitespace-nowrap pl-1">Lọc nhanh:</span>
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              filterStatus === "ALL"
                ? "bg-pastel-blue-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus("Mai táng")}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              filterStatus === "Mai táng"
                ? "bg-pastel-blue-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Đã Mai táng
          </button>
          <button
            onClick={() => setFilterStatus("Mộ chờ")}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              filterStatus === "Mộ chờ"
                ? "bg-pastel-blue-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Mộ chờ
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Kết quả tìm kiếm</span>
          {loading ? (
            <span className="text-pastel-blue-600">Đang tra cứu dữ liệu...</span>
          ) : (
            <span>Tìm thấy {results.length} hồ sơ</span>
          )}
        </div>

        {/* Results List */}
        {results.length > 0 ? (
          <div className="grid gap-3">
            {results.map((item) => (
              <Link
                key={item.id}
                href={`/grave/${encodeURIComponent(item.maLo)}`}
                className="group block bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-pastel-blue-300 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-base sm:text-lg text-slate-900 group-hover:text-pastel-blue-600 transition">
                        {item.nguoiDuocCap}
                      </h3>
                      {getStatusBadge(item.trangThai)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Mã lô: <strong className="text-slate-700 font-mono">{item.maLo}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {item.ngaySinh ? formatDate(item.ngaySinh) : "—"} - {item.ngayMat ? formatDate(item.ngayMat) : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center text-xs font-medium text-pastel-blue-600 group-hover:translate-x-1 transition">
                    <span>Xem vị trí</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : hasSearched && !loading ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">Không tìm thấy hồ sơ phù hợp</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Vui lòng kiểm tra lại chính tả họ tên hoặc mã lô. Nếu cần hỗ trợ thêm, thân nhân có thể liên hệ trực tiếp Ban Quản lý tại cổng nghĩa trang.
            </p>
          </div>
        ) : null}
      </div>

      {/* Quick Guide Card */}
      <div className="bg-pastel-blue-50/50 border border-pastel-blue-100 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
        <h4 className="font-semibold text-slate-800 flex items-center space-x-1.5">
          <span>💡 Hướng dẫn dành cho thân nhân đến viếng mộ</span>
        </h4>
        <ul className="list-disc pl-4 space-y-1">
          <li>Quét mã QR tại cổng nghĩa trang để mở ngay trang tra cứu này.</li>
          <li>Tìm kiếm tên người thân để lấy chính xác <strong>Mã lô</strong> (Ví dụ: MTA7-572 thuộc Khu A7).</li>
          <li>Sử dụng chức năng <strong>"Dẫn đường đến Nghĩa trang"</strong> trong trang chi tiết để được chỉ đường qua Google Maps.</li>
          <li>Khi tới nơi, vui lòng cung cấp Mã lô cho cán bộ BQL để được hướng dẫn trực tiếp đến phần mộ.</li>
        </ul>
      </div>
    </div>
  );
}
