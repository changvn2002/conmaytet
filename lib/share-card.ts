import type { CalcResult, InputData, ParentEstimate } from './types';
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

/* ── Palette hệ lens-04 (design/tokens.conmaytet-v4.json) ───────────
 * Mọi hex trong file này PHẢI thuộc tokens.json (tokens:verify quét
 * sink canvas). Thẻ trắng · số mực đen · seed chỉ ở wordmark/điểm
 * hiện tại/dải đáy · gold chỉ ở nhụy hoa. Cành đào vẽ bằng cánh hoa
 * thật (ellipse xoay 2 lớp) — cấm vòng tròn sticker như mock vòng 1. */
const CANVAS = '#FFFFFF';
const INK = '#16191D';
const INK2 = '#3F4750';
const MUTED = '#5A636E';
const SEED = '#198038';
const SEED_INK = '#146C2E';
const GOLD = '#F1C21B';
const PETAL = '#F6B8C6';
const PETAL_LIGHT = '#FBD9E0';
const BRANCH = '#8A5A36';
const LEAF = '#2E9E4F';
const DAD_BG = '#DCEFE2';
const DAD_INK = '#146C2E';
const MOM_BG = '#FDEEC9';
const MOM_INK = '#7A5B00';
const SEED_TINT = '#EEF7F0';
const GOLD_SOFT = '#FBF6E3';
const LIVED_STRONG = '#59616B';
const TRACK = '#E9EBEA';
const LINE_SOFT = '#EEF0EE';

const DISPLAY_FONT = `'Baloo 2', 'Be Vietnam Pro', sans-serif`;
const BODY_FONT = `'Be Vietnam Pro', sans-serif`;

/** Hệ hoa THAM SỐ trên canvas (G3 vòng 3) — CÙNG hệ với branch.tsx:
 *  cánh là PATH oval NHỌN (Path2D từ đúng chuỗi path của 3 họ cánh),
 *  mỗi bông duy nhất theo (số cánh 5–6 × họ cánh × trạng thái
 *  nở/hé × lệch góc từng cánh × squash). Cấm ellipse dập khuôn và
 *  cấm hai bông trùng silhouette trong cùng một hình.
 *  VÒNG 4 (H3) đồng bộ với branch.tsx: dài/rộng RIÊNG từng cánh
 *  (PETAL_LEN/PETAL_WID), một cánh KHUẤT mờ 50% thu 0,8 vẽ trước,
 *  tâm nhị LỆCH khỏi tâm hình học; toạ độ cành thẻ TRỌN trong
 *  khung (không bông nào chạm mép canvas). */
const PETAL_PATHS = [
  'M0 0 C-7.5 -2.5 -10 -9.5 -3.4 -15.2 L0 -13.4 L3 -15.4 C9.5 -10 7 -2.8 0 0 Z',
  'M0 0 C-5.6 -3 -7.6 -11 -2.2 -16.6 L0 -14.4 L2.4 -16.9 C7.2 -11.6 5.4 -3.2 0 0 Z',
  'M0 0 C-8.6 -2 -11.2 -8 -4.2 -13.6 L0 -12.4 L3.8 -13.9 C10.2 -8.4 8.2 -2.4 0 0 Z',
];
const PETAL_INNER_PATHS = [
  'M0 0 C-5.5 -2 -7 -7 -2.4 -11 L0 -9.6 L2.2 -11.2 C6.8 -7.4 5 -2 0 0 Z',
  'M0 0 C-4 -2.2 -5.4 -8 -1.6 -12 L0 -10.4 L1.8 -12.2 C5.2 -8.4 3.8 -2.2 0 0 Z',
  'M0 0 C-6.2 -1.6 -8 -6 -3 -10 L0 -9 L2.8 -10.2 C7.4 -6.4 5.8 -2 0 0 Z',
];
const HALF_CUP_PATH =
  'M0 1 C-4.5 -1 -6 -6.5 -3 -10.5 C-1.6 -8 -0.8 -8.6 0 -11 C0.8 -8.6 1.6 -8 3 -10.5 C6 -6.5 4.5 -1 0 1 Z';
