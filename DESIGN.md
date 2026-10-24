---
name: Còn Mấy Cái Tết Nữa?
description: Đếm số Tết còn bên bố mẹ bằng thống kê tuổi thọ — REDESIGN-V4: canvas trắng trung tính của IBM Carbon, seed Green 60 chỉ là accent, cảnh công bố là bề mặt art-class Green 100 duy nhất, mark «Một Vòng Năm», avatar DiceBear initials. (Tài liệu này THAY THẾ bản REDESIGN-V2 «Sân Khấu Sáng Đầu Năm»; hệ màu V2 — xanh thông + vàng lì xì + giấy ấm — đã chết toàn bộ theo NEO-0 và nằm trong danh sách cấm của `pnpm tokens:verify`.)
colors:
  primary: "#198038"
  primary-strong: "#0E6027"
  primary-deep-text: "#044317"
  primary-tint: "#DEFBE6"
  gold: "#F1C21B"
  canvas: "#FFFFFF"
  subtle: "#F4F4F4"
  ink: "#161616"
  muted: "#525252"
  line: "#C6C6C6"
  line-control: "#525252"
  reveal: "#071908"
  reveal-alt: "#022D0D"
  on-deep: "#FFFFFF"
  on-deep-muted: "#DEFBE6"
  success-solid: "#198038"
  success-ink: "#0E6027"
  success-bg: "#DEFBE6"
  error-solid: "#DA1E28"
  error-ink: "#161616"
  warning-bg: "#F1C21B"
  warning-ink: "#161616"
  info-solid: "#0F62FE"
  info-ink: "#161616"
typography:
  display:
    fontFamily: "Baloo 2, Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 800
  body:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    fontSize: "1rem"
    lineHeight: 1.625
  label:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
    fontSize: "0.9375rem"
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
    backgroundColor: "{colors.primary-strong}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  chip-radio-selected:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  chip-radio:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  stat-tile:
    backgroundColor: "{colors.primary-tint}"
    rounded: "{rounded.md}"
    padding: "12px"
  stage-number:
    backgroundColor: "{colors.reveal}"
    textColor: "{colors.on-deep}"
    rounded: "0"
    padding: "0"
---

# Design System: Còn Mấy Cái Tết Nữa? (REDESIGN-V4)

> Nguồn sự thật của màu: `design/tokens.conmaytet-v4.json` (bản sao của
> tokens.json trong hồ sơ redesign-v4/conmaytet); `app/tokens.css` là
> file sinh từ JSON đó và `app/globals.css` chỉ map token sang lớp
> semantic. Mọi hex ngoài tokens.json là hex mồ côi = lỗi chặn
> (`pnpm tokens:verify`). Hệ có **0 token tự chế (loại C)**: mọi giá
> trị là giá trị LITERAL đã công bố của IBM Carbon (loại A), một bậc
> trong thang CÔNG BỐ của Carbon (loại B), hoặc neutral trong thang
> Gray CÔNG BỐ (loại N).

## Overview

**Creative North Star: «Một Vòng Năm Trên Tờ Trắng»**

Trang vẫn là Scene Flow bốn cảnh (khung chức năng giữ nguyên tuyệt
đối từ các bản trước): Cảnh 1 là lời mời nhập liệu, Cảnh 2 là con số
công bố, Cảnh 3 là câu chuyện tuần đời, Cảnh 4 là hành động gửi đi.
Điều V4 thay là ba tầng: **màu** (canvas trắng + thang Gray của IBM
Carbon theo luật Neutral-First; seed Green 60 chỉ là accent điểm),
**lớp hình** (hero «Vòng Năm» suy từ chính mark, poster SVG tĩnh —
WebGL chết theo mặc định), và **avatar** (DiceBear `initials`).

Con số Tết vẫn không nằm trong thẻ: ở Cảnh 2 nó đứng trên bề mặt
**reveal art-class Green 100** — ngoại lệ nền sâu duy nhất của toàn
app, đúng một scope `.scene-reveal`, chỉ xuất hiện sau hành động của
người dùng ở Cảnh 2. Mọi bề mặt còn lại là trắng/Gray trung tính.

