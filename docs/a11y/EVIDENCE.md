# A11Y-12 — Gói bằng chứng khả năng tiếp cận (ConMayTet)

> Gói đo cho hạng mục A11Y-12 của đợt hygiene sau Panel #02. Mọi số
> trong gói này là **output đo thật** trên build local hiện tại, không
> chép số của panel và không suy luận từ mã nguồn (mã nguồn chỉ dùng
> để chọn cặp token cần đo).

## Môi trường & phương pháp

- **Ngày đo:** 2026-10-24 ~01:14 (+07) — trường `measuredAt` trong các
  file JSON là giờ UTC của lần chạy script cuối.
- **Nền code:** HEAD `25873fc` + cây chưa commit của wave hygiene
  (W1 docs/CI + W2 polish đã land; gồm disclosure thứ ba «Quyền riêng
  tư & dữ liệu của bạn» và sửa OBS-A). Build ID của bản build đã đo:
  `nq4gEI3kq8BQZkIoc9AFJ` (`.next/BUILD_ID` sau lần build của webServer
  e2e; script đo chạy trên chính server đó).
- **Bản đo:** production build local (`pnpm build` + `next start` cổng
  3417) — cùng bản build mà bộ e2e Playwright (CQ-08) vừa chạy xanh.
- **Trình duyệt:** Chrome hệ thống `/opt/meta-chromium/chrome`
  (Chromium 152.0.7977.82, headless; UA ghi trong số thô:
  `HeadlessChrome/152.0.0.0`), lái qua CDP bằng Playwright.
- **Vượt chặn Local Network Access:** Chrome 152 chặn mọi điều hướng
  trực tiếp tới `127.0.0.1`/`localhost`
  (`ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`; các cờ
  `--disable-features=LocalNetworkAccessChecks…` đã thử, không hiệu
  quả). Script dùng kỹ thuật của W2: điều hướng tới origin public
  `https://conmaytet.vercel.app` và fulfill mọi request bằng bytes của
  build local ở `127.0.0.1:3417` (route interception), service worker
  bị khoá (`serviceWorkers: 'block'`). Nội dung đo là build local
  100%; chỉ tên origin trong trình duyệt là khác.
- **Dữ liệu đo:** bộ panel chuẩn — sinh 15/06/1995, giới tính Nam, bố
  1965, mẹ 1968, về thăm 2 lần/năm (seed qua localStorage
  `conmaytet:input:v1`).
- **Script đo:** `measure-a11y.mjs` trong thư mục này (chạy:
  `node docs/a11y/measure-a11y.mjs` khi server 3417 đang chạy). Số thô
  toàn phần: `hygiene-evidence-w3/a11y-raw.json` ở repo root (thư mục
  làm việc của wave, không commit).

## Giới hạn trung thực

- Đo bằng **headless Chrome trên VM** — KHÔNG có screen reader thật
  (NVDA/JAWS/VoiceOver/TalkBack), KHÔNG có thiết bị thật, không có
  người dùng khuyết tật tham gia. Mọi khẳng định về trải nghiệm screen
  reader thực tế là **UNKNOWN** — gói này chỉ kiểm chứng được cấu trúc
  DOM, thứ tự focus, tương phản và kích thước mục tiêu chạm.
- Tương phản của token được **tính bằng công thức WCAG 2.x** từ giá
  trị token trong `app/globals.css`; phần computed-style là màu đã
  render thật (đọc `getComputedStyle` + nền hiệu dụng theo tổ tiên).
- Touch target đo bằng `getBoundingClientRect` tại thời điểm đo; các
  phần tử có kích thước 0 hoặc `display:none`/`visibility:hidden` bị
  loại khỏi census.

## 1. Census tương phản (chi tiết: `contrast.json`)

26 cặp token + 10 mẫu computed-style. Headline:

- **Cặp chữ (text) thấp nhất: 6,54:1** — muted `#44564B` trên
  brand-soft `#E3EDE6` (nhãn các ô thống kê ở Cảnh 3): đạt **AA**,
  chưa tới AAA (7:1). Mọi cặp chữ còn lại đều ≥ 6,69:1; thân bài đạt
  AAA (ink/paper 14,83:1, muted/paper 7,32:1).
