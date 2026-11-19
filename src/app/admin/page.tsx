"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  QrCode,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  LayoutGrid,
  FileText,
  AlertTriangle,
  RefreshCw,
  LogOut,
  X,
  ExternalLink,
  ShieldCheck,
  Layers,
  MapPin,
  Download,
  ChevronDown,
  FileSpreadsheet,
  Upload,
  Check,
  Pencil,
  Trash2
} from "lucide-react";

interface GraveRecord {
  id: number;
  stt: number | null;
  maLo: string;
  trangThai: string;
  nguoiDuocCap: string;
  cccd: string | null;
  danToc: string | null;
  quocTich: string | null;
  ngaySinh: string | null;
  ngayMat: string | null;
  quyetDinhCapDat: string | null;
  nguoiLienHe: string | null;
  soDienThoai: string | null;
  diaChi: string | null;
  ghiChu: string | null;
}

// Cấu hình trạng thái phân khu 32 Lô đồng bộ với hệ thống:
// Dừng hoạt động: A4, A5, A6, A7, A9, A10, A11
// Đang hoạt động: A8
// Dự kiến: Các khu còn lại (A1, A2, A3, A12–A32)
const STOPPED_ZONES = new Set(["A4", "A5", "A6", "A7", "A9", "A10", "A11"]);
const ACTIVE_ZONES = new Set(["A8"]);

