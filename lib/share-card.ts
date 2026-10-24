import type { CalcResult, InputData } from './types';
import { SITE_NAME, SITE_URL } from './site';

const nf = new Intl.NumberFormat('vi-VN');

function round1(n: number): string {
  return n.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
}

/** Câu hy vọng viết riêng cho từng người (COPY-DIET #11/#15) — không dùng chung. */
const HOPE_FATHER = 'Đủ để trân trọng từng lần về nhà với bố.';
const HOPE_MOTHER = 'Đủ để ngồi lâu hơn bên mâm cơm với mẹ.';

/**
 * Đoạn text kết quả để copy gửi Zalo/Facebook. Diễn đạt theo kỷ luật
 * trung thực của REDESIGN-V2 (COPY-DIET #15): luôn "theo thống kê tuổi
 * thọ trung bình", không dự đoán cá nhân, mỗi người một đoạn với chủ
 * ngữ đúng người đó và câu hy vọng riêng của người đó, không khẳng
 * định nào về số đông. Không emoji ở dòng đầu (kỷ luật không-emoji
 * của hệ thiết kế v2).
 */
export function buildShareText(result: CalcResult, input: InputData): string {
  const lines: string[] = [SITE_NAME, ''];
  if (result.father) {
    lines.push(
      `Với bố (${result.father.currentAge} tuổi): theo thống kê tuổi thọ trung bình, còn khoảng ${nf.format(result.father.tetsLeft)} cái Tết — tương đương khoảng ${nf.format(result.father.meetingsLeft)} ${input.livesWithParents ? 'ngày' : 'lần'} gặp nữa nếu giữ nhịp như hiện tại.`,
      HOPE_FATHER,
    );
  }
  if (result.mother) {
    lines.push(
      `Với mẹ (${result.mother.currentAge} tuổi): theo thống kê tuổi thọ trung bình, còn khoảng ${nf.format(result.mother.tetsLeft)} cái Tết — tương đương khoảng ${nf.format(result.mother.meetingsLeft)} ${input.livesWithParents ? 'ngày' : 'lần'} gặp nữa nếu giữ nhịp như hiện tại.`,
      HOPE_MOTHER,
    );
  }
  if (result.life) {
    lines.push(
      `Còn mình: đã đi qua ${round1(result.life.percentLived)}% của đời người theo kỳ vọng thống kê (${nf.format(result.life.weeksLived)} / ${nf.format(result.life.totalWeeks)} tuần).`,
    );
  }
  lines.push(
    '',
    'Đây là ước tính thống kê theo tuổi thọ trung bình của người Việt. Không phải dự đoán cho bất kỳ ai.',
    `Tính thử cho gia đình bạn: ${SITE_URL}`,
  );
  return lines.join('\n');
}

/* ── Palette REDESIGN-V4 (design/tokens.conmaytet-v4.json) ──────────
 * Mọi hex trong file này PHẢI thuộc tokens.json (tokens:verify quét
 * sink canvas). Nền trắng · số Green 60 · mực Gray 100 · muted Gray 70 ·
 * URL/dòng đậm Green 80 · dải chân Green 60. Gold CHỈ ở vạch tháng 1
 * (dài hơn — kênh hình phụ) và tâm hoa của dải art đầu thẻ; gold trên
 * nền sáng ở vai chữ/dải chân đã BỎ theo COLOR-SYSTEM §3. */
const CANVAS = '#FFFFFF';
const BRAND = '#198038';
const INK = '#161616';
const MUTED = '#525252';
const DEEP = '#044317';
const GOLD = '#F1C21B';

const DISPLAY_FONT = `'Baloo 2', 'Be Vietnam Pro', sans-serif`;
const BODY_FONT = `'Be Vietnam Pro', sans-serif`;

/**
 * Vòng năm thu nhỏ cho dải art đầu thẻ (VISUAL-LAYER §2 Cảnh 4): vành +
 * 12 vạch hướng tâm đều 30°, vạch tháng 1 (góc −60°) dài hơn + gold —
 * phân biệt bằng ĐỘ DÀI trước, màu sau. Tâm vòng để trống; không đường
 * chia cung, không vòng đệm, không glyph trong vòng (VETO-V4-2).
 */
function drawYearRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const angle = ((-90 + i * 30) * Math.PI) / 180;
    const isJanuary = i === 1;
    const len = (r * (isJanuary ? 22 : 14)) / 128;
    const x1 = cx + Math.cos(angle) * r;
    const y1 = cy + Math.sin(angle) * r;
    const x2 = cx + Math.cos(angle) * (r - len);
    const y2 = cy + Math.sin(angle) * (r - len);
    ctx.strokeStyle = isJanuary ? GOLD : INK;
    ctx.lineWidth = isJanuary ? 3.5 : 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Một hoa outline mực cho dải art đầu thẻ: 5 vòng outline quanh tâm
 * (hình học hoa của hero-ring), KHÔNG fill miền; tâm hoa = chấm gold
 * nhỏ. (cx, cy) là tâm hoa.
 */
