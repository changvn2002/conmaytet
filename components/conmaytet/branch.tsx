'use client';

/**
 * Cành đào — minh hoạ của conmaytet, vẽ bằng HỆ HOA THAM SỐ
 * (VÒNG 3, G3 của panel vòng 2: hết «một glyph dập lặp»).
 *
 * Mỗi bông là DUY NHẤT theo bộ tham số riêng: số cánh 5–6, BIẾN THỂ
 * cánh (3 họ path oval NHỌN khác nhau về dài/rộng/độ sâu khía V),
 * dãy lệch góc riêng từng cánh, ép dọc (squash) riêng, trạng thái
 * nở/hé riêng. Trong cùng một hình cấm hai bông trùng silhouette —
 * bảng tham số dưới đây được chọn để mọi tổ hợp (số cánh × biến thể
 * × trạng thái × squash) trong một biến thể cành đều khác nhau.
 * Bộ bông của HERO ≠ bộ bông của THẺ (toạ độ + tham số riêng).
 * Lá cũng là path nhọn hai đầu có gân giữa, dài/cong khác nhau từng
 * chiếc — không còn ellipse dập khuôn.
 *
 * VÒNG 4 (H3, bài học meta panel vòng 3): hoa toả tròn đối xứng vẫn
 * đọc như CON DẤU dù đã biến thiên cỡ/góc — nay phá đối xứng NGAY
 * TRONG một bông: từng cánh có dài/rộng RIÊNG (cánh dài/ngắn xen
 * nhau), một cánh KHUẤT vẽ trước ở độ mờ 50% thu 0,8 nép sau các
 * cánh chính, và TÂM (vòng nhị + đĩa gold) LỆCH khỏi tâm hình học
 * của bông. Lá thuôn cong một phía phồng một phía lép (hai mép
 * không đối xứng). LUẬT TRỌN KHUNG: mọi cành/bông/nụ/lá nằm TRỌN
 * trong viewBox với lề rõ — hero kết thúc trước mép thẻ, không còn
 * bông nào bị mép thẻ/viewBox cắt (bỏ bố cục tràn mép của vòng 2).
 *
 * VÒNG 5 (J5): hai đầu THÂN CHÍNH của cả hai biến thể thuôn nhọn
 * dần theo từng đoạn (dày → mỏng → rất mỏng) và kết thúc bằng
 * nụ (ngọn hero) hoặc lá (gốc hero, hai đầu thẻ) — không đầu thân
 * nào còn là vết cắt phẳng lơ lửng giữa nền.
 *
 * VÒNG 6 (K1 thẻ + K1b hero): cách thuôn bằng NHIỀU ĐOẠN NÉT
 * chồng nhau của vòng 5 vẫn để lại KHẤC BẬC ở mỗi khớp nối và
 * mặt cắt chéo ở đầu trái (ghế 2+5 thẻ, ghế 3 hero) — nay thân
 * là MỘT ĐƯỜNG CONG LIỀN MẠCH DUY NHẤT: chuỗi cubic C1 liên tục
 * được lấy mẫu thành ĐƯỜNG BAO THUÔN (fill) với bề rộng biến
 * thiên trơn (nhọn hai đầu với thân chính, nhọn đầu ngọn với
 * cành con) — không khớp nối, không vết chồng nét, không đầu
 * cắt phẳng nào còn tồn tại. Mọi cành con kết thúc DƯỚI một
 * bông/nụ; mọi lá/nụ trang trí bám đúng điểm trên đường cong
 * thân (toạ độ đã đối chiếu số học với chính chuỗi cubic).
 *
 * Hai biến thể bố cục:
 *  - 'hero': cành lớn trong thẻ hero của form, thân vươn lên.
 *  - 'card': cành của header thẻ chia sẻ — R8 cùng bố cục
 *    chéo với hero (bản U võng + bông treo của các vòng ≤7 đã
 *    bị bác vì đọc như vòng cổ/mặt dây chuyền).
 * Màu qua var(--*) của tokens.css — không hex literal (luật sink).
 * Hồng CHỈ ở cánh hoa.
 */

/** Ba họ cánh oval nhọn: giọt có khía V ở đầu, gốc tại (0,0), đầu
 *  cánh hướng -y, dài danh nghĩa ~16đv nhưng MỖI HỌ một tỉ lệ thật:
 *  họ 0 cân đối, họ 1 THON DÀI (khía sâu), họ 2 RỘNG NGẮN (khía nông,
 *  vai phồng). Hai vai không đối xứng để tránh đọc máy/sticker. */