Mọi con số là ước tính thống kê từ một hệ số liệu duy nhất (bảng sống
WHO Việt Nam 2019), luôn có nguồn đứng cùng khối với số, không bao
giờ là bói toán hay dự đoán cá nhân, và luôn đi kèm một câu hy vọng
viết riêng cho đúng người được nói tới. Copy cấm mọi ngữ pháp bói
toán (vòng quay / số phận / vận mệnh / lá số / tử vi / quẻ / điềm…)
ở mọi lớp — chữ, alt-text, tên file.

**Key Characteristics:**

- Bốn cảnh toàn viewport; luồng lõi nhập → thấy số tốn tối đa 1 lần cuộn trên mobile.
- Canvas thường trú: trắng `#FFFFFF` + Gray 10–100. Không còn «giấy» nhuộm màu ở bất kỳ bề mặt thường trú nào.
- Con số sân khấu Baloo 2 800, clamp(120px, 38vw, 168px), màu trắng trên reveal Green 100; vạch chân số gold tĩnh.
- Mọi khối prose khoá bề ngang 34rem (~65 ký tự/dòng) trên mọi breakpoint.
- Gold Yellow 30 chỉ ở các vai khoá (xem The Gold Rule); không bao giờ là chữ/icon/focus trên nền sáng.

## Colors

Nguồn thang: IBM Carbon Design System — https://www.ibm.com/design/language/color/

| Token | Hex | Vai trò |
|---|---|---|
| Green 60 (seed, loại A) | `#198038` | CTA solid + chữ trắng · chữ/mark trên trắng · chấm tuần đã sống |
| Green 70 | `#0E6027` | Chữ brand trên bề mặt subtle · focus chính thức · success-ink |
| Green 80 | `#044317` | Chữ đậm trên sáng (URL/dòng đậm trên thẻ chia sẻ) |
| Green 10 | `#DEFBE6` | Tint: ô thống kê, dải offline, nền success, nền avatar · on-deep-muted trong reveal |
| Green 30 | `#6FDC8C` | Đồ hoạ trên nền sâu (cung góc tờ ở reveal) |
| Green 90 | `#022D0D` | Reveal phụ · chữ initials trên Green 10 |
| Green 100 | `#071908` | Bề mặt reveal CHÍNH (art-class, scope `.scene-reveal` duy nhất) |
| Yellow 30 (gold, loại A) | `#F1C21B` | Chỉ các vai khoá — xem The Gold Rule |
| Trắng (canvas) | `#FFFFFF` | Nền thường trú chính · on-deep |
| Gray 10 | `#F4F4F4` | Bề mặt subtle · nền avatar phụ |
| Gray 20 | `#E0E0E0` | Nền avatar phụ · viền mạnh |
| Gray 30 | `#C6C6C6` | Hairline trang trí (`line`) — không gánh nghĩa |
| Gray 70 | `#525252` | Chữ phụ (`muted`) · biên control (`line-control`) |
| Gray 100 | `#161616` | Mực chính · chữ error/warning/info |
| Red 60 | `#DA1E28` | Dấu/bar error (`error-solid`) — luôn kèm chữ, không màu-đơn-kênh |
| Blue 60 | `#0F62FE` | Dấu info (`info-solid`) — liều điểm, không phải accent thứ hai |

### Bảng contrast (WCAG 2.x — trích từ khối contrastVerified của tokens.json, đo độc lập bởi hồ sơ)

| Cặp | Tỉ lệ | Vai |
|---|---|---|
| Trắng trên Green 60 | 5.02 | CTA solid |
| Green 60 trên trắng | 5.02 | Chữ/mark thường trú |
| Green 70 trên trắng / Gray 10 | 7.72 / 7.02 | Chữ brand trên subtle · focus |
| Gray 100 trên trắng | 18.10 | Mực chính |
| Gray 70 trên trắng / Gray 10 | 7.81 / 7.10 | Chữ phụ · biên control |
| Trắng trên Green 100 | 18.24 | Số/chữ trên reveal |
| Green 10 trên Green 100 | 16.54 | On-deep-muted (nguồn, nhãn) |
| Gold trên Green 100 | 10.83 | Vạch chân số, cap mark trên-reveal |
| Gray 100 trên Yellow 30 | 10.75 | Chữ warning trên nền warning |
| Red 60 trên trắng | 5.00 | Dấu error |
| **Gold trên trắng** | **1.68** | **CẤM ở mọi vai mang nghĩa trên sáng** |
| Green 90 trên Green 10 | 13.77 | Initials avatar cặp 1 |
| Gray 100 trên Green 10 / Gray 10 / Gray 20 | 16.41 / 16.45 / 13.71 | Initials avatar cặp 2/3/4 |

