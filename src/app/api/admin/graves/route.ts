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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
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

    if (!id || !maLo || !nguoiDuocCap) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp ID, Mã lô và Tên người được cấp." },
        { status: 400 }
      );
    }

    const graveId = Number(id);

    // Kiểm tra trùng mã lô với hồ sơ khác
    const existing = await prisma.graveRecord.findFirst({
      where: {
        maLo: maLo.trim(),
        NOT: { id: graveId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Mã lô ${maLo} đã được sử dụng bởi hồ sơ khác.` },
        { status: 409 }
      );
    }

    const updated = await prisma.graveRecord.update({
      where: { id: graveId },
      data: {
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

    return NextResponse.json({ success: true, grave: updated });
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ:", error);
    return NextResponse.json({ error: "Lỗi cập nhật hồ sơ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    let id = idParam ? parseInt(idParam) : null;

    if (!id) {
      try {
        const body = await req.json();
        if (body.id) id = parseInt(body.id);
      } catch {
        // không có body json
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Vui lòng cung cấp ID cần xóa." }, { status: 400 });
    }

    await prisma.graveRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa hồ sơ thành công." });
  } catch (error) {
    console.error("Lỗi xóa hồ sơ:", error);
    return NextResponse.json({ error: "Không thể xóa hồ sơ này." }, { status: 500 });
  }
}
