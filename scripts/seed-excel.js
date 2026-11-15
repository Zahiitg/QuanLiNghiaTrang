const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function excelSerialToDate(serial) {
  if (!serial || isNaN(serial)) return null;
  // Excel base date is Dec 30, 1899 due to leap year bug
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400 * 1000;
  return new Date(utcValue);
}

async function main() {
  console.log("=== Bắt đầu nạp dữ liệu từ file CẤP ĐẤT NGHĨA TRANG 2026.xlsx ===");

  let filePath = path.join(__dirname, "..", "docs", "CẤP ĐẤT NGHĨA TRANG 2026.xlsx");
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, "..", "CẤP ĐẤT NGHĨA TRANG 2026.xlsx");
  }
  if (!fs.existsSync(filePath)) {
    console.error("Không tìm thấy file Excel trong docs/ hoặc thư mục gốc:", filePath);
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // MT.A7
  const sheet = workbook.Sheets[sheetName];

  // Đọc dữ liệu dạng mảng dòng
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Dòng 0: Tiêu đề danh sách
  // Dòng 1: Header ['STT', 'Mã lô', 'Người được cấp', 'CCCD', 'Dân tộc', 'Quốc tịch', 'Ngày sinh', 'Ngày mất', 'Người liên hệ', 'SĐT', 'Địa chỉ', 'Quyết định/Giấy giới thiệu', 'Trạng Thái', 'Ghi chú']
  console.log("Tiêu đề cột:", rows[1]);

  let countSuccess = 0;
  let countSkipped = 0;

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[1]) {
      continue; // Bỏ qua dòng trống
    }

    const stt = typeof row[0] === "number" ? row[0] : parseInt(row[0]) || null;
    const maLo = String(row[1]).trim();
    const nguoiDuocCap = row[2] ? String(row[2]).trim() : "Chưa có tên";
    const cccd = row[3] ? String(row[3]).trim() : null;
    const danToc = row[4] ? String(row[4]).trim() : "Kinh";
    const quocTich = row[5] ? String(row[5]).trim() : "Việt Nam";

    const ngaySinh = typeof row[6] === "number" ? excelSerialToDate(row[6]) : null;
    const ngayMat = typeof row[7] === "number" ? excelSerialToDate(row[7]) : null;

    const nguoiLienHe = row[8] ? String(row[8]).trim() : null;
    const soDienThoai = row[9] ? String(row[9]).trim() : null;
    const diaChi = row[10] ? String(row[10]).trim() : null;
    const quyetDinhCapDat = row[11] ? String(row[11]).trim() : null;
    const trangThaiRaw = row[12] ? String(row[12]).trim() : "Trống";
    const ghiChu = row[13] ? String(row[13]).trim() : null;

    // Chuẩn hóa trạng thái
    let trangThai = "Trống";
    if (trangThaiRaw.toLowerCase().includes("mai táng")) {
      trangThai = "Mai táng";
    } else if (trangThaiRaw.toLowerCase().includes("mộ chờ")) {
      trangThai = "Mộ chờ";
    }

    try {
      await prisma.graveRecord.upsert({
        where: { maLo },
        update: {
          stt,
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
        },
        create: {
          stt,
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
        },
      });
      countSuccess++;
    } catch (err) {
      console.error(`Lỗi tại dòng ${i + 1} (Mã lô: ${maLo}):`, err.message);
      countSkipped++;
    }
  }

  console.log(`\n=== Hoàn tất nạp dữ liệu! ===`);
  console.log(`- Thành công: ${countSuccess} hồ sơ`);
  console.log(`- Lỗi / Bỏ qua: ${countSkipped} hồ sơ`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
