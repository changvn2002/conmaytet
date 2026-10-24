/**
 * Pipeline brand V4 CHÍNH THỨC của conmaytet (REDESIGN-V4, neo IBM Carbon):
 * sinh các bản PNG/ICO phục vụ SEO/PWA từ artwork V4 trong
 * public/products/brand/ — các SVG đó chép BYTE-IDENTICAL từ hồ sơ
 * redesign-v4/conmaytet/assets/, script chỉ raster hoá / trích nhóm hình,
 * KHÔNG vẽ lại, KHÔNG sửa hình học path:
 *   public/icons/icon-192.png            192×192  — icon PWA (app-icon nguyên bản)
 *   public/icons/icon-512.png            512×512  — icon PWA (app-icon nguyên bản)
 *   public/icons/icon-maskable-512.png   512×512  — icon maskable (app-icon nguyên bản)
 *   public/icons/apple-touch-icon.png    180×180  — icon iOS (app-icon nguyên bản)
 *   app/favicon.ico                      16/32/48 — favicon PNG-in-ICO 2 nguồn theo
 *                                          luật cỡ (16px từ micro, 32/48px từ app-icon)
 *   public/og.png                        1200×630 — ảnh Open Graph / Twitter card
 *
 * Artwork nguồn (một họ mark «Một Vòng Năm» duy nhất — IDENTITY §5):
 * app-icon V4 = public/products/brand/conmaytet-app-icon.svg: tile Green 100
 * #071908 + mark «Một Vòng Năm» biến thể trên-reveal (nét Green 10 #DEFBE6,
 * cap-mốc gold Yellow 30 #F1C21B — gold chỉ tồn tại ở biến thể trên-nền-sâu).
 * Biến thể MICRO = public/products/brand/conmaytet-mark-micro.svg: cùng họ
 * mark, hình học riêng cho cỡ nhỏ (xoắn 1,5 vòng, nét 14đv) — chỉ dùng ở
 * entry favicon 16px theo luật cỡ bên dưới, không dùng làm mark chính.
 *
 * Maskable: dùng NGUYÊN BẢN app-icon — trong file đó mark đã thu về vùng
 * sống 72/96 ≈ 75% quanh tâm tile (nhóm mark translate 12đv, scale 0.75),
 * nằm trọn trong vùng an toàn maskable (vòng tròn giữa 80%), nên không cần
 * bản full-bleed riêng và không được phóng mark ra mép.
 *
 * Favicon: cơ chế PNG-in-ICO 16/32/48 theo đúng tiền lệ app chị em chiatien
 * (buildIco bên dưới) NHƯNG 2 nguồn theo LUẬT CỠ của IDENTITY §5: hiển thị
 * ≤20px (favicon, tab, thông báo) bắt buộc dùng biến thể MICRO — cấm thu
 * mark chính (xoắn 2,5 vòng) xuống ≤20px vì nét 6,5đv sẽ bết ở cỡ đó. Vì
 * vậy entry 16px sinh từ tổ hợp tile Green 100 + hình học micro (nét đổi
 * sang trắng trơn trên nền sâu, 0 gold — luật micro IDENTITY §3/§4), còn
 * entry 32px + 48px (≥24px, vùng của mark chính) giữ nguyên app-icon.
 *
 * OG 1200×630 (IDENTITY §5: mark trên-reveal trên nền Green 100 + tên app;
 * 0 số kết quả cá nhân):
 *   - nền Green 100 #071908;
 *   - mark: trích NGUYÊN nhóm mark từ app-icon.svg (nét Green 10 + cap gold),
 *     phóng lên 288px (scale 3 trên lưới 96), đặt tại (102, 171);
 *   - wordmark: trích NGUYÊN nhóm path wordmark outline từ lockup.svg, chỉ
 *     đổi fill nhóm từ mực Gray 100 #161616 sang trắng #FFFFFF (biến thể
 *     trên-sâu đã khoá — chỉ đổi MÀU, không sửa hình học), đặt cạnh mark.
 *     Bbox mực của wordmark trong lockup đo thật: x 120.75–345.75,
 *     y 0–83.5 (đơn vị lưới lockup) → scale 2.93 cho bề rộng mực ≈ 659px,
 *     gốc đặt tại (438, 192): mực chạy 438–1097 × 192–437, cân giữa theo
 *     chiều dọc với mark (tâm 315) và không phần tử nào chạm mép khung.
 *   - KHÔNG dòng phụ bằng chữ hệ thống: wordmark outline đã mang trọn tên
 *     app kèm dấu tiếng Việt dưới dạng hình học; chữ <text> phụ thuộc font
 *     hệ thống lúc sinh ảnh (rủi ro mất dấu / lệch font) nên bị bỏ hẳn.
 *
 * Mọi hex literal trong file này đều thuộc bảng token V4 (sink bake của
 * tokens:verify): #071908 · #198038 · #DEFBE6 · #F1C21B · #FFFFFF · #161616.
 *
 * Cách chạy (cần @resvg/resvg-js — tool sinh ảnh một lần, KHÔNG phải
 * dependency runtime của app; repo này dùng bản đã cài sẵn ở
 * ~/workspace/mini-apps/resvg-tool):
 *   RESVG_DIR=~/workspace/mini-apps/resvg-tool node scripts/generate-brand-pngs.mjs
 */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const anchor = process.env.RESVG_DIR
  ? path.join(process.env.RESVG_DIR, 'package.json')
  : path.join(root, 'package.json');
