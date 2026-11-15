const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function addEmptyGraves() {
  const emptyLots = [
    { maLo: "MTA7-757", stt: 186 },
    { maLo: "MTA7-758", stt: 187 },
    { maLo: "MTA7-759", stt: 188 },
    { maLo: "MTA7-760", stt: 189 },
    { maLo: "MTA7-761", stt: 190 },
    { maLo: "MTA7-762", stt: 191 },
    { maLo: "MTA7-763", stt: 192 },
    { maLo: "MTA7-764", stt: 193 },
    { maLo: "MTA7-765", stt: 194 },
    { maLo: "MTA7-766", stt: 195 },
  ];

  for (const lot of emptyLots) {
    await prisma.graveRecord.upsert({
      where: { maLo: lot.maLo },
      update: {
        trangThai: "Trống",
        nguoiDuocCap: "Lô đất trống (Dự trữ an táng)",
        ghiChu: "Quỹ đất dự trữ an táng theo quy hoạch Khu A7 - Nghĩa trang Trà Đa",
      },
      create: {
        stt: lot.stt,
        maLo: lot.maLo,
        trangThai: "Trống",
        nguoiDuocCap: "Lô đất trống (Dự trữ an táng)",
        danToc: "Kinh",
        quocTich: "Việt Nam",
        ghiChu: "Quỹ đất dự trữ an táng theo quy hoạch Khu A7 - Nghĩa trang Trà Đa",
      },
    });
  }
  console.log("Đã thêm 10 lô đất trống quy hoạch (MTA7-757 -> MTA7-766) vào Supabase thành công!");
}

addEmptyGraves()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
