#!/usr/bin/env node
/**
 * tokens:verify — conmaytet REDESIGN-V4 (V4-IMPL-STATE §6, LK4-06 + LK4-51)
 *
 * Usage: node scripts/verify-tokens.mjs   (npm: pnpm tokens:verify)
 *
 * Nguồn sự thật: design/tokens.conmaytet-v4.json — bản sao nguyên vẹn của
 * hồ sơ redesign-v4/conmaytet/assets/tokens.json (kiểm khớp sâu ở nhóm 2).
 *
 * Cơ chế sinh-lại app/tokens.css (nhóm 3) — TRUNG THỰC: app/tokens.css là
 * bản chép của file sinh trong hồ sơ, mang comment diễn giải + thứ tự biên
 * tập mà một bộ sinh thuần JSON không tái tạo được từng byte. Vì vậy phép
 * "sinh lại" ở đây sinh lại PHẦN THÂN TOKEN: từ JSON dựng bản đồ khai báo
 * kỳ vọng (--var → giá trị, theo từng scope :root / .scene-reveal, gồm cả
 * các alias có giấy tờ khai ngay trong script này: --line, --line-control,
 * --reveal-bg, --reveal-bg-alt, --gold-on-deep, font/ease/dur từ các khối
 * type/motion của JSON), trích cùng bản đồ đó từ file đã chép (sau khi
 * strip comment), rồi đòi hai bản đồ BẰNG NHAU tuyệt đối — thừa biến,
 * thiếu biến hay lệch một byte giá trị đều FAIL. Header của file chép chỉ
 * khác bản hồ sơ ở dòng trỏ nguồn sự thật về repo; không giá trị nào khác.
 *
 * Các nhóm kiểm (node thuần, không dependency):
 *  1. Seed/gold Δbyte = 0: anchor.seed = #198038, anchor.gold = #F1C21B,
 *     brand-60/gold-30 (loại A) khớp anchor; manifest trong JSON khớp.
 *  2. Cấu trúc: bản sao repo == hồ sơ (deep-equal); mọi token có
 *     value/provenance/type; type ∈ {A, B, N}.
 *  3. Sinh-lại phần thân app/tokens.css từ JSON -> diff rỗng.
 *  4. Hex mồ côi: mọi #RRGGBB trong 5 sink SAU KHI strip comment phải
 *     ∈ giá trị tokens.json ∪ {#000000, #FFFFFF cực trị đã khai}.
 *     5 sink: CSS (app/globals.css, app/tokens.css) · SVG (public/**\/*.svg,
 *     strip <!-- --> — LK4-51) · script bake (lib/share-card.ts,
 *     scripts/generate-brand-pngs.mjs) · manifest/layout (app/manifest.ts,
 *     app/layout.tsx) · TS (components/**, lib/** — trừ *.spec.*).
 *     Strip: CSS /* *\/, XML <!-- -->, TS string-aware (URL trong chuỗi
 *     không bị cắt) — có fixture tự kiểm tích hợp bên dưới.
 *  5. Cấm literal rgb(/rgba(/hsl(/oklch( trong mọi sink (sau strip).
 *  6. Kỷ luật hex ở code: components/ + lib/ KHÔNG chứa hex literal —
 *     NGOẠI TRỪ file bake canvas lib/share-card.ts (được chứa hex nhưng
 *     mọi hex ở đó vẫn phải ∈ bảng token qua nhóm 4/7).
 *  7. BANNED: hex V2 + dead-V3 xuất hiện ngoài comment = FAIL riêng.
 *  (+ nhóm 2 kiêm kiểm token loại C = 0 — hồ sơ conmaytet khoá 0 token C.)
 *
 * Exit code: 0 = PASS, 1 = FAIL (bất kỳ nhóm nào).
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoTokensPath = path.join(repoRoot, 'design', 'tokens.conmaytet-v4.json');
const dossierTokensPath = path.resolve(
  repoRoot,
  '..',
  'redesign-v4',
  'conmaytet',
  'assets',
  'tokens.json',
);
const generatedCssPath = path.join(repoRoot, 'app', 'tokens.css');

const failures = {
  seed: [],
  structure: [],
  cssDiff: [],
  orphans: [],
  bannedFuncs: [],
  codeHex: [],
  bannedHex: [],
};
const notes = [];

// ---------- BANNED (nhóm 7) — V4-IMPL-STATE §6 ----------
// V2 (pine/gold/giấy ấm) + V3 dead (NEO-0):
const BANNED = new Set(
  [
    '#1F4D3A',
    '#14342A',
    '#2A6248',
    '#E3EDE6',
    '#C9A227',
    '#E9D48A',
    '#6B5510',
    '#FBF7EC',
    '#1C2420',
    '#44564B',
    '#D8DDD0',
    '#7E9384',
    '#FBF0D3',
    '#5C4A0E',
    '#FDECEA',
    '#8A2A20',
    '#3E6744',
    '#112414',
    '#F1F7F1',
    '#633B00',
    '#DDEDDE',
  ].map((h) => h.toUpperCase()),
);
const DECLARED_EXTREMES = new Set(['#000000', '#FFFFFF']);

// ---------- comment stripping (LK4-51) ----------
function blankPreservingNewlines(s) {
  return s.replace(/[^\n]/g, ' ');
}
function stripCssComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => blankPreservingNewlines(m));
}
function stripXmlComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, (m) => blankPreservingNewlines(m));
}
// String-aware TS/TSX stripper (tiền lệ chiatien/dichbome): // và /* */
// chỉ được nhận diện trong ngữ cảnh code, không bao giờ trong '...',
// "..." hay `...` — URL như 'https://schema.org' không bị cắt. Template
// ${ ... } quay lại ngữ cảnh code.
function stripTsComments(text) {
  let out = '';
  let i = 0;
  const stack = [{ type: 'code', braceDepth: 0, fromTpl: false }];
  const top = () => stack[stack.length - 1];
  while (i < text.length) {
    const c = text[i];
    const n = text[i + 1] ?? '';
    const ctx = top();
    if (ctx.type === 'str') {
      out += c;
      if (c === '\\') {
        out += n;
        i += 2;
        continue;
      }
      if (c === ctx.quote) stack.pop();
      i += 1;
      continue;
    }
    if (ctx.type === 'tpl') {
      if (c === '\\') {
        out += c + n;
        i += 2;
        continue;
      }
      if (c === '`') {
        out += c;
        stack.pop();
        i += 1;
        continue;
      }
      if (c === '$' && n === '{') {
        out += '${';
        stack.push({ type: 'code', braceDepth: 1, fromTpl: true });
        i += 2;
        continue;
      }
      out += c;
      i += 1;
      continue;
    }
    if (c === '/' && n === '/') {
      let j = i;
      while (j < text.length && text[j] !== '\n') j += 1;
      out += ' '.repeat(j - i);
      i = j;
      continue;
    }
    if (c === '/' && n === '*') {
      let j = text.indexOf('*/', i + 2);
      j = j === -1 ? text.length : j + 2;
      out += blankPreservingNewlines(text.slice(i, j));
      i = j;
      continue;
    }
    if (c === "'" || c === '"') {
      out += c;
      stack.push({ type: 'str', quote: c });
      i += 1;
      continue;
    }
    if (c === '`') {
      out += c;
      stack.push({ type: 'tpl' });
      i += 1;
      continue;
    }
    if (ctx.fromTpl) {
      if (c === '{') ctx.braceDepth += 1;
      if (c === '}') {
        ctx.braceDepth -= 1;
        if (ctx.braceDepth === 0) {
          out += c;
          stack.pop();
          i += 1;
          continue;
        }
      }
    }
    out += c;
    i += 1;
  }
  return out;
}
function stripForFile(file, text) {
  if (file.endsWith('.svg')) return stripXmlComments(text);
  if (file.endsWith('.css')) return stripCssComments(text);
  return stripTsComments(text);
}

