---
name: Còn Mấy Cái Tết Nữa?
description: Đếm số Tết còn bên bố mẹ bằng thống kê tuổi thọ — sân khấu sáng, ấm, đầy hy vọng. (REDESIGN-V2 «Sân Khấu Sáng Đầu Năm»: Full-viewport Scene Flow, pine + gold. Đã promote thành DESIGN.md hiện hành ngày 2026-10-24, sau khi Panel #02 PASS 5/5 + §6 5/5 trên live 084bb36.)
colors:
  primary: "#1F4D3A"
  primary-deep: "#14342A"
  primary-hover: "#2A6248"
  primary-tint: "#E3EDE6"
  gold: "#C9A227"
  gold-soft: "#E9D48A"
  gold-text: "#6B5510"
  paper: "#FBF7EC"
  card: "#FFFFFF"
  ink: "#1C2420"
  muted: "#44564B"
  line: "#D8DDD0"
  input-line: "#7E9384"
  notice-warn-bg: "#FBF0D3"
  notice-warn-text: "#5C4A0E"
  notice-error-bg: "#FDECEA"
  notice-error-text: "#8A2A20"
typography:
  display:
    fontFamily: "Baloo 2, Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 800
  headline:
    fontFamily: "Baloo 2, Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    fontSize: "1rem"
    lineHeight: 1.625
  label:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
    fontSize: "0.875rem"
rounded:
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  4xl: "40px"
  5xl: "56px"
  6xl: "80px"
measure:
  prose: "34rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  chip-radio-selected:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  chip-radio:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  stat-tile:
    backgroundColor: "{colors.primary-tint}"
    rounded: "{rounded.md}"
    padding: "12px"
  stage-number:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary}"
    rounded: "0"
    padding: "0"
---

# Design System: Còn Mấy Cái Tết Nữa? (ĐỀ XUẤT — REDESIGN-V2)

## Overview

**Creative North Star: «Sân Khấu Sáng Đầu Năm»**

Trang là một dãy cảnh, mỗi cảnh chiếm trọn một màn hình và chỉ có một
nhân vật: Cảnh 1 là lời mời, Cảnh 2 là con số, Cảnh 3 là câu chuyện
tuần đời, Cảnh 4 là hành động gửi đi. Con số Tết không còn nằm trong
thẻ kết quả: nó đứng trần giữa sân khấu giấy sáng, to như chữ trang
bìa, với khoảng trống xung quanh là một phần của thiết kế. Hệ tham
chiếu chính là Apple (sân khấu hoá một con số, prose bị kỷ luật bề
ngang) và Spotify Wrapped (khoảnh khắc reveal cá nhân hoá, thẻ chia
sẻ đáng gửi đi), phụ là Airbnb (giọng lời mời ấm áp). Học cấu trúc
của các hệ đó, không học màu sân khấu của chúng: ở đây sân khấu luôn
sáng.

Mọi con số là ước tính thống kê từ một hệ số liệu duy nhất (bảng sống
WHO Việt Nam 2019), luôn có nguồn đứng cạnh, không bao giờ là bói
toán hay dự đoán cá nhân, và luôn đi kèm một câu hy vọng viết riêng
cho đúng người được nói tới.

**Key Characteristics:**

- Bốn cảnh toàn viewport; luồng lõi nhập → thấy số tốn tối đa 1 lần cuộn trên mobile.
- Con số sân khấu Baloo 2 800, clamp(120px, 38vw, 168px), màu Xanh Thông trên Giấy Ấm — không thẻ, không viền, không bóng.
- Mọi khối prose khoá bề ngang 34rem (~65 ký tự/dòng) trên mọi breakpoint.
- Vàng chỉ là điểm chạm đồ hoạ; không bao giờ là chữ trên nền sáng.
- Không nền tối ở bất kỳ cảnh/trạng thái nào; không gradient dưới mọi hình thức.

## Colors

