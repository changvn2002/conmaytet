---
name: Còn Mấy Cái Tết Nữa?
description: Đếm số Tết còn bên bố mẹ bằng thống kê tuổi thọ — ấm, trang trọng, đầy hy vọng.
colors:
  primary: "#8C1D18"
  primary-deep: "#6E130E"
  primary-soft: "#F6E3DE"
  gold: "#A87E1F"
  paper: "#FAF6EF"
  card: "#FFFFFF"
  ink: "#221D1A"
  muted: "#6E6259"
  line: "#E8DCCB"
  notice-warn-bg: "#FBF3DC"
  notice-warn-text: "#7A5B12"
typography:
  display:
    fontFamily: "Outfit, Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
  headline:
    fontFamily: "Outfit, Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
    fontSize: "1.5rem"
    lineHeight: 1.25
  body:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    fontSize: "1rem"
    lineHeight: 1.625
  label:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
    fontSize: "0.875rem"
rounded:
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  chip-radio-selected:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  chip-radio:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  stat-tile:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "12px"
---

# Design System: Còn Mấy Cái Tết Nữa?

## Overview

**Creative North Star: "Mâm Cơm Giao Thừa"**

Một mâm cơm giao thừa không ồn ào: nền giấy ấm như tờ lịch treo tường nhà bố
mẹ, mực nâu đen, và một màu đỏ sơn mài trầm — màu của bao lì xì, của câu đối,
của sự sum vầy — nói rất ít nhưng mỗi lần xuất hiện đều có trọng lượng. Hệ
thống này phục vụ một khoảnh khắc cảm xúc cao trên điện thoại: người trẻ xa
quê nhìn thấy con số của gia đình mình. Vì vậy mọi quyết định thị giác đều
quy về một câu hỏi: người đọc có thấy được nâng niu không?

Con số lớn là nhân vật chính và luôn được khung như một lời nhắc yêu thương —
"còn 14 cái Tết — đủ để trân trọng từng lần về nhà" — không bao giờ như một
đồng hồ đếm ngược. Trang trọng không có nghĩa là tang tóc: không nền tối,
không hiệu ứng gây sợ, không chữ xám nhỏ cho thông tin quan trọng. Độ sâu đến
từ hai bóng đổ mềm và sự phân tầng giấy/trắng, không phải từ màu mè.

**Key Characteristics:**

- Màu đặc 100%; đỏ sơn mài chỉ dành cho con số chính, hành động chính, lựa chọn đang chọn và tuần đã sống trong lưới đời.
- Nền giấy ấm `#FAF6EF`, thẻ trắng, mực `#221D1A` — tương phản cao cho người đọc ở mọi độ tuổi, kể cả bố mẹ của người dùng khi nhận kết quả được gửi tới.
- Con số chính cỡ chữ 72px (text-7xl) bằng Outfit; không thông tin cốt lõi nào nằm dưới cỡ chữ thân bài.
- Số liệu và nguồn thống kê luôn đứng ngay dưới kết quả, trang trọng, cùng cột đọc — không chôn ở chân trang.
- Vàng đồng xuất hiện tối thiểu: nhuỵ hoa mai trong logo, dấu mốc "tuần này" trong lưới tuần, vài đường nhấn hiếm hoi.

## Colors

Một bảng màu mượn từ vật liệu ngày Tết: sơn mài, giấy, mực tàu và một vệt vàng
đồng. Đỏ là tiếng nói duy nhất; phần còn lại là nền ấm trung tính.

### Primary