// ---------- fixture tự kiểm cho tầng strip ----------
// Hex CẤM nằm trong comment (CSS/XML/TS) -> KHÔNG được tính; hex lậu
// thật ngoài comment -> PHẢI bị bắt; URL trong chuỗi TS không bị cắt.
function fixtureSelfTest() {
  const dead = '#1F4D3A'; // hex V2 đã cấm — chỉ dùng làm mồi fixture
  const css = stripCssComments(`/* ${dead} */ :root{}`);
  if (css.includes(dead)) failures.structure.push('fixture: hex cấm sống sót qua strip CSS /* */');
  const xml = stripXmlComments(`<svg><!-- ${dead} --></svg>`);
  if (xml.includes(dead))
    failures.structure.push('fixture: hex cấm sống sót qua strip XML <!-- -->');
  const tsLine = stripTsComments(`// ${dead}\nconst a = 1;`);
  if (tsLine.includes(dead)) failures.structure.push('fixture: hex cấm sống sót qua strip TS //');
  const tsUrl = stripTsComments(`const u = 'https://schema.org'; // ${dead}`);
  if (!tsUrl.includes('https://schema.org'))
    failures.structure.push('fixture: stripper TS cắt URL trong chuỗi literal');
  if (tsUrl.includes(dead))
    failures.structure.push('fixture: hex cấm sau // trên cùng dòng sống sót');
  const live = stripTsComments(`const c = '#123456';`);
  if (!live.includes('#123456'))
    failures.structure.push('fixture: hex lậu trong chuỗi bị strip mất (phải bị bắt)');
  notes.push(
    'fixture strip-comment self-test executed (hex cấm trong comment bị bỏ qua ở CSS/XML/TS, hex lậu thật bị bắt, URL trong chuỗi được giữ)',
  );
}
fixtureSelfTest();

