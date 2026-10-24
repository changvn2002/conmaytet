/**
 * Pipeline brand hệ lens-04 của conmaytet (chương trình conmaytet-redesign):
 * sinh PNG/ICO phục vụ SEO/PWA từ artwork mới trong public/products/brand/
 * — script chỉ raster hoá / trích nhóm hình, KHÔNG vẽ lại hình học:
 *   public/icons/icon-192.png            192×192  — icon PWA (app-icon nguyên bản)
 *   public/icons/icon-512.png            512×512  — icon PWA (app-icon nguyên bản)
 *   public/icons/icon-maskable-512.png   512×512  — icon maskable (app-icon nguyên bản)
 *   public/icons/apple-touch-icon.png    180×180  — icon iOS (app-icon nguyên bản)
 *   app/favicon.ico                      16/32/48 — PNG-in-ICO: 16px từ biến thể
 *                                          MICRO (glyph rút gọn), 32/48px từ app-icon
 *   public/og.png                        1200×630 — ảnh Open Graph / Twitter card
 *
 * Mark mới (thay «Vòng Năm» đã chết): tile bo góc nền seed #198038 + glyph
 * cành đào trắng rút gọn (2–3 hoa path cánh thật + thân cong, nhị gold) —
 * đọc được ở 16px nhờ biến thể micro (glyph to, nét dày, 0 gold).
 * App-icon: tile seed full-bleed, glyph trong vùng sống 80% quanh tâm
 * (scale 0.8) nên bản maskable dùng nguyên bản an toàn.
 *
 * OG 1200×630: nền trung tính #F6F7F6 (canvas của hệ) + tile mark lớn bên
 * trái (trích nguyên nhóm glyph từ app-icon, đặt trên tile seed riêng) +
 * cành đào nguyên cành bên phải (conmaytet-branch.svg nguyên bản thu nhỏ).
 * Không chữ hệ thống trong OG: resvg chạy loadSystemFonts:false nên <text>
 * sẽ mất dấu/lệch font — OG chỉ dùng hình học vector.
 *
 * Mọi hex literal trong file này đều thuộc bảng token hệ lens-04 (sink
 * bake của tokens:verify): #198038 · #F6F7F6 · #FFFFFF.
 *
 * Cách chạy (cần @resvg/resvg-js ở ~/workspace/mini-apps/resvg-tool):
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

const SEED = '#198038'; // tile mark/app-icon (token seed)
const CANVAS = '#F6F7F6'; // nền OG trung tính (token canvas)

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
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  const entries = [];
  let offset = 6 + sizes.length * 16;
  for (const size of sizes) {
    const png = pngBySize[size];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += png.length;
  }
  return Buffer.concat([header, ...entries, ...sizes.map((s) => pngBySize[s])]);
}

/** Nhóm glyph cành trắng bên trong một file mark/app-icon (thẻ <g id="glyph">). */
function glyphGroup(svg, file) {
  const match = svg.match(/<g id="glyph"[^>]*>([\s\S]*?)<\/g>\s*<\/svg>/);
  if (!match) throw new Error(`Không trích được nhóm glyph từ ${file}`);
  return match[1].trim();
}

/** Thân SVG của cành đào (bỏ thẻ <svg> ngoài) để nhúng vào OG. */
function branchInner(svg) {
  const match = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!match) throw new Error('Không trích được thân cành từ conmaytet-branch.svg');
  return match[1].trim();
}

const appIcon = readBrand('conmaytet-app-icon.svg');
const mark = readBrand('conmaytet-mark.svg');
const micro = readBrand('conmaytet-mark-micro.svg');
const branch = readBrand('conmaytet-branch.svg');
const microGlyph = glyphGroup(micro, 'conmaytet-mark-micro.svg');

// Icon PWA + maskable + iOS: raster NGUYÊN BẢN app-icon ở mọi kích thước.
render(appIcon, 192, 'public/icons/icon-192.png');
render(appIcon, 512, 'public/icons/icon-512.png');
render(appIcon, 512, 'public/icons/icon-maskable-512.png');
render(appIcon, 180, 'public/icons/apple-touch-icon.png');

// Favicon ICO 16/32/48 — 16px (≤20px) từ MICRO trên tile seed full-bleed;
// 32/48px từ app-icon nguyên bản.
const favicon16Svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">` +
  `<rect width="96" height="96" fill="${SEED}"/>` +
  `<g>${microGlyph}</g>` +
  `</svg>`;
const faviconPngs = {
  16: render(favicon16Svg, 16, null),
  32: render(appIcon, 32, null),
  48: render(appIcon, 48, null),
};
const ico = buildIco(faviconPngs);
writeFileSync(path.join(root, 'app/favicon.ico'), ico);
console.log(`✓ app/favicon.ico (${ico.length} bytes)`);

// OG 1200×630: nền canvas trung tính + mark bo góc 360px bên trái + cành
// đào nguyên cành bên phải (thu từ viewBox 340×190, đặt x 560..1140).
render(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">` +
    `<rect width="1200" height="630" fill="${CANVAS}"/>` +
    `<g transform="translate(90 135) scale(3.75)">${mark
      .match(/<svg[^>]*>([\s\S]*?)<\/svg>/)[1]
      .trim()}</g>` +
    `<g transform="translate(580 160) scale(1.65)">${branchInner(branch)}</g>` +
    `</svg>`,
  1200,
  'public/og.png',
);

if (!existsSync(path.join(root, 'public/og.png'))) {
  throw new Error('og.png was not written');
}
console.log('Done — brand artwork was only scaled/composited, never redrawn.');