Cặp mỏng phải tôn trọng: Green 60 trên Gray 10 = 4.56 (+0.06) → vai
chữ/link trên mọi bề mặt subtle dùng **Green 70**; Green 60 giữ vai
solid/mark/CTA.

### Named Rules

**The Neutral-First Rule.** Bề mặt thường trú là trắng và Gray trung
tính; màu brand chỉ xuất hiện như accent điểm (hành động, lựa chọn,
trạng thái, đồ hoạ nhỏ). Ngân sách đo trên render: Cảnh 1 neutral
≥80% · Cảnh 3 ≥90% · Cảnh 4 ≥86% · disclosure ≥94%.

**The Gold Rule.** Gold `#F1C21B` (1.68 trên trắng) bị cấm trên sáng
ở mọi vai mang nghĩa: chữ, icon UI, focus, đồ hoạ thiết yếu. Gold chỉ
sống ở: (i) trên nền sâu đã đo (vạch tĩnh chân số ở reveal, cap-mốc
của mark biến thể trên-reveal); (ii) trang trí có kênh hình phụ —
vạch tháng 1 trong hero/mini-vòng/thẻ dài hơn hẳn (22 so 14) nên mất
gold vẫn đọc ra bằng độ dài; tâm hoa nhỏ trong art; (iii) nền warning
với chữ Gray 100. Liều gold ở reveal ≤1% diện tích.

**The Reveal Is Art Rule.** Bề mặt Green 100 là art-class: đúng 1
scope `.scene-reveal`, đúng 1 cảnh (Cảnh 2), chỉ sau hành động công
bố. Token on-deep chỉ tồn tại trong scope đó; `theme_color` của
manifest là seed Green 60, không phải màu reveal.

**The Source Stays Close Rule.** Dòng nguồn WHO (≥14px) luôn cùng
khối, cùng tờ với con số ở mọi trạng thái và mọi frame; nguyên văn ở
disclosure cùng trang, mở bằng một chạm từ dòng rút gọn.

## Typography

**Display Font:** Baloo 2 — chỉ weight **800** (import 700 đã bỏ).
Vai của Baloo bị khoá cứng: **H1 của các cảnh + con số hero +
initials avatar**. Cấm Baloo <20px ngoài các vai đó, cấm cho nhãn
nhập/CTA/số liệu phụ (số ở ô thống kê, thang thăm… là Be Vietnam Pro
700). Baloo 2 có `tnum` thật → số hero không nhảy bề ngang.

**Body Font:** Be Vietnam Pro (400/500/600/700), WOFF2 tự host,
`font-display: swap`. Be Vietnam Pro không có `tnum` → không bao giờ
gánh con số hero.

### Hierarchy

- **Stage Number** (Baloo 2, 800, clamp(120px, 38vw, 168px), line-height 0.95, tabular): con số Tết ở Cảnh 2.
- **H1 cảnh** (Baloo 2, 800, 25px): tiêu đề của Cảnh 1/3/4.
- **Section** (Be Vietnam Pro, 700, 20px).
- **Body** (Be Vietnam Pro, 400, 16px, line-height 1.625, **max-width 34rem**).
- **Label** (Be Vietnam Pro, 600, ≥15px): nhãn trường nhập.
- **Nguồn** (≥14px, cùng khối với số — D4-CM-2).

### Named Rules

**The Stage Number Rule.** Con số Tết không nhỏ hơn 120px trên
mobile, không nằm trong thẻ/viền/bóng, không bị container ép (chuỗi
dài → đơn vị xuống hàng, cấm co số, cấm clip — D4-CM-1), và không bao
giờ đứng một mình: cùng cảnh phải có đơn vị, câu hy vọng riêng của
người đó, diễn giải, miễn trừ và nguồn.

**The Measure Rule.** Không khối prose nào rộng hơn 34rem trên bất
kỳ breakpoint nào.

