# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Người dùng chính là người Việt trẻ đi học, đi làm xa quê — con cái đã rời nhà,
sống khác tỉnh/thành với bố mẹ, mỗi năm chỉ về thăm một vài lần, dịp Tết là lần
sum vầy chắc chắn nhất. Họ mở công cụ này trên điện thoại, thường trong một
khoảnh khắc rất riêng: gần Tết, sau một cuộc gọi về nhà, hoặc khi chợt nhận ra
bố mẹ đã già đi nhiều. Cùng lúc tính cho cả nhà: bố, mẹ, và chính mình.

Một nhóm người dùng thứ cấp: người đang sống cùng bố mẹ — với họ, con số được
tính theo ngày bên nhau thay cho số lần về thăm.

Công việc họ cần làm xong: nhập năm sinh của mình và của bố mẹ, số lần về thăm
mỗi năm — và nhận lại một con số cụ thể, đáng tin: còn khoảng bao nhiêu cái Tết
với bố, với mẹ; còn khoảng bao nhiêu lần gặp nữa; và cuộc đời của chính mình
nhìn trong một lưới tuần.

## Product Purpose

Còn Mấy Cái Tết Nữa? ước tính số cái Tết và số lần gặp còn lại với bố mẹ dựa
trên bảng sống (bảng tuổi thọ) Việt Nam của WHO, tra tuổi thọ kỳ vọng còn lại
theo đúng độ tuổi hiện tại và giới tính, rồi đếm số ngày mùng 1 Tết Nguyên Đán
bằng thuật toán âm lịch Việt Nam (múi giờ UTC+7). Kèm theo là lưới tuần cuộc
đời của chính người dùng: tổng số tuần kỳ vọng, số tuần đã sống, phần trăm đời
người đã qua, cùng các mốc phụ như số ngày đã sống và số cái Tết đã trải qua.

Thành công = người dùng nhìn thấy con số của gia đình mình và chuyển nó thành
một hành động cụ thể — về thăm sớm hơn, gọi điện thường xuyên hơn, ở lại lâu
hơn — thay vì một cảm giác mơ hồ "để khi nào rảnh". Con số là lời nhắc yêu
thương, không phải lời tiên tri.

## Positioning

Đây là công cụ tính bằng thống kê dân số thật, không phải bói toán: nó tra
bảng sống theo tuổi hiện tại (không lấy tuổi thọ khi sinh trừ tuổi — cách tính
sai mà các công cụ đếm ngược thông thường vẫn dùng) và đếm Tết từ lịch âm Việt
Nam thật, mỗi năm đúng một mùng 1. Nguồn số liệu được ghi nguyên văn ngay dưới
kết quả. Không sản phẩm tương tự nào ở thị trường Việt Nam làm cả hai việc đó
cùng lúc với độ minh bạch này.

## Operating Context

- Dùng trên trình duyệt điện thoại là chính; không cần cài app, không cần tài
  khoản, không có máy chủ — mọi phép tính chạy ngay trong trình duyệt.
- Dữ liệu người dùng nhập chỉ lưu trong localStorage của trình duyệt đó, mở
  lại là còn, và xoá sạch bằng nút "Làm lại từ đầu".
- Người dùng chia sẻ kết quả bằng cách copy đoạn văn bản hoặc tải ảnh thẻ kết
  quả (vẽ bằng canvas trong trình duyệt) để gửi cho người thân qua Zalo,
  Messenger — kênh lan truyền chính của sản phẩm.
- Cao điểm sử dụng: những tuần trước Tết Nguyên Đán và các dịp về quê, giỗ,
  lễ Vu Lan.

## Capabilities and Constraints

- Tính được cho bố và mẹ riêng biệt (có thể bỏ qua một người); bố tra bảng
  nam, mẹ tra bảng nữ; giới tính của người dùng tuỳ chọn (nam/nữ/không chọn).
- Số lần gặp còn lại = số năm kỳ vọng còn lại × số lần về thăm mỗi năm; khi
  sống cùng bố mẹ, tính theo số ngày.