- **Placeholder** ô nhập (muted trên nền ô trắng, opacity 1): **7,84:1
  AAA** — đo từ `::placeholder` đã render.
- **Non-text thiết yếu đều qua ngưỡng 3:1:** viền ô nhập ở trạng thái
  nghỉ 3,28:1 (trên card) / 3,07:1 (trên paper); chỉ báo focus
  brand-deep 12,62:1 (paper) / 13,51:1 (card); chấm «tuần này»
  gold-text 6,69:1.
- **Hai cặp dưới 3:1 — đều là trang trí thuần, ghi rõ để phân xử:**
  viền `line` trên paper 1,29:1 (viền thẻ disclosure/đường kẻ trang
  trí — không mang thông tin, không phải ranh giới duy nhất để nhận
  diện điều khiển) và `gold` trên paper 2,26:1 (đường nhấn đồ hoạ
  dưới con số sân khấu; `globals.css` đã cấm gold làm chữ trên nền
  sáng — dạng chữ hợp lệ duy nhất là gold-text 6,69:1). Hai cặp này
  không được tính là đạt; chúng được khai báo thay vì giấu khỏi bảng.

| Cặp | Chữ | Nền | Tỉ lệ | Mức |
| --- | --- | --- | --- | --- |
| thân bài: ink trên paper | ink #1C2420 | paper #FBF7EC | 14.83 | AAA |
| thân bài: ink trên card | ink #1C2420 | card #FFFFFF | 15.88 | AAA |
| chữ phụ: muted trên paper | muted #44564B | paper #FBF7EC | 7.32 | AAA |
| chữ phụ: muted trên card | muted #44564B | card #FFFFFF | 7.84 | AAA |
| chữ phụ: muted trên brand-soft (nhãn ô thống kê) | muted #44564B | brand-soft #E3EDE6 | 6.54 | AA |
| số thống kê: ink trên brand-soft | ink #1C2420 | brand-soft #E3EDE6 | 13.25 | AAA |
| tiêu đề: brand-deep trên paper | brand-deep #14342A | paper #FBF7EC | 12.62 | AAA (large) |
| link/nút chữ: brand trên paper | brand #1F4D3A | paper #FBF7EC | 9 | AAA |
| link/nút chữ: brand trên card | brand #1F4D3A | card #FFFFFF | 9.63 | AAA |
| nút Hoàn tác/nav: brand trên brand-soft (hover) | brand #1F4D3A | brand-soft #E3EDE6 | 8.03 | AAA |
| số lần về thăm: brand trên paper | brand #1F4D3A | paper #FBF7EC | 9 | AAA (large) |
| chữ vàng hợp lệ: gold-text trên paper (mốc tuổi) | gold-text #6B5510 | paper #FBF7EC | 6.69 | AA |
| nút chính: white trên brand | white #FFFFFF | brand #1F4D3A | 9.63 | AAA |
| nút chính hover: white trên brand-hover | white #FFFFFF | brand-hover #2A6248 | 7.15 | AAA |
| nút Xoá: white trên error-text | white #FFFFFF | error-text #8A2A20 | 8.63 | AAA |
| cảnh báo: warn-text trên warn-bg | warn-text #5C4A0E | warn-bg #FBF0D3 | 7.58 | AAA |
| lỗi: error-text trên error-bg | error-text #8A2A20 | error-bg #FDECEA | 7.55 | AAA |
| placeholder ô nhập: muted trên card | muted #44564B | card #FFFFFF | 7.84 | AAA |
| viền ô nhập (nghỉ): input-line trên card | input-line #7E9384 | card #FFFFFF | 3.28 | PASS ≥3:1 (non-text) |
| viền ô nhập trên paper: input-line trên paper | input-line #7E9384 | paper #FBF7EC | 3.07 | PASS ≥3:1 (non-text) |
| chỉ báo focus: brand-deep trên paper | brand-deep #14342A | paper #FBF7EC | 12.62 | PASS ≥3:1 (non-text) |
| chỉ báo focus: brand-deep trên card | brand-deep #14342A | card #FFFFFF | 13.51 | PASS ≥3:1 (non-text) |
| viền trang trí: line trên paper | line #D8DDD0 | paper #FBF7EC | 1.29 | dưới 3:1 — trang trí (xem ghi chú trên) |
| đồ hoạ gold: gold trên paper | gold #C9A227 | paper #FBF7EC | 2.26 | dưới 3:1 — đồ hoạ trang trí, cấm dùng làm chữ |
| chấm tuần này: gold-text trên paper (đồ hoạ) | gold-text #6B5510 | paper #FBF7EC | 6.69 | PASS ≥3:1 (non-text) |
| vùng chọn chữ: brand-deep trên brand-soft (selection) | brand-deep #14342A | brand-soft #E3EDE6 | 11.27 | AAA |

