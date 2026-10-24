---
name: Còn Mấy Cái Tết Nữa?
description: Đếm số Tết còn bên bố mẹ bằng thống kê tuổi thọ — hệ lens-04 «SẢN PHẨM ẤM ÁP / FINTECH-GRADE» (chương trình conmaytet-redesign, hướng thắng chấm mù 2 vòng): canvas xám trung tính #F6F7F6, mọi nội dung trong thẻ trắng bo 20–22px viền #E6E8E6 + bóng mềm hai lớp, seed #198038 chỉ là accent, gold #F1C21B chỉ ở micro. Mark vòng năm và bề mặt reveal bão hoà của V4 ĐÃ CHẾT toàn bộ. Nguồn sự thật màu: design/tokens.conmaytet-v4.json (kiểm bằng `pnpm tokens:verify`).
colors:
  primary: "#198038"
  primary-ink: "#146C2E"
  primary-strong: "#0E6027"
  gold: "#F1C21B"
  canvas: "#F6F7F6"
  card: "#FFFFFF"
  subtle: "#F7F8F7"
  ink: "#16191D"
  ink-2: "#3F4750"
  muted: "#5A636E"
  line: "#E6E8E6"
  line-control: "#5A636E"
  lived: "#79828D"
  lived-strong: "#59616B"
  future: "#DEE1DE"
typography:
  display:
    fontFamily: "Baloo 2, Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 800
  body:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    fontSize: "1rem"
    lineHeight: 1.625
rounded:
  card: "20px"
  card-lg: "22px"
  control: "13px"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "14px"
    padding: "0 22px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: "24px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
---

# DESIGN — Còn Mấy Cái Tết Nữa? (hệ lens-04)

## Triết lý

Sản phẩm tài chính tiêu dùng đã chín (kiểu MoMo/ngân hàng số tốt):
canvas `#F6F7F6`, mọi nội dung sống trong **thẻ trắng bo 20–22px, viền
`#E6E8E6`, bóng mềm hai lớp**; phân cấp bằng cỡ chữ + khoảng trắng,
không bằng khối màu. Sự ấm áp đến từ **con người**: avatar DiceBear
`initials` của bố/mẹ là nhân vật chính của màn kết quả, con số là
trung tâm tuyệt đối, và **một cành hoa đào duy nhất** làm dấu ấn Tết.

## Luật cứng

- Không màn nào là nền bão hoà; seed `#198038` không bao giờ phủ diện
  rộng — chỉ CTA, trạng thái chọn, điểm «hiện tại», link, dải đáy thẻ.
- Gold `#F1C21B` chỉ ở micro: nhân chấm «tuần này», nhụy hoa, nền chip
  mốc pha nhạt. **Cấm huy hiệu tick vàng trên avatar.**
- Motif vòng **chết**: không mark vòng, không mảnh cung trôi góc,
  không vạch chia kiểu mặt đồng hồ. Thời gian biểu diễn bằng **thanh
  tiến trình thẳng** ở mọi nơi (thẻ bố, thẻ mẹ, đầu lưới tuần, thẻ
  chia sẻ).
- Minh hoạ duy nhất: cành đào path cánh thật (xem BRAND.md). Reveal
  và lưới tuần không minh hoạ.

## Từng cảnh

- **Cảnh 1 — Form:** desktop 2 cột (thẻ hero sticky: cành đào trên
  nền trung tính của thẻ + H1 + 3 dòng tin cậy tick seed; cột phải 2
  thẻ đánh số «1 · Về bạn» / «2 · Về bố mẹ»). Control 52–58px;
  segmented giới tính (chọn = viền seed + nền seed pha cực nhạt);
  toggle + slider trong hàng mềm; CTA seed 58px, chưa có kết quả thì
  xám vô hiệu + dòng hướng dẫn. Mobile xếp dọc, hero rút gọn.
- **Cảnh 2 — Reveal:** hai thẻ người thân trắng (mobile dọc, desktop
  song song): avatar DiceBear initials 78px + tên + năm sinh + chip
  tuổi; số Baloo 2 800 mực đen lớn nhất thẻ; dòng lần gặp kèm ikon
  phân biệt (nhà cho bố / mâm cơm cho mẹ); thanh tiến trình thẳng
  trong hộp mềm (đã sống `#59616B` / chưa sống `#E9EBEA` / điểm hiện
  tại chấm seed viền trắng + «đã đi N%» / «Phần còn lại phía trước»);
  câu cảm xúc = khối trích dẫn viền trái seed; miễn trừ + nguồn WHO +
  «Cách tính ›» ở chân thẻ; SceneNav ở chân từng thẻ.
- **Cảnh 3 — Lưới tuần:** thẻ đầu gọn (avatar + tiêu đề + «1.900 /
  ≈4.177 tuần» + thanh tổng mảnh) → **lưới bắt đầu ngay trong khung
  hình đầu**. Lưới nhóm thập kỷ: nhãn lề trái (Tuổi + năm), khoảng
  nghỉ + kẻ mảnh, chip mốc 30·2020 / 40·2030 / 50·2040 / 60·2050
  (gold pha nhạt). Chấm ≤7px: đã sống `#79828D`, chưa sống `#DEE1DE`;
  «tuần này» = chấm seed lớn nhân gold + pill seed «Bạn đang ở tuần
  này · tuần N». Ba thẻ thống kê phụ nằm **dưới** lưới.
- **Cảnh 4 — Chia sẻ:** 2 cột (xem trước thẻ + thẻ hành động sticky:
  Copy seed đặc / Tải ảnh viền / Làm lại ghost + hộp riêng tư). Thẻ
  1080×1350: header wordmark + cành đào biến tấu, hai hàng bố/mẹ
  (avatar initials bake + số lớn + câu), thanh tiến trình thẳng từng
  người, chân thẻ + dải seed 12px ở đáy.

## Hành vi không đổi (bất biến từ v1.2.1)

Reset = dialog thật `role=dialog` `aria-modal` + khoá cuộn + focus
trap (V122); focus outline đầy đủ gồm segment `#birth`; thứ tự Tab;
copy giữ nguyên văn; DiceBear initials 9.4.3 (glyph X1, seed→palette);
WebGL = 0.