| Token | Hex | Vai trò |
|---|---|---|
| Xanh Thông Sâu | `#14342A` | Tiêu đề cảnh, chữ trên tint thông |
| Xanh Thông (brand) | `#1F4D3A` | Con số sân khấu, nút chính, trạng thái chọn, tuần đã sống |
| Xanh Thông Hover | `#2A6248` | Hover/pressed của hành động chính |
| Xanh Thông Nhạt | `#E3EDE6` | Nền ô thống kê, dải offline, khối phụ |
| Vàng Lì Xì | `#C9A227` | Chỉ đồ hoạ: đường nhấn dưới số, vòng tuần này, hạt nắng |
| Vàng Nắng Mềm | `#E9D48A` | Chi tiết sáng trên nền thông |
| Vàng Chữ | `#6B5510` | Dạng duy nhất của vàng được làm chữ trên nền sáng |
| Giấy Ấm | `#FBF7EC` | Nền trang, nền sân khấu, nền ô nhập |
| Trắng Thẻ | `#FFFFFF` | Ô nhập nổi, thẻ chia sẻ, khối disclosure |
| Mực | `#1C2420` | Chữ chính |
| Mực Nhạt | `#44564B` | Chữ phụ — chỉ trên Giấy Ấm/Trắng Thẻ, đạt AAA |
| Đường Kẻ Ấm | `#D8DDD0` | Đường chia, chấm tuần chưa sống |
| Đường Kẻ Nhập | `#7E9384` | Viền ô nhập trạng thái nghỉ (đạt non-text 3:1) |
| Cảnh báo | `#FBF0D3` / `#5C4A0E` | Cảnh báo mềm không chặn |
| Lỗi | `#FDECEA` / `#8A2A20` | Lỗi nhập liệu (màu ngữ nghĩa, không phải brand) |

### Bảng contrast (WCAG relative-luminance, tính bằng script từ hex, 2026-10-23 — đo lại trên render thật ở implementation)

| Cặp | Nền thật | Tỉ lệ | Ngưỡng | Kết luận |
|---|---|---|---|---|
| Trắng trên Xanh Thông | nút primary | 9.63:1 | 4.5 | Đạt AAA |
| Xanh Thông trên Giấy Ấm | con số sân khấu, chữ nhấn | 9.00:1 | 4.5 (3.0 cỡ lớn) | Đạt AAA |
| Xanh Thông Sâu trên Giấy Ấm | tiêu đề cảnh | 12.62:1 | 4.5 | Đạt AAA |
| Trắng trên Xanh Thông Sâu | (dự phòng bề mặt đặc) | 13.51:1 | 4.5 | Đạt AAA |
| Trắng trên Xanh Thông Hover | hover nút chính | 7.15:1 | 4.5 | Đạt AAA |
| Mực trên Giấy Ấm | body | 14.83:1 | 4.5 | Đạt AAA |
| Mực trên Trắng Thẻ | body trong khối phụ | 15.88:1 | 4.5 | Đạt AAA |
| Mực Nhạt trên Giấy Ấm | chữ phụ | 7.32:1 | 4.5 | Đạt AAA |
| Mực Nhạt trên Trắng Thẻ | chữ phụ | 7.84:1 | 4.5 | Đạt AAA |
| Xanh Thông Sâu trên Xanh Thông Nhạt | dải offline, ô thống kê | 11.27:1 | 4.5 | Đạt AAA |
| Vàng Nắng Mềm trên Xanh Thông | chi tiết/chữ phụ trên pine khi thật cần | 6.53:1 | 4.5 | Đạt AA |
| Vàng Chữ trên Giấy Ấm | nhãn vàng dạng chữ | 6.69:1 | 4.5 | Đạt AA |
| Chữ cảnh báo trên nền cảnh báo | `#5C4A0E` / `#FBF0D3` | 7.58:1 | 4.5 | Đạt AAA |
| Chữ lỗi trên nền lỗi | `#8A2A20` / `#FDECEA` | 7.55:1 | 4.5 | Đạt AAA |
| Viền nhập trên Giấy Ấm | `#7E9384` / `#FBF7EC` (phi chữ) | 3.07:1 | 3.0 | Đạt non-text |
| **Vàng Lì Xì trên Giấy Ấm** | `#C9A227` / `#FBF7EC` | **2.26:1** | — | **CẤM làm chữ** — chỉ đồ hoạ ≥3px kèm tín hiệu khác |
| Vàng Lì Xì trên Xanh Thông | chi tiết đồ hoạ trên pine | 3.98:1 | 3.0 (phi chữ) | Đạt non-text |

Phương pháp: tỉ lệ = (L1 + 0,05) / (L2 + 0,05) với L là độ chói tương
đối WCAG 2.x tính từ hex sRGB. Mọi cặp chữ trong bảng đều tính trên
đúng nền mà chữ đó sẽ đứng trong Scene Flow (sân khấu = Giấy Ấm, khối
phụ = Trắng Thẻ/tint), không tính trên nền «lý tưởng».

### Named Rules

