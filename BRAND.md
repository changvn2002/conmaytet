# BRAND — Còn Mấy Cái Tết Nữa? (REDESIGN-V4)

> Tài liệu này thay thế bản brand của REDESIGN-V2. Hệ V2 (xanh thông +
> vàng lì xì + giấy ấm, motif bao lì xì/cành thông) đã chết toàn bộ
> theo NEO-0; các giá trị đó nằm trong danh sách cấm của
> `pnpm tokens:verify`. Nguồn sự thật màu: `design/tokens.conmaytet-v4.json`.

## Nhận diện

- **Mark «Một Vòng Năm»:** xoắn vòng năm không khép, nét 6.5đv, khe
  hiệu dụng 8.59đv, cap-mốc tròn liền khối ở đầu nét ngoài. Hình học
  kế thừa nguyên vẹn từ V3 — V4 chỉ đổi màu về Carbon literal và siết
  luật biến thể. Bộ asset chính thức ở `public/products/brand/`:
  - `conmaytet-mark.svg` — biến thể thường trú: Green 60 `#198038`, 0 gold. Dùng ≥24px (favicon, header qua lockup).
  - `conmaytet-mark-micro.svg` — bản micro cho ≤20px: Green 60, 0 gold.
  - `conmaytet-mono.svg` — mono đen cho bề mặt đơn sắc.
  - `conmaytet-lockup.svg` — mark + wordmark Baloo 2 800 **outline thật** (không `<text>`), mực Gray 100 `#161616`. Đây là thứ header của app hiển thị (cao 36px).
  - `conmaytet-app-icon.svg` — tile cài đặt: nền Green 100, mark Green 10 + cap gold (biến thể trên-reveal duy nhất được mang gold ở vai mark).
  - `conmaytet-hero-ring.svg` — hero «Vòng Năm» của Cảnh 1 (xem dưới).
- **OG:** `/og.png` (1200×630) — cùng ngôn ngữ vòng năm, 0 số kết quả cá nhân.

## Màu thương hiệu (IBM Carbon)

- **Seed:** Green 60 `#198038` (giá trị LITERAL của Carbon, Δbyte = 0) — CTA, mark thường trú, trạng thái đã sống/đã chọn.
- **Gold:** Yellow 30 `#F1C21B` (LITERAL) — **luật gold**: cấm trên sáng ở mọi vai mang nghĩa (chữ/icon/focus/đồ hoạ thiết yếu — chỉ 1.68:1 trên trắng). Gold chỉ ở: cap-mốc của mark trên-reveal · vạch tĩnh chân số ở reveal · vạch tháng 1 (dài hơn, kênh hình phụ) và tâm hoa trong art · nền warning với chữ Gray 100.
- **Canvas:** trắng `#FFFFFF` + thang Gray 10–100 của Carbon (Neutral-First: bề mặt thường trú là trung tính, màu chỉ là accent).
- **Reveal:** Green 100 `#071908` — bề mặt art-class duy nhất, đúng một scope ở Cảnh 2.
- **Mực:** Gray 100 `#161616`. **Không gradient** ở bất cứ đâu.

## Hero «Vòng Năm»

Vành r=128 với 12 vạch tháng đều 30°; vạch tháng 1 dương lịch dài
22px (các vạch khác 14px) + gold — đọc ra bằng **độ dài trước, màu
sau** (bản grayscale vẫn đọc được tháng được đánh dấu). Cành hoa
outline mực «không miền»: cánh là vòng outline không fill (cấm fill
vàng = mai/Nam, cấm fill hồng/đỏ = đào/Bắc), tâm hoa chấm gold nhỏ.
Tâm vòng để **trống**. Alt chính thức: «Vòng năm mười hai tháng và
cành hoa xuân». Cấm gọi vạch đánh dấu là «Tháng Giêng» (đó là tháng 1
âm lịch).

## Avatar

DiceBear `initials` 9.4.3 (client-side, không HTTP API): đĩa tròn
chữ Baloo 2 800, glyph theo luật X1 (chữ đầu của tên gọi, NFC), 4 cặp
nền/chữ khoá của Carbon (Green 10/Green 90 · Green 10/Gray 100 ·
Gray 10/Gray 100 · Gray 20/Gray 100), **gold không vào avatar**, tên
chữ Be Vietnam Pro luôn đi kèm. Mọi style có mặt đều bị cấm.

## Font

Baloo 2 **800** (H1 các cảnh, số hero, initials avatar, wordmark
outline trong lockup) + Be Vietnam Pro 400/500/600/700 (mọi chữ còn
lại). Không tồn tại Baloo 700 trong app từ V4.

## Cấm (cấp brand)

Lì xì / đèn lồng / câu đối / con giáp / cành thông làm motif · hoa
fill màu miền · đĩa mặt trời · đường đất · sao/quẻ/tarot/nến/hào
quang và mọi motif bói toán · mesh-gradient/aurora · raster AI-gen
cho banner/hero/logo · chữ/số giả trong art. Motif văn hoá được phép
duy nhất: tờ lịch / vòng thời gian.

## Quy tắc artwork

Bộ SVG ở `public/products/brand/` là nguồn sự thật duy nhất — giữ
nguyên tỉ lệ gốc, không cắt, không đặt lại màu ngoài các biến thể đã
liệt kê. Mọi hex trong asset phải thuộc tokens.json (kiểm bằng
`pnpm tokens:verify`, có strip comment XML trước khi quét). PNG/OG
sinh từ bộ asset V4 — không sinh artwork từ script của hệ cũ.