const PETALS = [
  'M0 0 C-7.5 -2.5 -10 -9.5 -3.4 -15.2 L0 -13.4 L3 -15.4 C9.5 -10 7 -2.8 0 0 Z',
  'M0 0 C-5.6 -3 -7.6 -11 -2.2 -16.6 L0 -14.4 L2.4 -16.9 C7.2 -11.6 5.4 -3.2 0 0 Z',
  'M0 0 C-8.6 -2 -11.2 -8 -4.2 -13.6 L0 -12.4 L3.8 -13.9 C10.2 -8.4 8.2 -2.4 0 0 Z',
] as const;
/** Cánh lớp trong tương ứng từng họ: ngắn/hẹp hơn, cùng ngôn ngữ. */
const PETALS_INNER = [
  'M0 0 C-5.5 -2 -7 -7 -2.4 -11 L0 -9.6 L2.2 -11.2 C6.8 -7.4 5 -2 0 0 Z',
  'M0 0 C-4 -2.2 -5.4 -8 -1.6 -12 L0 -10.4 L1.8 -12.2 C5.2 -8.4 3.8 -2.2 0 0 Z',
  'M0 0 C-6.2 -1.6 -8 -6 -3 -10 L0 -9 L2.8 -10.2 C7.4 -6.4 5.8 -2 0 0 Z',
] as const;
/** Nụ: cánh khép thành giọt kín, đầu hơi nhọn. */
const BUD = 'M0 0 C-6 -4 -7 -12 0 -17 C7 -12 6 -4 0 0 Z';
/** Cúp hoa HÉ: cụm cánh khép ôm tâm (hoa chưa nở hết) — vẽ đè lên
 *  giữa bông hé để đọc «đang mở» chứ không phải bông nở thu nhỏ. */
const HALF_CUP =
  'M0 1 C-4.5 -1 -6 -6.5 -3 -10.5 C-1.6 -8 -0.8 -8.6 0 -11 C0.8 -8.6 1.6 -8 3 -10.5 C6 -6.5 4.5 -1 0 1 Z';

type BloomState = 'full' | 'half';

/** Dài/rộng RIÊNG từng cánh trong cùng một bông (H3 vòng 4): cánh
 *  dài nhất gấp ~1,4 lần cánh ngắn nhất, bề rộng cũng lệch nhịp —
 *  phá hẳn vòng tròn đều của bông toả tròn kiểu con dấu. Mẫu được
 *  XOAY theo họ cánh (variant) nên mỗi họ một nhịp lệch khác nhau. */
const PETAL_LEN = [1.14, 0.88, 1.05, 0.8, 1.1, 0.95] as const;
const PETAL_WID = [0.92, 1.1, 0.84, 1.13, 0.97, 1.03] as const;