**The No Small Print Rule.** Miễn trừ thống kê và nguồn tối thiểu
14px — không chôn, không làm mờ, không chân trang pháp lý. (Luật
pháp/hồ sơ pháp lý không thuộc gate của app — quyết định của chủ
dự án 2026-10-23; DATA-04 đứng vững bằng lý do kiến trúc/bảo mật.)

## Layout

Scene Flow một cột: Cảnh 1 (lời mời + hero «Vòng Năm» in-flow trên
H1, rộng min(342px, 88%)) → Cảnh 2 (sân khấu số trên reveal, 1
viewport/người trên mobile; song song hai sân khấu từ 1024px) → Cảnh
3 (lưới tuần kể chuyện) → Cảnh 4 (gửi đi) → tầng disclosure (Cách
tính & nguồn · Hỏi đáp · Quyền riêng tư, server-render, mặc định
đóng). Cảnh chưa có dữ liệu không tồn tại trong luồng cuộn.

Lưới tuần ở Cảnh 3: 52 cột, gap 3px, chấm đã sống Green 60, «tuần
này» Green 70 đặc + vòng Green 70 **tĩnh** (không pulse — M6) + glyph
vòng tĩnh và nhãn chữ tại chỗ, tuần còn lại Gray 30; dải mốc tuổi
30/40/50/60 nhãn Gray 70 neo vào đúng hàng lưới; chú thích 3 trạng
thái bằng chữ luôn đi kèm; `role="img"` + aria-label tóm tắt bằng số.
Đầu Cảnh 3 có mini-vòng 64px suy đúng tỉ lệ từ hero-ring (vành + 12
vạch, vạch tháng 1 dài hơn + gold, bỏ hoa).

Ở Cảnh 2, hai cung phần tư của vòng năm (r≈128, nét 3, Green 30) nằm
ở hai góc đối của tờ reveal, tĩnh, `pointer-events-none`, giao với
khối số/nguồn/CTA = 0px².

## Elevation & Depth

Sân khấu phẳng: Cảnh 2 không bóng, không viền. Bóng chỉ còn hai
token: `shadow-card` cho thẻ chia sẻ và khối disclosure,
`shadow-lift` cho hàng hành động bám đáy trong Cảnh 4 và thanh trạng
thái tạm thời. Không gradient dưới mọi hình thức.

## Shapes

Thẻ/khối phụ bo 16px; ô nhập, nút, chip bo 12px; chấm tuần và đĩa
avatar tròn hoàn hảo; sân khấu không có hình dạng (không khung). Bộ
asset brand V4 ở `public/products/brand/conmaytet-{mark,mark-micro,
mono,lockup,app-icon,hero-ring}.svg`; OG là `/og.png`.

## Motion

Kỷ luật M1–M9 của hồ sơ giữ nguyên: tổng trình tự công bố ≤760ms,
tĩnh tuyệt đối từ 640ms; cắt cảnh sang reveal 0ms (không quét/rèm);
số hiện bằng stage-in/hope-in qua easing token (`--ease-ceremony` /
`--ease-ui` — cấm easing viết tay); vạch gold chân số tĩnh hoặc chết
(M7); «tuần này» tĩnh tuyệt đối (M6); sửa input tại cảnh kết quả chỉ
cross-fade 160ms. Số không đếm tăng. `prefers-reduced-motion`: tắt
toàn bộ, số + nguồn + câu đi kèm hiện cùng một frame.

## Components

### Buttons

Bo 12px, Be Vietnam Pro semibold 14px, vùng chạm tối thiểu 44px
(nút chính 52px). Primary: nền Green 60, chữ trắng, hover Green 70 —
«Xem còn mấy cái Tết» (Cảnh 1), «Copy kết quả» (Cảnh 4). Outline: viền
Green 70, chữ Green 70 trên trắng — «Tải ảnh thẻ kết quả». Ghost:
viền Gray 30, chữ mực — «Làm lại từ đầu», và nó **không bao giờ xoá
ngay**: bấm → xác nhận tại chỗ (nút Xoá nền Red 60) → sau khi xoá có
«Hoàn tác» 8 giây. Điều hướng giữa cảnh (SceneNav) có biến thể
on-deep khi đứng trên bề mặt reveal.

### Segmented (giới tính)