const { Resvg } = createRequire(anchor)('@resvg/resvg-js');

const DEEP = '#071908'; // Green 100 — nền OG + tile app-icon (token brand-100)
const WHITE = '#FFFFFF'; // wordmark trên-sâu + nét micro trên-sâu (cực trị đã khai)
const MICRO_GREEN = '#198038'; // Green 60 — nét gốc trong conmaytet-mark-micro.svg

function readBrand(file) {
  return readFileSync(path.join(root, 'public/products/brand', file), 'utf8');
}

function render(svg, width, outFile) {
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
  if (outFile) {
    const out = path.join(root, outFile);
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, png);
    console.log(`✓ ${outFile} (${png.length} bytes)`);
  }
  return png;
}

/** ICO chứa PNG 16/32/48 — cơ chế favicon.ico theo tiền lệ app chị em chiatien. */
function buildIco(pngBySize) {
  const sizes = Object.keys(pngBySize)
    .map(Number)
    .sort((a, b) => a - b);
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(sizes.length, 4);
  const entries = [];
  let offset = 6 + sizes.length * 16;
  for (const size of sizes) {
    const png = pngBySize[size];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += png.length;
  }
  return Buffer.concat([header, ...entries, ...sizes.map((s) => pngBySize[s])]);
}

/**
 * Nhóm mark trên-reveal bên trong app-icon.svg: nhóm <g> chứa nguyên path
 * nét Green 10 #DEFBE6 + circle cap gold #F1C21B theo toạ độ lưới 96 gốc
 * (chưa áp transform thu vùng sống của tile — OG tự đặt scale riêng).
 */
function markGroupOnDeep(appIconSvg) {
  const match = appIconSvg.match(
    /<g transform="translate\(12 12\.75\) scale\(0\.75\)">([\s\S]*?)<\/g>/,
  );
  if (!match) throw new Error('Không trích được nhóm mark từ conmaytet-app-icon.svg');
  return match[1].trim();
}

/**
 * Phần tử <path> duy nhất của conmaytet-mark-micro.svg, đổi nét Green 60
 * sang trắng trơn cho bề mặt sâu (luật micro trên-sâu IDENTITY §3/§4:
 * nét trắng trơn, 0 gold). CHỈ đổi màu nét — hình học `d`, bề dày nét 14đv
 * và cap tròn chép nguyên, không sửa một byte hình học nào.
 */