**The One Pine Rule.** Xanh thông chỉ xuất hiện khi mang ý nghĩa: con
số chính, hành động chính, lựa chọn đã chọn, tuần đã sống. Trạng thái
chưa chọn không được nhuộm brand (diệt finding chip «Không chọn» đặc
màu của bản live).

**The Gold Is Graphic Rule.** Vàng Lì Xì `#C9A227` không làm chữ trên
nền sáng (2.26:1), không làm nền khối lớn, không làm tín hiệu duy
nhất. Vàng làm chữ trên nền sáng chỉ có một dạng hợp lệ: Vàng Chữ
`#6B5510`.

**The Hope Rule.** Không nền đen/tối, không khung tang, không hiệu
ứng tưởng niệm, không đếm ngược. Sân khấu của con số là giấy sáng —
kể cả khi hệ tham chiếu dùng sân khấu tối.

**The Source Stays Close Rule.** Dòng nguồn rút gọn (≥13px) đứng
trong cùng Cảnh 2 với con số; nguyên văn ở disclosure cùng trang, mở
bằng một chạm từ dòng rút gọn.

## Typography

**Display Font:** Baloo 2 — đã kiểm chứng ở mức file/glyph bằng
fontTools trên file thật do Google Fonts phân phối (variable +
static 700 + static 800): **90/90 ký tự tiền hợp tiếng Việt có
glyph**, feature `tnum` có thật → số tabular hoạt động. (Đối chứng:
Outfit của bản live thiếu 88/90 trên cùng phép kiểm — bị loại vĩnh
viễn. Be Vietnam Pro phải nạp đúng subset `vietnamese`.)

**Body Font:** Be Vietnam Pro (400/500/600/700), subset vietnamese +
latin, WOFF2 tự host, `font-display: swap`.

### Hierarchy

- **Stage Number** (Baloo 2, 800, clamp(120px, 38vw, 168px), line-height 0.95, tabular): con số Tết ở Cảnh 2 — phần tử lớn nhất toàn app.
- **Display 1** (Baloo 2, 700, 32px mobile / 44px desktop, line-height 1.15): câu mời Cảnh 1, tiêu đề Cảnh 3.
- **Display 2** (Baloo 2, 700, 24–28px): tiêu đề Cảnh 4, tiêu đề disclosure.
- **Body** (Be Vietnam Pro, 400, 16px, line-height 1.625, **max-width 34rem**): mọi prose.
- **Body Strong** (Be Vietnam Pro, 600, 16px): câu hy vọng đi kèm số, cụm khoá trong miễn trừ.
- **Label** (Be Vietnam Pro, 600, 14px): nhãn trường; nhãn người ở Cảnh 2 là 13px semibold, tracking rộng, Xanh Thông Sâu.
- **Caption** (13–14px): chỉ chú thích phụ trợ thật sự. Miễn trừ (≥14px) và nguồn (≥13px) không phải caption — xem No Small Print.

### Named Rules

**The Stage Number Rule.** Con số Tết không nhỏ hơn 120px trên
mobile, không nằm trong thẻ/viền/bóng, và không bao giờ đứng một
mình: cùng cảnh phải có đơn vị, câu hy vọng riêng của người đó, diễn
giải, miễn trừ và nguồn.

**The Measure Rule.** Không khối prose nào rộng hơn 34rem trên bất
kỳ breakpoint nào. Cột trang được phép rộng hơn cho lưới tuần và thẻ
chia sẻ; prose thì không.

**The No Small Print Rule.** Miễn trừ thống kê tối thiểu 14px (đậm
cụm khoá), nguồn rút gọn tối thiểu 13px, nguyên văn tối thiểu 12px
trong disclosure — không chôn, không làm mờ, không chân trang pháp lý.

## Layout

Scene Flow một cột: Cảnh 1 (lời mời, ≤1 viewport mobile) → Cảnh 2
(sân khấu số, 1 viewport/người trên mobile; song song hai sân khấu từ
1024px) → Cảnh 3 (lưới tuần kể chuyện, ~1.3 viewport, có mốc tuổi) →
Cảnh 4 (gửi đi, ≤1 viewport) → tầng disclosure (Cách tính & nguồn ·
Hỏi đáp, server-render, mặc định đóng). Luồng lõi nhập → thấy số tốn
tối đa 1 lần cuộn viewport mobile; desktop 0–1 lần cuộn. Cảnh chưa có
dữ liệu không tồn tại trong luồng cuộn. Chi tiết wireframe + bảng
chiều cao: `LAYOUT-SPEC.md`.