const BUD_PATH = 'M0 0 C-6 -4 -7 -12 0 -17 C7 -12 6 -4 0 0 Z';

/** Dài/rộng riêng từng cánh — CÙNG mẫu với branch.tsx (H3 vòng 4). */
const PETAL_LEN = [1.14, 0.88, 1.05, 0.8, 1.1, 0.95];
const PETAL_WID = [0.92, 1.1, 0.84, 1.13, 0.97, 1.03];

interface FlowerSpec {
  count: 5 | 6;
  variant: 0 | 1 | 2;
  state: 'full' | 'half';
  offsets: number[];
  squash?: number;
  rot?: number;
}

function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  spec: FlowerSpec,
) {
  const s = r / 16;
  const step = 360 / spec.count;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(((spec.rot ?? 0) * Math.PI) / 180);
  ctx.scale(1, spec.squash ?? 1);
  const outerScale = spec.state === 'half' ? 0.72 : 1;
  const lenOf = (i: number) => PETAL_LEN[(i + spec.variant * 2) % PETAL_LEN.length];
  const widOf = (i: number) => PETAL_WID[(i * 2 + spec.variant) % PETAL_WID.length];
  // Cánh KHUẤT (H3): vẽ trước, mờ 50%, thu 0,8, nép ở khe giữa hai
  // cánh chính — cùng công thức với Flower trong branch.tsx.
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.rotate((((spec.variant + 1) * step * 0.5 + (spec.offsets[0] ?? 0)) * Math.PI) / 180);
  ctx.scale(s * outerScale * 0.8, s * outerScale * 0.8);
  ctx.fillStyle = PETAL;
  ctx.fill(new Path2D(PETAL_PATHS[spec.variant]));
  ctx.restore();
  ctx.fillStyle = PETAL;
  for (let i = 0; i < spec.count; i++) {
    ctx.save();
    ctx.rotate(((i * step + (spec.offsets[i] ?? 0)) * Math.PI) / 180);
    ctx.scale(s * outerScale * widOf(i), s * outerScale * lenOf(i));
    ctx.fill(new Path2D(PETAL_PATHS[spec.variant]));
    ctx.restore();
  }
  // Tâm LỆCH khỏi tâm hình học (cùng độ lệch với branch.tsx, quy
  // theo đơn vị r/16 của bông).
  const coreDx = (spec.variant === 0 ? 1.1 : spec.variant === 1 ? -0.8 : 0.5) * s;
  const coreDy = (spec.count === 6 ? -0.7 : 0.9) * s;
  if (spec.state === 'full') {
    ctx.fillStyle = PETAL_LIGHT;
    for (let i = 0; i < spec.count; i++) {
      ctx.save();
      ctx.rotate(((i + 0.5) * step - (spec.offsets[i] ?? 0) * 0.6) * (Math.PI / 180));
      ctx.scale(s * widOf(i + 2), s * lenOf(i + 3));
      ctx.fill(new Path2D(PETAL_INNER_PATHS[spec.variant]));
      ctx.restore();
    }
    ctx.fillStyle = GOLD;
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 * Math.PI) / 180;
      ctx.beginPath();
      ctx.arc(
        coreDx + Math.sin(a) * r * 0.16,
        coreDy - Math.cos(a) * r * 0.16,
        Math.max(0.8, r * 0.055),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(coreDx, coreDy, Math.max(1.4, r * 0.1), 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.save();
    ctx.scale(s, s);
    ctx.fillStyle = PETAL_LIGHT;
    ctx.fill(new Path2D(HALF_CUP_PATH));
    ctx.restore();
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(coreDx, coreDy, Math.max(1.1, r * 0.08), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Nụ đào trên canvas: giọt cánh khép đầu nhọn (path, cùng họ nụ SVG). */
function drawBud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rotDeg: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotDeg * Math.PI) / 180);
  ctx.scale(s, s);
  ctx.fillStyle = PETAL;
  ctx.fill(new Path2D(BUD_PATH));
  ctx.restore();
}

/* ── Thân thuôn LIỀN MẠCH trên canvas (K1 vòng 6) — CÙNG thuật
 * toán với Stem trong branch.tsx: đường bao của một chuỗi cubic
 * C1 liên tục, bề rộng biến thiên trơn; 'both' nhọn hai đầu,
 * 'tip' chỉ nhọn đầu ngọn. Thay hẳn cách vẽ nhiều đoạn nét chồng
 * nhau (để lại khấc bậc ở khớp + mặt cắt chéo ở đầu trái). */
type CvPt = readonly [number, number];
type CvCubic = readonly [CvPt, CvPt, CvPt, CvPt];

function cvCubicPoint(seg: CvCubic, t: number): CvPt {
  const [p0, p1, p2, p3] = seg;
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
}

function cvCubicTangent(seg: CvCubic, t: number): CvPt {
  const [p0, p1, p2, p3] = seg;
  const u = 1 - t;
  return [
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ];
}

function cvStemWidthAt(t: number, wMax: number, mode: 'both' | 'tip', floorFrac = 0): number {
  const tip = 1 - 0.92 * t * t;
  let w: number;
  if (mode === 'tip') {
    w = wMax * tip;
  } else {
    const s = Math.min(1, Math.max(0, t / 0.2));
    const base = 0.1 + 0.9 * (s * s * (3 - 2 * s));
    w = wMax * base * tip;
  }
  // SÀN bề rộng (L2 vòng 7, cùng công thức branch.tsx): ngoài
  // hai chóp nhọn 5% t ở hai đầu, bề rộng ≥ floorFrac × wMax.
  if (floorFrac > 0) {
    const ss = (x: number) => {
      const c = Math.min(1, Math.max(0, x));
      return c * c * (3 - 2 * c);
    };
    const endTaper = Math.min(ss(t / 0.05), ss((1 - t) / 0.05));
    w = Math.max(w, wMax * floorFrac * endTaper);
  }
  return w;
}

function cvStemOutline(
  segs: readonly CvCubic[],
  wMax: number,
  mode: 'both' | 'tip',
  floorFrac = 0,
): string {
  const PER = 48;
  const left: string[] = [];
  const right: string[] = [];
  segs.forEach((seg, s) => {
    for (let j = 0; j <= PER; j++) {
      if (s > 0 && j === 0) continue;
      const lt = j / PER;
      const gt = (s + lt) / segs.length;
      const [x, y] = cvCubicPoint(seg, lt);
      const [tx, ty] = cvCubicTangent(seg, lt);
      const m = Math.hypot(tx, ty) || 1;
      const hw = cvStemWidthAt(gt, wMax, mode, floorFrac) / 2;
      left.push(`${(x - (ty / m) * hw).toFixed(2)} ${(y + (tx / m) * hw).toFixed(2)}`);
      right.push(`${(x + (ty / m) * hw).toFixed(2)} ${(y - (tx / m) * hw).toFixed(2)}`);
    }
  });
  return `M${left.join(' L')} L${right.reverse().join(' L')} Z`;
}

function fillStem(
  ctx: CanvasRenderingContext2D,
  segs: readonly CvCubic[],
  wMax: number,
  mode: 'both' | 'tip',
  floorFrac = 0,
) {
  ctx.fillStyle = BRANCH;
  ctx.fill(new Path2D(cvStemOutline(segs, wMax, mode, floorFrac)));
}

/** Thân chính thẻ — CÙNG toạ độ với CARD_STEM của branch.tsx.
 *  R8: chéo bất đối xứng như hero (bỏ cung U + bông treo). */
const CARD_STEM_CV: readonly CvCubic[] = [
  [
    [8, 124],
    [52, 116],
    [92, 94],
    [138, 72],
  ],
  [
    [138, 72],
    [186, 50],
    [238, 36],
    [294, 28],
  ],
  [
    [294, 28],
    [320, 25],
    [338, 23],
    [352, 22],
  ],
];
/** Cành xẻ xuống thẻ (R8, như branch.tsx): gốc (87,6 · 96,3)
 *  đúng trên thân đoạn 1, ngọn (167,123) chìm trong bông. */
const CARD_TWIG_DIP_CV: readonly CvCubic[] = [
  [
    [87.6, 96.3],
    [112, 97],
    [140, 107],
    [167, 123],
  ],
];
/** Cành chĩa lên thẻ (R8, như branch.tsx): gốc (182,3 · 54,3)
 *  đúng trên thân đoạn 2, ngọn (205,14). */
const CARD_TWIG_UP_CV: readonly CvCubic[] = [
  [
    [182.3, 54.3],
    [195, 41],
    [203, 27],
    [205, 14],
  ],
];

/** Lá đào trên canvas: phiến NHỌN hai đầu THUÔN CONG BẤT ĐỐI XỨNG
 *  bằng bezier (cùng công thức cong của Leaf trong branch.tsx —
 *  mép trên phồng ×1,18, mép dưới lép ×0,45–0,62, đầu lệch bend). */
function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  wid: number,
  rotDeg: number,
  bend: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotDeg * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.fill(
    new Path2D(
      `M0 0 C ${wid * 1.18} ${-len * 0.3 + bend} ${wid * 0.72} ${-len * 0.72 + bend} ${bend * 0.9} ${-len} C ${-wid * 0.45} ${-len * 0.78 - bend} ${-wid * 0.62} ${-len * 0.34 - bend} 0 0 Z`,
    ),
  );
  ctx.restore();
}

