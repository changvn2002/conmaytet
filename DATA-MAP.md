# Bản đồ dữ liệu — Còn Mấy Cái Tết Nữa? (conmaytet)

Tài liệu này liệt kê **toàn bộ** dữ liệu người dùng mà app xử lý. App
thuần client-side: không tài khoản, không backend/API thu thập dữ
liệu, không analytics/tracker, không cookie do app đặt. Nếu một dữ
liệu không có trong bảng dưới đây thì app không thu thập nó.

Kiểu dữ liệu nguồn: `InputData` trong `lib/types.ts` — đúng 6 trường.

| Trường kỹ thuật | Nhãn người dùng | Thu thập gì | Lưu ở đâu | Giữ bao lâu | Cách xoá | Có rời khỏi máy không |
| --- | --- | --- | --- | --- | --- | --- |
| `myBirthDate` | Ngày sinh của bạn | Ngày sinh của bạn, dạng ISO `yyyy-mm-dd` (chuỗi rỗng = chưa nhập) | `localStorage` của trình duyệt, khoá `conmaytet:input:v1` | Tới khi bạn xoá — không tự hết hạn | «Làm lại từ đầu» → xác nhận tại chỗ → `clearInput()` xoá cả khoá (có «Hoàn tác» 8 giây); hoặc xoá dữ liệu duyệt web của trình duyệt | Không |
| `mySex` | Giới tính của bạn | Một trong ba giá trị `male` / `female` / `unspecified`, dùng để tra bảng tuổi thọ | Như trên — cùng một khoá, cùng một bản ghi | Như trên | Như trên | Không |
| `fatherBirthYear` | Năm sinh của bố | Năm sinh của bố, số nguyên (`null` = bỏ qua, không tính cho bố) | Như trên | Như trên | Như trên | Không |
| `motherBirthYear` | Năm sinh của mẹ | Năm sinh của mẹ, số nguyên (`null` = bỏ qua, không tính cho mẹ) | Như trên | Như trên | Như trên | Không |
| `visitsPerYear` | Về thăm mỗi năm? | Số lần bạn về thăm bố mẹ mỗi năm (số nguyên, bị chặn trong khoảng 0–365 khi lọc dữ liệu) | Như trên | Như trên | Như trên | Không |
| `livesWithParents` | Tôi đang sống cùng bố mẹ | Cờ đúng/sai: đang sống cùng bố mẹ hay không (đúng = «số lần gặp» được tính theo ngày) | Như trên | Như trên | Như trên | Không |

## Luồng lưu trữ

- Cả 6 trường nằm trong **một bản ghi JSON duy nhất** dưới khoá
  `conmaytet:input:v1`. Không có khoá lưu trữ nào khác cho dữ liệu
  người dùng.
- Mọi thao tác đọc/ghi/xoá đi qua đúng một module — `lib/storage.ts` —
  với ba hàm: `loadInput()` (đọc), `saveInput()` (ghi) và
  `clearInput()` (xoá khoá). Đây là storage adapter duy nhất của app.
- Dữ liệu đọc lên luôn qua `sanitize()` trong cùng module: giá trị
  không hợp lệ (sai kiểu, năm ngoài khoảng 1900–2100, số lần thăm
  ngoài khoảng cho phép…) bị đưa về giá trị an toàn hoặc `null` thay
  vì được dùng nguyên trạng.
- Xoá bằng «Làm lại từ đầu» trong app: yêu cầu xác nhận tại chỗ, gọi
  `clearInput()` để xoá khoá, biểu mẫu trở về trống, và có lớp
  «Hoàn tác» 8 giây khôi phục lại bản ghi vừa xoá nếu bấm nhầm.

## Chia sẻ do người dùng chủ động

Hai hành động chia sẻ đều sinh ra **ngay trên máy người dùng** và chỉ
xảy ra khi người dùng tự bấm: copy đoạn chữ kết quả vào clipboard, và
tải ảnh thẻ kết quả PNG được vẽ bằng canvas trên trình duyệt. App
không tự gửi dữ liệu đi đâu ở bất kỳ thời điểm nào.

## Những gì app không có

- **Không cookie**: app không đặt và không đọc cookie (kiểm chứng bằng
  grep trên mã nguồn `app/`, `components/`, `lib/`: `Set-Cookie` và
  `document.cookie` cho 0 kết quả).
- **Không analytics/tracker**: không tích hợp bất kỳ dịch vụ phân tích
  hay theo dõi nào (grep các dấu hiệu analytics phổ biến trên mã
  nguồn cho 0 kết quả).
- **Không tài khoản, không máy chủ thu thập**: không có đăng ký/đăng
  nhập, không có API nhận dữ liệu nhập; mọi phép tính chạy trong
  trình duyệt.
- Service worker (`public/sw.js`, viết tay) chỉ lưu cache **tài sản
  của app** (trang, biểu tượng, ảnh thương hiệu) để app mở được khi
  mất mạng — nó không lưu dữ liệu bạn nhập.

Chính sách đầy đủ và kênh liên hệ: [PRIVACY.md](PRIVACY.md).