function microPathOnDeep(microSvg) {
  const match = microSvg.match(/<path[^>]*\/>/);
  if (!match) throw new Error('Không trích được path từ conmaytet-mark-micro.svg');
  const onDeep = match[0].replace(`stroke="${MICRO_GREEN}"`, `stroke="${WHITE}"`);
  if (onDeep === match[0]) {
    throw new Error('Không đổi được nét micro sang trắng — file micro đã đổi màu gốc?');
  }
  return onDeep;
}

/**
 * Nhóm path wordmark outline trong lockup.svg: nhóm <g fill="#161616"> cuối
 * file (Baloo 2 800 outline thật — hình học kế thừa nguyên vẹn, không <text>).
 */
function wordmarkGroup(lockupSvg) {
  const match = lockupSvg.match(/<g fill="#161616">([\s\S]*?)<\/g>\s*<\/svg>/);
  if (!match) throw new Error('Không trích được nhóm wordmark từ conmaytet-lockup.svg');
  return match[1].trim();
}

const appIcon = readBrand('conmaytet-app-icon.svg');
const lockup = readBrand('conmaytet-lockup.svg');
const micro = readBrand('conmaytet-mark-micro.svg');
const markInner = markGroupOnDeep(appIcon);
const wordmarkInner = wordmarkGroup(lockup);
const microInner = microPathOnDeep(micro);

// Icon PWA + maskable + iOS: raster NGUYÊN BẢN app-icon V4 ở mọi kích thước
// (tile Green 100 đã là thiết kế icon; mark trong vùng sống 72/96 ≈ 75%
// nên bản maskable an toàn mà không cần biến thể riêng — xem header).
render(appIcon, 192, 'public/icons/icon-192.png');
render(appIcon, 512, 'public/icons/icon-512.png');
render(appIcon, 512, 'public/icons/icon-maskable-512.png');
render(appIcon, 180, 'public/icons/apple-touch-icon.png');

// Favicon ICO 16/32/48 (PNG-in-ICO) — 2 NGUỒN theo luật cỡ IDENTITY §5:
//   16px (≤20px): tổ hợp MỚI = tile Green 100 (rect như app-icon) + hình
//     học MICRO trắng trơn (0 gold), đặt trong vùng sống 72/96 quanh tâm
//     bằng đúng transform của app-icon (translate 12 12.75, scale 0.75 —
//     tâm quang học (48,47) khớp tâm tile (48,48)). Cấm dùng mark chính
//     ở cỡ này (xem header).
//   32px + 48px (≥24px): giữ nguyên app-icon như cũ (mark chính trên-reveal).
const favicon16Svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">` +
  `<rect width="96" height="96" fill="${DEEP}"/>` +
  `<g transform="translate(12 12.75) scale(0.75)">${microInner}</g>` +
  `</svg>`;
const faviconPngs = {
  16: render(favicon16Svg, 16, null),
  32: render(appIcon, 32, null),
  48: render(appIcon, 48, null),
};
const ico = buildIco(faviconPngs);
writeFileSync(path.join(root, 'app/favicon.ico'), ico);
console.log(`✓ app/favicon.ico (${ico.length} bytes)`);

// OG 1200×630: nền Green 100 + mark trên-reveal 288px bên trái + wordmark
// outline trắng bên phải (chỉ đổi màu fill nhóm, giữ nguyên hình học).
render(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">` +
    `<rect width="1200" height="630" fill="${DEEP}"/>` +
    `<g transform="translate(102 171) scale(3)">${markInner}</g>` +
    `<g transform="translate(438 192) scale(2.93) translate(-120.75 0)">` +
    `<g fill="${WHITE}">${wordmarkInner}</g>` +
    `</g>` +
    `</svg>`,
  1200,
  'public/og.png',
);

if (!existsSync(path.join(root, 'public/og.png'))) {
  throw new Error('og.png was not written');
}
console.log('Done — brand artwork was only scaled/composited, never redrawn.');
