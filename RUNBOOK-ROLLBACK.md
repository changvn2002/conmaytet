# Runbook: Deploy & Rollback — Còn Mấy Cái Tết Nữa?

Tài liệu vận hành cho bản production https://conmaytet.vercel.app
(Vercel project gắn với repo GitHub `changvn2002/conmaytet`, nhánh
`main`). Mục tiêu: khôi phục production về trạng thái tốt gần nhất
trong vài phút, không cần người viết code gốc.

App thuần client-side: không backend, không cơ sở dữ liệu, không biến
môi trường bắt buộc — rollback vì vậy chỉ là chuyện đưa bản tĩnh trước
về phục vụ, không có schema hay dữ liệu máy chủ nào phải khôi phục.
Dữ liệu người dùng nằm trong `localStorage` trên từng trình duyệt
(xem [DATA-MAP.md](DATA-MAP.md)) và không bị rollback động tới.

## Mô hình deploy

- **Một commit trên `main` = một deployment production.** Vercel tự
  build khi có push; không có bước deploy tay.
- Việc commit/push lên `main` do **parent (người điều phối) thực hiện
  duy nhất** — runbook này mô tả đường rollback để parent hoặc người
  được parent uỷ quyền thi hành, không phải quyền mặc định của mọi
  đóng góp.

## Bảng mốc deployment hiện có

Repo **hiện chưa có git tag nào** — kiểm chứng tại thời điểm viết
(2026-10-24): `git tag` local = 0, tag trên remote = 0. Các mốc
deployment vì vậy được neo theo commit:

| Commit | Mốc | Ghi chú |
| --- | --- | --- |
| `ed2c358` | REDESIGN-V2 launch — «Sân Khấu Sáng Đầu Năm», Scene Flow, 2026-10-23 | Bản thiết kế v2 lên production |
| `028208c` | Screenshot pack v2, 2026-10-23 | Chỉ tài liệu/ảnh chụp lại trên bản `ed2c358` |
| `084bb36` | Vá TC-1 (lớp Hoàn tác 8 giây sau khi xoá), deploy ~22:19 2026-10-23 | Bản đã qua Panel #02: PASS 5/5 + Figma-grade 5/5 |
| `25873fc` | Promote `DESIGN.md` v2, 2026-10-23 | Chỉ tài liệu thiết kế; code chạy production không đổi so với `084bb36` |

## Đề xuất tag (chờ parent chốt — runbook này không tự tạo tag)

| Tag đề xuất | Neo vào commit | Lý do |
| --- | --- | --- |
| `v1.0.0` | `ed2c358` | Bản redesign v2 — lần phát hành công khai đầu tiên đạt chuẩn của app; khớp `version` 1.0.0 đang ghi trong `package.json` |
| `v1.0.1` | `084bb36` | Bản vá TC-1 trên nền v1.0.0, đã deploy và đã qua Panel #02 (PASS 5/5 + §6 5/5) — mốc production tốt gần nhất để rollback về |

Khi parent chốt tag, bảng «Mốc deployment» ở trên sẽ được bổ sung cột
tag tương ứng và từ đó «về bản vX.Y.Z» nghĩa là về đúng commit của
tag đó.

## Rollback — đường nhanh (không đổi code)

1. Vercel → Project **conmaytet** → **Deployments**.
2. Chọn deployment tốt gần nhất (đối chiếu commit SHA với bảng mốc ở
   trên — hiện tại mốc an toàn nhất là `084bb36`).
3. `…` → **Promote to Production** (Instant Rollback). Production trỏ
   lại build đó ngay, không build lại.
4. Sang mục **Kiểm chứng sau rollback** ở dưới.

## Rollback — đường git (khi cần giữ lịch sử tuyến tính)

1. `git revert <commit-hỏng>` trên `main` (KHÔNG reset/force-push —
   lịch sử production phải truy vết được).
2. Push `main`; chờ Vercel build xong.
3. Sang mục **Kiểm chứng sau rollback**.

## Kiểm chứng sau rollback (bắt buộc, ghi lại kết quả)

1. `curl -sI https://conmaytet.vercel.app/` trả HTTP 200.
2. Mở https://conmaytet.vercel.app trên trình duyệt thật, chạy luồng
   chính trọn vẹn: nhập ngày sinh của bạn + năm sinh của bố/mẹ → sân
   khấu số hiện con số Tết/lần gặp → lưới tuần hiện đúng → ở cảnh Gửi
   đi, copy được đoạn chữ kết quả và tải được ảnh thẻ PNG.
3. Kiểm tra service worker: `curl -s https://conmaytet.vercel.app/sw.js`
   tải được, và hằng số `CACHE_VERSION` trong file (hiện tại
   `v1-2026-10-23`) khớp bản vừa rollback về. Sau khi bản cũ thành
   active, client tự xoá các cache không thuộc version đó ở lần ghé
   tiếp theo — nếu người dùng vẫn thấy bản mới hơn mong đợi, hướng
   dẫn tải lại trang một lần nữa thay vì cho rằng rollback chưa tới.
4. Thử thao tác xoá an toàn: «Làm lại từ đầu» → xác nhận tại chỗ →
   thanh «Hoàn tác» xuất hiện và bấm hoàn tác trong cửa sổ 8 giây
   khôi phục đủ dữ liệu.

## Lưu ý dữ liệu người dùng khi rollback

- Rollback code **không xoá và không đổi** dữ liệu trong
  `localStorage` của người dùng: khoá `conmaytet:input:v1` và lớp
  `sanitize()` trong `lib/storage.ts` đọc được dữ liệu đã lưu bởi các
  bản trước (cùng schema `v1`).
- Nếu một bản phát hành tương lai đổi schema lưu trữ, bản đó phải giữ
  khả năng đọc dữ liệu của schema cũ trước khi được tính là an toàn
  để rollback qua lại — ghi điều kiện đó vào CHANGELOG của bản đó.

## Sự cố thường gặp

| Triệu chứng | Kiểm tra đầu tiên |
| --- | --- |
| Trang trắng sau deploy | Console trình duyệt có lỗi JS chặn đứng không; nếu có, rollback đường nhanh rồi mới sửa |
| Người dùng thấy giao diện cũ sau rollback/deploy | Service worker: `CACHE_VERSION` trong `sw.js` của bản đang phục vụ đã đổi chưa; bản SW mới tự thay khi activate, tải lại trang để nhận |
| Số liệu/luồng tính sai sau deploy | Đối chiếu commit đang chạy production với bảng mốc ở trên; rollback về `084bb36` (bản đã qua panel) rồi điều tra trên bản local |
| Vercel build fail | Đọc log build của deployment đó; bản production đang chạy không bị ảnh hưởng — sửa trên nhánh/commit mới, không cần rollback |
