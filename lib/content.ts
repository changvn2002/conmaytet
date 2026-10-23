import { LIFE_EXPECTANCY_AT_BIRTH } from './data';

/**
 * Nội dung tĩnh của trang (render phía server cho SEO): phần giải thích dưới
 * công cụ + FAQ. Cùng một nguồn này vừa hiển thị cho người đọc vừa sinh
 * JSON-LD FAQPage trong app/page.tsx — hai nơi không bao giờ lệch nhau.
 * Mọi câu chữ tuân theo nguyên tắc trung thực: thống kê trung bình,
 * không bói toán, không dự đoán cá nhân.
 */

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Còn bao nhiêu cái Tết với bố mẹ — công cụ này tính thế nào?',
    a: 'Bạn nhập năm sinh của bố và của mẹ. Công cụ tra bảng tuổi thọ Việt Nam để ước tính số năm kỳ vọng còn lại ở độ tuổi hiện tại của bố/mẹ, rồi đếm số ngày mùng 1 Tết Nguyên Đán nằm trong khoảng thời gian đó bằng thuật toán âm lịch Việt Nam (múi giờ UTC+7). Vì mỗi năm chỉ có đúng một Tết Nguyên Đán nên số Tết còn lại xấp xỉ số năm kỳ vọng còn lại, chênh lệch tuỳ thời điểm hiện tại trong năm.',
  },
  {
    q: 'Tuổi thọ trung bình của người Việt Nam là bao nhiêu?',
    a: `Theo bảng sống Việt Nam 2019 của Tổ chức Y tế Thế giới (WHO) mà công cụ này sử dụng, tuổi thọ trung bình khi sinh là ${String(LIFE_EXPECTANCY_AT_BIRTH.both).replace('.', ',')} năm — nam ${String(LIFE_EXPECTANCY_AT_BIRTH.male).replace('.', ',')} năm và nữ ${String(LIFE_EXPECTANCY_AT_BIRTH.female).replace('.', ',')} năm. Lưu ý quan trọng: người đã sống tới 60 tuổi thì kỳ vọng sống thêm của họ cao hơn nhiều so với phép trừ đơn giản từ tuổi thọ khi sinh, vì họ đã vượt qua các rủi ro tử vong ở tuổi trẻ — đó là lý do công cụ tra tuổi thọ còn lại theo đúng độ tuổi hiện tại thay vì lấy tuổi thọ khi sinh trừ đi tuổi.`,
  },
  {
    q: 'Số liệu tuổi thọ lấy từ đâu, có đáng tin không?',
    a: 'Số liệu lấy từ bảng sống Việt Nam 2019 của Tổ chức Y tế Thế giới (WHO), công bố năm 2020. Đây là số liệu thống kê dân số chính thống, được dùng trong nghiên cứu y tế công cộng, không phải số liệu tự chế. Nguồn đầy đủ và cách công cụ dùng số liệu này — xem mục Cách tính & nguồn.',
  },
  {
    q: 'Đây có phải bói toán hay xem số mệnh không?',
    a: 'Không. Công cụ chỉ dùng thống kê tuổi thọ trung bình của toàn dân số — cùng một phép tính mà các công ty bảo hiểm và nhà hoạch định chính sách dân số sử dụng. Con số cho ra là trung bình của hàng triệu người, không phải dự đoán dành cho bố, mẹ hay chính bạn. Rất nhiều người sống thọ hơn con số trung bình này rất nhiều.',
  },
  {
    q: 'Vì sao nên tính còn mấy cái Tết với bố mẹ?',
    a: 'Vì thời gian bên bố mẹ hữu hạn hơn chúng ta tưởng, nhất là khi đi làm xa và mỗi năm chỉ về nhà một hai lần. Một người về thăm nhà 2 lần mỗi năm, nếu bố mẹ còn khoảng 15 năm kỳ vọng, nghĩa là phía trước còn khoảng 30 lần gặp và 15 cái Tết để trân trọng. Nhìn thấy con số cụ thể giúp mỗi người tự quyết định rõ hơn cho chính mình: gọi điện thường xuyên hơn, sắp xếp về thăm nhiều hơn, và trân trọng từng dịp sum vầy thay vì để dành đến "khi nào rảnh".',
  },
  {
    q: 'Số lần gặp bố mẹ còn lại được tính ra sao?',
    a: 'Bằng số năm kỳ vọng còn lại của bố/mẹ nhân với số lần bạn về thăm mỗi năm (làm tròn xuống). Nếu bạn đang sống cùng bố mẹ, công cụ tính theo ngày — mỗi ngày đều là một lần gặp. Bạn có thể thay đổi số lần về thăm để thấy ngay: chỉ cần về thêm một lần mỗi năm, tổng số lần gặp còn lại tăng lên đáng kể.',
  },
  {
    q: 'Kết quả của tôi có bị gửi đi hay lưu ở đâu không?',
    a: 'Không. Công cụ chạy hoàn toàn trong trình duyệt của bạn, không có máy chủ, không cần tài khoản. Dữ liệu bạn nhập chỉ lưu trong localStorage của chính trình duyệt này để lần sau mở lại còn nguyên, và bạn xoá bất cứ lúc nào bằng nút "Làm lại từ đầu".',
  },
];

export const METHOD_POINTS: string[] = [
  'Tuổi hiện tại của bố/mẹ tính theo năm sinh (sai số ±1 tuổi vì không cần nhập ngày sinh đầy đủ của bố mẹ).',
  'Tuổi thọ kỳ vọng còn lại tra theo đúng độ tuổi hiện tại và giới tính trong bảng sống — không lấy tuổi thọ khi sinh trừ tuổi, vì cách trừ đó sai về mặt thống kê.',
  'Số cái Tết còn lại là số ngày mùng 1 Tết Nguyên Đán (tính bằng thuật toán âm lịch Việt Nam, múi giờ UTC+7) nằm trong khoảng từ hôm nay tới cuối khoảng kỳ vọng.',
  'Tuổi thọ thực tế của từng người chênh rất xa trung bình vì sức khỏe, di truyền, lối sống và vùng miền. Con số trong công cụ chỉ là một lời nhắc để trân trọng thời gian, không phải điều chắc chắn.',
];