function drawFlowerOutline(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  const petalR = 13;
  const offsets: Array<[number, number]> = [
    [0, -13],
    [12.4, -4],
    [7.6, 10.5],
    [-7.6, 10.5],
    [-12.4, -4],
  ];
  for (const [dx, dy] of offsets) {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, petalR, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Vẽ thẻ kết quả 1080×1350 (khổ dọc, hợp đăng story/bài viết) lên canvas
 * bằng API canvas 2D thuần — chạy thật trên trình duyệt người dùng.
 * Hệ V4: nền trắng, dải art đầu thẻ = vòng năm thu nhỏ + 2 hoa outline
 * mực hai bên (motif lì xì + cành thông của V2 đã bị VISUAL-LAYER §5
 * CẤM và đã xoá), số sân khấu Baloo 2 800 màu Green 60, mỗi người có
 * câu hy vọng riêng, dải chân Green 60. Không gradient, không emoji.
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

  // Nền trắng thường trú (canvas của hệ V4).
  ctx.fillStyle = CANVAS;
  ctx.fillRect(0, 0, W, H);

  // Dải art đầu thẻ: vòng năm thu nhỏ ở giữa, 2 hoa outline hai bên.
  drawYearRing(ctx, W / 2, 84, 62);
  drawFlowerOutline(ctx, W / 2 - 210, 84);
  drawFlowerOutline(ctx, W / 2 + 210, 84);

  ctx.textAlign = 'center';
  ctx.fillStyle = BRAND;
  ctx.font = `800 54px ${DISPLAY_FONT}`;
  ctx.fillText('CÒN MẤY CÁI TẾT NỮA?', W / 2, 216);

  ctx.fillStyle = MUTED;
  ctx.font = `500 30px ${BODY_FONT}`;
  ctx.fillText('Ước tính theo thống kê tuổi thọ trung bình của người Việt', W / 2, 268);

  // Nhịp y của một khối người: nhãn y · số y+150 · đơn vị y+205 ·
  // lần gặp y+258 · hy vọng y+310, bước khối 435. Khối đầu bắt đầu ở
  // 340 (sau dải art + tiêu đề đã dời xuống), hai khối kết thúc ở
  // dòng hy vọng 1085 — cách dải phân cách chân thẻ (H-201 = 1149)
  // 64px, không khối nào đè footer.
  let y = 340;
  const block = (label: string, tets: number, meetings: number, hope: string) => {
    ctx.fillStyle = MUTED;
    ctx.font = `600 34px ${BODY_FONT}`;
    ctx.fillText(label, W / 2, y);
    ctx.fillStyle = BRAND;
    ctx.font = `800 150px ${DISPLAY_FONT}`;
    ctx.fillText(String(tets), W / 2, y + 150);
    ctx.fillStyle = INK;
    ctx.font = `600 38px ${BODY_FONT}`;
    ctx.fillText('cái Tết nữa (ước tính)', W / 2, y + 205);
    ctx.fillStyle = MUTED;
    ctx.font = `500 32px ${BODY_FONT}`;
    ctx.fillText(
      input.livesWithParents
        ? `và khoảng ${nf.format(meetings)} ngày còn bên nhau`
        : `và khoảng ${nf.format(meetings)} lần gặp nữa`,
      W / 2,
      y + 258,
    );
    ctx.fillStyle = INK;
    ctx.font = `600 34px ${BODY_FONT}`;
    ctx.fillText(hope, W / 2, y + 310);
    y += 435;
  };

  if (result.father)
    block('VỚI BỐ', result.father.tetsLeft, result.father.meetingsLeft, HOPE_FATHER);
  if (result.mother)
    block('VỚI MẸ', result.mother.tetsLeft, result.mother.meetingsLeft, HOPE_MOTHER);
  if (!result.father && !result.mother && result.life) {
    ctx.fillStyle = MUTED;
    ctx.font = `600 34px ${BODY_FONT}`;
    ctx.fillText('CUỘC ĐỜI BẠN ĐÃ ĐI QUA', W / 2, y);
    ctx.fillStyle = BRAND;
    ctx.font = `800 150px ${DISPLAY_FONT}`;
    ctx.fillText(`${round1(result.life.percentLived)}%`, W / 2, y + 150);
    ctx.fillStyle = INK;
    ctx.font = `600 38px ${BODY_FONT}`;
    ctx.fillText('theo kỳ vọng thống kê', W / 2, y + 205);
    ctx.fillStyle = MUTED;
    ctx.font = `500 32px ${BODY_FONT}`;
    ctx.fillText(
      `${nf.format(result.life.weeksLived)} / ${nf.format(result.life.totalWeeks)} tuần đã sống`,
      W / 2,
      y + 258,
    );
  }

  // Dải phân cách + dải chân thẻ: Green 60 (gold trên sáng đã bỏ).
  ctx.fillStyle = BRAND;
  ctx.fillRect(W / 2 - 60, H - 201, 120, 4);
  ctx.fillStyle = INK;
  ctx.font = `600 34px ${BODY_FONT}`;
  ctx.fillText('Trân trọng từng cái Tết còn bên nhau.', W / 2, H - 137);
  ctx.fillStyle = MUTED;
  ctx.font = `500 27px ${BODY_FONT}`;
  ctx.fillText(
    'Ước tính thống kê — không phải dự đoán dành cho bất kỳ cá nhân nào.',
    W / 2,
    H - 89,
  );
  ctx.fillStyle = DEEP;
  ctx.font = `700 30px ${BODY_FONT}`;
  ctx.fillText(SITE_URL.replace('https://', ''), W / 2, H - 37);
  ctx.fillStyle = BRAND;
  ctx.fillRect(0, H - 18, W, 18);

  return canvas;
}
