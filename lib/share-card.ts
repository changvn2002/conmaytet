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

/* ── Palette v2 (DESIGN.md.proposed) ─────────────────────────────── */
const PAPER = '#FBF7EC';
const PINE = '#1F4D3A';
const PINE_DEEP = '#14342A';
const GOLD = '#C9A227';
const GOLD_SOFT = '#E9D48A';
const INK = '#1C2420';
const MUTED = '#44564B';

const DISPLAY_FONT = `'Baloo 2', 'Be Vietnam Pro', sans-serif`;
const BODY_FONT = `'Be Vietnam Pro', sans-serif`;

/** Path rect bo góc (không phụ thuộc ctx.roundRect của từng trình duyệt). */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

/**
 * Motif v2 vẽ bằng canvas path (toạ độ tay, không ảnh ngoài), bám hình
 * học logo v2: bao lì xì gold thân bo góc, nắp hình thang pine, một
 * điểm gold-soft giữa nắp, và cành thông pine (thân cong + kim ngắn)
 * nhô lên từ miệng bao. (x, y) là góc trên-trái của hộp bao trọn motif.
 */
function drawLiXiMotif(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.lineCap = 'round';

  // Cành thông: thân cong từ miệng bao đi lên, kim ngắn hai bên.
  ctx.strokeStyle = PINE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 48, y + 44);
  ctx.quadraticCurveTo(x + 46, y + 26, x + 56, y + 8);
  ctx.stroke();
  ctx.lineWidth = 4;
  const needles: Array<[number, number, number, number]> = [
    [x + 56, y + 10, x + 42, y + 2],
    [x + 56, y + 10, x + 53, y - 2],
    [x + 56, y + 10, x + 66, y + 0],
    [x + 56, y + 10, x + 70, y + 8],
    [x + 50, y + 26, x + 37, y + 19],
    [x + 50, y + 26, x + 64, y + 17],
  ];
  for (const [x1, y1, x2, y2] of needles) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  // Điểm gold-soft ở đầu cành.
  ctx.fillStyle = GOLD_SOFT;
  ctx.beginPath();
  ctx.arc(x + 56, y - 6, 5, 0, Math.PI * 2);
  ctx.fill();

  // Thân bao lì xì: rect bo góc gold.
  roundedRectPath(ctx, x + 8, y + 40, 84, 58, 9);
  ctx.fillStyle = GOLD;
  ctx.fill();

  // Nắp bao: hình thang pine phủ phần trên thân bao.
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 40);
  ctx.lineTo(x + 92, y + 40);
  ctx.lineTo(x + 78, y + 62);
  ctx.lineTo(x + 22, y + 62);
  ctx.closePath();
  ctx.fillStyle = PINE;
  ctx.fill();

  // Điểm gold-soft giữa nắp.
  ctx.fillStyle = GOLD_SOFT;
  ctx.beginPath();
  ctx.arc(x + 50, y + 51, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Một nét cành thông pine đứng riêng (thân cong + kim ngắn + điểm
 * gold-soft ở đầu) — đặt góc trên-trái để cân với bao lì xì bên phải.
 */
function drawPineSprig(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = PINE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 96);
  ctx.quadraticCurveTo(x + 12, y + 52, x + 28, y + 14);
  ctx.stroke();
  ctx.lineWidth = 4;
  const needles: Array<[number, number, number, number]> = [
    [x + 28, y + 16, x + 12, y + 6],
    [x + 28, y + 16, x + 26, y + 0],
    [x + 28, y + 16, x + 40, y + 4],
    [x + 28, y + 16, x + 44, y + 14],
    [x + 20, y + 40, x + 4, y + 30],
    [x + 20, y + 40, x + 38, y + 28],
    [x + 14, y + 66, x + 0, y + 58],
    [x + 14, y + 66, x + 30, y + 54],
  ];
  for (const [x1, y1, x2, y2] of needles) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.fillStyle = GOLD_SOFT;
  ctx.beginPath();
  ctx.arc(x + 28, y + 2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Vẽ thẻ kết quả 1080×1350 (khổ dọc, hợp đăng story/bài viết) lên canvas
 * bằng API canvas 2D thuần — chạy thật trên trình duyệt người dùng.
 * Hệ v2: nền giấy ấm, dải pine trên cùng, motif bao lì xì + cành thông
 * vẽ tay bằng path, số sân khấu Baloo 2 màu pine, mỗi người có câu hy
 * vọng riêng. Không gradient, không emoji.
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

  // Nền giấy ấm + dải trên cùng màu pine (không gradient).
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PINE;
  ctx.fillRect(0, 0, W, 18);

  // Motif v2: cành thông góc trên-trái, bao lì xì góc trên-phải.
  drawPineSprig(ctx, 56, 52);
  drawLiXiMotif(ctx, 928, 58);

  ctx.textAlign = 'center';
  ctx.fillStyle = PINE;
  ctx.font = `800 54px ${DISPLAY_FONT}`;
  ctx.fillText('CÒN MẤY CÁI TẾT NỮA?', W / 2, 130);

  ctx.fillStyle = MUTED;
  ctx.font = `500 30px ${BODY_FONT}`;
  ctx.fillText('Ước tính theo thống kê tuổi thọ trung bình của người Việt', W / 2, 182);

  // Nhịp y của một khối người (đã tính lại để thêm dòng câu hy vọng
  // ~34px dưới dòng lần gặp mà chân trang không bị đè):
  // nhãn y · số y+150 · đơn vị y+205 · lần gặp y+258 · hy vọng y+310,
  // bước khối 451. Hai khối: 277 → 728, dòng hy vọng cuối ở 1038,
  // đường gold chân trang ở H-201 = 1149.
  // (R1-F2, Panel #02: điểm bắt đầu khối 320 → 277 thu khoảng trống
  // sau header 99px về ~56px ngang nhịp thẻ; chân trang dời xuống
  // 39px để lề đáy 71px cân về ~32px ngang lề đầu; bước khối 410 →
  // 451 chia phần dư còn lại đều cho khoảng liên khối và khoảng
  // trước chân trang, hai khoảng này thành đối xứng ~105px.)
  let y = 277;
  const block = (label: string, tets: number, meetings: number, hope: string) => {
    ctx.fillStyle = MUTED;
    ctx.font = `600 34px ${BODY_FONT}`;
    ctx.fillText(label, W / 2, y);
    ctx.fillStyle = PINE;
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
    y += 451;
  };

  if (result.father)
    block('VỚI BỐ', result.father.tetsLeft, result.father.meetingsLeft, HOPE_FATHER);
  if (result.mother)
    block('VỚI MẸ', result.mother.tetsLeft, result.mother.meetingsLeft, HOPE_MOTHER);
  if (!result.father && !result.mother && result.life) {
    ctx.fillStyle = MUTED;
    ctx.font = `600 34px ${BODY_FONT}`;
    ctx.fillText('CUỘC ĐỜI BẠN ĐÃ ĐI QUA', W / 2, y);
    ctx.fillStyle = PINE;
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

  ctx.fillStyle = GOLD;
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
  ctx.fillStyle = PINE_DEEP;
  ctx.font = `700 30px ${BODY_FONT}`;
  ctx.fillText(SITE_URL.replace('https://', ''), W / 2, H - 37);

  return canvas;
}