export default function AdminDashboardPage() {
  const router = useRouter();
  const [graves, setGraves] = useState<GraveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterZone, setFilterZone] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // State cho Import Excel
  const [importFileName, setImportFileName] = useState("");
  const [importRecords, setImportRecords] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importOverwrite, setImportOverwrite] = useState(true);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    maLo: "",
    trangThai: "Mai táng",
    nguoiDuocCap: "",
    cccd: "",
    danToc: "Kinh",
    quocTich: "Việt Nam",
    ngaySinh: "",
    ngayMat: "",
    quyetDinhCapDat: "",
    nguoiLienHe: "",
    soDienThoai: "",
    diaChi: "",
    ghiChu: "",
  });

  // State cho Chỉnh Sửa & Xóa
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    id: number | null;
    maLo: string;
    trangThai: string;
    nguoiDuocCap: string;
    cccd: string;
    danToc: string;
    quocTich: string;
    ngaySinh: string;
    ngayMat: string;
    quyetDinhCapDat: string;
    nguoiLienHe: string;
    soDienThoai: string;
    diaChi: string;
    ghiChu: string;
  }>({
    id: null,
    maLo: "",
    trangThai: "Mai táng",
    nguoiDuocCap: "",
    cccd: "",
    danToc: "Kinh",
    quocTich: "Việt Nam",
    ngaySinh: "",
    ngayMat: "",
    quyetDinhCapDat: "",
    nguoiLienHe: "",
    soDienThoai: "",
    diaChi: "",
    ghiChu: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<GraveRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/graves");
      if (res.ok) {
        const data = await res.json();
        setGraves(data.graves || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/graves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          maLo: "",
          trangThai: "Mai táng",
          nguoiDuocCap: "",
          cccd: "",
          danToc: "Kinh",
          quocTich: "Việt Nam",
          ngaySinh: "",
          ngayMat: "",
          quyetDinhCapDat: "",
          nguoiLienHe: "",
          soDienThoai: "",
          diaChi: "",
          ghiChu: "",
        });
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Không thể thêm hồ sơ");
      }
    } catch {
      alert("Lỗi kết nối");
    }
  };

  // Mở modal chỉnh sửa hồ sơ
  const handleOpenEdit = (record: GraveRecord) => {
    setEditFormData({
      id: record.id,
      maLo: record.maLo,
      trangThai: record.trangThai || "Mai táng",
      nguoiDuocCap: record.nguoiDuocCap || "",
      cccd: record.cccd || "",
      danToc: record.danToc || "Kinh",
      quocTich: record.quocTich || "Việt Nam",
      ngaySinh: record.ngaySinh ? record.ngaySinh.split("T")[0] : "",
      ngayMat: record.ngayMat ? record.ngayMat.split("T")[0] : "",
      quyetDinhCapDat: record.quyetDinhCapDat || "",
      nguoiLienHe: record.nguoiLienHe || "",
      soDienThoai: record.soDienThoai || "",
      diaChi: record.diaChi || "",
      ghiChu: record.ghiChu || "",
    });
    setShowEditModal(true);
  };

  // Lưu chỉnh sửa hồ sơ
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/admin/graves", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        setShowEditModal(false);
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Không thể cập nhật hồ sơ");
      }
    } catch {
      alert("Lỗi kết nối khi cập nhật hồ sơ");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Mở modal xác nhận xóa
  const handleOpenDelete = (record: GraveRecord) => {
    setDeletingRecord(record);
    setShowDeleteConfirm(true);
  };

  // Thực hiện xóa hồ sơ
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/graves?id=${deletingRecord.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setShowDeleteConfirm(false);
        setDeletingRecord(null);
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Không thể xóa hồ sơ");
      }
    } catch {
      alert("Lỗi kết nối khi xóa hồ sơ");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper chuyển đổi giá trị ngày tháng từ Excel
  const parseDateValue = (val: any): string | null => {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val.getTime())) {
      return val.toISOString();
    }
    const s = String(val).trim();
    if (!s || s === "Không Đào" || s === "-") return null;

    if (/^\d{4}-\d{1,2}-\d{1,2}/.test(s)) {
      const parts = s.split(" ")[0].split("-");
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      const d = parseInt(parts[2]);
      if (y >= 1900 && y <= 2100) {
        const dt = new Date(Date.UTC(y, m, d));
        if (!isNaN(dt.getTime())) return dt.toISOString();
      }
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(s)) {
      const parts = s.split(" ")[0].split("/");
      const d = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      const y = parseInt(parts[2]);
      if (y >= 1900 && y <= 2100) {
        const dt = new Date(Date.UTC(y, m, d));
        if (!isNaN(dt.getTime())) return dt.toISOString();
      }
    }

    const dt = new Date(s);
    if (!isNaN(dt.getTime()) && dt.getFullYear() >= 1900 && dt.getFullYear() <= 2100) {
      return dt.toISOString();
    }
    return null;
  };

  // Đọc và phân tích file Excel / CSV
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setImportResult(null);
    setImportFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];

      let headerRowIndex = -1;
      let colMaLo = -1;
      let colName = -1;
      let colNgayMat = -1;
      let colDiaChi = -1;
      let colCccd = -1;
      let colSdt = -1;
      let colNguoiLienHe = -1;
      let colQuyetDinh = -1;
      let colGhiChu = -1;
      let colTrangThai = -1;
      let colStt = -1;

      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const row = rows[r];
        if (!Array.isArray(row)) continue;

        row.forEach((cell, idx) => {
          const text = String(cell).toLowerCase().trim();
          if (text.includes("mã lô") || text === "mã" || (text.includes("lô") && !text.includes("trống"))) {
            if (colMaLo === -1) colMaLo = idx;
          }
          if (text.includes("họ và tên") || text.includes("họ tên") || text.includes("người được cấp") || text === "tên") {
            if (colName === -1) colName = idx;
          }
          if (text.includes("ngày mất") || text.includes("năm mất")) {
            if (colNgayMat === -1) colNgayMat = idx;
          }
          if (text.includes("địa chỉ") || text.includes("thường trú") || text.includes("quê quán")) {
            if (colDiaChi === -1) colDiaChi = idx;
          }
          if (text.includes("cccd") || text.includes("cmnd") || text.includes("căn cước")) {
            if (colCccd === -1) colCccd = idx;
          }
          if (text.includes("điện thoại") || text.includes("sđt") || text.includes("sdt")) {
            if (colSdt === -1) colSdt = idx;
          }
          if (text.includes("thân nhân") || text.includes("liên hệ") || text.includes("người thân")) {
            if (colNguoiLienHe === -1) colNguoiLienHe = idx;
          }
          if (text.includes("trích lục") || text.includes("quyết định") || text.includes("giấy tờ")) {
            if (colQuyetDinh === -1) colQuyetDinh = idx;
          }
          if (text.includes("ghi chú")) {
            if (colGhiChu === -1) colGhiChu = idx;
          }
          if (text.includes("trạng thái") || text.includes("hiện trạng")) {
            if (colTrangThai === -1) colTrangThai = idx;
          }
          if (text === "stt" || text === "số thứ tự") {
            if (colStt === -1) colStt = idx;
          }
        });

        if (colMaLo !== -1 && colName !== -1) {
          headerRowIndex = r;
          break;
        }
      }

      const isDefaultLayout = headerRowIndex === -1;
      const startRow = isDefaultLayout ? 0 : headerRowIndex + 1;
      const parsedRecords: any[] = [];

      for (let r = startRow; r < rows.length; r++) {
        const row = rows[r];
        if (!Array.isArray(row) || row.length === 0) continue;

        let maLo = "";
        let nguoiDuocCap = "";
        let rawNgayMat: any = "";
        let diaChi = "";
        let cccd = "";
        let sdt = "";
        let nguoiLienHe = "";
        let quyetDinh = "";
        let ghiChu = "";
        let trangThai = "";
        let stt = null;

        if (!isDefaultLayout) {
          maLo = colMaLo !== -1 ? String(row[colMaLo] || "").trim() : "";
          nguoiDuocCap = colName !== -1 ? String(row[colName] || "").trim() : "";
          rawNgayMat = colNgayMat !== -1 ? row[colNgayMat] : "";
          diaChi = colDiaChi !== -1 ? String(row[colDiaChi] || "").trim() : "";
          cccd = colCccd !== -1 ? String(row[colCccd] || "").trim() : "";
          sdt = colSdt !== -1 ? String(row[colSdt] || "").trim() : "";
          nguoiLienHe = colNguoiLienHe !== -1 ? String(row[colNguoiLienHe] || "").trim() : "";
          quyetDinh = colQuyetDinh !== -1 ? String(row[colQuyetDinh] || "").trim() : "";
          ghiChu = colGhiChu !== -1 ? String(row[colGhiChu] || "").trim() : "";
          trangThai = colTrangThai !== -1 ? String(row[colTrangThai] || "").trim() : "";
          stt = colStt !== -1 ? parseInt(String(row[colStt])) || null : null;
        } else {
          // File chuẩn nghĩa trang tự động định vị
          for (let c = 0; c < row.length; c++) {
            const val = String(row[c] || "").trim();
            if (/^mt/i.test(val)) {
              maLo = val;
              nguoiDuocCap = String(row[c + 1] || "").trim();
              stt = c > 0 ? parseInt(String(row[c - 1])) || null : null;
              rawNgayMat = row[9] || row[8] || "";
              if (row[12]) diaChi = String(row[12]).trim();
              break;
            }
          }
        }

        if (!maLo || !/^mt/i.test(maLo)) continue;
        if (maLo.toLowerCase().includes("mã") || maLo.toLowerCase().includes("lô")) continue;

        // Chuẩn hóa trạng thái
        if (!trangThai) {
          const lowerName = nguoiDuocCap.toLowerCase();
          if (!nguoiDuocCap || lowerName === "" || lowerName.includes("trống") || lowerName.includes("chưa chôn")) {
            trangThai = "Trống";
            nguoiDuocCap = "Chưa an táng";
          } else if (lowerName.includes("mộ chờ") || lowerName.includes("chờ") || lowerName.includes("sinh phần")) {
            trangThai = "Mộ chờ";
          } else if (lowerName.includes("cải táng")) {
            trangThai = "Mộ cải táng";
          } else {
            trangThai = "Mai táng";
          }
        }

        parsedRecords.push({
          stt,
          maLo,
          nguoiDuocCap: nguoiDuocCap || "Chưa an táng",
          trangThai,
          ngayMat: parseDateValue(rawNgayMat),
          diaChi: diaChi || null,
          cccd: cccd || null,
          soDienThoai: sdt || null,
          nguoiLienHe: nguoiLienHe || null,
          quyetDinhCapDat: quyetDinh || null,
          ghiChu: ghiChu || null,
        });
      }

      setImportRecords(parsedRecords);
    } catch (err) {
      console.error("Lỗi đọc file Excel:", err);
      alert("Không thể đọc file này. Vui lòng kiểm tra lại định dạng file .xlsx hoặc .csv");
    } finally {
      setIsParsing(false);
    }
  };

  // Gửi danh sách bản ghi import lên máy chủ
  const handleBulkImportSubmit = async () => {
    if (importRecords.length === 0) return;
    setIsImporting(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/admin/graves/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: importRecords,
          overwrite: importOverwrite,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setImportResult({ success: true, message: data.message });
        loadData();
      } else {
        setImportResult({ success: false, message: data.error || "Có lỗi xảy ra khi nạp dữ liệu." });
      }
    } catch {
      setImportResult({ success: false, message: "Lỗi kết nối máy chủ." });
    } finally {
      setIsImporting(false);
    }
  };

  const total = graves.length;
  const totalMaiTang = graves.filter((g) => g.trangThai === "Mai táng").length;
  const totalCaiTang = graves.filter((g) => g.trangThai === "Mộ cải táng").length;
  const totalMoCho = graves.filter((g) => g.trangThai === "Mộ chờ").length;
  const totalTrong = graves.filter((g) => g.trangThai === "Trống").length;

  // Đếm số lượng mộ thực tế của từng lô
  const getZoneCount = (zoneKey: string) => {
    const num = zoneKey.replace("A", "");
    const regex = new RegExp(`^mta${num}[^0-9]`, "i");
    return graves.filter((g) => regex.test(g.maLo)).length;
  };

  // Helper trích xuất số thứ tự khu (A4 -> 4, A10 -> 10) để sắp xếp tuần tự theo từng Lô
  const getZoneNumber = (maLo: string): number => {
    const match = maLo.match(/^mt\.?a(\d+)/i);
    return match ? parseInt(match[1]) : 999;
  };

  // Lọc dữ liệu hiển thị theo Tìm kiếm + Trạng thái + Phân bố 32 Lô và sắp xếp tuần tự
  const filteredGraves = graves
    .filter((g) => {
      const matchStatus = filterStatus === "ALL" || g.trangThai === filterStatus;
      
      let matchZone = true;
      if (filterZone !== "ALL") {
        const zoneNum = filterZone.replace("A", "");
        const zoneRegex = new RegExp(`^mta${zoneNum}[^0-9]`, "i");
        matchZone = zoneRegex.test(g.maLo);
      }

      const s = search.toLowerCase();
      const matchSearch =
        g.maLo.toLowerCase().includes(s) ||
        g.nguoiDuocCap.toLowerCase().includes(s) ||
        (g.cccd && g.cccd.toLowerCase().includes(s)) ||
        (g.soDienThoai && g.soDienThoai.toLowerCase().includes(s)) ||
        (g.nguoiLienHe && g.nguoiLienHe.toLowerCase().includes(s));

      return matchStatus && matchZone && matchSearch;
    })
    .sort((a, b) => {
      // Sắp xếp theo thứ tự Lô (A4 -> A5 -> A6 -> A7 -> A8 -> A9 -> A10 -> A11...)
      const zoneA = getZoneNumber(a.maLo);
      const zoneB = getZoneNumber(b.maLo);
      if (zoneA !== zoneB) return zoneA - zoneB;
      return (a.stt ?? 0) - (b.stt ?? 0);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* CityWork Style Dashboard Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Phần Mềm Quản Trị Nghĩa Trang Đô Thị — Chuẩn GIS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Ban Quản Lý Nghĩa Trang Trà Đa (Xã Biển Hồ, Gia Lai)
          </h1>
          <p className="text-xs text-slate-500 flex items-center space-x-2">
            <span>Cơ quan chủ quản: Ban Quản lý dịch vụ công Quy Nhơn - Sở Xây dựng tỉnh Gia Lai</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">Supabase Cloud PostgreSQL</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/qr-code"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-all"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>In Mã QR Cổng</span>
          </Link>

          {/* Nút Tiếp Nhận Mộ Mới với Dropdown 2 lựa chọn */}
          <div className="relative" ref={actionMenuRef}>
            <button
              type="button"
              onClick={() => setShowActionMenu(!showActionMenu)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Tiếp Nhận Mộ Mới</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showActionMenu ? "rotate-180" : ""}`} />
            </button>

            {showActionMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-1.5 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn phương thức tiếp nhận</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowActionMenu(false);
                    setShowAddModal(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 flex items-start space-x-3 transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs group-hover:text-blue-700">✍️ Nhập lẻ từng hồ sơ</div>
                    <div className="text-[11px] text-slate-500">Điền biểu mẫu thủ công cho từng mộ mới</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowActionMenu(false);
                    setShowImportModal(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/70 flex items-start space-x-3 transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs group-hover:text-emerald-700">📥 Nhập dữ liệu từ Excel / CSV</div>
                    <div className="text-[11px] text-slate-500">Tải file .xlsx, .csv nạp hàng loạt vào CSDL</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold transition"
            title="Đăng xuất khỏi phiên làm việc"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>

      {/* CityWork KPI Quản Lý Quỹ Đất An Táng */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">TỔNG LÔ SỐ HÓA</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Phân bố: 32 Lô (MT.A1 – A32)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ĐÃ AN TÁNG</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-blue-700">{totalMaiTang}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Tỷ lệ sử dụng đất:</span>
            <strong className="text-blue-700">{total > 0 ? Math.round((totalMaiTang / total) * 100) : 0}%</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">MỘ CHỜ / SINH PHẦN</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{totalMoCho}</div>
          <p className="text-[11px] text-slate-500">Đã đăng ký trước (trên 70 tuổi)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">LÔ TRỐNG / DỰ TRỮ</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{totalTrong}</div>
          <p className="text-[11px] text-slate-500">Sẵn sàng tiếp nhận hồ sơ</p>
        </div>
      </div>

      {/* Bảng Dữ Liệu Hạ Tầng & Hồ Sơ Điện Tử */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-5">
        {/* Bộ lọc đa năng kiểu CityWork */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Tên, Mã lô, CCCD, SĐT, Người liên hệ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Lọc Phân Khu & Trạng Thái */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="ALL">Tất cả 32 Lô (MT.A1 – A32)</option>
              {Array.from({ length: 32 }, (_, i) => i + 1).map((n) => {
                const key = `A${n}`;
                const count = getZoneCount(key);
                let statusLabel = "";
                if (ACTIVE_ZONES.has(key)) {
                  statusLabel = count > 0 ? `Đang hoạt động - ${count} mộ` : "Đang hoạt động";
                } else if (STOPPED_ZONES.has(key)) {
                  statusLabel = count > 0 ? `Dừng hoạt động - ${count} mộ` : "Dừng hoạt động";
                } else {
                  statusLabel = count > 0 ? `${count} mộ` : "Dự kiến";
                }
                return (
                  <option key={n} value={key}>
                    Lô MT.A{n} ({statusLabel})
                  </option>
                );
              })}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="ALL">Tất cả Trạng thái ({total})</option>
              <option value="Mai táng">Đã Mai táng ({totalMaiTang})</option>
              <option value="Mộ cải táng">Mộ cải táng ({totalCaiTang})</option>
              <option value="Mộ chờ">Mộ chờ (Sinh phần) ({totalMoCho})</option>
              <option value="Trống">Khu mộ trống ({totalTrong})</option>
            </select>

            <button
              onClick={loadData}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Bảng dữ liệu 14 cột nghiệp vụ */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider whitespace-nowrap">
              <tr>
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Mã Lô</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Hiện Trạng</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[160px]">Người Được Cấp Đất</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[120px]">Số CCCD</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[150px]">Người Thân Liên Hệ</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[120px]">Số Điện Thoại</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[220px]">Trích Lục / Giấy Tờ</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[240px]">Địa Chỉ Thường Trú</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap w-24">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredGraves.length > 0 ? (
                filteredGraves.map((g, idx) => (
                  <tr key={g.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3.5 px-3 text-slate-400 font-mono text-center whitespace-nowrap">{idx + 1}</td>
                    <td className="py-3.5 px-3.5 font-mono font-bold text-blue-700 bg-blue-50/40 whitespace-nowrap">
                      {g.maLo}
                    </td>
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      {g.trangThai === "Mai táng" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
                          Đã Mai táng
                        </span>
                      )}
                      {g.trangThai === "Mộ cải táng" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-1.5"></span>
                          Mộ cải táng
                        </span>
                      )}
                      {g.trangThai === "Mộ chờ" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                          Mộ chờ (Sinh phần)
                        </span>
                      )}
                      {g.trangThai === "Trống" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                          Khu mộ trống
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 font-bold text-slate-900 whitespace-nowrap">{g.nguoiDuocCap}</td>
                    <td className="py-3.5 px-3.5 font-mono text-slate-600 whitespace-nowrap">{g.cccd || "—"}</td>
                    <td className="py-3.5 px-3.5 font-medium whitespace-nowrap">{g.nguoiLienHe || "—"}</td>
                    <td className="py-3.5 px-3.5 font-mono whitespace-nowrap">
                      {g.soDienThoai ? (
                        <span className="text-slate-800">{g.soDienThoai}</span>
                      ) : (
                        <span className="inline-flex items-center text-amber-600 text-[11px] font-medium whitespace-nowrap">
                          <AlertTriangle className="w-3 h-3 mr-0.5" /> Chưa có
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 max-w-sm truncate text-slate-600" title={g.quyetDinhCapDat || ""}>
                      {g.quyetDinhCapDat || "—"}
                    </td>
                    <td className="py-3.5 px-3.5 max-w-sm truncate text-slate-600" title={g.diaChi || ""}>
                      {g.diaChi || "—"}
                    </td>
                    <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <Link
                          href={`/grave/${encodeURIComponent(g.maLo)}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-100/60 inline-flex items-center justify-center transition"
                          title="Xem trang công khai"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(g)}
                          className="text-amber-600 hover:text-amber-800 p-1.5 rounded-lg hover:bg-amber-100/60 inline-flex items-center justify-center transition"
                          title="Chỉnh sửa hồ sơ"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(g)}
                          className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-100/60 inline-flex items-center justify-center transition"
                          title="Xóa hồ sơ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    {loading ? "Đang tải dữ liệu hồ sơ từ Supabase..." : "Không tìm thấy hồ sơ nào phù hợp."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-slate-500 flex justify-between items-center pt-2">
          <span>Hiển thị <strong>{filteredGraves.length}</strong> / <strong>{graves.length}</strong> hồ sơ</span>
          <span className="text-[11px] text-slate-400">Khớp 100% với 14 cột nghiệp vụ CẤP ĐẤT NGHĨA TRANG 2026</span>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Tiếp Nhận & Thêm Mới Hồ Sơ Mộ Phần</h3>
                <p className="text-xs text-slate-500">Dữ liệu được cập nhật trực tiếp vào cơ sở dữ liệu Supabase Cloud</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chuyển đổi qua lại giữa Nhập lẻ & Nhập Excel */}
            <div className="flex border-b border-slate-100 pb-3 gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"
              >
                ✍️ Nhập lẻ từng hồ sơ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowImportModal(true);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
              >
                📥 Nhập từ file Excel / CSV
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Mã lô định danh (VD: MTA8.39) *</label>
                  <input
                    type="text"
                    required
                    placeholder="MTA8-..."
                    value={formData.maLo}
                    onChange={(e) => setFormData({ ...formData, maLo: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Trạng thái cấp đất *</label>
                  <select
                    value={formData.trangThai}
                    onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Mai táng">Đã mai táng</option>
                    <option value="Mộ cải táng">Mộ cải táng</option>
                    <option value="Mộ chờ">Mộ chờ (Sinh phần)</option>
                    <option value="Trống">Khu mộ trống</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Họ và tên người được cấp đất *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.nguoiDuocCap}
                    onChange={(e) => setFormData({ ...formData, nguoiDuocCap: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Số Căn cước công dân (CCCD)</label>
                  <input
                    type="text"
                    placeholder="12 chữ số"
                    value={formData.cccd}
                    onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Người thân liên hệ (Đại diện 1-1)</label>
                  <input
                    type="text"
                    placeholder="Họ và tên thân nhân"
                    value={formData.nguoiLienHe}
                    onChange={(e) => setFormData({ ...formData, nguoiLienHe: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Số điện thoại liên hệ chính</label>
                  <input
                    type="text"
                    placeholder="09..."
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Quyết định / Giấy giới thiệu / Trích lục khai tử</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Trích lục khai tử số 120/2026/TLKT do UBND phường..."
                  value={formData.quyetDinhCapDat}
                  onChange={(e) => setFormData({ ...formData, quyetDinhCapDat: e.target.value })}
                  className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Địa chỉ thường trú</label>
                <input
                  type="text"
                  placeholder="Số nhà, đường, phường/xã..."
                  value={formData.diaChi}
                  onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                  className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20"
                >
                  Lưu Vào Cơ Sở Dữ Liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Nhập Dữ Liệu Hàng Loạt Từ Excel / CSV</span>
                </h3>
                <p className="text-xs text-slate-500">Tự động đọc, phân tích cột và đồng bộ trực tiếp lên Supabase Cloud</p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportRecords([]);
                  setImportFileName("");
                  setImportResult(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chuyển đổi qua lại giữa Nhập lẻ & Nhập Excel */}
            <div className="flex border-b border-slate-100 pb-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setShowAddModal(true);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
              >
                ✍️ Nhập lẻ từng hồ sơ
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                📥 Nhập từ file Excel / CSV
              </button>
            </div>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition bg-slate-50/50 hover:bg-emerald-50/20 group">
              <input
                type="file"
                id="excel-file-input"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer block space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-800 group-hover:text-emerald-700">
                    Bấm vào đây để chọn file Excel / CSV
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">Hỗ trợ định dạng .xlsx, .xls, .csv từ máy tính</p>
                </div>
              </label>
            </div>

            {/* Parsing Indicator */}
            {isParsing && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-700 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Đang đọc và phân tích cấu trúc cột trong file Excel...</span>
              </div>
            )}

            {/* Import Result Alert */}
            {importResult && (
              <div
                className={`p-4 rounded-2xl text-xs border ${
                  importResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {importResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{importResult.success ? "Thành công!" : "Thông báo"}</span>
                </div>
                <p className="mt-1">{importResult.message}</p>
              </div>
            )}

            {/* Preview Section */}
            {importRecords.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="font-semibold text-slate-600">File đã chọn: </span>
                    <strong className="text-slate-900">{importFileName}</strong>
                    <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                      {importRecords.length} hồ sơ hợp lệ
                    </span>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={importOverwrite}
                      onChange={(e) => setImportOverwrite(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Ghi đè/cập nhật nếu đã có mã lô</span>
                  </label>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Xem trước 5 hồ sơ đầu tiên:
                  </p>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">STT</th>
                          <th className="py-2 px-3">Mã Lô</th>
                          <th className="py-2 px-3">Họ và Tên</th>
                          <th className="py-2 px-3">Hiện Trạng</th>
                          <th className="py-2 px-3">Ngày Mất</th>
                          <th className="py-2 px-3">Địa Chỉ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importRecords.slice(0, 5).map((rec, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-slate-400 font-mono">{rec.stt || idx + 1}</td>
                            <td className="py-2 px-3 font-mono font-bold text-blue-700">{rec.maLo}</td>
                            <td className="py-2 px-3 font-semibold text-slate-800">{rec.nguoiDuocCap}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {rec.trangThai}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600">
                              {rec.ngayMat ? new Date(rec.ngayMat).toLocaleDateString("vi-VN") : "—"}
                            </td>
                            <td className="py-2 px-3 text-slate-600 truncate max-w-xs">{rec.diaChi || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importRecords.length > 5 && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      ... và {importRecords.length - 5} hồ sơ khác sẵn sàng được nạp.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportRecords([]);
                  setImportFileName("");
                  setImportResult(null);
                }}
                className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-600 text-xs"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={importRecords.length === 0 || isImporting}
                onClick={handleBulkImportSubmit}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center space-x-1.5 transition ${
                  importRecords.length === 0 || isImporting
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 active:scale-[0.99]"
                }`}
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    <span>Đang nạp dữ liệu lên CSDL...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    <span>Tiến hành nạp {importRecords.length > 0 ? `(${importRecords.length})` : ""} vào CSDL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-amber-600" />
                  <span>Chỉnh Sửa Hồ Sơ Mộ Phần: {editFormData.maLo}</span>
                </h3>
                <p className="text-xs text-slate-500">Cập nhật thông tin chi tiết vào cơ sở dữ liệu Supabase Cloud</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Mã lô định danh *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.maLo}
                    onChange={(e) => setEditFormData({ ...editFormData, maLo: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Trạng thái cấp đất *</label>
                  <select
                    value={editFormData.trangThai}
                    onChange={(e) => setEditFormData({ ...editFormData, trangThai: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Mai táng">Đã mai táng</option>
                    <option value="Mộ cải táng">Mộ cải táng</option>
                    <option value="Mộ chờ">Mộ chờ (Sinh phần)</option>
                    <option value="Trống">Khu mộ trống</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Họ và tên người được cấp đất *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.nguoiDuocCap}
                    onChange={(e) => setEditFormData({ ...editFormData, nguoiDuocCap: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Số Căn cước công dân (CCCD)</label>
                  <input
                    type="text"
                    placeholder="12 chữ số"
                    value={editFormData.cccd}
                    onChange={(e) => setEditFormData({ ...editFormData, cccd: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Ngày sinh (nếu có)</label>
                  <input
                    type="date"
                    value={editFormData.ngaySinh}
                    onChange={(e) => setEditFormData({ ...editFormData, ngaySinh: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Ngày mất (nếu có)</label>
                  <input
                    type="date"
                    value={editFormData.ngayMat}
                    onChange={(e) => setEditFormData({ ...editFormData, ngayMat: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Người thân liên hệ (Đại diện 1-1)</label>
                  <input
                    type="text"
                    value={editFormData.nguoiLienHe}
                    onChange={(e) => setEditFormData({ ...editFormData, nguoiLienHe: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Số điện thoại liên hệ chính</label>
                  <input
                    type="text"
                    placeholder="09..."
                    value={editFormData.soDienThoai}
                    onChange={(e) => setEditFormData({ ...editFormData, soDienThoai: e.target.value })}
                    className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Quyết định / Giấy giới thiệu / Trích lục khai tử</label>
                <textarea
                  rows={2}
                  value={editFormData.quyetDinhCapDat}
                  onChange={(e) => setEditFormData({ ...editFormData, quyetDinhCapDat: e.target.value })}
                  className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Địa chỉ thường trú</label>
                <input
                  type="text"
                  value={editFormData.diaChi}
                  onChange={(e) => setEditFormData({ ...editFormData, diaChi: e.target.value })}
                  className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-500/20 flex items-center space-x-1.5"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      <span>Cập Nhật Thay Đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-extrabold text-lg text-slate-900">Xác Nhận Xóa Hồ Sơ Mộ Phần</h3>
              <p className="text-xs text-slate-600">
                Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ mộ{" "}
                <strong className="text-blue-700 font-mono font-bold">{deletingRecord.maLo}</strong> (
                <strong className="text-slate-900">{deletingRecord.nguoiDuocCap}</strong>) khỏi cơ sở dữ liệu Supabase Cloud không?
              </p>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-medium text-left">
                ⚠️ Cảnh báo: Dữ liệu này sẽ bị xóa khỏi hệ thống và không thể hoàn tác sau khi xác nhận.
              </div>
            </div>

            <div className="flex justify-center space-x-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingRecord(null);
                }}
                className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-600 text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-500/20 flex items-center space-x-1.5 transition active:scale-[0.99]"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1" />
                    <span>Xác Nhận Xóa Vĩnh Viễn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
