/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành không dấu để phục vụ tìm kiếm gần đúng (fuzzy search).
 * Ví dụ: "Nguyễn Đức Kiệt" -> "nguyen duc kiet"
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
}

/**
 * Định dạng ngày Date thành chuỗi hiển thị chuẩn Việt Nam: dd/MM/yyyy
 */
export function formatDateVN(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "Chưa cập nhật";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "Chưa cập nhật";
  
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
