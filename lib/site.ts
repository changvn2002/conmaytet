/**
 * Thông tin site dùng chung cho SEO/PWA: layout (metadata, JSON-LD), robots.ts,
 * sitemap.ts, manifest.ts cùng đọc từ đây để không lệch nhau.
 *
 * NEXT_PUBLIC_SITE_URL — URL gốc của bản production (không có slash cuối).
 * Mặc định là domain Vercel dự kiến của repo này; khi có domain chính thức,
 * chỉ cần đặt biến môi trường lúc deploy, không phải sửa code.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://conmaytet.vercel.app'
).replace(/\/+$/, '');

export const SITE_NAME = 'Còn Mấy Cái Tết Nữa?';

export const SITE_TITLE =
  'Còn Mấy Cái Tết Nữa? — Còn bao nhiêu cái Tết với bố mẹ? Tính theo tuổi thọ Việt Nam';

export const SITE_DESCRIPTION =
  'Còn mấy cái Tết nữa được sum vầy bên bố mẹ? Nhập năm sinh của bạn và của bố mẹ, công cụ ước tính còn bao nhiêu cái Tết với bố mẹ và còn khoảng bao nhiêu lần gặp nữa — theo bảng tuổi thọ trung bình Việt Nam (WHO) — kèm lưới tuần cuộc đời của chính bạn. Ước tính thống kê để trân trọng thời gian bên gia đình, không phải bói toán.';