/**
 * Cành đào biến thể THẺ (hệ toạ độ 360×170) vẽ bằng canvas —
 * R8: CÙNG bố cục chéo với biến thể hero của branch.tsx (thân
 * vào từ dưới-trái (8,124) vươn lên trên-phải tận cùng
 * (352,22), một cành con xẻ xuống mang bông ở đầu cành, một
 * cành con chĩa lên mang nụ; mọi bông nằm trên thân hoặc ở
 * đầu cành con). Bố cục cung U đối xứng + bông treo ở điểm
 * võng + cánh rơi của các vòng ≤7 đã bị panel vòng 7 bác
 * (đọc như vòng cổ/mặt dây chuyền). Cùng toạ độ với
 * PeachBranch variant="card" để thẻ tải về và artwork UI
 * một nhà.
 */
function drawBranchCard(ctx: CanvasRenderingContext2D, ox: number, oy: number, k: number) {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(k, k);
  // Thân LIỀN MẠCH thuôn hai đầu + hai cành con (R8) — CÙNG
  // toạ độ với PeachBranch variant="card": vào (8,124), kết
  // thúc (352,22), trọn khung 360×170; cành xẻ ngọn chìm đúng
  // tâm bông (169,125), cành chĩa lên ngọn (205,14) với nụ
  // bám thân ở (198,8 · 32). Thân chính 6,5 + SÀN bề rộng
  // 0,62 như vòng 7.
  fillStem(ctx, CARD_STEM_CV, 6.5, 'both', 0.62);
  fillStem(ctx, CARD_TWIG_DIP_CV, 3.2, 'tip');
  fillStem(ctx, CARD_TWIG_UP_CV, 2.6, 'tip');
  // Lá bám đúng điểm trên đường cong — cùng vị trí với
  // branch.tsx (đối chiếu số học R8).
  drawLeaf(ctx, 23.7, 120.5, 12, 3.6, -58, 1.6, LEAF);
  drawLeaf(ctx, 121.7, 79.9, 18, 4.8, -35, 2.2, SEED);
  drawLeaf(ctx, 231.9, 39.8, 15, 4, -62, -2, LEAF);
  drawLeaf(ctx, 126.3, 103.9, 14, 4, 58, -2.2, SEED);
  drawLeaf(ctx, 321.6, 24.9, 11, 3.2, -72, -1.6, LEAF);
  drawFlower(ctx, 330, 27, 13, {
    count: 5,
    variant: 2,
    state: 'full',
    offsets: [0, -6, 9, -8, 5],
    squash: 1.02,
    rot: -8,
  });
  drawFlower(ctx, 169, 125, 10.5, {
    count: 6,
    variant: 0,
    state: 'full',
    offsets: [0, 8, -5, 10, -6, 3],
    rot: 22,
  });
  drawFlower(ctx, 254, 34, 9, {
    count: 5,
    variant: 0,
    state: 'half',
    offsets: [0, 4, -9, 6, -4],
    rot: -38,
  });
  drawFlower(ctx, 47, 113, 7, {
    count: 6,
    variant: 1,
    state: 'half',
    offsets: [0, -10, 7, -5, 9, -7],
    squash: 0.88,
    rot: 15,
  });
  // Nụ khép hai đầu thân + nụ bám cành chĩa lên — cùng vị
  // trí với branch.tsx (R8). Không nụ treo dưới thân, không
  // cánh rơi.
  drawBud(ctx, 352, 22, 0.5, 80);
  drawBud(ctx, 8, 124, 0.55, -102);
  drawBud(ctx, 198.8, 32, 0.8, 18);
  ctx.restore();
}

