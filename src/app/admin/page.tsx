"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Download
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
  const [filterZone, setFilterZone] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

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

  const total = graves.length;
  const totalMaiTang = graves.filter((g) => g.trangThai === "Mai táng").length;
  const totalMoCho = graves.filter((g) => g.trangThai === "Mộ chờ").length;
  const totalTrong = graves.filter((g) => g.trangThai === "Trống").length;

  // Lọc dữ liệu hiển thị theo Tìm kiếm + Trạng thái + Phân bố 32 Lô
  const filteredGraves = graves.filter((g) => {
    const matchStatus = filterStatus === "ALL" || g.trangThai === filterStatus;
    const matchZone =
      filterZone === "ALL" ||
      g.maLo.toLowerCase().startsWith(`mta${filterZone.replace("A", "")}`);

    const s = search.toLowerCase();
    const matchSearch =
      g.maLo.toLowerCase().includes(s) ||
      g.nguoiDuocCap.toLowerCase().includes(s) ||
      (g.cccd && g.cccd.toLowerCase().includes(s)) ||
      (g.soDienThoai && g.soDienThoai.toLowerCase().includes(s)) ||
      (g.nguoiLienHe && g.nguoiLienHe.toLowerCase().includes(s));

    return matchStatus && matchZone && matchSearch;
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

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Tiếp Nhận Mộ Mới</span>
          </button>

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
              <option value="A7">Lô MT.A7 (Đang sử dụng - 195 mộ)</option>
              {Array.from({ length: 32 }, (_, i) => i + 1)
                .filter((n) => n !== 7)
                .map((n) => (
                  <option key={n} value={`A${n}`}>
                    Lô MT.A{n}
                  </option>
                ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="ALL">Tất cả Trạng thái ({total})</option>
              <option value="Mai táng">Đã Mai táng ({totalMaiTang})</option>
              <option value="Mộ chờ">Mộ chờ ({totalMoCho})</option>
              <option value="Trống">Lô Trống ({totalTrong})</option>
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
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3.5">STT</th>
                <th className="py-3 px-3.5">Mã Định Danh Lô</th>
                <th className="py-3 px-3.5">Hiện Trạng</th>
                <th className="py-3 px-3.5">Người Được Cấp Đất</th>
                <th className="py-3 px-3.5">Số CCCD</th>
                <th className="py-3 px-3.5">Người Thân Liên Hệ</th>
                <th className="py-3 px-3.5">Số Điện Thoại</th>
                <th className="py-3 px-3.5">Trích Lục / Giấy Tờ</th>
                <th className="py-3 px-3.5">Địa Chỉ Thường Trú</th>
                <th className="py-3 px-3.5 text-center">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredGraves.length > 0 ? (
                filteredGraves.map((g, idx) => (
                  <tr key={g.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3 px-3.5 text-slate-400 font-mono">{g.stt || idx + 1}</td>
                    <td className="py-3 px-3.5 font-mono font-bold text-blue-700 bg-blue-50/40">
                      {g.maLo}
                    </td>
                    <td className="py-3 px-3.5">
                      {g.trangThai === "Mai táng" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Mai táng
                        </span>
                      )}
                      {g.trangThai === "Mộ chờ" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Mộ chờ
                        </span>
                      )}
                      {g.trangThai === "Trống" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Trống
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-900">{g.nguoiDuocCap}</td>
                    <td className="py-3 px-3.5 font-mono text-slate-600">{g.cccd || "—"}</td>
                    <td className="py-3 px-3.5 font-medium">{g.nguoiLienHe || "—"}</td>
                    <td className="py-3 px-3.5 font-mono">
                      {g.soDienThoai ? (
                        <span className="text-slate-800">{g.soDienThoai}</span>
                      ) : (
                        <span className="inline-flex items-center text-amber-600 text-[11px] font-medium">
                          <AlertTriangle className="w-3 h-3 mr-0.5" /> Chưa có
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 max-w-xs truncate text-slate-500" title={g.quyetDinhCapDat || ""}>
                      {g.quyetDinhCapDat || "—"}
                    </td>
                    <td className="py-3 px-3.5 max-w-xs truncate text-slate-500" title={g.diaChi || ""}>
                      {g.diaChi || "—"}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <Link
                        href={`/grave/${encodeURIComponent(g.maLo)}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 p-1 inline-block"
                        title="Xem trang công khai"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
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

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Mã lô định danh (VD: MTA7-757) *</label>
                  <input
                    type="text"
                    required
                    placeholder="MTA7-..."
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
                    <option value="Mai táng">Mai táng</option>
                    <option value="Mộ chờ">Mộ chờ (Sinh phần)</option>
                    <option value="Trống">Trống</option>
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
    </div>
  );
}
