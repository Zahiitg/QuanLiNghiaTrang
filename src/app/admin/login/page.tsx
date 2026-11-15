"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Tên đăng nhập hoặc mật khẩu không chính xác.");
      } else {
        // Lưu token hoặc cookie
        router.push("/admin");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ xác thực.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-pastel-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Về trang tra cứu công khai</span>
        </Link>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-pastel-blue-50 border border-pastel-blue-100 rounded-xl flex items-center justify-center text-pastel-blue-600 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Đăng Nhập Quản Trị</h2>
            <p className="text-xs text-slate-500">
              Dành riêng cho cán bộ Ban Quản lý Nghĩa trang & UBND xã Biển Hồ
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pastel-blue-400 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pastel-blue-400 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-pastel-blue-600 hover:bg-pastel-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Đang xác thực..." : "Đăng Nhập"}
            </button>
          </form>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 text-center">
            Tài khoản mặc định: <span className="font-mono text-slate-700">admin</span> / <span className="font-mono text-slate-700">admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
