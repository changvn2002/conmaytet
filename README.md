# Còn Mấy Cái Tết Nữa? — Còn bao nhiêu cái Tết với bố mẹ?

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