3 ô chọn một, role radio/aria-checked đầy đủ, cao tối thiểu 44px.
**Trạng thái ban đầu: cả 3 ô trung tính** (nền trắng, viền
line-control Gray 70, chữ mực). Ô đã chọn: nền Green 60 + chữ trắng
**cộng kênh phụ** — font semibold + viền Green 70 (C-11.15: trạng
thái không bao giờ là màu-đơn-kênh).

### Inputs / Fields

Nền trắng, viền 1px line-control (Gray 70), bo 12px, chữ 16px (bắt
buộc để iOS không tự phóng). Focus: viền Green 60 + outline 2px
Green 70. Giải thích tại chỗ đứng ngay dưới trường liên quan. Slider:
track Gray 30, núm Green 60, vùng chạm dọc 44px, thang mốc đúng tỉ lệ
0/6/12/18/24.

### Notices

Lỗi: nền subtle Gray 10, chữ Gray 100 (`error-ink`), bar Red 60 ở mép
trái, `role="alert"`, đặt ngay dưới trường liên quan; validate theo
từng phần — lỗi của một người không ẩn kết quả của người còn lại.
Cảnh báo mềm: nền Yellow 30, chữ Gray 100 (`warning-ink`) — đúng ngữ
pháp warning của Carbon: vàng là nền, không bao giờ là chữ.

### Icons

Bộ icon tự vẽ «Vòng Năm» (`components/conmaytet/icons.tsx`): lưới
24, nét 2.0, cap tròn, một nét cong không khép cùng họ mark, đầu nét
mở 45° phải-trên; icon có khung (lịch, nhà) mang cung vòng-năm nhỏ ở
góc phải-trên; màu `currentColor` — **gold không bao giờ là màu
icon**. Không dùng bộ icon stock. Cấm motif bói toán trong icon:
không sao, quẻ, con giáp, lì xì, đèn lồng, câu đối.

### Avatar (DiceBear initials)

Avatar là **DiceBear style `initials`** (`@dicebear/core` +
`@dicebear/initials` 9.4.3, render client-side bằng JS library,
không qua HTTP API, SVG inline, chunk lười). Font initials là Baloo
2 800. Glyph theo **luật X1**: chữ cái đầu của từ cuối (tên gọi) sau
NFC — hàm thuần `initialsForName` ở `lib/avatar-initials.ts` có unit
test bằng tên Việt thật; glyph được ép chắc chắn bằng seed-glyph +
`chars: 1` (cơ chế đã probe trên chính package: glyph của style này
suy từ seed, seed chuẩn cho glyph vô nghĩa). Seed chuẩn:
`conmaytet:v1:profile:<role>-<năm sinh>` — chỉ dùng để chọn cặp
nền/chữ bằng FNV-1a trong 4 cặp palette khoá (Green 10/Green 90 ·
Green 10/Gray 100 · Gray 10/Gray 100 · Gray 20/Gray 100; gold không
vào avatar). Tên chữ Be Vietnam Pro **luôn** đi kèm avatar (C-11.10).
Vị trí duy nhất: cạnh nhãn «Với BỐ/MẸ · tuổi» ở Cảnh 2 và cạnh heading
của người dùng ở đầu Cảnh 3, đĩa 32px. Mọi style DiceBear có mặt đều
bị cấm ở app này.

### Signature: Stage Number (Cảnh 2)

Avatar + nhãn người → số sân khấu → đơn vị → vạch gold tĩnh 48×3px →
câu hy vọng riêng từng người → diễn giải lần gặp (chủ ngữ đúng người
đó) → miễn trừ rút gọn → nguồn rút gọn + liên kết Cách tính (biến
thể on-deep, focus outline on-deep). Không thẻ. Hai người = hai cảnh
(mobile) hoặc hai sân khấu song song (desktop), văn bản **không dùng
chung** ngoài cấu trúc.

### Signature: Story Week Grid (Cảnh 3)

Như mục Layout: lưới tuần có dải mốc tuổi neo vào hàng, chấm tuần này
tĩnh với vòng + glyph + nhãn, chú thích chữ 3 trạng thái, 4 ô thống
kê nền Green 10 với số Be Vietnam Pro 700 màu mực (Baloo không gánh
số liệu phụ).

### Share Card (Cảnh 4)

