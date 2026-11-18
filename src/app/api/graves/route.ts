import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { removeVietnameseAccents } from "@/lib/vietnamese";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || "ALL";

    // Lấy dữ liệu cơ bản
    const allRecords = await prisma.graveRecord.findMany({
      where: {
        isArchived: false,
        ...(status !== "ALL" ? { trangThai: status } : {}),
      },
      select: {
        id: true,
        stt: true,
        maLo: true,
        trangThai: true,
        nguoiDuocCap: true,
        ngaySinh: true,
        ngayMat: true,
        // Bảo mật: Không trả về cccd, so_dien_thoai, nguoi_lien_he, dia_chi
      },
      orderBy: [
        { maLo: "asc" },
      ],
    });

    if (!query) {
      return NextResponse.json({ graves: allRecords });
    }

    // Lọc theo tìm kiếm không dấu
    const normalizedQuery = removeVietnameseAccents(query);

    const filtered = allRecords.filter((record) => {
      const matchMaLo = record.maLo.toLowerCase().includes(query.toLowerCase());
      const normalizedName = removeVietnameseAccents(record.nguoiDuocCap);
      const matchName = normalizedName.includes(normalizedQuery);
      return matchMaLo || matchName;
    });

    return NextResponse.json({ graves: filtered });
  } catch (error) {
    console.error("Lỗi API tra cứu:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
