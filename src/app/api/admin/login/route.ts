import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Tài khoản chuẩn ban đầu hoặc xác thực database
    if (
      (username === "admin" && password === "admin123") ||
      (username === "bql" && password === "bql2026")
    ) {
      const response = NextResponse.json({
        success: true,
        user: { username, fullName: "Cán bộ BQL Nghĩa trang Trà Đa" },
      });

      // Set cookie phiên làm việc
      response.cookies.set("admin_session", "authenticated", {
        httpOnly: true,
        path: "/",
        maxAge: 8 * 60 * 60, // 8 tiếng theo SRS v2.0
      });

      return response;
    }

    return NextResponse.json(
      { error: "Sai tên đăng nhập hoặc mật khẩu" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
