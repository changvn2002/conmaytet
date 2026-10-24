#!/usr/bin/env node
/**
 * tokens:verify — conmaytet hệ lens-04 (chương trình conmaytet-redesign)
 *
 * Usage: node scripts/verify-tokens.mjs   (npm: pnpm tokens:verify)
 *
 * Nguồn sự thật: design/tokens.conmaytet-v4.json (nay chứa hệ lens-04
 * «SẢN PHẨM ẤM ÁP / FINTECH-GRADE» theo final/IMPLEMENTATION-SPEC).
 *
 * Các nhóm kiểm (node thuần, không dependency):
 *  1. Seed/gold Δbyte = 0: anchor.seed = #198038, anchor.gold = #F1C21B
 *     (loại A), manifest trong JSON: theme #198038, background #F6F7F6.
 *  2. Cấu trúc: mọi token có value/provenance/type; type ∈ {A, S}
 *     (A = seed/gold literal giữ nguyên văn; S = giá trị spec/mock).
 *  3. Sinh-lại phần thân app/tokens.css từ JSON -> diff rỗng (bản đồ
 *     --var của :root khớp tuyệt đối, gồm font/motion suy từ JSON).
 *  4. Hex mồ côi: mọi #RRGGBB trong các sink SAU KHI strip comment
 *     phải ∈ giá trị tokens.json ∪ {#000000, #FFFFFF cực trị đã khai}.
 *  5. Cấm literal rgb(/rgba(/hsl(/oklch( trong mọi sink (sau strip).
 *  6. Kỷ luật hex ở code: components/ + lib/ KHÔNG chứa hex literal —
 *     NGOẠI TRỪ file bake canvas lib/share-card.ts (mọi hex ở đó vẫn
 *     phải ∈ bảng token qua nhóm 4/7).
 *  7. BANNED: hex V2 + V3-dead + bề mặt reveal V4 (#071908, #022D0D)
 *     xuất hiện ngoài comment = FAIL riêng.
 *  8. Luật Neutral-First của hệ mới: KHÔNG còn scope .scene-reveal ở
 *     bất kỳ sink nào; KHÔNG còn tham chiếu asset vòng năm đã chết
 *     (conmaytet-hero-ring).
 *
 * Exit code: 0 = PASS, 1 = FAIL (bất kỳ nhóm nào).
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoTokensPath = path.join(repoRoot, 'design', 'tokens.conmaytet-v4.json');
const generatedCssPath = path.join(repoRoot, 'app', 'tokens.css');

const failures = {
  seed: [],
  structure: [],
  cssDiff: [],
  orphans: [],
  bannedFuncs: [],
  codeHex: [],
  bannedHex: [],
  neutral: [],
};
const notes = [];

// ---------- BANNED (nhóm 7) ----------
// V2 (pine/gold/giấy ấm) + V3 dead (NEO-0) + bề mặt reveal V4 đã chết:
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
    '#071908',
    '#022D0D',
  ].map((h) => h.toUpperCase()),
);
const DECLARED_EXTREMES = new Set(['#000000', '#FFFFFF']);

// ---------- comment stripping ----------
function blankPreservingNewlines(s) {
  return s.replace(/[^\n]/g, ' ');
}
function stripCssComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => blankPreservingNewlines(m));
}
function stripXmlComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, (m) => blankPreservingNewlines(m));
}
// String-aware TS/TSX stripper: // và /* */ chỉ nhận diện trong ngữ
// cảnh code, không bao giờ trong '...', "..." hay `...`.
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
function fixtureSelfTest() {
  const dead = '#1F4D3A';
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
  notes.push('fixture strip-comment self-test executed');
}
fixtureSelfTest();

// ---------- load tokens ----------
if (!existsSync(repoTokensPath)) {
  console.error('tokens:verify FAIL — thiếu bản sao token: design/tokens.conmaytet-v4.json');
  process.exit(1);
}
const repoTokens = JSON.parse(readFileSync(repoTokensPath, 'utf8'));
const tokens = repoTokens.tokens ?? {};
const valid = new Set(Object.values(tokens).map((t) => String(t.value).toUpperCase()));

// ---------- nhóm 1: seed/gold Δbyte = 0 ----------
const EXPECTED_SEED = '#198038';
const EXPECTED_GOLD = '#F1C21B';
const EXPECTED_BG = '#F6F7F6';
if (repoTokens.anchor?.seed !== EXPECTED_SEED)
  failures.seed.push(`anchor.seed = ${repoTokens.anchor?.seed} != ${EXPECTED_SEED}`);
if (repoTokens.anchor?.gold !== EXPECTED_GOLD)
  failures.seed.push(`anchor.gold = ${repoTokens.anchor?.gold} != ${EXPECTED_GOLD}`);
if (tokens['seed']?.value !== EXPECTED_SEED)
  failures.seed.push(`token seed = ${tokens['seed']?.value} != ${EXPECTED_SEED}`);
if (tokens['gold']?.value !== EXPECTED_GOLD)
  failures.seed.push(`token gold = ${tokens['gold']?.value} != ${EXPECTED_GOLD}`);