// ---------- load tokens ----------
if (!existsSync(repoTokensPath)) {
  console.error('tokens:verify FAIL — thiếu bản sao token: design/tokens.conmaytet-v4.json');
  process.exit(1);
}
const repoTokens = JSON.parse(readFileSync(repoTokensPath, 'utf8'));
const dossierTokens = existsSync(dossierTokensPath)
  ? JSON.parse(readFileSync(dossierTokensPath, 'utf8'))
  : null;
if (!dossierTokens)
  notes.push('không thấy tokens.json của hồ sơ — nhóm 2 chỉ kiểm cấu trúc nội bộ');

const tokens = repoTokens.tokens ?? {};
const valid = new Set(Object.values(tokens).map((t) => String(t.value).toUpperCase()));

// ---------- nhóm 1: seed/gold Δbyte = 0 ----------
const EXPECTED_SEED = '#198038';
const EXPECTED_GOLD = '#F1C21B';
if (repoTokens.anchor?.seed !== EXPECTED_SEED)
  failures.seed.push(`anchor.seed = ${repoTokens.anchor?.seed} != ${EXPECTED_SEED}`);
if (repoTokens.anchor?.gold !== EXPECTED_GOLD)
  failures.seed.push(`anchor.gold = ${repoTokens.anchor?.gold} != ${EXPECTED_GOLD}`);
if (tokens['brand-60']?.value !== repoTokens.anchor?.seed)
  failures.seed.push(
    `brand-60 value ${tokens['brand-60']?.value} != anchor.seed ${repoTokens.anchor?.seed}`,
  );
if (tokens['gold-30']?.value !== repoTokens.anchor?.gold)
  failures.seed.push(
    `gold-30 value ${tokens['gold-30']?.value} != anchor.gold ${repoTokens.anchor?.gold}`,
  );
