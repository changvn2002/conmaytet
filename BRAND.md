# BRAND — Còn Mấy Cái Tết Nữa? (hệ lens-04)

> Tài liệu này thay thế bản brand REDESIGN-V4. Mark «Một Vòng Năm»,
> hero-ring và bề mặt reveal Green 100 của V4 đã chết toàn bộ theo
> phán quyết của chương trình conmaytet-redesign (user bác V4 +
> chấm mù 2 vòng chọn lens-04). Nguồn sự thật màu:
> `design/tokens.conmaytet-v4.json` (nay chứa hệ lens-04).

## Nhận diện

- **Mark mới:** tile bo góc nền seed `#198038` + glyph cành đào trắng
  rút gọn (thân cong + 2–3 hoa vẽ bằng path cánh thật, nhị gold) —
  đọc được ở 16px nhờ biến thể micro (glyph to, nét dày hơn, 0 gold).
  Bộ asset chính thức ở `public/products/brand/`:
  - `conmaytet-mark.svg` — mark thường trú (favicon SVG, header qua
    ảnh + wordmark chữ HTML).
  - `conmaytet-mark-micro.svg` — bản micro cho ≤20px (entry favicon
    16px sinh từ tổ hợp này).
  - `conmaytet-mono.svg` — mono mực `#16191D` cho bề mặt đơn sắc.
  - `conmaytet-lockup.svg` — mark + wordmark Baloo 2 800 dạng `<text>`
    (chỉ dùng ở bề mặt web có font; pipeline PNG không dùng lockup).
  - `conmaytet-app-icon.svg` — tile cài đặt full-bleed seed, glyph
    trong vùng sống 80% (an toàn maskable).
  - `conmaytet-branch.svg` — cành đào nguyên cành (artwork nguồn của
    hero + OG); bản React ở `components/conmaytet/branch.tsx`.
- **OG:** `/og.png` (1200×630) — nền canvas `#F6F7F6` + app-icon +
  cành đào, 0 số kết quả cá nhân, 0 chữ hệ thống.
- PNG/ICO sinh bằng `scripts/generate-brand-pngs.mjs` (chỉ raster
  hoá/trích nhóm hình, không vẽ lại).

## Cành đào (minh hoạ duy nhất)

Vẽ bằng **path cánh thật**: cánh có khía V ở đầu, hai vai không đối
xứng tuyệt đối, 2 lớp cánh (ngoài `#F6B8C6`, trong `#FBD9E0`), nhị
gold `#F1C21B`, thân nâu `#8A5A36` thon dần theo đoạn, đủ nụ + hoa
hé + hoa nở + lá seed. **Cấm** vẽ hoa bằng 5 vòng tròn đều nhau kiểu
sticker (lỗi của mock vòng 1, panel đã chê). Cành luôn đứng trên nền
TRUNG TÍNH (trắng/xám cực nhạt của thẻ) — không panel hồng riêng;
hồng chỉ ở cánh hoa. Xuất hiện: hero form (lớn), header thẻ chia sẻ
(biến tấu cắt cúp/lật hướng), mark (glyph rút gọn). Reveal + lưới
tuần: không minh hoạ.

## Màu thương hiệu

- **Seed:** `#198038` (Carbon Green 60, giữ nguyên văn) — CTA, trạng
  thái chọn, điểm hiện tại, link, dải đáy thẻ chia sẻ, tile mark.
  Không bao giờ là nền phủ diện rộng.
- **Gold:** `#F1C21B` (Carbon Yellow 30, giữ nguyên văn) — chỉ micro:
  nhân chấm «tuần này», nhụy hoa, nền chip mốc pha nhạt (`#FFF7D6`
  + chữ `#7A5B00`). **Cấm huy hiệu tick vàng trên avatar** (đọc như
  tick mạng xã hội — phán quyết panel).
- **Canvas:** `#F6F7F6`; thẻ `#FFFFFF`; viền `#E6E8E6`; mực
  `#16191D`; chữ phụ `#5A636E`; đã sống `#79828D` / nhấn `#59616B`;
  chưa sống `#DEE1DE`. Không gradient ở bất cứ đâu.

## Avatar

DiceBear `initials` 9.4.3 (client-side, không HTTP API): đĩa tròn
chữ Baloo 2 800, glyph theo luật X1, 4 cặp nền/chữ của hệ lens-04
(bố xanh nhạt `#DCEFE2`/`#146C2E` · mẹ vàng nhạt `#FDEEC9`/`#7A5B00`
· seed-soft · neutral), chọn cặp bằng FNV-1a trên seed chuẩn như
V4; **không badge vàng**; tên chữ Be Vietnam Pro luôn đi kèm. Mọi
style có mặt đều bị cấm.

## Font

Baloo 2 **800** (wordmark, tiêu đề, số cảm xúc, initials avatar) +
Be Vietnam Pro 400/500/600/700 (mọi chữ còn lại).

## Cấm (cấp brand)

Motif vòng/vành/đồng hồ ở mọi dạng · lì xì / đèn lồng / câu đối /
con giáp / cành thông làm motif · hoa fill sticker 5 vòng tròn ·
đĩa mặt trời · sao/quẻ/tarot/nến/hào quang và mọi motif bói toán ·
mesh-gradient/aurora · raster AI-gen cho banner/hero/logo · chữ/số
giả trong art · nền bão hoà ở bất kỳ màn nào.

## Quy tắc artwork

Bộ SVG ở `public/products/brand/` là nguồn sự thật duy nhất — giữ
nguyên hình học, không đặt lại màu ngoài các biến thể đã liệt kê.
Mọi hex trong asset phải thuộc tokens.json (kiểm bằng
`pnpm tokens:verify`).
