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
