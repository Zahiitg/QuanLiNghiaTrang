"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  QrCode,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  LayoutGrid,
  FileText,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Edit,
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [graves, setGraves] = useState<GraveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  // Form states for new grave
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

  // Tính toán KPI
  const total = graves.length;
  const totalMaiTang = graves.filter((g) => g.trangThai === "Mai táng").length;
  const totalMoCho = graves.filter((g) => g.trangThai === "Mộ chờ").length;
  const totalTrong = graves.filter((g) => g.trangThai === "Trống").length;

  // Lọc dữ liệu hiển thị
  const filteredGraves = graves.filter((g) => {
    const matchStatus = filterStatus === "ALL" || g.trangThai === filterStatus;
    const s = search.toLowerCase();
    const matchSearch =
      g.maLo.toLowerCase().includes(s) ||
      g.nguoiDuocCap.toLowerCase().includes(s) ||
      (g.cccd && g.cccd.toLowerCase().includes(s)) ||
      (g.soDienThoai && g.soDienThoai.toLowerCase().includes(s)) ||
      (g.nguoiLienHe && g.nguoiLienHe.toLowerCase().includes(s));
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Bar with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản Trị Hồ Sơ Nghĩa Trang Trà Đa
          </h2>
          <p className="text-xs text-slate-500">
            Dữ liệu số hóa chính thức — UBND xã Biển Hồ, TP. Pleiku
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/qr-code"
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-pastel-blue-300 text-slate-700 rounded-xl text-xs font-medium transition"
          >
            <QrCode className="w-4 h-4 text-pastel-blue-600" />
            <span>Tải Mã QR Tra Cứu</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-pastel-blue-600 hover:bg-pastel-blue-700 text-white rounded-xl text-xs font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Hồ Sơ Mới</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-medium transition"
            title="Đăng xuất phiên làm việc"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">TỔNG HỒ SƠ</span>
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <p className="text-xs text-slate-500">Khu A7 & A8 hiện hữu</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-semibold text-slate-500">ĐÃ MAI TÁNG</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{totalMaiTang}</div>
          <p className="text-xs text-slate-500">Đã tiếp nhận an táng</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold text-slate-500">MỘ CHỜ</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{totalMoCho}</div>
          <p className="text-xs text-slate-500">Đăng ký trước người cao tuổi</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold text-slate-500">LÔ ĐẤT TRỐNG</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{totalTrong}</div>
          <p className="text-xs text-slate-500">Sẵn sàng bố trí</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Tên, Mã lô, CCCD, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pastel-blue-400 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-pastel-blue-400 transition"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Mai táng">Đã Mai táng</option>
              <option value="Mộ chờ">Mộ chờ</option>
              <option value="Trống">Trống</option>
            </select>

            <button
              onClick={loadData}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
              title="Tải lại danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">STT</th>
                <th className="py-3 px-3">Mã lô</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-3">Người được cấp</th>
                <th className="py-3 px-3">CCCD</th>
                <th className="py-3 px-3">Người liên hệ</th>
                <th className="py-3 px-3">Số ĐT</th>
                <th className="py-3 px-3">Quyết định / Hồ sơ</th>
                <th className="py-3 px-3">Địa chỉ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredGraves.length > 0 ? (
                filteredGraves.map((g, idx) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 text-slate-400">{g.stt || idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{g.maLo}</td>
                    <td className="py-2.5 px-3">
                      {g.trangThai === "Mai táng" && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-pastel-badge-maitangBg text-pastel-badge-maitangText border border-indigo-200">
                          Mai táng
                        </span>
                      )}
                      {g.trangThai === "Mộ chờ" && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-pastel-badge-mochoBg text-pastel-badge-mochoText border border-amber-200">
                          Mộ chờ
                        </span>
                      )}
                      {g.trangThai === "Trống" && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-pastel-badge-trongBg text-pastel-badge-trongText border border-emerald-200">
                          Trống
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{g.nguoiDuocCap}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{g.cccd || "—"}</td>
                    <td className="py-2.5 px-3">{g.nguoiLienHe || "—"}</td>
                    <td className="py-2.5 px-3">
                      {g.soDienThoai ? (
                        <span className="font-mono text-slate-700">{g.soDienThoai}</span>
                      ) : (
                        <span className="inline-flex items-center text-amber-600 text-[11px] font-medium">
                          <AlertTriangle className="w-3 h-3 mr-0.5" /> Chưa có
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-500" title={g.quyetDinhCapDat || ""}>
                      {g.quyetDinhCapDat || "—"}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-500" title={g.diaChi || ""}>
                      {g.diaChi || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    {loading ? "Đang tải dữ liệu hồ sơ..." : "Không tìm thấy hồ sơ nào phù hợp."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-slate-500 flex justify-between items-center pt-2">
          <span>Hiển thị {filteredGraves.length} / {graves.length} hồ sơ</span>
          <span className="text-[11px] text-slate-400">Hệ thống đồng bộ 100% với file Excel CẤP ĐẤT NGHĨA TRANG 2026</span>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Thêm Mới Hồ Sơ Mộ Phần</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Mã lô (VD: MTA7-757) *</label>
                  <input
                    type="text"
                    required
                    value={formData.maLo}
                    onChange={(e) => setFormData({ ...formData, maLo: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Trạng thái *</label>
                  <select
                    value={formData.trangThai}
                    onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border rounded-lg"
                  >
                    <option value="Mai táng">Mai táng</option>
                    <option value="Mộ chờ">Mộ chờ</option>
                    <option value="Trống">Trống</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Họ và tên người được cấp *</label>
                  <input
                    type="text"
                    required
                    value={formData.nguoiDuocCap}
                    onChange={(e) => setFormData({ ...formData, nguoiDuocCap: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Số CCCD</label>
                  <input
                    type="text"
                    value={formData.cccd}
                    onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Người liên hệ / Thân nhân</label>
                  <input
                    type="text"
                    value={formData.nguoiLienHe}
                    onChange={(e) => setFormData({ ...formData, nguoiLienHe: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Quyết định / Giấy giới thiệu / Khai tử</label>
                <textarea
                  rows={2}
                  value={formData.quyetDinhCapDat}
                  onChange={(e) => setFormData({ ...formData, quyetDinhCapDat: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border rounded-lg"
                  placeholder="Ví dụ: Trích lục khai tử số... do UBND phường..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Địa chỉ thường trú</label>
                <input
                  type="text"
                  value={formData.diaChi}
                  onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pastel-blue-600 hover:bg-pastel-blue-700 text-white rounded-xl font-medium"
                >
                  Lưu Hồ Sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