if (tokens['seed']?.type !== 'A') failures.seed.push('token seed không phải loại A');
if (tokens['gold']?.type !== 'A') failures.seed.push('token gold không phải loại A');
if (tokens['canvas']?.value !== EXPECTED_BG)
  failures.seed.push(`token canvas = ${tokens['canvas']?.value} != ${EXPECTED_BG}`);
if (repoTokens.manifest?.theme_color !== EXPECTED_SEED)
  failures.seed.push(
    `manifest.theme_color = ${repoTokens.manifest?.theme_color} != ${EXPECTED_SEED}`,
  );
if (repoTokens.manifest?.background_color !== EXPECTED_BG)
  failures.seed.push(
    `manifest.background_color = ${repoTokens.manifest?.background_color} != ${EXPECTED_BG}`,
  );

// ---------- nhóm 2: cấu trúc ----------
for (const [name, t] of Object.entries(tokens)) {
  if (!t.value || !t.provenance || !t.type)
    failures.structure.push(`token ${name}: thiếu value/provenance/type`);
  if (!['A', 'S'].includes(String(t.type ?? '')))
    failures.structure.push(`token ${name}: type lạ '${t.type}' (hệ mới chỉ có A/S)`);
  if (!/^#[0-9A-F]{6}$/i.test(String(t.value ?? '')))
    failures.structure.push(`token ${name}: value không phải hex 6 số '${t.value}'`);
}

// ---------- nhóm 3: sinh-lại phần thân app/tokens.css ----------
function expectedDecls() {
  const root = new Map();
  for (const [name, t] of Object.entries(tokens)) root.set(`--${name}`, t.value);
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
  return root;
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
  for (const decl of body.split(';')) {
    const m = decl.trim().match(/^(--[\w-]+)\s*:\s*([\s\S]+)$/);
    if (!m) continue;
    vars.set(m[1], m[2].trim().replace(/\s+/g, ' '));
  }
  return vars;
}
if (!existsSync(generatedCssPath)) {
  failures.cssDiff.push('app/tokens.css missing');
} else {
  const shippedCss = readFileSync(generatedCssPath, 'utf8');
  const expected = expectedDecls();
  const actualRoot = extractDecls(shippedCss, ':root');
  if (!actualRoot) {
    failures.cssDiff.push('app/tokens.css: không tìm thấy block :root');
  } else {
    for (const [k, v] of expected) {
      if (!actualRoot.has(k)) failures.cssDiff.push(`:root: thiếu khai báo ${k} (kỳ vọng ${v})`);
      else if (actualRoot.get(k).toUpperCase() !== String(v).toUpperCase())
        failures.cssDiff.push(`:root: ${k} = ${actualRoot.get(k)} != kỳ vọng ${v}`);
    }
    for (const k of actualRoot.keys()) {
      if (!expected.has(k))
        failures.cssDiff.push(`:root: khai báo thừa ngoài JSON ${k}: ${actualRoot.get(k)}`);
    }
  }
  if (failures.cssDiff.length === 0)
    notes.push('tokens.css regeneration (phần thân token): diff rỗng — bản đồ :root khớp JSON');
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

// ---------- nhóm 4, 5, 6, 7, 8: quét sink ----------
const hexRe = /#[0-9A-Fa-f]{6}(?![0-9A-Fa-f])/g;
const funcRe = /\b(?:oklch|hsla?|rgba?)\s*\(/g;
let scannedHexTotal = 0;
for (const file of sinkFiles) {
  const raw = readFileSync(file, 'utf8');
  const stripped = stripForFile(file, raw);
  const rel = path.relative(repoRoot, file) || file;
  if (stripped.includes('scene-reveal'))
    failures.neutral.push(`${rel}: còn scope/class .scene-reveal của hệ V4 đã chết`);
  if (stripped.includes('conmaytet-hero-ring'))
    failures.neutral.push(`${rel}: còn tham chiếu asset vòng năm đã chết (conmaytet-hero-ring)`);
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
  `tokens:verify — valid hex set: ${valid.size} token values from design/tokens.conmaytet-v4.json (hệ lens-04)`,
);
console.log(
  `tokens:verify — sinks scanned: ${sinkFiles.length} files, ${scannedHexTotal} hex literals after comment-strip`,
);
for (const n of notes) console.log(`  NOTE ${n}`);
const groups = [
  ['1 seed/gold Δbyte=0 + manifest JSON', failures.seed],
  ['2 structure (value/provenance/type, A/S)', failures.structure],
  ['3 tokens.css regeneration (token body) diff', failures.cssDiff],
  ['4 orphan hex in sinks', failures.orphans],
  ['5 banned colour functions (rgb/rgba/hsl/oklch)', failures.bannedFuncs],
  ['6 components/lib hex discipline (except bake lib/share-card.ts)', failures.codeHex],
  ['7 banned hex (V2 + V3 dead + V4 reveal surfaces)', failures.bannedHex],
  ['8 neutral-first: no .scene-reveal / no dead ring asset refs', failures.neutral],
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