Computed-style đã render (trích): H1 brand-deep/paper 12,62 AAA · số
sân khấu 16 brand/paper 9,00 AAA-large · câu hy vọng ink/paper 14,83
AAA · nút chính trắng/brand 9,63 AAA · nhãn mốc tuổi gold-text/paper
6,69 AA · summary «Hỏi đáp» ink/card 15,88 AAA. Đủ 10 mẫu trong
`contrast.json`.

## 2. Census touch target (chi tiết: `touch-targets.json`)

Đo mọi phần tử tương tác nhìn thấy được ở 390×844 và 1440×900, ba
trạng thái (trống / đã điền / thanh «Đã xoá» hiện):

| Viewport | Trạng thái | Tổng phần tử | < 44px |
| --- | --- | --- | --- |
| 390×844 | trống | 13 | 1 |
| 390×844 | đã điền | 22 | 1 |
| 390×844 | thanh «Đã xoá» hiện | 14 | 1 |
| 1440×900 | trống | 13 | 1 |
| 1440×900 | đã điền | 22 | 1 |
| 1440×900 | thanh «Đã xoá» hiện | 14 | 1 |

- **Mọi điều khiển (button/input/summary/switch/radio/slider) đều
  ≥ 44px ở cả hai viewport và mọi trạng thái** — chiều cao điều khiển
  nhỏ nhất đo được đúng 44px (nút «Hoàn tác» trên thanh đã xoá:
  87,8 × 44px).
- **Phần tử < 44px duy nhất ở mọi trạng thái: link inline «GitHub
  Issues của dự án»** nằm giữa đoạn văn trong disclosure «Quyền riêng
  tư & dữ liệu của bạn» (189,3 × 20px — chiều cao dòng chữ). Đây là
  link trong văn bản (inline link) — thuộc ngoại lệ mục tiêu chạm
  trong câu văn của WCAG 2.5.8/2.5.5 — nhưng vẫn ghi danh công khai ở
  đây và trong `touch-targets.json` để coordinator/parent phân xử nếu
  muốn nới vùng chạm cho link này.

## 3. Ma trận focus (chi tiết: `focus-matrix.md`)

Thứ tự Tab đầy đủ 32 bước + 8 lối ra của luồng xoá trong
`focus-matrix.md`. Headline: **8/8 lối ra khớp kỳ vọng Panel #02 §8**,
gồm OBS-A — hết hạn khi focus ở «Hoàn tác» thì focus về `#birth`
(thanh biến mất ở ~8.661ms theo vòng poll của script đo), Esc/Giữ lại
trả focus về «Làm lại từ đầu», Hoàn tác trả focus về `#birth`.

## 4. Thứ tự heading

Cây heading theo thứ tự DOM (desktop; mobile cùng cây):

- **Trạng thái trống:** H1 «Đếm thử: còn mấy cái Tết bên bố mẹ?» → H2
  «Cách tính: …» → H2 «Hỏi đáp» → H3 ×7 (câu hỏi FAQ) → H2 «Quyền
  riêng tư & dữ liệu của bạn».
- **Trạng thái đã điền:** H1 → H2 «Cuộc đời bạn, kể bằng tuần» → H2
  «Gửi cho người thân» → H2 «Cách tính: …» → H2 «Hỏi đáp» → H3 ×7 →
  H2 «Quyền riêng tư & dữ liệu của bạn».

**Không nhảy cấp ở cả hai trạng thái** (mức heading không bao giờ
tăng quá +1 so với heading trước; H3 chỉ xuất hiện dưới H2 «Hỏi đáp»
của chúng). Disclosure thứ ba thêm ở wave này giữ đúng kỷ luật H2
trong `summary` như hai disclosure trước.