Lưới tuần ở Cảnh 3: 52 cột, gap 3px, chấm đã sống Xanh Thông, tuần
này Vàng Lì Xì + vòng Xanh Thông 2px + nhãn chữ trỏ tại chỗ, tuần còn
lại Đường Kẻ Ấm; dải mốc tuổi 30/40/50/60 neo vào đúng hàng lưới;
chú thích 3 trạng thái bằng chữ luôn đi kèm; `role="img"` + aria-label
tóm tắt bằng số.

## Elevation & Depth

Sân khấu phẳng tuyệt đối: Cảnh 2 không bóng, không viền. Bóng chỉ
còn hai token: `shadow-card` cho thẻ chia sẻ và khối disclosure,
`shadow-lift` cho hàng hành động bám đáy trong Cảnh 4 và lớp phủ tạm
thời. Không gradient dưới mọi hình thức — màu không mô phỏng độ sâu.

- **shadow-card** (`0 1px 2px rgba(28,36,32,0.05), 0 8px 24px rgba(28,36,32,0.06)`)
- **shadow-lift** (`0 2px 4px rgba(28,36,32,0.06), 0 16px 40px rgba(28,36,32,0.10)`)

## Shapes

Thẻ/khối phụ bo 16px; ô nhập, nút, chip bo 12px; chấm tuần tròn
hoàn hảo; sân khấu không có hình dạng (không khung). Logo giữ nguyên
tỉ lệ gốc từ file SVG của bộ asset v2 — không cắt, không đặt lại màu.

## Motion

Một khoảnh khắc ngôi sao duy nhất: reveal con số ở Cảnh 2 (scale
0.92 → 1 + fade, 480ms, `cubic-bezier(0.22, 1, 0.36, 1)`; câu hy vọng
trễ 120ms). Cập nhật số khi sửa input chỉ cross-fade 160ms. Chấm
«tuần này» pulse vòng 1 lần khi lưới vào viewport. Số không đếm tăng
(không gợi đếm ngược). `prefers-reduced-motion`: tắt toàn bộ, cuộn
nhảy tức thì.

## Components

### Buttons

Bo 12px, Be Vietnam Pro semibold 14px, vùng chạm tối thiểu 44px
(nút chính 52px). Primary: nền Xanh Thông, chữ trắng — «Xem còn mấy
cái Tết» (Cảnh 1), «Copy kết quả» (Cảnh 4). Outline: viền Xanh Thông,
chữ Xanh Thông trên Trắng Thẻ — «Tải ảnh thẻ kết quả». Ghost: viền
Đường Kẻ Ấm, chữ Mực — «Làm lại từ đầu», và nó **không bao giờ xoá
ngay**: bấm → xác nhận tại chỗ → sau khi xoá có «Hoàn tác» 8 giây.

### Segmented (giới tính)

3 ô chọn một, role radio/aria-checked đầy đủ, cao tối thiểu 44px.
**Trạng thái ban đầu: cả 3 ô trung tính** (nền Giấy Ấm, viền Đường Kẻ
Ấm, chữ Mực). Ô chỉ chuyển nền Xanh Thông/chữ trắng sau khi người
dùng thực sự chọn.

### Inputs / Fields

Nền Giấy Ấm (trong cảnh) hoặc Trắng Thẻ, viền 1px Đường Kẻ Nhập, bo
12px, chữ 16px (bắt buộc để iOS không tự phóng). Focus: viền Xanh
Thông + outline 2px Xanh Thông Sâu. Giải thích tại chỗ (13–14px, Mực
Nhạt trên Giấy Ấm = 7.32:1) đứng ngay dưới trường liên quan. Slider:
accent Xanh Thông, núm 26px, vùng chạm dọc 44px, thang mốc đúng tỉ
lệ 0/6/12/18/24.

### Notices

Lỗi: nền `#FDECEA`, chữ `#8A2A20`, `role="alert"`, đặt ngay dưới
trường liên quan; validate theo từng phần — lỗi của một người không
ẩn kết quả của người còn lại. Cảnh báo mềm: nền `#FBF0D3`, chữ
`#5C4A0E`, vẫn tính kết quả. Cả hai tối thiểu 14px.

### Signature: Stage Number (Cảnh 2)

