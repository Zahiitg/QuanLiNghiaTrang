import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface ImportRecord {
  stt?: number | null;
  maLo: string;
  trangThai?: string;
  nguoiDuocCap: string;
  cccd?: string | null;
  danToc?: string | null;
  quocTich?: string | null;
  ngaySinh?: string | null;
  ngayMat?: string | null;
  quyetDinhCapDat?: string | null;
  nguoiLienHe?: string | null;
  soDienThoai?: string | null;
  diaChi?: string | null;
  ghiChu?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { records, overwrite = true } = body as {
      records: ImportRecord[];
      overwrite?: boolean;
    };

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "Danh sách hồ sơ không hợp lệ hoặc rỗng." },
        { status: 400 }
      );
    }

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Lấy STT lớn nhất hiện tại làm mốc
    const lastRec = await prisma.graveRecord.findFirst({
      orderBy: { stt: "desc" },
    });
    let currentMaxStt = lastRec?.stt || 0;

    // Xử lý từng bản ghi
    for (const item of records) {
      const maLoTrimmed = item.maLo ? String(item.maLo).trim() : "";
      const nameTrimmed = item.nguoiDuocCap ? String(item.nguoiDuocCap).trim() : "";

      if (!maLoTrimmed || !nameTrimmed) {
        skippedCount++;
        continue;
      }

      // Xác định ngày mất hợp lệ
      let parsedNgayMat: Date | null = null;
      if (item.ngayMat) {
        const d = new Date(item.ngayMat);
        if (!isNaN(d.getTime())) {
          parsedNgayMat = d;
        }
      }

      // Xác định ngày sinh hợp lệ
      let parsedNgaySinh: Date | null = null;
      if (item.ngaySinh) {
        const d = new Date(item.ngaySinh);
        if (!isNaN(d.getTime())) {
          parsedNgaySinh = d;
        }
      }

      const existing = await prisma.graveRecord.findUnique({
        where: { maLo: maLoTrimmed },
      });

      if (existing) {
        if (overwrite) {
          await prisma.graveRecord.update({
            where: { maLo: maLoTrimmed },
            data: {
              trangThai: item.trangThai || existing.trangThai,
              nguoiDuocCap: nameTrimmed,
              cccd: item.cccd !== undefined ? (item.cccd ? String(item.cccd).trim() : null) : existing.cccd,
              diaChi: item.diaChi !== undefined ? (item.diaChi ? String(item.diaChi).trim() : null) : existing.diaChi,
              ngayMat: parsedNgayMat ?? existing.ngayMat,
              ngaySinh: parsedNgaySinh ?? existing.ngaySinh,
              nguoiLienHe: item.nguoiLienHe !== undefined ? (item.nguoiLienHe ? String(item.nguoiLienHe).trim() : null) : existing.nguoiLienHe,
              soDienThoai: item.soDienThoai !== undefined ? (item.soDienThoai ? String(item.soDienThoai).trim() : null) : existing.soDienThoai,
              quyetDinhCapDat: item.quyetDinhCapDat !== undefined ? item.quyetDinhCapDat : existing.quyetDinhCapDat,
              ghiChu: item.ghiChu !== undefined ? item.ghiChu : existing.ghiChu,
            },
          });
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        currentMaxStt++;
        await prisma.graveRecord.create({
          data: {
            stt: item.stt || currentMaxStt,
            maLo: maLoTrimmed,
            trangThai: item.trangThai || "Mai táng",
            nguoiDuocCap: nameTrimmed,
            cccd: item.cccd ? String(item.cccd).trim() : null,
            danToc: item.danToc || "Kinh",
            quocTich: item.quocTich || "Việt Nam",
            ngaySinh: parsedNgaySinh,
            ngayMat: parsedNgayMat,
            quyetDinhCapDat: item.quyetDinhCapDat || null,
            nguoiLienHe: item.nguoiLienHe ? String(item.nguoiLienHe).trim() : null,
            soDienThoai: item.soDienThoai ? String(item.soDienThoai).trim() : null,
            diaChi: item.diaChi ? String(item.diaChi).trim() : null,
            ghiChu: item.ghiChu || null,
          },
        });
        addedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã nạp thành công ${addedCount + updatedCount} hồ sơ (${addedCount} thêm mới, ${updatedCount} cập nhật, ${skippedCount} bỏ qua).`,
      addedCount,
      updatedCount,
      skippedCount,
      totalProcessed: records.length,
    });
  } catch (error) {
    console.error("Lỗi bulk import hồ sơ:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ trong quá trình nhập dữ liệu." },
      { status: 500 }
    );
  }
}
