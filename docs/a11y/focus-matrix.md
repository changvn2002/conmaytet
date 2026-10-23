# A11Y-12 — Ma trận focus (ConMayTet, build local sau W2)

> Đo thật bằng script `measure-a11y.mjs` trong thư mục này (Chrome hệ
> thống Chromium 152 qua CDP/Playwright, build production local, dữ
> liệu panel chuẩn: sinh 15/06/1995, Nam, bố 1965, mẹ 1968, 2 lần/năm;
> viewport 1440×900). Số thô đầy đủ: `hygiene-evidence-w3/a11y-raw.json`
> (thư mục làm việc của wave, không commit). Ngày đo và môi trường: xem
> `EVIDENCE.md`.

## 1. Thứ tự Tab qua form và các cảnh (trạng thái đã điền)

| Bước | Phần tử nhận focus | Ghi chú |
| --- | --- | --- |
| 1–4 | `input#birth` (type=date) | 4 Tab đầu di chuyển qua các segment ngày/tháng/năm **bên trong** cùng một ô date — activeElement vẫn là `#birth` |
| 5 | button role=radio «Nữ» | nhóm Giới tính |
| 6 | button role=radio «Nam» | |
| 7 | button role=radio «Không chọn» | |
| 8 | `input#father-year` | Năm sinh của bố |
| 9 | `input#mother-year` | Năm sinh của mẹ |
| 10 | button role=switch «Tôi đang sống cùng bố mẹ» | |
| 11 | `input#visits` (type=range) | Về thăm mỗi năm |
| 12 | button «Xem còn mấy cái Tết» | nút chính Cảnh 1 |
| 13 | button «Cách tính» | trong sân khấu bố |
| 14 | button «Cách tính» | trong sân khấu mẹ |
| 15 | button «Tiếp» | SceneNav sau Cảnh 2 |
| 16 | button «Sửa lại» | SceneNav sau Cảnh 2 |
| 17 | button «Tiếp» | SceneNav sau Cảnh 3 |
| 18 | button «Sửa lại» | SceneNav sau Cảnh 3 |
| 19 | button «Copy kết quả» | Cảnh 4 |
| 20 | button «Tải ảnh thẻ kết quả» | Cảnh 4 |
| 21 | button «Làm lại từ đầu» | Cảnh 4 |
| 22 | summary «Cách tính: …» (H2) | disclosure 1 |
| 23 | summary «Hỏi đáp» (H2) | disclosure 2 |
| 24 | summary «Quyền riêng tư & dữ liệu của bạn» (H2) | disclosure 3 (mới ở wave hygiene) |
| 25 | BODY | focus rời trang sang chrome của trình duyệt |
| 26–29 | `input#birth` | vòng Tab quay lại đầu trang — thứ tự lặp lại nhất quán (26–32 = lại segment date → radio Nữ/Nam/Không chọn) |

Không có focus trap, không có phần tử tương tác nào bị bỏ qua, thứ tự
Tab khớp thứ tự đọc trực quan (form → sân khấu → lưới tuần → gửi đi →
disclosure).

## 2. Các lối ra của luồng xoá (đối chiếu Panel #02 §8)

| Tình huống | activeElement đo được | Kỳ vọng §8 | Kết luận |
| --- | --- | --- | --- |
| Mở khối xác nhận xoá | button «Giữ lại» | focus vào lựa chọn an toàn «Giữ lại» | ĐẠT |
| Esc tại khối xác nhận | button «Làm lại từ đầu» | huỷ xoá, focus trả về nút vừa mở khối | ĐẠT |
| Bấm «Giữ lại» | button «Làm lại từ đầu» | như trên | ĐẠT |
| Ngay sau khi xoá | button «Hoàn tác» | focus vào nút Hoàn tác trên thanh `role=status` | ĐẠT |
| Bấm «Hoàn tác» | `input#birth` | về Cảnh 1, focus ô đầu tiên | ĐẠT |
| Xoá lần 2, trong cửa sổ | button «Hoàn tác» | focus giữ trong thanh | ĐẠT |
| Hết hạn 8s khi focus trong thanh | `input#birth` | OBS-A §8.1: focus về `#birth`, không rơi về BODY | ĐẠT — thanh biến mất ở ~8.661ms theo đồng hồ đo của script (mốc gồm cả thời gian chờ phần tử + vòng poll 150ms) |
| Bấm «Sửa lại» ở SceneNav Cảnh 2 | `input#birth` | về Cảnh 1, focus ô đầu tiên | ĐẠT |

Cả 8 lối ra khớp kỳ vọng. Nhánh OBS-A còn được khoá độc lập trong e2e
Playwright (`e2e/reset-undo.spec.ts`, chạy ở cả 2 project
desktop/mobile) và trong test jsdom của W2
(`components/conmaytet/hygiene-wave.spec.tsx`).