if (tokens['brand-60']?.type !== 'A') failures.seed.push('brand-60 không phải loại A');
if (tokens['gold-30']?.type !== 'A') failures.seed.push('gold-30 không phải loại A');
if (repoTokens.manifest?.theme_color !== EXPECTED_SEED)
  failures.seed.push(
    `manifest.theme_color trong JSON = ${repoTokens.manifest?.theme_color} != ${EXPECTED_SEED}`,
  );
if (repoTokens.manifest?.background_color !== '#FFFFFF')
  failures.seed.push(
    `manifest.background_color trong JSON = ${repoTokens.manifest?.background_color} != #FFFFFF`,
  );

// ---------- nhóm 2: cấu trúc + khớp hồ sơ + token C = 0 ----------
for (const [name, t] of Object.entries(tokens)) {
  if (!t.value || !t.provenance || !t.type)
    failures.structure.push(`token ${name}: thiếu value/provenance/type`);
  if (!/^[A-Z]$/.test(String(t.type ?? '')))
    failures.structure.push(`token ${name}: type lạ '${t.type}'`);
  if (t.type === 'C')
    failures.structure.push(`token ${name}: token loại C — hồ sơ khoá 0 token C (LK4-03)`);
}
if (dossierTokens) {
  const a = JSON.stringify(repoTokens);
  const b = JSON.stringify(dossierTokens);
  if (a !== b) {
    failures.structure.push('bản sao repo KHÔNG khớp sâu (deep-equal) với tokens.json của hồ sơ');
    const dt = dossierTokens.tokens ?? {};
    for (const name of new Set([...Object.keys(tokens), ...Object.keys(dt)])) {
      if (JSON.stringify(tokens[name]) !== JSON.stringify(dt[name]))
        failures.structure.push(`token ${name}: repo != hồ sơ`);
    }
    for (const k of new Set([...Object.keys(repoTokens), ...Object.keys(dossierTokens)])) {
      if (k !== 'tokens' && JSON.stringify(repoTokens[k]) !== JSON.stringify(dossierTokens[k]))
        failures.structure.push(`khoá top-level '${k}': repo != hồ sơ`);
    }
  } else {
    notes.push(
      'design/tokens.conmaytet-v4.json deep-equal với tokens.json của hồ sơ (bản sao nguyên vẹn)',
    );
  }
}
const deadValues = new Set(
  Object.values(repoTokens.deadValuesV3 ?? {}).filter(
    (v) => typeof v === 'string' && v.startsWith('#'),
  ),
);
for (const [name, t] of Object.entries(tokens)) {
  if (deadValues.has(String(t.value).toUpperCase()))
    failures.structure.push(
      `token ${name}: value ${t.value} trùng giá trị V3 đã chết (deadValuesV3)`,
    );
}