function Flower({
  x,
  y,
  r,
  rot = 0,
  count = 5,
  variant = 0,
  state = 'full',
  offsets,
  squash = 1,
}: {
  x: number;
  y: number;
  /** Bán kính hoa theo đơn vị viewBox (cánh dài 16đv ở r=16). */
  r: number;
  rot?: number;
  /** Số cánh ngoài: 5 hoặc 6. */
  count?: 5 | 6;
  /** Họ cánh (0 cân đối / 1 thon dài / 2 rộng ngắn). */
  variant?: 0 | 1 | 2;
  /** 'full' nở hết · 'half' hé mở (cánh ngoài thu 0,72 + cúp khép). */
  state?: BloomState;
  /** Lệch góc riêng TỪNG CÁNH (độ) — nhịp không bông nào giống bông nào. */
  offsets: number[];
  /** Ép dọc riêng (0,84–1,04) để bông không tròn đều như tem. */
  squash?: number;
}) {
  const s = r / 16;
  const step = 360 / count;
  const outerScale = state === 'half' ? 0.72 : 1;
  const outerAngles = Array.from({ length: count }, (_, i) => i * step + (offsets[i] ?? 0));
  const innerAngles = Array.from(
    { length: count },
    (_, i) => (i + 0.5) * step - (offsets[i] ?? 0) * 0.6,
  );
  // Dài/rộng từng cánh: mẫu PETAL_LEN/PETAL_WID xoay theo họ cánh.
  const lenOf = (i: number) => PETAL_LEN[(i + variant * 2) % PETAL_LEN.length];
  const widOf = (i: number) => PETAL_WID[(i * 2 + variant) % PETAL_WID.length];
  // Cánh KHUẤT: nằm ở khe giữa hai cánh chính, vẽ TRƯỚC (dưới cùng),
  // thu 0,8 và mờ 50% — chỉ lộ phần đầu không bị cánh chính che.
  const hiddenAngle = (variant + 1) * step * 0.5 + (offsets[0] ?? 0);
  // Tâm LỆCH khỏi tâm hình học (theo họ cánh + số cánh).
  const coreDx = variant === 0 ? 1.1 : variant === 1 ? -0.8 : 0.5;
  const coreDy = count === 6 ? -0.7 : 0.9;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s} ${s * squash})`}>
      <g transform={`scale(${outerScale})`}>
        <path
          d={PETALS[variant]}
          fill="var(--petal)"
          opacity={0.5}
          transform={`rotate(${hiddenAngle}) scale(0.8 0.8)`}
        />
        {outerAngles.map((a, i) => (
          <path
            key={i}
            d={PETALS[variant]}
            fill="var(--petal)"
            transform={`rotate(${a}) scale(${widOf(i)} ${lenOf(i)})`}
          />
        ))}
      </g>
      {state === 'full' &&
        innerAngles.map((a, i) => (
          <path
            key={i}
            d={PETALS_INNER[variant]}
            fill="var(--petal-light)"
            transform={`rotate(${a}) scale(${widOf(i + 2)} ${lenOf(i + 3)})`}
          />
        ))}
      {state === 'half' && <path d={HALF_CUP} fill="var(--petal-light)" />}
      {/* Nhị: vòng chấm gold quanh tâm LỆCH + đĩa gold lệch theo. */}
      {state === 'full' && (
        <g transform={`translate(${coreDx} ${coreDy})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle
              key={a}
              cx={2.6 * Math.sin((a * Math.PI) / 180)}
              cy={-2.6 * Math.cos((a * Math.PI) / 180)}
              r={0.9}
              fill="var(--gold)"
            />
          ))}
          <circle r={1.6} fill="var(--gold)" />
        </g>
      )}
      {state === 'half' && <circle cx={coreDx} cy={coreDy} r={1.3} fill="var(--gold)" />}
    </g>
  );
}

function Bud({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={BUD} fill="var(--petal)" />
      <path
        d="M0 -1 C-2 -5 -2.4 -10 0 -14.5"
        stroke="var(--petal-light)"
        strokeWidth={1.4}
        fill="none"
      />
    </g>
  );
}

/**
 * Lá đào bằng PATH: phiến nhọn hai đầu THUÔN CONG BẤT ĐỐI XỨNG
 * (H3 vòng 4): mép trên phồng rộng (×1,18 bề rộng) trong khi mép
 * dưới lép hẳn (×0,45–0,62), đầu lá lệch theo bend — hai phía của
 * gân không còn là ảnh gương của nhau. Gân giữa mảnh. Gốc lá tại
 * (0,0), đầu lá hướng -y rồi xoay theo `rot`.
 */