- Ràng buộc trung thực bắt buộc: mọi con số là trung bình thống kê của toàn
  dân số, tuyệt đối không được trình bày như dự đoán cho cá nhân; luôn có câu
  miễn trừ hiển thị cùng kết quả và nguồn số liệu ngay dưới kết quả.
- Ràng buộc dữ liệu: tuổi của bố mẹ suy ra từ năm sinh nên sai số ±1 tuổi —
  phải công bố trong phần phương pháp.
- Ràng buộc kỹ thuật: bảng sống nhúng sẵn trong mã nguồn (lib/data.ts, WHO
  2019 Việt Nam); âm lịch tính bằng thuật toán, không hardcode danh sách năm.
- Không thu thập, không gửi đi bất kỳ dữ liệu nào của người dùng.

## Brand Commitments

- Tên sản phẩm: "Còn Mấy Cái Tết Nữa?" — câu hỏi là tên gọi, giữ nguyên dấu
  hỏi trong mọi ngữ cảnh hiển thị chính thức.
- Nhận diện: bao lì xì vàng + cành thông trên nền xanh thông `#1F4D3A`
  (logo SVG tại public/products/brand/conmaytet-logo.svg là nguồn sự thật
  duy nhất; xem BRAND.md).
- Giọng văn: ấm, trang trọng, đầy hy vọng. Con số dù nhỏ cũng được nói như
  lời nhắc trân trọng ("còn 14 cái Tết — đủ để trân trọng từng lần về nhà"),
  không bao giờ như lời đe doạ hay đếm ngược tang tóc.

## Evidence on Hand

- Bảng sống Việt Nam 2019 của WHO (tuổi thọ kỳ vọng khi sinh và còn lại theo
  tuổi/giới) — nhúng trong lib/data.ts kèm trích nguồn nguyên văn
  DATA_SOURCE_VI hiển thị trên trang.
- Kiểm chứng thuật toán âm lịch: ngày mùng 1 Tết tính được khớp 12/12 năm đối
  chiếu ground truth độc lập (ghi trong báo cáo Team Core/DataVerify).
- Nội dung phương pháp và FAQ trung thực tại lib/content.ts — cùng một nguồn
  cho phần hiển thị và JSON-LD FAQPage, không thể lệch nhau.
- Không có testimonial, số liệu người dùng hay tuyên bố marketing nào khác;
  không được bịa thêm.

## Product Principles

1. **Thống kê, không số mệnh.** Mọi con số đều truy được về bảng sống và lịch
   âm thật; chỗ nào là ước tính, chỗ đó nói rõ là ước tính.
2. **Con số để hành động, không để sợ.** Mọi cách trình bày kết quả phải dẫn
   về một việc làm được ngay: về thăm, gọi điện, ở lại lâu hơn.
3. **Hy vọng là tông mặc định.** Trang trọng và ấm; cái chết không bao giờ là
   chủ đề trực diện — thời gian bên nhau mới là chủ đề.
4. **Riêng tư tuyệt đối.** Không tài khoản, không máy chủ, không theo dõi;
   dữ liệu của gia đình người dùng không rời khỏi máy của họ.
5. **Một màn hình, một câu hỏi.** Công cụ trả lời đúng câu hỏi trong tên gọi
   của nó trước, mọi thứ khác (lưới tuần, mốc phụ) là phụ trợ.

## Accessibility & Inclusion

- Người dùng chính đọc trên điện thoại, ngoài trời hoặc trong nhà ga/bến xe:
  con số chính phải thật lớn, tương phản cao, không phụ thuộc vào màu sắc để
  hiểu (lưới tuần luôn có chú thích chữ đi kèm).
- Bố mẹ của người dùng cũng có thể là người đọc kết quả được gửi tới: cỡ chữ
  thân bài không nhỏ, câu chữ plain Vietnamese, tránh thuật ngữ thống kê khó.