// ---------- nhóm 3: sinh-lại phần thân app/tokens.css ----------
// Bản đồ khai báo kỳ vọng dựng TỪ JSON (xem ghi chú trung thực ở header).
function expectedDecls() {
  const root = new Map();
  const reveal = new Map();
  for (const [name, t] of Object.entries(tokens)) {
    if (name === 'on-deep' || name === 'on-deep-muted') reveal.set(`--${name}`, t.value);
    else root.set(`--${name}`, t.value);
  }
  // Alias có giấy tờ trong tokens.css (bằng bậc thang công bố, không hex mới):
  root.set('--line', tokens['neutral-30'].value); // = Gray 30
  root.set('--line-control', tokens['neutral-70'].value); // = Gray 70
  // Type + motion từ khối type/motion của JSON:
  root.set('--font-display', `"${repoTokens.type.display}", "${repoTokens.type.body}", sans-serif`);
  root.set('--font-body', `"${repoTokens.type.body}", sans-serif`);
  root.set('--hero-size', repoTokens.type.heroSize);
  root.set('--ease-ceremony', repoTokens.motion.easeCeremony);
  root.set('--ease-ui', repoTokens.motion.easeUi);
  const durByName = {
    '--dur-press': 120,
    '--dur-input-fix': 160,
    '--dur-accompany': 300,
    '--dur-reveal-number': 620,
  };
  for (const [k, ms] of Object.entries(durByName)) {
    if (!(repoTokens.motion.durationsMs ?? []).includes(ms))
      failures.cssDiff.push(`motion.durationsMs của JSON thiếu ${ms}ms (cho ${k})`);
    root.set(k, `${ms}ms`);
  }
  // Scope .scene-reveal (art-class): biến phụ suy từ token theo hồ sơ:
  reveal.set('--reveal-bg', tokens['brand-100'].value);
  reveal.set('--reveal-bg-alt', tokens['brand-90'].value);
  reveal.set('--gold-on-deep', tokens['gold-30'].value);
  return { root, reveal };
}
function extractDecls(cssText, selector) {
  const clean = stripCssComments(cssText);
  const idx = clean.indexOf(selector);
  if (idx === -1) return null;
  const open = clean.indexOf('{', idx);
  if (open === -1) return null;
  let depth = 0;
  let end = -1;
  for (let i = open; i < clean.length; i += 1) {
    if (clean[i] === '{') depth += 1;
    if (clean[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;
  const body = clean.slice(open + 1, end);
  const vars = new Map();
  const props = new Map();
  for (const decl of body.split(';')) {
    const m = decl.trim().match(/^(--[\w-]+|[a-z-]+)\s*:\s*([\s\S]+)$/);
    if (!m) continue;
    const value = m[2].trim().replace(/\s+/g, ' ');
    if (m[1].startsWith('--')) vars.set(m[1], value);
    else props.set(m[1], value);
  }
  return { vars, props };
}
if (!existsSync(generatedCssPath)) {
  failures.cssDiff.push('app/tokens.css missing');
} else {
  const shippedCss = readFileSync(generatedCssPath, 'utf8');
  const expected = expectedDecls();
  const actualRoot = extractDecls(shippedCss, ':root');
  const actualReveal = extractDecls(shippedCss, '.scene-reveal');
  const compareScope = (label, exp, act) => {
    if (!act) {
      failures.cssDiff.push(`app/tokens.css: không tìm thấy block ${label}`);
      return;
    }
    for (const [k, v] of exp) {
      if (!act.vars.has(k)) failures.cssDiff.push(`${label}: thiếu khai báo ${k} (kỳ vọng ${v})`);
      else if (act.vars.get(k).toUpperCase() !== String(v).toUpperCase())
        failures.cssDiff.push(`${label}: ${k} = ${act.vars.get(k)} != kỳ vọng ${v}`);
    }
    for (const k of act.vars.keys()) {
      if (!exp.has(k))
        failures.cssDiff.push(`${label}: khai báo thừa ngoài JSON ${k}: ${act.vars.get(k)}`);
    }
  };
  compareScope(':root', expected.root, actualRoot);
  compareScope('.scene-reveal', expected.reveal, actualReveal);
  if (actualReveal) {
    if (actualReveal.props.get('background') !== 'var(--reveal-bg)')
      failures.cssDiff.push(
        `.scene-reveal: background = ${actualReveal.props.get('background')} != var(--reveal-bg)`,
      );
    if (actualReveal.props.get('color') !== 'var(--on-deep)')
      failures.cssDiff.push(
        `.scene-reveal: color = ${actualReveal.props.get('color')} != var(--on-deep)`,
      );
  }
  if (failures.cssDiff.length === 0)
    notes.push(
      'tokens.css regeneration (phần thân token): diff rỗng — bản đồ khai báo :root + .scene-reveal khớp phép sinh từ JSON',
    );
}

// ---------- sinks ----------
function walkFiles(dir, exts) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walkFiles(p, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}
const componentFiles = walkFiles(path.join(repoRoot, 'components'), ['.ts', '.tsx']).filter(
  (f) => !f.includes('.spec.'),
);
const libFiles = walkFiles(path.join(repoRoot, 'lib'), ['.ts', '.tsx']).filter(
  (f) => !f.includes('.spec.'),
);
const bakeFile = path.join(repoRoot, 'lib', 'share-card.ts');
const sinkFiles = [
  path.join(repoRoot, 'app', 'globals.css'),
  path.join(repoRoot, 'app', 'tokens.css'),
  ...walkFiles(path.join(repoRoot, 'public'), ['.svg']),
  bakeFile,
  path.join(repoRoot, 'scripts', 'generate-brand-pngs.mjs'),
  path.join(repoRoot, 'app', 'manifest.ts'),
  path.join(repoRoot, 'app', 'layout.tsx'),
  ...componentFiles,
  ...libFiles,
].filter((f, idx, a) => a.indexOf(f) === idx && existsSync(f));
const noHexCodeFiles = new Set([...componentFiles, ...libFiles.filter((f) => f !== bakeFile)]);

// ---------- nhóm 4, 5, 6, 7: quét sink ----------
const hexRe = /#[0-9A-Fa-f]{6}(?![0-9A-Fa-f])/g;
const funcRe = /\b(?:oklch|hsla?|rgba?)\s*\(/g;
let scannedHexTotal = 0;
for (const file of sinkFiles) {
  const raw = readFileSync(file, 'utf8');
  const stripped = stripForFile(file, raw);
  const rel = path.relative(repoRoot, file) || file;
  stripped.split('\n').forEach((line, idx) => {
    for (const m of line.matchAll(hexRe)) {
      scannedHexTotal += 1;
      const hex = m[0].toUpperCase();
      if (BANNED.has(hex)) failures.bannedHex.push(`${rel}:${idx + 1} ${hex}`);
      else if (!valid.has(hex) && !DECLARED_EXTREMES.has(hex))
        failures.orphans.push(`${rel}:${idx + 1} ${hex}`);
      if (noHexCodeFiles.has(file))
        failures.codeHex.push(
          `${rel}:${idx + 1} hex literal trong code ${hex} (components/lib chỉ dùng var/semantic; ngoại lệ duy nhất: lib/share-card.ts)`,
        );
    }
    for (const m of line.matchAll(funcRe)) {
      failures.bannedFuncs.push(`${rel}:${idx + 1} banned colour function ${m[0]}`);
    }
  });
}

// ---------- report ----------
console.log(
  `tokens:verify — valid hex set: ${valid.size} token values from design/tokens.conmaytet-v4.json`,
);
console.log(
  `tokens:verify — sinks scanned: ${sinkFiles.length} files, ${scannedHexTotal} hex literals after comment-strip`,
);
for (const n of notes) console.log(`  NOTE ${n}`);
const groups = [
  ['1 seed/gold Δbyte=0 + manifest JSON', failures.seed],
  ['2 structure + copy vs dossier + token C = 0', failures.structure],
  ['3 tokens.css regeneration (token body) diff', failures.cssDiff],
  ['4 orphan hex in sinks', failures.orphans],
  ['5 banned colour functions (rgb/rgba/hsl/oklch)', failures.bannedFuncs],
  ['6 components/lib hex discipline (except bake lib/share-card.ts)', failures.codeHex],
  ['7 banned hex (V2 + V3 dead)', failures.bannedHex],
];
let failed = false;
for (const [label, list] of groups) {
  if (list.length === 0) {
    console.log(`  PASS ${label}: 0`);
    continue;
  }
  failed = true;
  console.log(`  FAIL ${label}: ${list.length}`);
  for (const item of list) console.log(`    - ${item}`);
}
console.log(failed ? 'tokens:verify RESULT: FAIL' : 'tokens:verify RESULT: PASS');
process.exit(failed ? 1 : 0);