/** Thanh tiến trình đời người THẲNG trên thẻ: đã sống xám đậm, rãnh
 *  xám nhạt, điểm hiện tại chấm seed viền trắng. */
function drawLifeBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  percent: number,
  label: string,
) {
  ctx.textAlign = 'left';
  ctx.fillStyle = MUTED;
  ctx.font = `600 19px ${BODY_FONT}`;
  ctx.fillText(label, x, y);
  ctx.textAlign = 'right';
  ctx.fillStyle = INK2;
  ctx.font = `700 19px ${BODY_FONT}`;
  ctx.fillText(`đã đi ${percent}%`, x + w, y);
  const barY = y + 14;
  ctx.fillStyle = TRACK;
  ctx.beginPath();
  ctx.roundRect(x, barY, w, 13, 7);
  ctx.fill();
  ctx.fillStyle = LIVED_STRONG;
  ctx.beginPath();
  ctx.roundRect(x, barY, (w * percent) / 100, 13, 7);
  ctx.fill();
  ctx.fillStyle = SEED;
  ctx.strokeStyle = CANVAS;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x + (w * percent) / 100, barY + 6.5, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/**
 * Vẽ thẻ kết quả 1080×1350 (khổ dọc, hợp đăng story/bài viết) lên canvas
 * bằng API canvas 2D thuần — chạy thật trên trình duyệt người dùng.
 * Hệ lens-04: thẻ trắng, header cành đào (biến tấu của artwork), hai
 * hàng bố/mẹ (avatar initials + số lớn mực đen + câu riêng), mỗi người
 * một thanh tiến trình thẳng để nhịp dọc «đầy», chân thẻ + dải seed
 * 12px ở đáy. Không gradient, không emoji.
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

  ctx.fillStyle = CANVAS;
  ctx.fillRect(0, 0, W, H);

  // Header (H4 vòng 4 — nén trắng đỉnh thẻ): cành đào biến thể THẺ
  // thu hệ số 1,3 → 1,22 và nhích lên trên, tiêu đề + dòng phụ kéo
  // lên theo — vùng trắng quanh cành ở đỉnh thẻ giảm ~30px.
  drawBranchCard(ctx, (W - 360 * 1.22) / 2, 10, 1.22);

  ctx.textAlign = 'center';
  ctx.fillStyle = SEED_INK;
  ctx.font = `800 56px ${DISPLAY_FONT}`;
  ctx.fillText('CÒN MẤY CÁI TẾT NỮA?', W / 2, 260);

  ctx.fillStyle = MUTED;
  ctx.font = `500 30px ${BODY_FONT}`;
  ctx.fillText('Ước tính theo thống kê tuổi thọ trung bình của người Việt', W / 2, 304);

  const MX = 64;
  const block = (
    top: number,
    label: string,
    person: string,
    glyph: string,
    bg: string,
    ink: string,
    est: ParentEstimate,
    hope: string,
    panel: string,
  ) => {
    // G4b vòng 3: mỗi người một PANEL tint cực nhạt (bố = seed-tint,
    // mẹ = gold-soft) — thẻ hết đọc như danh sách dọc hai khối giống
    // hệt nhau trên trắng trơn; đệm nằm TRONG panel nên nhịp dọc
    // đầy tới gần chân thẻ, không dồn trắng ra cuối.
    ctx.fillStyle = panel;
    ctx.beginPath();
    ctx.roundRect(MX - 24, top - 16, W - (MX - 24) * 2, 376, 26);
    ctx.fill();

    // Avatar initials (đĩa tròn + glyph X1) — bake tĩnh, không DiceBear
    // trên canvas (cơ chế DiceBear chỉ chạy ở UI client như hồ sơ).
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(MX + 64, top + 88, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.font = `800 52px ${DISPLAY_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(glyph, MX + 64, top + 88 + 18);

    ctx.textAlign = 'left';
    ctx.fillStyle = MUTED;
    ctx.font = `700 20px ${BODY_FONT}`;
    ctx.fillText(label, MX + 156, top + 60);
    ctx.fillStyle = INK;
    ctx.font = `700 27px ${BODY_FONT}`;
    ctx.fillText(`${person} · ${est.currentAge} tuổi`, MX + 156, top + 100);

    // F5 vòng 2: con số là trung tâm — tăng cỡ 104 → 128.
    ctx.textAlign = 'right';
    ctx.fillStyle = INK;
    ctx.font = `800 128px ${DISPLAY_FONT}`;
    ctx.fillText(String(est.tetsLeft), W - MX, top + 118);
    ctx.fillStyle = INK2;
    ctx.font = `600 22px ${BODY_FONT}`;
    ctx.fillText('cái Tết nữa (ước tính)', W - MX, top + 154);

    ctx.textAlign = 'left';
    ctx.fillStyle = INK2;
    ctx.font = `500 24px ${BODY_FONT}`;
    ctx.fillText(
      input.livesWithParents
        ? `và khoảng ${nf.format(est.meetingsLeft)} ngày còn bên nhau — «${hope}»`
        : `và khoảng ${nf.format(est.meetingsLeft)} lần gặp nữa — «${hope}»`,
      MX,
      top + 204,
    );

    const percent = Math.min(
      100,
      Math.max(0, Math.round((est.currentAge / (est.currentAge + est.remainingYears)) * 100)),
    );
    drawLifeBar(
      ctx,
      MX,
      top + 246,
      W - MX * 2,
      percent,
      `Hành trình đời người của ${person.toLowerCase()}`,
    );

    // Dải vạch Tết (F5 vòng 2, G4a vòng 3, H4 vòng 4): mỗi vạch là
    // một cái Tết còn lại của đúng người này — nhóm theo 5 kiểu đếm
    // TALLY (5|5|3…), đầu vạch BO TRÒN, chiều cao lệch nhẹ theo
    // nhịp xác định. VÒNG 4: vạch TO và THƯA hẳn (rộng 10px, cao
    // ~19–23px, hở trong nhóm 8px, hở giữa nhóm 18px tính theo
    // mép) để ở khổ xem trước 0,37× trên trang share vẫn đọc là
    // dấu đếm từng cái, không co thành vệt mã vạch.
    // VÒNG 5 (J5): vạch rộng 10 → 12px, GIỮ nguyên khoảng hở của
    // vòng 4 (trong nhóm 8px, giữa nhóm 18px mép–mép) nên bước
    // trong nhóm 18 → 20px và bước nhóm 100 → 110px.
    ctx.textAlign = 'left';
    ctx.fillStyle = MUTED;
    ctx.font = `600 18px ${BODY_FONT}`;
    ctx.fillText('Mỗi vạch là một cái Tết còn lại', MX, top + 312);
    ctx.fillStyle = SEED;
    const count = Math.max(0, est.tetsLeft);
    const TICK_W = 12;
    const TICK_STEP = 20;
    // Bước nhóm 110px: mép phải vạch cuối nhóm → mép trái vạch đầu
    // nhóm kế = 110 − (4×20 + 12) = 18px.
    const GROUP_PITCH = 110;
    const TICK_MAX_H = 23;
    for (let i = 0; i < count; i++) {
      const gx = MX + Math.floor(i / 5) * GROUP_PITCH + (i % 5) * TICK_STEP;
      const h = 19 + ((i * 37) % 5);
      ctx.beginPath();
      ctx.roundRect(gx, top + 326 + (TICK_MAX_H - h), TICK_W, h, TICK_W / 2);
      ctx.fill();
    }
  };

  let y = 350;
  if (result.father) {
    block(y, 'VỚI BỐ', 'Bố', 'B', DAD_BG, DAD_INK, result.father, HOPE_FATHER, SEED_TINT);
    y += 396;
  }
  if (result.mother) {
    block(y, 'VỚI MẸ', 'Mẹ', 'M', MOM_BG, MOM_INK, result.mother, HOPE_MOTHER, GOLD_SOFT);
    y += 396;
  }
  // Một phụ huynh + có lưới đời: thêm dòng «còn mình» (nội dung thật
  // từ kết quả) để nhịp dọc thẻ không gãy khi chỉ đếm cho một người.
  if ((result.father != null) !== (result.mother != null) && result.life) {
    ctx.textAlign = 'center';
    ctx.fillStyle = INK2;
    ctx.font = `600 26px ${BODY_FONT}`;
    ctx.fillText(
      `Còn mình: đã đi qua ${round1(result.life.percentLived)}% đời người theo kỳ vọng thống kê`,
      W / 2,
      y + 48,
    );
    ctx.fillStyle = MUTED;
    ctx.font = `500 24px ${BODY_FONT}`;
    ctx.fillText(
      `${nf.format(result.life.weeksLived)} / ${nf.format(result.life.totalWeeks)} tuần đã sống`,
      W / 2,
      y + 88,
    );
    y += 120;
  }
  if (!result.father && !result.mother && result.life) {
    ctx.textAlign = 'center';
    ctx.fillStyle = MUTED;
    ctx.font = `600 34px ${BODY_FONT}`;
    ctx.fillText('CUỘC ĐỜI BẠN ĐÃ ĐI QUA', W / 2, y + 60);
    ctx.fillStyle = INK;
    ctx.font = `800 150px ${DISPLAY_FONT}`;
    ctx.fillText(`${round1(result.life.percentLived)}%`, W / 2, y + 210);
    ctx.fillStyle = INK2;
    ctx.font = `600 38px ${BODY_FONT}`;
    ctx.fillText('theo kỳ vọng thống kê', W / 2, y + 265);
    ctx.fillStyle = MUTED;
    ctx.font = `500 32px ${BODY_FONT}`;
    ctx.fillText(
      `${nf.format(result.life.weeksLived)} / ${nf.format(result.life.totalWeeks)} tuần đã sống`,
      W / 2,
      y + 318,
    );
  }

  // Chân thẻ + dải seed ở đáy (H4 vòng 4: chân thẻ KÉO LÊN 30px —
  // kẻ chân từ H−168 lên H−198, các dòng theo cùng nhịp — dải
  // trắng giữa khối cuối và dòng kết thu về mức đệm thường).
  ctx.strokeStyle = LINE_SOFT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MX, H - 198);
  ctx.lineTo(W - MX, H - 198);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = `600 30px ${BODY_FONT}`;
  ctx.fillText('Trân trọng từng cái Tết còn bên nhau.', W / 2, H - 144);
  ctx.fillStyle = MUTED;
  ctx.font = `500 24px ${BODY_FONT}`;
  ctx.fillText(
    'Ước tính thống kê — không phải dự đoán dành cho bất kỳ cá nhân nào.',
    W / 2,
    H - 102,
  );
  ctx.fillStyle = SEED_INK;
  ctx.font = `700 26px ${BODY_FONT}`;
  ctx.fillText(SITE_URL.replace('https://', ''), W / 2, H - 60);
  ctx.fillStyle = SEED;
  ctx.fillRect(0, H - 12, W, 12);

  return canvas;
}