Nhãn người → số sân khấu → đơn vị → đường nhấn vàng 48×3px → câu hy
vọng riêng từng người → diễn giải lần gặp (chủ ngữ đúng người đó) →
miễn trừ rút gọn → nguồn rút gọn + liên kết Cách tính. Không thẻ.
Hai người = hai cảnh (mobile) hoặc hai sân khấu song song (desktop),
văn bản **không dùng chung** ngoài cấu trúc.

### Signature: Story Week Grid (Cảnh 3)

Lưới tuần có dải mốc tuổi 30/40/50/60 neo vào hàng, chấm tuần này có
vòng + nhãn trỏ + pulse 1 lần, chú thích chữ 3 trạng thái, 4 ô thống
kê nền Xanh Thông Nhạt với số Mực (giữ Xanh Thông cho duy nhất con số
chính của app).

## App shell & offline

Yêu cầu cứng W5-01 (chi tiết + nghiệm thu: `LAYOUT-SPEC.md` mục
«App shell & offline»). App đăng ký **service worker** và **precache
app shell** — HTML (gồm tầng disclosure server-render), CSS, JS, font
WOFF2 thiết yếu, logo và bộ icon PWA v2 — ngay lần tải đầu có mạng;
SW + manifest (standalone, icon gồm bản maskable) phải cùng đưa app
tới **đạt tiêu chí cài đặt PWA (installable)**.

App thuần client-side nên sau khi cache shell, **toàn bộ Scene Flow
chạy offline hoàn toàn**: nhập liệu, tính toán, reveal, lưới tuần,
Copy kết quả và Tải ảnh thẻ (canvas trên máy) — không bước nào bị
khoá hay degrade, không nút nào bị vô hiệu hoá vì mất mạng.

Chỉ báo offline là dải trạng thái **ngay dưới AppBar, trên Cảnh 1**:
nền Xanh Thông Nhạt, chữ Xanh Thông Sâu (11.27:1), icon Lucide
WifiOff luôn kèm chữ, chữ tối thiểu 14px, `role="status"`, chỉ hiện
khi offline và tự ẩn khi có mạng lại. Mẫu câu chuẩn: «Bạn đang không
có mạng — không sao, app vẫn tính Tết và tạo ảnh thẻ được như
thường.»

**The Offline Stays Warm Rule.** Ngoại tuyến không phải lỗi của
người dùng và không bao giờ trình bày như sự cố: chỉ báo offline
giữ giọng ấm của app (trấn an trước, nói rõ vẫn dùng được sau),
không màu lỗi, không thuật ngữ kỹ thuật, không để lộ lỗi thô của
trình duyệt — và tuân thủ Hope Rule + No Small Print như mọi nội
dung hạng nhất.

## Avatar & minh hoạ

**Không dùng DiceBear**: app không có thực thể người nào cần avatar
trong luồng (không tài khoản, không hồ sơ, không danh sách thành
viên). Hình ảnh gợi con người bằng vật (tờ lịch, bao lì xì, ấm trà)
theo hướng Airbnb — không vẽ mặt người. Minh hoạ duy nhất là
`assets/illustration-calendar.svg` của bộ asset v2.

## Do's and Don'ts

### Do

- **Do** giữ con số ở sân khấu trần trên giấy sáng, kèm câu hy vọng riêng của đúng người đó trong cùng cảnh.
- **Do** khoá mọi prose ở 34rem, kể cả trên desktop 1440px.
- **Do** giữ nguồn rút gọn trong Cảnh 2 và nguyên văn ở disclosure cùng trang.
- **Do** để trạng thái chưa chọn trung tính; brand chỉ xuất hiện sau lựa chọn thật.
- **Do** kiểm tra chuỗi dấu tiếng Việt bằng Baloo 2 trên bản render thật trước khi chốt tiêu đề mới.

### Don't

- **Don't** đặt con số chính vào thẻ/card có viền hoặc bóng dưới bất kỳ biến thể nào.
- **Don't** dùng nền tối, gradient, hiệu ứng tưởng niệm, hay số đếm tăng kiểu đếm ngược.
- **Don't** dùng Vàng Lì Xì làm chữ trên nền sáng hoặc làm tín hiệu duy nhất.
- **Don't** viết cùng một câu chữ cho thẻ/cảnh của bố và của mẹ.
- **Don't** khẳng định về hành vi của «nhiều người» khi không có số liệu trích được.
- **Don't** để một trường lỗi ẩn kết quả của các phần không liên quan.
- **Don't** dùng emoji/glyph unicode làm icon — chỉ Lucide, một độ dày nét.
