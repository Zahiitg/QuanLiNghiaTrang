import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const graves = await prisma.graveRecord.findMany({
      where: { isArchived: false },
      orderBy: { stt: "asc" },
    });
    return NextResponse.json({ graves });
  } catch (error) {
    console.error("Lỗi lấy danh sách hồ sơ admin:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      maLo,
      trangThai,
      nguoiDuocCap,
      cccd,
      danToc,
      quocTich,
      ngaySinh,
      ngayMat,
      quyetDinhCapDat,
      nguoiLienHe,
      soDienThoai,
      diaChi,
      ghiChu,
    } = body;

    if (!maLo || !nguoiDuocCap) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Mã lô và Tên người được cấp." },
        { status: 400 }
      );
    }

    // Kiểm tra trùng mã lô
    const existing = await prisma.graveRecord.findUnique({
      where: { maLo: maLo.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Mã lô ${maLo} đã tồn tại trong hệ thống.` },
        { status: 409 }
      );
    }

    // Đếm STT lớn nhất
    const lastRecord = await prisma.graveRecord.findFirst({
      orderBy: { stt: "desc" },
    });
    const nextStt = (lastRecord?.stt || 0) + 1;

    const newRecord = await prisma.graveRecord.create({
      data: {
        stt: nextStt,
        maLo: maLo.trim(),
        trangThai: trangThai || "Mai táng",
        nguoiDuocCap: nguoiDuocCap.trim(),
        cccd: cccd ? cccd.trim() : null,
        danToc: danToc || "Kinh",
        quocTich: quocTich || "Việt Nam",
        ngaySinh: ngaySinh ? new Date(ngaySinh) : null,
        ngayMat: ngayMat ? new Date(ngayMat) : null,
        quyetDinhCapDat: quyetDinhCapDat || null,
        nguoiLienHe: nguoiLienHe ? nguoiLienHe.trim() : null,
        soDienThoai: soDienThoai ? soDienThoai.trim() : null,
        diaChi: diaChi ? diaChi.trim() : null,
        ghiChu: ghiChu || null,
      },
    });

    return NextResponse.json({ success: true, grave: newRecord });
  } catch (error) {
    console.error("Lỗi thêm mới hồ sơ:", error);
    return NextResponse.json({ error: "Lỗi lưu hồ sơ" }, { status: 500 });
  }
}