function Leaf({
  x,
  y,
  len,
  wid,
  rot,
  bend,
  tone,
}: {
  x: number;
  y: number;
  len: number;
  wid: number;
  rot: number;
  /** Độ cong lệch của phiến (đv) — dương võng phải, âm võng trái. */
  bend: number;
  tone: 'var(--seed)' | 'var(--leaf)';
}) {
  const d = `M0 0 C ${wid * 1.18} ${-len * 0.3 + bend} ${wid * 0.72} ${-len * 0.72 + bend} ${bend * 0.9} ${-len} C ${-wid * 0.45} ${-len * 0.78 - bend} ${-wid * 0.62} ${-len * 0.34 - bend} 0 0 Z`;
  const rib = `M0 -1.5 C ${bend * 0.45} ${-len * 0.4} ${bend * 0.55} ${-len * 0.65} ${bend * 0.8} ${-len + 2}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={d} fill={tone} />
      <path d={rib} stroke="var(--card)" strokeWidth={0.9} fill="none" opacity={0.35} />
    </g>
  );
}

/* ── Thân thuôn LIỀN MẠCH (K1/K1b vòng 6) ──────────────────────
 * Thân/cành con = đường bao (outline) của MỘT chuỗi cubic C1
 * liên tục, lấy mẫu 18 điểm/đoạn, bề rộng biến thiên trơn theo t
 * toàn cục. 'both': nhọn cả hai đầu (thân chính — gốc cũng thuôn
 * thành điểm và tận cùng bằng nụ/lá). 'tip': chỉ nhọn đầu ngọn
 * (cành con — gốc giữ nguyên bề rộng để chìm vào thân chính). */
type Pt = readonly [number, number];
type CubicSeg = readonly [Pt, Pt, Pt, Pt];

function cubicPoint(seg: CubicSeg, t: number): Pt {
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

function cubicTangent(seg: CubicSeg, t: number): Pt {
  const [p0, p1, p2, p3] = seg;
  const u = 1 - t;
  return [
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ];
}

const smoothstep01 = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Bề rộng thân tại t toàn cục (0 = gốc · 1 = ngọn).
 *  `floorFrac` (L2 vòng 7, CHỈ thân chính THẺ): SÀN bề rộng —
 *  ngoài hai chóp nhọn ở hai đầu (mỗi chóp rút trong 5% t đầu/
 *  cuối, tận cùng bằng lá như cũ), bề rộng không bao giờ
 *  xuống dưới floorFrac × wMax. Thân hero không truyền sàn
 *  nên hình học hero giữ nguyên byte-for-byte về bề rộng. */
function stemWidthAt(t: number, wMax: number, mode: 'both' | 'tip', floorFrac = 0): number {
  const tip = 1 - 0.92 * t * t;
  let w: number;
  if (mode === 'tip') {
    w = wMax * tip;
  } else {
    const base = 0.1 + 0.9 * smoothstep01(t / 0.2);
    w = wMax * base * tip;
  }
  if (floorFrac > 0) {
    const endTaper = Math.min(smoothstep01(t / 0.05), smoothstep01((1 - t) / 0.05));
    w = Math.max(w, wMax * floorFrac * endTaper);
  }
  return w;
}

/** Đường bao khép kín của thân — một path fill duy nhất. */
function stemOutline(
  segs: readonly CubicSeg[],
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
      const [x, y] = cubicPoint(seg, lt);
      const [tx, ty] = cubicTangent(seg, lt);
      const m = Math.hypot(tx, ty) || 1;
      const hw = stemWidthAt(gt, wMax, mode, floorFrac) / 2;
      left.push(`${(x - (ty / m) * hw).toFixed(2)} ${(y + (tx / m) * hw).toFixed(2)}`);
      right.push(`${(x + (ty / m) * hw).toFixed(2)} ${(y - (tx / m) * hw).toFixed(2)}`);
    }
  });
  return `M${left.join(' L')} L${right.reverse().join(' L')} Z`;
}

function Stem({
  segs,
  w,
  mode = 'both',
  floorFrac = 0,
}: {
  segs: readonly CubicSeg[];
  w: number;
  mode?: 'both' | 'tip';
  floorFrac?: number;
}) {
  return (
    <path
      d={stemOutline(segs, w, mode, floorFrac)}
      fill="var(--branch)"
      stroke="var(--branch)"
      strokeWidth={0.6}
      strokeLinejoin="round"
    />
  );
}

/** Thân chính HERO — một chuỗi cubic liền mạch (K1b): gốc (10,192)
 *  thuôn nhọn tận cùng bằng NỤ, ngọn (347,24) tận cùng bằng nụ
 *  như cũ; tiếp tuyến tại hai khớp (132,118) và (268,36) gần như
 *  thẳng hàng nên đường bao không gờ bậc nào. */
const HERO_STEM: readonly CubicSeg[] = [
  [
    [10, 192],
    [58, 179],
    [96, 156],
    [132, 118],
  ],
  [
    [132, 118],
    [168, 84],
    [214, 52],
    [268, 36],
  ],
  [
    [268, 36],
    [300, 27],
    [326, 24.5],
    [347, 24],
  ],
];
/** Cành phụ hero — gốc bám đúng điểm trên HERO_STEM (đối chiếu
 *  số học), ngọn chìm dưới bông của nó. */
const HERO_TWIG_1: readonly CubicSeg[] = [
  [
    [115.6, 134.1],
    [146, 130],
    [176, 140],
    [205, 160],
  ],
];
const HERO_TWIG_2: readonly CubicSeg[] = [
  [
    [211, 61],
    [226, 48],
    [235, 32],
    [237.5, 18],
  ],
];
const HERO_TWIG_3: readonly CubicSeg[] = [
  [
    [69.5, 167.7],
    [88, 154],
    [97, 136],
    [100.5, 117],
  ],
];

/** Thân chính THẺ — R8 (phán quyết parent sau panel vòng 7,
 *  lỗi R-A): BỎ bố cục cung chữ U đối xứng + bông treo ở điểm
 *  võng (đọc như vòng cổ/mặt dây chuyền) — thân nay CHÉO BẤT
 *  ĐỐI XỨNG như thân hero: vào từ dưới-trái (8,124), vươn lên
 *  trên-phải, tận cùng (352,22). Tiếp tuyến tại hai khớp lệch
 *  ≤1° (−26°/−25° và −8°/−7°, đã đối chiếu số học). */
const CARD_STEM: readonly CubicSeg[] = [
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
/** Cành con XẺ XUỐNG của thẻ (R8 — thay cành rủ thẳng đứng
 *  của các vòng trước): gốc bám ĐÚNG điểm trên CARD_STEM đoạn 1
 *  ở t=0,62 → (87,6 · 96,3), xẻ chéo xuống-phải như cành phụ 1
 *  của hero, ngọn (167,123) chìm đúng tâm bông ở (169,125) —
 *  bông nằm ở ĐẦU một cành con thật (w 3,2), không còn bông
 *  nào treo giữa nhịp bằng cuống mảnh. */
const CARD_TWIG_DIP: readonly CubicSeg[] = [
  [
    [87.6, 96.3],
    [112, 97],
    [140, 107],
    [167, 123],
  ],
];
/** Cành con chĩa lên của thẻ (R8): gốc bám ĐÚNG điểm trên
 *  CARD_STEM đoạn 2 ở t=0,30 → (182,3 · 54,3), ngọn (205,14);
 *  nụ bám thân cành ở t=0,55 → (198,8 · 32). */
const CARD_TWIG_UP: readonly CubicSeg[] = [
  [
    [182.3, 54.3],
    [195, 41],
    [203, 27],
    [205, 14],
  ],
];

/** Biến thể HERO: viewBox 360×205. Thân chính vươn từ dưới-trái lên
 *  phải, đầu cành chạm mép phải. Bộ bông hero: 7 bông — tổ hợp tham
 *  số (cánh × họ × trạng thái × squash) KHÔNG bông nào trùng nhau:
 *  6c-họ0-nở · 5c-họ1-nở · 5c-họ2-hé · 6c-họ1-nở · 5c-họ2-nở ·
 *  5c-họ1-hé · 6c-họ2-nở. */
function HeroBranch() {
  return (
    <g>
      <Stem segs={HERO_STEM} w={6.5} />
      <Stem segs={HERO_TWIG_1} w={3.4} mode="tip" />
      <Stem segs={HERO_TWIG_2} w={3} mode="tip" />
      <Stem segs={HERO_TWIG_3} w={2.6} mode="tip" />
      {/* Lá bám ĐÚNG điểm trên đường cong thân (K1b — toạ độ đã
          đối chiếu với HERO_STEM/HERO_TWIG_1, không còn lá/nụ nào
          lơ lửng cách thân vài đơn vị như bản cũ). */}
      <Leaf x={257} y={40} len={23} wid={5.6} rot={-58} bend={2.4} tone="var(--seed)" />
      <Leaf x={17} y={189} len={12} wid={3.6} rot={-64} bend={1.6} tone="var(--leaf)" />
      <Leaf x={140} y={113} len={19} wid={4.6} rot={48} bend={-1.8} tone="var(--seed)" />
      <Leaf x={46} y={177} len={21} wid={5.2} rot={-38} bend={1.4} tone="var(--seed)" />
      <Leaf x={193} y={151} len={16} wid={4.2} rot={72} bend={2.8} tone="var(--leaf)" />
      <Leaf x={292} y={30} len={15} wid={3.9} rot={-76} bend={-2.2} tone="var(--leaf)" />
      {/* Bông đầu cành (vòng 4): tâm lùi vào 326/30 để cánh dài
          nhất (r×1,14) vẫn cách mép phải/mép trên ≥8đv. */}
      <Flower
        x={326}
        y={30}
        r={19}
        rot={14}
        count={6}
        variant={0}
        offsets={[0, 7, -5, 9, -8, 4]}
        squash={0.94}
      />
      <Flower x={238} y={20} r={12} rot={-19} count={5} variant={1} offsets={[0, -8, 6, -4, 10]} />
      {/* Bông hé dưới thân phải (K1b): nâng từ y=62 lên y=47 để
          cánh trên chạm hẳn vào thân — bản cũ lơ lửng cách thân
          ~14đv. */}
      <Flower
        x={282}
        y={47}
        r={15}
        rot={27}
        count={5}
        variant={2}
        state="half"
        offsets={[0, 9, -6, 5, -9]}
        squash={0.9}
      />
      <Flower
        x={206}
        y={161}
        r={13}
        rot={4}
        count={6}
        variant={1}
        offsets={[0, -6, 8, -9, 5, -3]}
      />
      <Flower
        x={101}
        y={116}
        r={10}
        rot={-33}
        count={5}
        variant={2}
        offsets={[0, 5, -10, 7, -5]}
        squash={0.86}
      />
      <Flower
        x={168}
        y={92}
        r={8}
        rot={41}
        count={5}
        variant={1}
        state="half"
        offsets={[0, -11, 8, -6, 9]}
      />
      <Flower
        x={88}
        y={146}
        r={6.5}
        rot={-12}
        count={6}
        variant={2}
        offsets={[0, 10, -7, 6, -10, 8]}
        squash={1.03}
      />
      {/* Nụ bám cành con 2 (K1b): gốc nụ nằm đúng trên HERO_TWIG_2
          — bản cũ ở (242,76) lơ lửng giữa khoảng trống. */}
      <Bud x={227} y={42} rot={-40} s={0.9} />
      <Bud x={59} y={172} rot={-58} s={0.62} />
      {/* Nụ bám mép dưới thân gần ngọn (K1b): gốc trên HERO_STEM —
          bản cũ ở (306,46) lơ lửng dưới thân ~14đv. */}
      <Bud x={301} y={29} rot={24} s={0.8} />
      {/* Nụ kết thúc đầu ngọn thân (J5): đầu cành thuôn nhọn
          tận cùng bằng nụ này, ở (347,24) — trọn trong viewBox. */}
      <Bud x={347} y={24} rot={78} s={0.5} />
      {/* Nụ kết thúc đầu GỐC thân (K1b): gốc thân (10,192) thuôn
          nhọn và tận cùng bằng nụ này chĩa ngược dọc tiếp tuyến
          gốc — hết mặt cắt phẳng + khấc ở đầu dưới-trái. */}
      <Bud x={10} y={192} rot={-105} s={0.55} />
    </g>
  );
}

/** Biến thể CARD: viewBox 360×170. R8: cùng NGÔN NGỮ bố cục
 *  với hero — thân chéo dưới-trái → trên-phải, một cành con xẻ
 *  xuống mang bông ở đầu cành, một cành con chĩa lên mang nụ;
 *  MỌI bông hoặc nằm trên thân hoặc ở đầu cành con, hai đầu
 *  thân khép bằng nụ; KHÔNG cung võng, KHÔNG bông treo giữa
 *  nhịp, KHÔNG cánh rơi (bố cục U + bông treo + cánh rơi của
 *  các vòng ≤7 bị panel vòng 7 bác là vòng cổ/mặt dây chuyền).
 *  Bộ bông thẻ: 4 bông, tham số RIÊNG, không mượn tổ hợp của
 *  hero ở cùng kích cỡ/trạng thái: 5c-họ2-nở-squash1,02 ·
 *  6c-họ0-nở · 5c-họ0-hé · 6c-họ1-hé + 3 nụ. */
function CardBranch() {
  return (
    <g>
      {/* Thân chính LIỀN MẠCH chéo (R8): một đường bao thuôn
          duy nhất (CARD_STEM) + SÀN bề rộng 0,62 như vòng 7 —
          bề rộng tối đa 6,5 ngang thân hero. Trọn khung: vào
          (8,124), kết thúc (352,22), không chạm mép. */}
      <Stem segs={CARD_STEM} w={6.5} floorFrac={0.62} />
      {/* Cành con xẻ xuống: gốc (87,6 · 96,3) đúng trên thân,
          ngọn chìm đúng tâm bông (169,125). */}
      <Stem segs={CARD_TWIG_DIP} w={3.2} mode="tip" />
      {/* Cành con chĩa lên: gốc (182,3 · 54,3) đúng trên thân,
          ngọn (205,14), nụ bám thân cành ở (198,8 · 32). */}
      <Stem segs={CARD_TWIG_UP} w={2.6} mode="tip" />
      {/* Lá bám ĐÚNG điểm trên đường cong (đối chiếu số học
          R8): (23,7 · 120,5) = thân đoạn 1 t=0,12 · (121,7 ·
          79,9) = đoạn 1 t=0,88 · (231,9 · 39,8) = đoạn 2
          t=0,62 · (126,3 · 103,9) = cành xẻ t=0,5 · (321,6 ·
          24,9) = đoạn 3 t=0,4. */}
      <Leaf x={23.7} y={120.5} len={12} wid={3.6} rot={-58} bend={1.6} tone="var(--leaf)" />
      <Leaf x={121.7} y={79.9} len={18} wid={4.8} rot={-35} bend={2.2} tone="var(--seed)" />
      <Leaf x={231.9} y={39.8} len={15} wid={4} rot={-62} bend={-2} tone="var(--leaf)" />
      <Leaf x={126.3} y={103.9} len={14} wid={4} rot={58} bend={-2.2} tone="var(--seed)" />
      <Leaf x={321.6} y={24.9} len={11} wid={3.2} rot={-72} bend={-1.6} tone="var(--leaf)" />
      {/* Bông đầu cành: tâm (330,27) phủ đúng thân đoạn 3
          (thân tại x=330 là y≈24) như bông đầu cành hero. */}
      <Flower
        x={330}
        y={27}
        r={13}
        rot={-8}
        count={5}
        variant={2}
        offsets={[0, -6, 9, -8, 5]}
        squash={1.02}
      />
      {/* Bông ở đầu cành xẻ xuống — thay bông treo giữa nhịp
          của bố cục cũ. */}
      <Flower
        x={169}
        y={125}
        r={10.5}
        rot={22}
        count={6}
        variant={0}
        offsets={[0, 8, -5, 10, -6, 3]}
      />
      {/* Bông hé nằm TRÊN thân đoạn 2 (tâm = điểm thân t=0,75
          → (252,8 · 35,2)). */}
      <Flower
        x={254}
        y={34}
        r={9}
        rot={-38}
        count={5}
        variant={0}
        state="half"
        offsets={[0, 4, -9, 6, -4]}
      />
      {/* Bông hé nhỏ nằm TRÊN thân đoạn 1 (tâm = điểm thân
          t=0,30 → (46,8 · 113,4)). */}
      <Flower
        x={47}
        y={113}
        r={7}
        rot={15}
        count={6}
        variant={1}
        state="half"
        offsets={[0, -10, 7, -5, 9, -7]}
        squash={0.88}
      />
      {/* Nụ khép hai đầu thân (như hero) + nụ bám cành chĩa
          lên ở (198,8 · 32). Không nụ treo dưới thân. */}
      <Bud x={352} y={22} rot={80} s={0.5} />
      <Bud x={8} y={124} rot={-102} s={0.55} />
      <Bud x={198.8} y={32} rot={18} s={0.8} />
    </g>
  );
}

/**
 * Cành đào theo vị trí: 'hero' (mặc định) cho thẻ hero của form —
 * cành nằm TRỌN trong thẻ (vòng 4, luật trọn khung); 'card' cho
 * header thẻ chia sẻ (canvas trong lib/share-card.ts vẽ cùng bố cục
 * card bằng API canvas riêng, cùng hệ tham số).
 */
export function PeachBranch({
  variant = 'hero',
  className,
}: {
  variant?: 'hero' | 'card';
  className?: string;
}) {
  const isCard = variant === 'card';
  return (
    <svg
      viewBox={isCard ? '0 0 360 170' : '0 0 360 205'}
      fill="none"
      className={className}
      role="img"
      aria-label="Cành hoa đào"
      focusable={false}
    >
      {isCard ? <CardBranch /> : <HeroBranch />}
    </svg>
  );
}
