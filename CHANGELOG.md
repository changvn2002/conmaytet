# Changelog

Mọi thay đổi đáng kể của Còn Mấy Cái Tết Nữa? được ghi ở đây.
Định dạng theo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
phiên bản theo [SemVer](https://semver.org/).

> **Trạng thái: bản gieo từ lịch sử git.** File này được tạo trong
> hygiene wave (2026-10-24) bằng cách đối chiếu `git log` thật của
> repo. Repo hiện **chưa có git tag nào** (local 0, remote 0), nên
> các mục phiên bản dưới đây neo theo commit; **parent đã chốt tag
> ngày 2026-10-24** theo đề xuất trong
> [RUNBOOK-ROLLBACK.md](RUNBOOK-ROLLBACK.md): `v1.0.0` → `ed2c358`,
> `v1.0.1` → `084bb36`.

## [1.2.3] — 2026-10-24 — Sửa nóng S-NEW-2: nút «Tiếp» của sân khấu bố bỏ qua sân khấu mẹ

### Fixed

- **Panel chấm lại v1.2.2, S-NEW-2 (SERIOUS, 2 ghế tái hiện độc
  lập bằng 2 phương pháp gồm click chuột thật):** cả hai sân
  khấu bố/mẹ cùng dùng một đích cuộn `afterScene2`, nên «Tiếp»
  của bố nhảy thẳng xuống lưới tuần (scrollY 2733 thay vì ≈1889)
  — người dùng theo luồng dẫn dắt không bao giờ dừng xem được
  kết quả của mẹ. Nay: «Tiếp» của bố cuộn tới đúng sân khấu mẹ
  (`#san-khau-me`) khi có kết quả của mẹ, ngược lại giữ đích cũ;
  «Tiếp» của mẹ giữ nguyên đích sau Cảnh 2. Chuỗi đúng: bố → mẹ
  → lưới tuần → Gửi đi.

### Notes

- Panel v1.2.2 đồng thời xác nhận MỌI mục chức năng được giao
  đã đóng thật (modal + focus trap, focus-visible, kiểm chéo
  năm sinh, H2 lưới tuần, kiểm thường lệ) — rule 12 chỉ fail vì
  S-NEW-2 này. §6 FAIL (3/5 ghế AI-made, tell trùng khớp lý do
  người dùng bác diện mạo V4) — không vá trên diện mạo cũ; chờ
  chương trình redesign, chấm lại trên diện mạo mới.

## [1.2.2] — 2026-10-24 — Focus trap cho dialog + kiểm chéo năm sinh

### Fixed

- **Dialog xác nhận xoá đã nhốt được focus** (S-NEW-1 của vòng
  chấm lại v1.2.1, tái lập 24/24 Tab thoát ra nền + Enter kích
  hoạt được `<details>` nền khi dialog mở): thêm trap
  Tab/Shift+Tab vòng trong dialog; focus lỡ ở nền thì Tab kéo
  về trong. Sau sửa: Tab ×24 → 0 thoát, nền không kích hoạt
  được bằng bàn phím; Esc/backdrop/hoàn tác giữ nguyên byte-
  equal (verifier độc lập xác nhận toàn bộ trước phát hành).
- **Kiểm chéo năm sinh bố/mẹ**: năm sinh bố/mẹ bằng hoặc sau
  năm sinh của người dùng là lỗi cứng tại chỗ («Năm sinh của
  bố/mẹ phải nhỏ hơn năm sinh của bạn…»), không còn sinh kết
  quả vô nghĩa kiểu bố sinh 2025 → «1 tuổi · 70 cái Tết». Ghi
  chú: 3 test W3 cũ khoá hành vi cảnh-báo-mềm (W3-F6) đã được
  viết lại theo yêu cầu mới này — thay đổi hành vi có chủ đích,
  ghi trong review record v1.2.2.

## [1.2.1] — 2026-10-24 — Sửa 2 SERIOUS thật của Panel v1.2.0 + đóng 2 cáo buộc không tái lập

### Fixed

- **Modal xác nhận làm lại/xoá thành modal thật**: trước đây là
  khối xác nhận tại chỗ (không overlay, không khoá cuộn — cuộn đi
  được, sửa form sau lưng được). Nay: `role="dialog"` +
  `aria-modal`, khoá cuộn html/body, backdrop bấm vào = huỷ an
  toàn («Giữ lại»), chạm không xuyên. Ngữ nghĩa Xoá/Giữ lại/Esc
  và cửa sổ hoàn tác 8s giữ nguyên; probe: wheel 1200px không
  nhúc nhích nền, xoá→hoàn tác khôi phục storage byte-equal.
- **Focus-visible cho đoạn lịch của ô ngày sinh** (#birth): điểm
  dừng duy nhất bị nuốt outline (đúng S5-3 của panel). Thêm
  `focus-within:outline-2` + gắn tường minh outline cho mọi phần
  tử tương tác; Tab thật sau sửa: 27/27 điểm dừng có outline 2px.
- **Tiêu đề lưới tuần** lệch +79px khỏi lề lưới ở mọi viewport →
  khối riêng thẳng lề (Δ=0), `text-balance`, 1 dòng, hết từ mồ
  côi «tuần».
- **Màn reveal**: đưa điều hướng đi tiếp vào chân từng sân khấu
  bố/mẹ — nội dung + hành động chiếm 88,6% chiều cao sân khấu
  (trước 55,6%, nút đi tiếp nằm ngoài viewport). Không thêm
  trang trí, không đổi luồng.

### Not reproduced (panel cáo buộc, 3 nguồn đo độc lập đều sạch)

- **Contrast**: cáo buộc 5 vai <4,5:1 (thấp nhất 2,58:1) KHÔNG
  tái lập — verifier panel + tiebreak + đợt sửa quét 102–104
  vai chữ ở 3 viewport: thấp nhất **5,02:1** (CTA trắng trên
  seed), 0 vai dưới chuẩn. Số lạ sinh ra khi đo giữa animation
  hoặc cặp sai nền. Không đổi token.
- **Tràn ngang**: cáo buộc scrollWidth 403 (tràn 13px @390 /
  83px @320) KHÔNG tái lập — lấy mẫu ~50–60ms xuyên animation:
  0px ở 320/390/1440. Cụm Sửa/Nguồn trên bề mặt thật vốn là
  `<button>` 14px, hàng nguồn flex-wrap. Không đổi layout.
- Favicon 16px: đã là micro mark thật từ v1.2.0 (giống hệt
  render micro 0/256px); chấm gold trên app-icon là chủ đích đã
  khai ở BRAND.md + tokens.json (cap-mốc gold-30) — parent chuẩn
  y giữ nguyên (xem review record v1.2.1).

## [1.2.0] — 2026-10-24 — REDESIGN-V4 (Carbon Green 60, Neutral-First)

### Changed

- Toàn bộ giao diện theo hồ sơ REDESIGN-V4 đã khoá: seed IBM
  Carbon Green 60 `#198038` nguyên văn + Yellow 30 `#F1C21B` chỉ ở
  khoảnh khắc ăn mừng, canvas trung tính chiếm ưu thế; Baloo 2 800
  cho hiển thị (dấu tiếng Việt kiểm crop thật ở mọi cỡ), Be Vietnam
  Pro cho nội dung; bộ icon «Vòng Năm» tự vẽ (0 import lucide);
  mark/lockup/OG/favicon sinh lại từ assets hồ sơ byte-identical.
- Avatar mặc định = DiceBear `initials` 9.4.3 với glyph từ luật X1
  của app (chữ cuối của tên gọi — B/M/B) + seed canonical chỉ chọn
  bảng màu trong 4 cặp khoá.
- Thẻ chia sẻ: bỏ motif lì xì và thông bị cấm, thêm dải vòng + hoa
  outline theo palette V4.
- tokens:verify mới (7 nhóm, bóc comment XML theo LK4-51) PASS
  7/7 + fixture đối kháng hai chiều.
- Nhãn nấc thang trượt (0/6/12/18/24) nâng 13px → 14px theo sàn
  hồ sơ (phân xử parent tại phát hành, §10-8).

### Invariants

- Suite **193/193** (184 baseline + 9 test X1 initials); hành vi
  lõi giữ nguyên; WebGL = 0 (chết theo khoá hồ sơ — cổng người
  thật G-06 chưa chạy).

## [1.1.0] — 2026-10-24 — hygiene wave sau Panel #02 + hotfix SEC-10

### Added

- CI đầy đủ (typecheck/lint/format/test/audit chặn/build/Playwright
  e2e) + Dependabot; `.nvmrc` 24.
- Tài liệu: `PRIVACY.md`, `DATA-MAP.md`, `NOTICE`, disclosure riêng
  tư trong app (đủ 6 trường dữ liệu), `RUNBOOK-ROLLBACK.md`.
- Playwright e2e: 3 specs (hành trình ra số, xoá + hoàn tác 8s,
  chia sẻ clipboard + PNG 1080×1350) — CQ-08.
- Gói bằng chứng a11y `docs/a11y/` — cặp chữ thấp nhất 6,54:1,
  điều khiển ≥44px, ma trận focus 8/8 (A11Y-12).

### Changed

- LICENSE về thuần MIT; thông báo thương hiệu tách sang `NOTICE`.

### Fixed

- OBS-A: hết hạn cửa sổ hoàn tác khi focus ở nút Hoàn tác — focus
  nay về ô ngày sinh thay vì rơi mất.
- Thanh đã-xoá giữ một bố cục 78px suốt cửa sổ (R1-F5); ô thống kê
  mobile đều nhau (R1-F3); hai sân khấu desktop cân chân số (R1-F4);
  nhịp dọc thẻ chia sẻ cân lại (R1-F2); dòng cuối H1 hết cụt (N-3).

### Security

- next 16.3.6 → 16.4.2: vá 2 CRITICAL RCE (GHSA-2464-fhr4-w9xw,
  GHSA-673q-mjm6-r5xr) + HIGH SSRF/DoS.

## [1.0.1] — 2026-10-23 (đề xuất tag, neo commit `084bb36`)

### Fixed

- TC-1: lớp «Hoàn tác» 8 giây sau khi xoá dữ liệu bằng «Làm lại từ
  đầu» nay hiển thị thật — thanh hoàn tác được chuyển lên component
  cha để không biến mất khi biểu mẫu bị làm trống (trước đó chỉ có
  lớp xác nhận, lớp hoàn tác không xuất hiện trên bản live). Kèm gói
  sửa §8 của Panel: khôi phục nguyên vẹn dữ liệu đã lưu, focus trở
  về nút Hoàn tác sau khi xoá.
- Bản này đã deploy (~22:19, 2026-10-23) và qua Panel #02 với kết
  quả PASS 5/5 + Figma-grade 5/5 trên bản live.

## [1.0.0] — 2026-10-23 (đề xuất tag, neo commit `ed2c358`)

### Added

- Thiết kế lại toàn diện REDESIGN-V2 «Sân Khấu Sáng Đầu Năm»: luồng
  4 cảnh nối tiếp (Scene Flow) — Lời mời → Sân khấu số → Câu chuyện
  tuần đời → Gửi đi; hệ màu xanh thông + vàng, nền giấy; font Baloo 2
  cho con số sân khấu và Be Vietnam Pro cho nội dung, tự host.
- Bộ ảnh chụp sản phẩm v2 trên bản redesign (`028208c`) và việc
  promote tài liệu thiết kế v2 thành `DESIGN.md` (`25873fc`) đi kèm
  theo mốc phát hành này.

### Trước mốc này (lịch sử tiền phát hành, từ `git log`)

- `62ed6e6` — Gia cố `lib/` theo phát hiện kiểm thử sâu: chặn
  NaN/Infinity trong tính toán/validate, sửa biên tuổi theo lịch,
  cảnh báo tuổi bố mẹ có dấu, sentinel tháng nhuận âm lịch; bổ sung
  bộ test sâu.
- `5dabfe7` — Gói ra mắt: ảnh chụp bản live kèm chú thích, README với
  URL production và thư viện ảnh.
- `3c24cd7` — Bản đầu tiên: Còn Mấy Cái Tết Nữa? — ước tính số Tết
  còn lại với bố mẹ từ bảng tuổi thọ Việt Nam.
