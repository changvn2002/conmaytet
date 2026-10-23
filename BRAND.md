# BRAND — Còn Mấy Cái Tết Nữa?

## Nhận diện

- **Logo chính thức:** `public/products/brand/conmaytet-logo.svg` — bao lì xì
  vàng (thân `#C9A227`, nắp mở `#E9D48A`) cùng cành thông màu giấy vươn lên,
  trên nền xanh thông bo góc. Motif lì xì + cành thông là dấu hiệu của Tết và
  của sự sum vầy bền lâu — ấm, trang trọng, không vui nhộn hoá một chủ đề cần
  sự nhẹ nhàng.
- **Màu thương hiệu:** xanh thông `#1F4D3A` (brand), đậm hơn `#14342A`
  (brand-deep), tint nền `#E3EDE6` (brand-soft). Đây là hệ duy nhất thuộc họ
  xanh lục trong bộ mini app (dichbome crimson, sodam indigo, chiatien amber)
  — che logo vẫn phân biệt được bằng hue + motif.
- **Điểm nhấn phụ:** vàng lì xì `#C9A227` — **chỉ dùng cho đồ hoạ** (thân bao
  lì xì, đường nhấn dưới con số, vòng mốc «tuần này»), không bao giờ làm nền
  diện rộng. Vàng **không bao giờ làm chữ trên nền sáng** (chỉ đạt 2,26:1 trên
  giấy); khi vàng cần thành chữ trên nền sáng, dạng hợp lệ duy nhất là vàng
  chữ `#6B5510`.
- **Nền app:** giấy ấm `#FBF7EC`, mực `#1C2420`.
- **Không gradient** ở bất cứ đâu. Không nền tối ở bất kỳ bề mặt nào.
- **Font:** Baloo 2 (font-display — con số sân khấu, tiêu đề; đã kiểm chứng
  glyph tiếng Việt 90/90 ở mức file) + Be Vietnam Pro (nội dung).

## Quy tắc artwork

Logo SVG là nguồn sự thật duy nhất — giữ nguyên tỉ lệ gốc, không cắt, không
đặt lại màu. Toàn bộ PNG/icon/OG của app lấy từ **bộ asset redesign-v2**:
file nguồn SVG và script tái sản xuất `build-assets.mjs` nằm ở
`~/workspace/mini-apps/redesign-v2/conmaytet/assets/` (raster hoá bằng resvg,
chữ trên OG là đường vector trích từ chính file Baloo 2 đã kiểm chứng — không
nướng bằng font thay thế). Không còn sinh artwork từ script cũ trong repo
(`scripts/generate-brand-pngs.mjs` chỉ còn là tài liệu tham khảo lịch sử).
