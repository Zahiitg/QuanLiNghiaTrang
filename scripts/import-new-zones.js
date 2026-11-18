const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function parseDate(str) {
  if (!str) return null;
  const s = String(str).trim();
  if (!s || s === "Không Đào") return null;

  // Dạng YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(s)) {
    const parts = s.split(" ")[0].split("-");
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]) - 1;
    const d = parseInt(parts[2]);
    if (y >= 1900 && y <= 2100) {
      const date = new Date(Date.UTC(y, m, d));
      if (!isNaN(date.getTime())) return date;
    }
  }

  // Dạng M/D/YYYY hoặc D/M/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const parts = s.split("/");
    const m = parseInt(parts[0]) - 1;
    const d = parseInt(parts[1]);
    const y = parseInt(parts[2]);
    if (y >= 1900 && y <= 2100) {
      const date = new Date(Date.UTC(y, m, d));
      if (!isNaN(date.getTime())) return date;
    }
  }

  const d = new Date(s);
  if (!isNaN(d.getTime()) && d.getFullYear() >= 1900 && d.getFullYear() <= 2100) {
    return d;
  }
  return null;
}

function parseCSVLine(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

async function processFile(filePath, zoneName) {
  console.log(`\n========================================`);
  console.log(`>>> Bắt đầu xử lý khu ${zoneName}: ${path.basename(filePath)}`);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`File không tồn tại: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const records = [];

  for (let i = 0; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const maLo = cols[1] ? cols[1].trim() : "";

    if (!maLo || !maLo.toUpperCase().startsWith("MT") || maLo.toUpperCase().includes("MÃ LÔ")) {
      continue;
    }

    const sttRaw = cols[0] ? cols[0].trim() : "";
    const stt = parseInt(sttRaw) || null;
    const rawNguoiDuocCap = cols[2] ? cols[2].trim() : "";
    const diaChi = cols[12] ? cols[12].trim() : null;
    const rawNgayMat = (cols[9] && cols[9].trim()) ? cols[9].trim() : (cols[8] ? cols[8].trim() : "");
    const ngayMat = parseDate(rawNgayMat);

    let nguoiDuocCap = rawNguoiDuocCap;
    let trangThai = "Mai táng";

    const lower = rawNguoiDuocCap.toLowerCase();
    if (!rawNguoiDuocCap || rawNguoiDuocCap === "") {
      trangThai = "Trống";
      nguoiDuocCap = "Chưa có thông tin";
    } else if (lower.includes("mộ chờ") || lower.includes("mộ chơ") || lower.startsWith("chờ")) {
      trangThai = "Mộ chờ";
    } else if (rawNguoiDuocCap.includes("...")) {
      trangThai = "Trống";
    }

    records.push({
      stt,
      maLo,
      trangThai,
      nguoiDuocCap,
      diaChi,
      danToc: "Kinh",
      quocTich: "Việt Nam",
      ngayMat,
    });
  }

  let successCount = 0;
  let skippedCount = 0;
  const CHUNK_SIZE = 30;

  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    const chunk = records.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async (item) => {
        try {
          await prisma.graveRecord.upsert({
            where: { maLo: item.maLo },
            update: {
              stt: item.stt,
              trangThai: item.trangThai,
              nguoiDuocCap: item.nguoiDuocCap,
              diaChi: item.diaChi || undefined,
              ngayMat: item.ngayMat || undefined,
            },
            create: item,
          });
          successCount++;
        } catch (err) {
          skippedCount++;
        }
      })
    );
    process.stdout.write(`Đã nạp: ${successCount}/${records.length}...\r`);
  }

  console.log(`\nKết quả khu ${zoneName}: ${successCount} thành công, ${skippedCount} lỗi.`);
}

async function main() {
  const dataDir = path.join(__dirname, "..", "data");
  const files = [
    { file: path.join(dataDir, "part_A4.csv"), zone: "A4" },
    { file: path.join(dataDir, "part_A5.csv"), zone: "A5" },
    { file: path.join(dataDir, "part_A6.csv"), zone: "A6" },
    { file: path.join(dataDir, "part_A8.csv"), zone: "A8" },
    { file: path.join(dataDir, "part_A9.csv"), zone: "A9" },
    { file: path.join(dataDir, "part_A10.csv"), zone: "A10" },
    { file: path.join(dataDir, "part_A11.csv"), zone: "A11" },
  ];

  for (const item of files) {
    await processFile(item.file, item.zone);
  }

  const total = await prisma.graveRecord.count();
  console.log(`\n========================================`);
  console.log(`TỔNG SỐ HỒ SƠ MỘ PHẦN TRONG DATABASE HIỆN TẠI: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