Thẻ canvas 1080×1350 (`lib/share-card.ts`): nền trắng, số Green 60
Baloo 800, mực Gray 100, muted Gray 70, URL/dòng đậm Green 80, dải
chân Green 60. Dải art đầu thẻ: vòng năm thu nhỏ + 2 hoa outline mực
hai bên (tâm hoa gold nhỏ, vạch tháng 1 dài hơn + gold). **Motif lì
xì và cành thông của V2 đã bị cấm và đã xoá.** Mọi câu chữ của thẻ
giữ kỷ luật copy của app.

## App shell & offline

App đăng ký **service worker** và **precache app shell** ngay lần tải
đầu có mạng; SW + manifest (standalone, icon gồm bản maskable) đưa
app tới **đạt tiêu chí cài đặt PWA (installable)**.

App thuần client-side nên sau khi cache shell, **toàn bộ Scene Flow
chạy offline hoàn toàn**: nhập liệu, tính toán, reveal, lưới tuần,
Copy kết quả và Tải ảnh thẻ (canvas trên máy) — không bước nào bị
khoá hay degrade.

Chỉ báo offline là dải trạng thái **ngay dưới AppBar, trên Cảnh 1**:
nền Green 10, chữ Green 70, icon `IconWifiOff` tự vẽ luôn kèm chữ,
`role="status"`, chỉ hiện khi offline và tự ẩn khi có mạng lại. Mẫu
câu chuẩn: «Bạn đang không có mạng — không sao, app vẫn tính Tết và
tạo ảnh thẻ được như thường.»

**The Offline Stays Warm Rule.** Ngoại tuyến không phải lỗi của
người dùng và không bao giờ trình bày như sự cố: giọng trấn an
trước, nói rõ vẫn dùng được sau, không màu lỗi, không thuật ngữ kỹ
thuật.

## Minh hoạ & disclosure

Hero duy nhất của luồng là «Vòng Năm» ở Cảnh 1 (in-flow trên H1):
vành 12 vạch tháng + cành hoa outline mực «không miền» (cánh không
fill — cấm fill vàng đọc thành mai/Nam, cấm fill hồng/đỏ đọc thành
đào/Bắc), tâm vòng trống, gold = vạch tháng 1 + tâm hoa (2 nhóm phần
tử, 0.09% canvas hero ở phép đo của hồ sơ). Ranh giới lịch vs tử vi
là cứng: không đường chia cung, không glyph/số trong vòng, không
vòng đệm, không đĩa tâm.

Tầng disclosure: tối đa 3 spot ink-only ≤120×60px trong toàn tầng,
chỉ 2 motif (vạch tháng đơn, hoa đơn outline từ `icons.tsx`); chữ là
nhân vật chính của tầng crawl/SEO này.

## Do's and Don'ts

### Do

- **Do** giữ con số ở sân khấu reveal trần, kèm câu hy vọng riêng của đúng người đó trong cùng cảnh.
- **Do** khoá mọi prose ở 34rem, kể cả trên desktop 1440px.
- **Do** giữ nguồn rút gọn trong Cảnh 2 và nguyên văn ở disclosure cùng trang.
- **Do** để trạng thái chưa chọn trung tính; brand chỉ xuất hiện sau lựa chọn thật, luôn có kênh phụ ngoài màu.
- **Do** kiểm tra chuỗi dấu tiếng Việt bằng Baloo 2 800 trên bản render thật trước khi chốt tiêu đề mới.

### Don't

- **Don't** đặt con số chính vào thẻ/card có viền hoặc bóng dưới bất kỳ biến thể nào.
- **Don't** dùng nền sâu ngoài đúng một scope reveal của Cảnh 2; không gradient, không hiệu ứng tưởng niệm, không số đếm tăng kiểu đếm ngược.
- **Don't** dùng gold làm chữ/icon/focus trên nền sáng hoặc làm tín hiệu duy nhất.
- **Don't** dùng motif lì xì, đèn lồng, câu đối, con giáp, cành thông, đĩa mặt trời, đường đất, hoa fill màu miền — ở bất kỳ bề mặt nào.
- **Don't** viết cùng một câu chữ cho thẻ/cảnh của bố và của mẹ.
- **Don't** để một trường lỗi ẩn kết quả của các phần không liên quan.
- **Don't** dùng emoji/glyph unicode hay bộ icon stock làm icon — chỉ bộ icon tự vẽ «Vòng Năm».
- **Don't** dùng style DiceBear có mặt cho avatar — chỉ `initials`.
