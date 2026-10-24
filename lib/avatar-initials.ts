/**
 * Luật X1 (REDESIGN-V4, TYPE-AND-ICON §4 + INTERFACE-SPEC cổng X1):
 * ký tự initials của một tên Việt = chữ cái đầu (uppercase) của TỪ CUỐI
 * — tên gọi — sau khi NFC-normalize. Tên một từ → đúng 1 ký tự đó.
 * Người Việt được gọi bằng tên gọi, không bằng họ + đệm, nên cấm để
 * mặc định của bất kỳ thư viện nào quyết định glyph.
 *
 * Hàm thuần, không phụ thuộc DiceBear: nơi gọi (avatar.tsx) dùng kết
 * quả này làm seed-glyph cho style `initials` (glyph của style đó được
 * suy từ seed — xem ghi chú cơ chế trong avatar.tsx).
 */
export function initialsForName(name: string): string {
  const normalized = name.normalize('NFC').trim();
  if (!normalized) return '';
  const words = normalized.split(/\s+/).filter(Boolean);
  const last = words[words.length - 1];
  if (!last) return '';
  // Lấy ký tự đầu theo code point (an toàn với ký tự tổ hợp sau NFC).
  const first = [...last][0];
  return first ? first.toUpperCase() : '';
}