- **Đỏ Sơn Mài** (#8C1D18): màu thương hiệu — con số Tết còn lại, nút hành động chính, trạng thái đang chọn, chấm tuần đã sống. Sẫm và nâu hơn đỏ crimson của các app chị em; trầm, không chói.
- **Đỏ Sơn Mài Sâu** (#6E130E): trạng thái hover của hành động chính và chữ trên nền tint đỏ; không bao giờ dùng làm nền diện rộng.

### Secondary

- **Vàng Đồng** (#A87E1F): điểm nhấn khan hiếm — nhuỵ hoa mai, chấm "tuần này" trong lưới cuộc đời, mốc phân tách hiếm. Không làm nền khối lớn, không làm chữ thân bài.

### Tertiary

- **Hồng Sơn Mài Nhạt** (#F6E3DE): tint của đỏ — nền khối báo lỗi nhập liệu và nền hover của nút viền. Chữ trên nền này luôn là Đỏ Sơn Mài Sâu hoặc Mực, không bao giờ xám.

### Neutral

- **Giấy Ấm** (#FAF6EF): nền toàn trang và nền ô nhập liệu; ấm hơn trắng, gợi giấy lịch và trang vở.
- **Trắng Thẻ** (#FFFFFF): bề mặt của thẻ nội dung và thẻ kết quả trên nền giấy.
- **Mực** (#221D1A): chữ chính, tiêu đề, con số phụ — nâu đen mềm hơn đen thuần nhưng vẫn tương phản rất cao trên Giấy Ấm.
- **Mực Nhạt** (#6E6259): chữ phụ, giải thích, chú thích — chỉ trên nền Giấy Ấm hoặc Trắng Thẻ, không bao giờ trên nền có màu.
- **Đường Kẻ Ấm** (#E8DCCB): viền thẻ, đường chia, và chấm tuần chưa sống trong lưới cuộc đời.

### Named Rules

**The One Red Rule.** Đỏ sơn mài chỉ xuất hiện khi nó mang ý nghĩa: con số chính, hành động chính, lựa chọn, tuần đã sống. Một màn hình mà đỏ làm nền trang trí là một màn hình sai.

**The Hope Rule.** Không nền đen/tối, không khung viền tang, không hiệu ứng mờ dần kiểu tưởng niệm. Bất kỳ thành phần nào khiến người đọc liên tưởng đến đám tang đều bị loại, dù nó "đẹp".

**The Source Stays Close Rule.** Khối nguồn số liệu (DATA_SOURCE_VI) đứng ngay dưới kết quả trong cùng cột đọc, không thu nhỏ dưới 12px và không tách sang trang/cột khác.

## Typography

**Display Font:** Outfit (với Be Vietnam Pro dự phòng — Outfit thiếu một số dấu tiếng Việt nên mọi chữ hiển thị đều phải kiểm tra dấu với font dự phòng)
**Body Font:** Be Vietnam Pro (với ui-sans-serif, system-ui dự phòng)
**Label Font:** Be Vietnam Pro semibold

**Character:** Outfit hình học, tròn và chắc, cho các con số cảm giác "khắc trên gỗ" — vững, không lạnh. Be Vietnam Pro mang đủ dấu tiếng Việt hoàn hảo cho thân bài dài, giọng văn ấm và rõ. Cặp font này nói cùng một thứ: hiện đại nhưng gốc gác gia đình.

### Hierarchy

- **Display / Số Tết** (Outfit, 700, 72px, line-height 1): con số "cái Tết nữa" trong thẻ kết quả của bố và mẹ — phần tử lớn nhất trang, luôn màu Đỏ Sơn Mài.
- **Display / H1** (Outfit, 700, 30–36px, line-height 1.25): câu hỏi tên sản phẩm, một lần duy nhất.
- **Headline** (Outfit, 700, 24px): tiêu đề các mục nội dung ("Cuộc đời bạn trong một trang", các H2 giải thích/FAQ).
- **Title** (Outfit, 700, 18–20px): tên sản phẩm ở header, nhãn "cái Tết nữa" dưới con số chính.
- **Body** (Be Vietnam Pro, 400, 16px, line-height 1.625): mọi đoạn giải thích; độ dài dòng giữ trong cột tối đa 4xl của trang, phần mở đầu giới hạn ~65 ký tự/dòng (max-w-2xl).
- **Label** (Be Vietnam Pro, 600, 14px): nhãn trường nhập, nhãn thẻ kết quả (uppercase, tracking rộng cho thẻ bố/mẹ).
- **Caption** (Be Vietnam Pro, 400, 12px): chỉ cho chú thích phụ trợ như nguồn số liệu rút gọn, thang slider, chú thích lưới tuần — không bao giờ cho nội dung người dùng buộc phải đọc để hiểu kết quả.

### Named Rules

**The Big Number Rule.** Con số Tết còn lại không bao giờ nhỏ hơn 60px và không bao giờ đứng một mình: ngay dưới nó phải có đơn vị ("cái Tết nữa") và một câu diễn giải đầy hy vọng trong cùng thẻ.

**The No Small Print Rule.** Miễn trừ thống kê và nguồn số liệu là nội dung hạng nhất: câu miễn trừ ở cỡ chữ thân bài nhỏ (14px, đậm các cụm khóa), nguồn ở tối thiểu 12px — không chôn, không làm mờ.

## Layout

Trang một cột, khung tối đa 4xl (896px), canh giữa, đệm ngang 16px (24px từ sm). Nhịp dọc: công cụ nhập liệu trước, kết quả ngay dưới, rồi các mục nội dung giải thích — phương pháp — FAQ, mỗi mục cách nhau 48–56px. Người dùng chính đọc trên điện thoại một tay: form xếp 1 cột trên mobile, 2 cột từ 640px; thẻ kết quả của bố/mẹ xếp chồng trên mobile, sóng đôi từ 640px.

Lưới tuần cuộc đời là thành phần chữ ký: lưới chấm tròn 52 cột (một hàng = một năm), khoảng cách 3px, chấm đã sống màu đỏ, tuần hiện tại màu vàng đồng có vòng nhấn, tuần còn lại màu Đường Kẻ Ấm — luôn kèm chú thích bằng chữ, không dựa vào màu đơn độc. Các ô thống kê phụ dưới lưới xếp 2 cột trên mobile, 4 cột từ 640px.

## Elevation & Depth

Độ sâu phẳng và ấm: thẻ trắng nổi trên nền giấy bằng một bóng đổ hai lớp rất mềm (ambient + contact) và viền Đường Kẻ Ấm 1px. Không có bề mặt nào nổi cao hơn thẻ; bóng "lift" chỉ dành cho lớp phủ tương lai (sheet/dialog) nếu có. Màu sắc không bao giờ mô phỏng độ sâu — không gradient dưới mọi hình thức.

### Shadow Vocabulary

- **shadow-card** (`0 1px 2px rgba(34,29,26,0.05), 0 8px 24px rgba(34,29,26,0.06)`): mọi thẻ đang nghỉ — thẻ nhập liệu, thẻ kết quả, thẻ lưới tuần, mục FAQ.
- **shadow-lift** (`0 2px 4px rgba(34,29,26,0.06), 0 16px 40px rgba(34,29,26,0.10)`): chỉ cho lớp phủ tạm thời nổi trên trang; hiện chưa có thành phần nào dùng.

### Named Rules

**The Flat Rows Rule.** Bên trong một thẻ, các hàng/ô con được phân tách bằng khoảng trống hoặc nền Giấy Ấm rất nhẹ (ô thống kê) — không lồng thẻ bo góc có viền trong thẻ khác.

## Shapes

Góc bo hào phóng và nhất quán: 16px (rounded-2xl) cho mọi thẻ, 12px (rounded-xl) cho ô nhập, nút, chip chọn và ô thống kê. Chấm của lưới tuần và chấm chú thích là hình tròn hoàn hảo. Viền luôn 1px Đường Kẻ Ấm khi cần tách nền; không viền dày, không góc vuông ở bất kỳ thành phần tương tác nào. Logo hoa mai giữ nguyên bo góc và tỉ lệ gốc từ file SVG — không cắt, không đặt lại màu.

## Components

### Buttons

- **Shape:** bo 12px, chữ Be Vietnam Pro semibold 14px, vùng chạm tối thiểu 44px chiều cao.
- **Primary:** nền Đỏ Sơn Mài, chữ trắng — dành cho hành động chia sẻ kết quả ("Copy kết quả gửi người thân"); hover chuyển Đỏ Sơn Mài Sâu trong 150ms; focus-visible có outline đỏ sâu rõ ràng.
- **Outline:** viền Đỏ Sơn Mài, chữ Đỏ Sơn Mài trên nền thẻ — hành động phụ ("Tải ảnh thẻ kết quả"); hover phủ Hồng Sơn Mài Nhạt.
- **Ghost:** viền Đường Kẻ Ấm, chữ Mực, nền Giấy Ấm — hành động phá huỷ nhẹ ("Làm lại từ đầu"); hover viền chuyển Đỏ Sơn Mài.

### Chips

- **Radio chip (giới tính):** nhóm 3 chip chọn một, có role radio/aria-checked đầy đủ. Chip đang chọn: nền Đỏ Sơn Mài, chữ trắng. Chip chưa chọn: nền Giấy Ấm, viền Đường Kẻ Ấm, chữ Mực; hover viền ấm lên Đỏ Sơn Mài. Cả hàng chip cao tối thiểu 44px để chạm dễ trên điện thoại.

### Cards / Containers

- **Corner Style:** bo 16px.
- **Background:** Trắng Thẻ trên nền Giấy Ấm; thẻ kết quả của bố/mẹ canh giữa toàn bộ nội dung.
- **Shadow Strategy:** shadow-card khi nghỉ; không đổi bóng theo hover (thẻ không phải nút).
- **Border:** 1px Đường Kẻ Ấm.
- **Internal Padding:** 20px (mobile) / 24px (từ sm).

### Inputs / Fields

- **Style:** nền Giấy Ấm, viền 1px Đường Kẻ Ấm, bo 12px, chữ 16px Mực (16px là bắt buộc để iOS không tự phóng khi focus), đệm 10px 14px.
- **Focus:** viền chuyển Đỏ Sơn Mài kèm outline đỏ sâu khi focus-visible — trạng thái focus phải nhìn thấy được bằng mắt thường, không chỉ đổi màu viền nhẹ.
- **Slider (số lần về thăm):** accent Đỏ Sơn Mài; giá trị hiện tại hiển thị bằng số Outfit 18px màu đỏ ngay cạnh nhãn; thang mốc dưới slider bằng chữ 12px Mực Nhạt.
- **Checkbox (sống cùng bố mẹ):** ô 20px accent Đỏ Sơn Mài, cả khối nhãn bấm được, kèm câu giải thích 14px.

### Notices

- **Lỗi nhập liệu:** nền Hồng Sơn Mài Nhạt, chữ Đỏ Sơn Mài Sâu, có role="alert" — lỗi nói rõ vấn đề và cách sửa, đứng ngay trong form.
- **Cảnh báo mềm:** nền vàng nhạt `#FBF3DC`, chữ `#7A5B12` — dành cho cảnh báo không chặn tính toán (ví dụ năm sinh bố mẹ sát tuổi con). Chữ trên hai nền này không bao giờ là Mực Nhạt.

### Signature: Parent Result Card (Thẻ Tết của bố/mẹ)

Thẻ trắng canh giữa: nhãn uppercase "CÒN KHOẢNG VỚI BỐ (… TUỔI)", con số 72px Đỏ Sơn Mài, đơn vị "cái Tết nữa", rồi một câu diễn giải có con số lần gặp/ngày bên nhau và mốc tuổi thọ kỳ vọng. Cấu trúc thẻ của bố và mẹ giống hệt nhau để hai con số đặt cạnh nhau tự kể câu chuyện — không trang trí thêm, không icon cảm xúc.

### Signature: Life Week Grid (Lưới tuần cuộc đời)

Lưới chấm 52 cột trong thẻ trắng, có role="img" và aria-label tóm tắt bằng số. Chú thích ba trạng thái luôn đi kèm. Dưới lưới là 4 ô thống kê nền Giấy Ấm (ngày đã sống, lần trăng tròn, số Tết đã qua, % đời đã qua) — các con số phụ dùng Outfit 20px màu Mực, giữ đỏ cho duy nhất con số chính của trang.

## Do's and Don'ts

### Do:

- **Do** trình bày mọi con số kết quả kèm một câu diễn giải đầy hy vọng ngay trong cùng thẻ ("còn khoảng… nếu giữ nhịp về thăm như hiện tại").
- **Do** giữ khối nguồn số liệu ngay dưới kết quả, tối thiểu 12px, trong cùng cột đọc (The Source Stays Close Rule).
- **Do** dùng Đỏ Sơn Mài đúng bốn việc: con số chính, hành động chính, trạng thái chọn, tuần đã sống.
- **Do** giữ mọi vùng chạm từ 44px và trạng thái focus-visible nhìn rõ trên mọi thành phần tương tác.
- **Do** kiểm tra dấu tiếng Việt của mọi chữ hiển thị bằng Outfit (font dự phòng Be Vietnam Pro) trước khi chốt một tiêu đề mới.

### Don't:

- **Don't** dùng gradient dưới bất kỳ hình thức nào — nền, chữ, hay trang trí.
- **Don't** dùng nền tối, khung tang, hình ảnh u ám, hiệu ứng tưởng niệm hay bất kỳ ẩn dụ cái chết trực diện nào (The Hope Rule).
- **Don't** đặt chữ Mực Nhạt/xám lên nền có màu (tint đỏ, vàng nhạt); trên nền màu, chữ là Mực, Đỏ Sơn Mài Sâu hoặc màu thông báo tương ứng.
- **Don't** lồng thẻ trong thẻ; phân tách nội bộ bằng khoảng trống hoặc nền Giấy Ấm nhẹ (The Flat Rows Rule).
- **Don't** thu nhỏ con số chính, câu miễn trừ thống kê, hay nguồn số liệu xuống dạng "chữ nhỏ chân trang".
- **Don't** dùng emoji hoặc glyph unicode làm icon — icon chỉ từ Lucide, cùng một độ dày nét.
