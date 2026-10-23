import type { CalcResult, InputData } from './types';
import { SITE_NAME, SITE_URL } from './site';

const nf = new Intl.NumberFormat('vi-VN');

function round1(n: number): string {
  return n.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
}

/**
 * Đoạn text kết quả để copy gửi Zalo/Facebook. Diễn đạt theo khuyến nghị
 * trung thực: luôn "theo thống kê trung bình", không dự đoán cá nhân,
 * kết thúc bằng thông điệp tích cực (đầy đủ căn cứ: DATA-VERIFIED.md mục 5).
 */
export function buildShareText(result: CalcResult, input: InputData): string {
  const lines: string[] = [`🧧 ${SITE_NAME}`, ''];
  if (result.father) {
    lines.push(
      `Với bố (${result.father.currentAge} tuổi): theo thống kê tuổi thọ trung bình, còn khoảng ${nf.format(result.father.tetsLeft)} cái Tết — tương đương khoảng ${nf.format(result.father.meetingsLeft)} ${input.livesWithParents ? 'ngày' : 'lần'} gặp nữa nếu giữ nhịp như hiện tại.`,
    );
  }
  if (result.mother) {
    lines.push(
      `Với mẹ (${result.mother.currentAge} tuổi): theo thống kê tuổi thọ trung bình, còn khoảng ${nf.format(result.mother.tetsLeft)} cái Tết — tương đương khoảng ${nf.format(result.mother.meetingsLeft)} ${input.livesWithParents ? 'ngày' : 'lần'} gặp nữa nếu giữ nhịp như hiện tại.`,
    );
  }
  if (result.life) {
    lines.push(
      `Còn mình: đã đi qua ${round1(result.life.percentLived)}% của đời người theo kỳ vọng thống kê (${nf.format(result.life.weeksLived)} / ${nf.format(result.life.totalWeeks)} tuần).`,
    );
  }
  lines.push(
    '',
    'Đây là ước tính thống kê theo tuổi thọ trung bình của người Việt — không phải dự đoán cho bất kỳ ai. Con số chỉ để nhắc mình trân trọng và chủ động sắp xếp thời gian bên bố mẹ.',
    `Tính thử cho gia đình bạn: ${SITE_URL}`,
  );
  return lines.join('\n');
}

/**
 * Vẽ thẻ kết quả 1080×1350 (khổ dọc, hợp đăng story/bài viết) lên canvas
 * bằng API canvas 2D thuần — chạy thật trên trình duyệt người dùng.
 * Trả về canvas để nơi gọi tự tải xuống (toBlob → a[download]).
 */
export function drawShareCard(result: CalcResult, input: InputData): HTMLCanvasElement {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Nền giấy ấm + viền trên màu sơn mài (khớp BRAND.md — không gradient).
  ctx.fillStyle = '#FAF6EF';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#8C1D18';
  ctx.fillRect(0, 0, W, 18);

  const ink = '#221D1A';
  const muted = '#6E6259';
  const brand = '#8C1D18';
  const gold = '#A87E1F';
  const font = `'Be Vietnam Pro', 'Noto Sans', sans-serif`;

  ctx.textAlign = 'center';
  ctx.fillStyle = brand;
  ctx.font = `800 54px ${font}`;
  ctx.fillText('CÒN MẤY CÁI TẾT NỮA?', W / 2, 130);

  ctx.fillStyle = muted;
  ctx.font = `500 30px ${font}`;
  ctx.fillText('Ước tính theo thống kê tuổi thọ trung bình của người Việt', W / 2, 182);

  let y = 320;
  const block = (label: string, tets: number, meetings: number) => {
    ctx.fillStyle = muted;
    ctx.font = `600 34px ${font}`;
    ctx.fillText(label, W / 2, y);
    ctx.fillStyle = brand;
    ctx.font = `800 150px ${font}`;
    ctx.fillText(String(tets), W / 2, y + 150);
    ctx.fillStyle = ink;
    ctx.font = `600 38px ${font}`;
    ctx.fillText('cái Tết nữa (ước tính)', W / 2, y + 205);
    ctx.fillStyle = muted;
    ctx.font = `500 32px ${font}`;
    ctx.fillText(
      input.livesWithParents
        ? `và khoảng ${nf.format(meetings)} ngày còn bên nhau`
        : `và khoảng ${nf.format(meetings)} lần gặp nữa`,
      W / 2,
      y + 258,
    );
    y += 360;
  };

  if (result.father) block('VỚI BỐ', result.father.tetsLeft, result.father.meetingsLeft);
  if (result.mother) block('VỚI MẸ', result.mother.tetsLeft, result.mother.meetingsLeft);
  if (!result.father && !result.mother && result.life) {
    ctx.fillStyle = muted;
    ctx.font = `600 34px ${font}`;
    ctx.fillText('CUỘC ĐỜI BẠN ĐÃ ĐI QUA', W / 2, y);
    ctx.fillStyle = brand;
    ctx.font = `800 150px ${font}`;
    ctx.fillText(`${round1(result.life.percentLived)}%`, W / 2, y + 150);
    ctx.fillStyle = ink;
    ctx.font = `600 38px ${font}`;
    ctx.fillText('theo kỳ vọng thống kê', W / 2, y + 205);
    ctx.fillStyle = muted;
    ctx.font = `500 32px ${font}`;
    ctx.fillText(
      `${nf.format(result.life.weeksLived)} / ${nf.format(result.life.totalWeeks)} tuần đã sống`,
      W / 2,
      y + 258,
    );
  }

  ctx.fillStyle = gold;
  ctx.fillRect(W / 2 - 60, H - 240, 120, 4);
  ctx.fillStyle = ink;
  ctx.font = `600 34px ${font}`;
  ctx.fillText('Trân trọng từng cái Tết còn bên nhau.', W / 2, H - 176);
  ctx.fillStyle = muted;
  ctx.font = `500 27px ${font}`;
  ctx.fillText(
    'Ước tính thống kê — không phải dự đoán dành cho bất kỳ cá nhân nào.',
    W / 2,
    H - 128,
  );
  ctx.fillStyle = brand;
  ctx.font = `700 30px ${font}`;
  ctx.fillText(SITE_URL.replace('https://', ''), W / 2, H - 76);

  return canvas;
}
