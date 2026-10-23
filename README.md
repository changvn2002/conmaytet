# Còn Mấy Cái Tết Nữa? — Còn bao nhiêu cái Tết với bố mẹ?

**▶ Dùng ngay: [https://conmaytet.vercel.app](https://conmaytet.vercel.app)** — không
cần đăng nhập, không cài app, mở link là tính được ngay trên trình duyệt.

<p align="center">
  <img src="docs/screenshots/conmaytet-desktop.png" alt="Còn Mấy Cái Tết Nữa? — kết quả: còn 16 cái Tết với bố và 24 cái Tết với mẹ" width="900">
</p>
<p align="center"><em>Một người sinh năm 1995, bố sinh 1965, mẹ sinh 1968, mỗi năm về nhà 2 lần: app tính ra còn khoảng <strong>16 cái Tết với bố</strong> (32 lần gặp) và <strong>24 cái Tết với mẹ</strong> (47 lần gặp), kèm lưới tuần cuộc đời ngay bên dưới. Ảnh chụp thật từ bản production đang chạy.</em></p>

Đi làm xa, mỗi năm về nhà được một hai lần — vậy **còn bao nhiêu cái Tết với bố
mẹ** nữa? **Còn Mấy Cái Tết Nữa?** giúp bạn nhìn thấy con số đó: nhập năm sinh
của bạn và của bố mẹ, công cụ ước tính số cái Tết và số lần gặp còn lại theo
bảng tuổi thọ trung bình của người Việt Nam, kèm "cuộc đời trong một trang" —
lưới tuần của chính bạn.

Đây là **ước tính thống kê** từ số liệu dân số chính thống — không phải bói
toán, không phải dự đoán cho bất kỳ cá nhân nào. Con số chỉ để nhắc chúng ta
trân trọng và chủ động sắp xếp thời gian bên bố mẹ.

Không cần đăng nhập. Không có máy chủ. Mọi phép tính chạy ngay trong trình
duyệt của bạn.

## 🖼️ Ảnh chụp từ bản live

Tất cả ảnh dưới đây được chụp trực tiếp từ bản production
[https://conmaytet.vercel.app](https://conmaytet.vercel.app) khi app đang ở
trạng thái **đã nhập xong một bộ dữ liệu đầy đủ và hiển thị kết quả** — đúng
những gì người dùng nhìn thấy sau khi nhập, không phải màn hình trống lúc mới
mở app hay ảnh dựng sẵn. Bộ dữ liệu trong ảnh: bạn sinh 15/06/1995, bố sinh
1965, mẹ sinh 1968, về thăm nhà 2 lần/năm.

### Kết quả — giá trị cốt lõi của app

![Desktop 1440×900 — hai thẻ kết quả bố/mẹ và đầu lưới tuần cuộc đời](docs/screenshots/conmaytet-desktop.png)

_Trên desktop: hai thẻ kết quả nằm cạnh nhau — **với bố (61 tuổi): 16 cái Tết
nữa, khoảng 32 lần gặp**; **với mẹ (58 tuổi): 24 cái Tết nữa, khoảng 47 lần
gặp** — kèm dòng lưu ý đây là ước tính thống kê, và ngay bên dưới là lưới tuần
cuộc đời bắt đầu hiện ra._

| Mobile (390×844) | Social / link-preview (1280×640) |
| --- | --- |
| ![Mobile — hai thẻ kết quả xếp dọc trên điện thoại](docs/screenshots/conmaytet-mobile.png) | ![Social — khung ngang vẫn thấy trọn hai thẻ kết quả](docs/screenshots/conmaytet-social.png) |
| _Trên điện thoại, hai thẻ kết quả xếp dọc: con số Tết lớn đọc rõ trong một màn hình, cuộn nhẹ là thấy thẻ của mẹ và phần giải thích._ | _Khung 1280×640 dùng khi gửi link app qua Zalo/Facebook — vẫn thấy trọn hai thẻ kết quả và đầu lưới tuần._ |

### Theo từng bước sử dụng

**Bước 1 — Nhập ngày sinh của bạn, năm sinh của bố mẹ và nhịp về thăm.** Kết
quả tự cập nhật ngay khi nhập, không cần bấm nút tính.

![Bước 1 — form đã nhập: sinh 1995, bố 1965, mẹ 1968, về thăm 2 lần/năm](docs/screenshots/gallery-01-form-da-nhap.png)

**Bước 2 — Đọc con số của từng người.** Mỗi thẻ hiện số cái Tết còn lại bằng
số lớn, số lần gặp còn lại theo nhịp về thăm hiện tại, và mốc tuổi thọ kỳ vọng
trung bình mà phép tính dựa vào.

![Bước 2 — hai thẻ kết quả: 16 Tết với bố, 24 Tết với mẹ](docs/screenshots/gallery-02-ket-qua-bo-me.png)

**Bước 3 — Nhìn cuộc đời mình trong một trang.** Mỗi chấm là một tuần: phần
đỏ là những tuần đã sống, chấm vàng là tuần này, phần nhạt là những tuần còn
lại theo kỳ vọng thống kê — trong ảnh là 1.636 tuần đã qua trên tổng số khoảng
3.780 tuần (43,3%) của một người sinh năm 1995.

![Bước 3 — lưới tuần cuộc đời: tuần đã sống, tuần này và tuần còn lại](docs/screenshots/gallery-03-luoi-tuan-cuoc-doi.png)

## Tính năng

- **Số Tết còn lại với bố và với mẹ** — tra tuổi thọ kỳ vọng còn lại theo đúng
  độ tuổi hiện tại trong bảng sống, rồi đếm số ngày mùng 1 Tết Nguyên Đán thật
  trong khoảng kỳ vọng (thuật toán âm lịch Việt Nam của Hồ Ngọc Đức, múi giờ
  UTC+7 — không hardcode danh sách năm).
- **Số lần gặp còn lại** — theo nhịp về thăm mỗi năm của bạn; thử tăng thêm
  một lần về mỗi năm và thấy tổng số lần gặp thay đổi ngay. Nếu đang sống cùng
  bố mẹ, công cụ tính theo ngày bên nhau.
- **Cuộc đời trong một trang** — lưới tuần (life in weeks): mỗi chấm là một
  tuần đời bạn, kèm số ngày đã sống, số lần trăng tròn xấp xỉ và số cái Tết
  bạn đã trải qua.
- **Chia sẻ kết quả** — copy đoạn text gửi Zalo/Facebook hoặc tải ảnh thẻ kết
  quả vẽ bằng canvas ngay trên trình duyệt.
- **Nhớ dữ liệu cho lần sau** — input lưu trong localStorage của chính trình
  duyệt bạn; nút "Làm lại từ đầu" xoá sạch.

## Số liệu & phương pháp

- **Một hệ số liệu duy nhất:** bảng sống Việt Nam 2019 của Tổ chức Y tế Thế
  giới (WHO, công bố 2020) trên WHO Global Health Observatory — cột tuổi thọ
  kỳ vọng còn lại theo Dang & Do (2025), *SAGE Open*, DOI
  10.1177/21582440251324694. Tuổi thọ trung bình khi sinh theo cùng bảng:
  73,7 năm (nam 69,6; nữ 78,1). App không trộn số liệu của hệ thống kê khác.
- Giá trị ở các tuổi lẻ giữa hai mốc 5 năm của bảng là **nội suy tuyến tính
  ước tính**, có ghi rõ trong app.
- Ngày Tết được tính bằng thuật toán âm lịch, đã kiểm chứng khớp 12/12 năm
  2024–2035 với bảng ngày Tết theo giờ Hà Nội (UTC+7).

## Công nghệ

- Next.js 16 + React 19 + Tailwind CSS 4, hoàn toàn client-side.
- Logic thuần tách riêng trong `lib/` (`lunar`, `life-table`, `data`, `calc`,
  `share-card`, `storage`) và được kiểm chứng bằng Vitest — gồm test thuật
  toán âm lịch với ground truth ngày Tết 2024–2035 đã verify độc lập.
- Nội dung giải thích + FAQ được render phía server; JSON-LD WebApplication +
  FAQPage; SEO/PWA đầy đủ: metadata + Open Graph, sitemap, robots, web app
  manifest, icon cài lên màn hình chính, chạy standalone.

## Chạy local

```bash
pnpm install
pnpm dev        # http://localhost:3100
pnpm test       # unit test cho âm lịch, bảng tuổi thọ và phép tính kết quả
pnpm build      # bản production
```

Biến môi trường duy nhất (tuỳ chọn): `NEXT_PUBLIC_SITE_URL` — URL gốc của bản
production cho SEO, mặc định `https://conmaytet.vercel.app`. Xem `.env.example`.

## Quyền riêng tư

App không thu thập dữ liệu: mọi thông tin bạn nhập chỉ nằm trong
`localStorage` của chính trình duyệt bạn đang dùng, không gửi đi đâu cả.

## Giấy phép

MIT — xem `LICENSE`. Riêng tài sản thương hiệu (logo, artwork trong
`public/`) không thuộc phạm vi MIT, xem `BRAND.md`.
