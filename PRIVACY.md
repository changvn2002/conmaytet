# Chính sách riêng tư — Còn Mấy Cái Tết Nữa? (conmaytet)

Cập nhật lần cuối: 2026-10-24. Áp dụng cho bản đang chạy tại
https://conmaytet.vercel.app và mã nguồn trong repo này.

## Tóm tắt trong một đoạn

Còn Mấy Cái Tết Nữa? chạy **hoàn toàn trong trình duyệt của bạn**: không
tài khoản, không máy chủ thu thập dữ liệu, không phân tích hành vi
(analytics), không trình theo dõi (tracker) và app không đặt cookie nào.
Mọi thông tin bạn nhập chỉ được lưu trong `localStorage` của chính trình
duyệt bạn đang dùng, trên chính thiết bị của bạn — không có bản sao nào
ở nơi khác.

## Dữ liệu bạn nhập

App chỉ xử lý đúng 6 trường bạn điền vào biểu mẫu (ngày sinh của bạn,
giới tính của bạn, năm sinh của bố, năm sinh của mẹ, số lần về thăm mỗi
năm, và việc bạn có đang sống cùng bố mẹ hay không). Bản đồ đầy đủ từng
trường — thu thập gì, lưu ở đâu, giữ bao lâu, xoá thế nào — nằm ở
[DATA-MAP.md](DATA-MAP.md). Ngoài 6 trường này, app không thu thập thêm
bất kỳ dữ liệu nào khác về bạn.

## Lưu ở đâu, giữ bao lâu

- Dữ liệu được ghi vào `localStorage` của trình duyệt, dưới khoá duy
  nhất `conmaytet:input:v1`, thông qua bộ lọc `sanitize()` trong
  `lib/storage.ts` (mọi lần đọc/ghi đều đi qua lớp này).
- Dữ liệu **không tự hết hạn**: nó ở đó cho tới khi bạn tự xoá (mục
  dưới) hoặc xoá dữ liệu duyệt web của trình duyệt.
- Nếu trình duyệt chặn `localStorage` (ví dụ chế độ ẩn danh nghiêm
  ngặt), app vẫn tính toán bình thường trong phiên đang mở, chỉ không
  nhớ lại được ở lần mở sau.

## Chia sẻ là do bạn chủ động

Kết quả chỉ rời khỏi trang khi **chính bạn bấm nút chia sẻ**:

- **Copy kết quả**: đoạn chữ kết quả được tạo ngay trên máy bạn và đưa
  vào clipboard của bạn; bạn tự dán vào nơi mình muốn.
- **Tải ảnh thẻ kết quả**: ảnh PNG được vẽ bằng canvas ngay trên máy
  bạn và tải xuống thiết bị của bạn.

App không tự gửi kết quả hay dữ liệu nhập đi bất kỳ đâu, ở bất kỳ thời
điểm nào.

## Bên thứ ba

- Trang được phục vụ qua nền tảng lưu trữ Vercel — đó là hạ tầng phân
  phối trang web, không phải bên nhận dữ liệu bạn nhập: biểu mẫu và mọi
  phép tính chạy trên máy bạn, không có yêu cầu mạng nào mang dữ liệu
  nhập của bạn ra ngoài.
- Phông chữ được đóng gói sẵn trong app (Baloo 2 và Be Vietnam Pro qua
  Fontsource), không tải từ máy chủ phông chữ bên ngoài.
- App không tích hợp dịch vụ quảng cáo, phân tích hay theo dõi của bất
  kỳ bên thứ ba nào.

## Cách xoá dữ liệu của bạn (chính sách xoá)

Bạn xoá toàn bộ dữ liệu đã nhập bất cứ lúc nào, ngay trong app:

1. Bấm **«Làm lại từ đầu»**.
2. App yêu cầu **xác nhận tại chỗ** trước khi xoá, để tránh bấm nhầm.
3. Khi xác nhận, `clearInput()` xoá khoá `conmaytet:input:v1` khỏi
   `localStorage` và biểu mẫu trở về trạng thái trống.

Nếu lỡ tay, app cho bạn lớp **«Hoàn tác» trong 8 giây** sau khi xoá để
khôi phục lại nguyên trạng dữ liệu vừa xoá.

Ngoài ra, xoá dữ liệu duyệt web (site data) của trình duyệt đối với
trang này cũng xoá toàn bộ dữ liệu app đã lưu — vì dữ liệu chỉ tồn tại
ở đó, xoá là xoá hẳn, không còn bản sao nào để khôi phục hay phải yêu
cầu thêm.

## Thay đổi của chính sách này

Khi cách app xử lý dữ liệu thay đổi, file này sẽ được cập nhật trong
repo cùng thay đổi đó, và mục «Cập nhật lần cuối» ở đầu file sẽ đổi
theo.

## Liên hệ

Mọi câu hỏi về riêng tư, yêu cầu liên quan đến dữ liệu, báo lỗi và góp
ý đều qua một kênh duy nhất: GitHub Issues của repo —
https://github.com/changvn2002/conmaytet/issues
