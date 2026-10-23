# BRAND — Còn Mấy Cái Tết Nữa?

## Nhận diện

- **Logo chính thức:** `public/products/brand/conmaytet-logo.svg` — hoa mai năm
  cánh màu kem, nhuỵ vàng đồng, trên nền đỏ sơn mài bo góc. Hoa mai là biểu
  tượng Tết quen thuộc; tông trang trọng, ấm, gợi sum vầy — không vui nhộn hoá
  một chủ đề cần sự nhẹ nhàng.
- **Màu thương hiệu:** đỏ sơn mài `#8C1D18` (brand), đậm hơn `#6E130E`
  (brand-deep), tint nền `#F6E3DE` (brand-soft). Khác rõ dichbome `#C22A44`
  (đỏ crimson sáng, hơi hồng) — màu của app này sẫm, nâu đỏ, trầm hơn.
- **Điểm nhấn phụ:** vàng đồng `#A87E1F` — chỉ dùng rất ít (nhuỵ hoa, đường
  kẻ, mốc số liệu), không bao giờ làm nền diện rộng.
- **Nền app:** giấy ấm `#FAF6EF`, mực `#221D1A`.
- **Không gradient** ở bất cứ đâu. Không tím-xanh kiểu template AI.
- **Font:** Be Vietnam Pro (nội dung, đủ dấu tiếng Việt) + Outfit (con số lớn,
  tiêu đề — font-display).

## Quy tắc artwork

Logo SVG là nguồn sự thật duy nhất. PNG cho SEO/PWA (icons, og.png) sinh bằng
`scripts/generate-brand-pngs.mjs` — script chỉ raster hoá/thu phóng nguyên
bản, không vẽ lại, không đổi màu. Icon maskable và apple-touch-icon đặt logo
nguyên bản trên nền giấy `#FAF6EF` vì nền tảng bắt buộc nền đục.
