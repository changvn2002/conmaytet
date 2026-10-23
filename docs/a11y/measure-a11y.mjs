/**
 * A11Y-12 — script đo gói bằng chứng khả năng tiếp cận của ConMayTet.
 *
 * Cách chạy (từ repo root, cần server production local ở cổng 3417):
 *   pnpm build && pnpm exec next start --port 3417   (terminal riêng)
 *   node docs/a11y/measure-a11y.mjs
 *
 * Phương pháp: Chrome hệ thống /opt/meta-chromium/chrome (Chromium 152)
 * lái qua CDP bằng Playwright. Chrome 152 chặn điều hướng trực tiếp tới
 * 127.0.0.1 (ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS) nên script dùng
 * cùng kỹ thuật với e2e/fixtures.ts: điều hướng tới origin public của
 * app và fulfill mọi request bằng bytes của build local ở
 * 127.0.0.1:3417; service worker bị khoá. Nội dung đo là build local.
 *
 * Đầu ra: docs/a11y/contrast.json, docs/a11y/touch-targets.json và
 * hygiene-evidence-w3/a11y-raw.json (toàn bộ số thô, gồm ma trận focus
 * và cây heading — hai bảng này được chép vào EVIDENCE.md /
 * focus-matrix.md kèm theo gói).
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const ORIGIN = 'https://conmaytet.vercel.app';
const LOCAL = 'http://127.0.0.1:3417';
const SEED = {
  myBirthDate: '1995-06-15',
  mySex: 'male',
  fatherBirthYear: 1965,
  motherBirthYear: 1968,
  visitsPerYear: 2,
  livesWithParents: false,
};

/* ── WCAG contrast ─────────────────────────────────────────────────── */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}
function relLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrastRatio(fg, bg) {
  const l1 = relLuminance(fg);
  const l2 = relLuminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

/** Token thực tế trong app/globals.css (:root) tại thời điểm đo. */
const TOKENS = {
  ink: '#1C2420',
  muted: '#44564B',
  line: '#D8DDD0',
  paper: '#FBF7EC',
  card: '#FFFFFF',
  brand: '#1F4D3A',
  'brand-deep': '#14342A',
  'brand-hover': '#2A6248',
  'brand-soft': '#E3EDE6',
  gold: '#C9A227',
  'gold-soft': '#E9D48A',
  'gold-text': '#6B5510',
  'input-line': '#7E9384',
  'warn-bg': '#FBF0D3',
  'warn-text': '#5C4A0E',
  'error-bg': '#FDECEA',
  'error-text': '#8A2A20',
  white: '#FFFFFF',
};

/** [tên cặp, token chữ, token nền, vai trò] — vai trò: text | large | non-text */
const PAIRS = [
  ['thân bài: ink trên paper', 'ink', 'paper', 'text'],
  ['thân bài: ink trên card', 'ink', 'card', 'text'],
  ['chữ phụ: muted trên paper', 'muted', 'paper', 'text'],
  ['chữ phụ: muted trên card', 'muted', 'card', 'text'],
  ['chữ phụ: muted trên brand-soft (nhãn ô thống kê)', 'muted', 'brand-soft', 'text'],
  ['số thống kê: ink trên brand-soft', 'ink', 'brand-soft', 'text'],
  ['tiêu đề: brand-deep trên paper', 'brand-deep', 'paper', 'large'],
  ['link/nút chữ: brand trên paper', 'brand', 'paper', 'text'],
  ['link/nút chữ: brand trên card', 'brand', 'card', 'text'],
  ['nút Hoàn tác/nav: brand trên brand-soft (hover)', 'brand', 'brand-soft', 'text'],
  ['số lần về thăm: brand trên paper', 'brand', 'paper', 'large'],
  ['chữ vàng hợp lệ: gold-text trên paper (mốc tuổi)', 'gold-text', 'paper', 'text'],
  ['nút chính: white trên brand', 'white', 'brand', 'text'],
  ['nút chính hover: white trên brand-hover', 'white', 'brand-hover', 'text'],
  ['nút Xoá: white trên error-text', 'white', 'error-text', 'text'],
  ['cảnh báo: warn-text trên warn-bg', 'warn-text', 'warn-bg', 'text'],
  ['lỗi: error-text trên error-bg', 'error-text', 'error-bg', 'text'],
  ['placeholder ô nhập: muted trên card', 'muted', 'card', 'text'],
  ['viền ô nhập (nghỉ): input-line trên card', 'input-line', 'card', 'non-text'],
  ['viền ô nhập trên paper: input-line trên paper', 'input-line', 'paper', 'non-text'],
  ['chỉ báo focus: brand-deep trên paper', 'brand-deep', 'paper', 'non-text'],
  ['chỉ báo focus: brand-deep trên card', 'brand-deep', 'card', 'non-text'],
  ['viền trang trí: line trên paper', 'line', 'paper', 'non-text'],
  ['đồ hoạ gold: gold trên paper (đường nhấn, không phải chữ)', 'gold', 'paper', 'non-text'],
  ['chấm tuần này: gold-text trên paper (đồ hoạ)', 'gold-text', 'paper', 'non-text'],
  ['vùng chọn chữ: brand-deep trên brand-soft (selection)', 'brand-deep', 'brand-soft', 'text'],
];

function grade(ratio, role) {
  if (role === 'non-text') return ratio >= 3 ? 'PASS ≥3:1 (non-text)' : 'FAIL <3:1 (non-text)';
  if (role === 'large')
    return ratio >= 4.5 ? 'AAA (large)' : ratio >= 3 ? 'AA (large)' : 'FAIL (large)';
  return ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'FAIL';
}

/* ── Điều hướng qua route-fulfill ──────────────────────────────────── */
async function newPage(browser, viewport, seed) {
  const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
  if (seed) {
    await context.addInitScript((value) => {
      localStorage.setItem('conmaytet:input:v1', value);
    }, JSON.stringify(SEED));
  }
  const page = await context.newPage();
  await page.route(`${ORIGIN}/**`, async (route) => {
    const u = new URL(route.request().url());
    try {
      const res = await fetch(`${LOCAL}${u.pathname}${u.search}`, {
        method: route.request().method(),
      });
      const body = Buffer.from(await res.arrayBuffer());
      const headers = {};
      res.headers.forEach((v, k) => {
        const key = k.toLowerCase();
        if (key !== 'content-length' && key !== 'content-encoding' && key !== 'transfer-encoding')
          headers[k] = v;
      });
      await route.fulfill({ status: res.status, headers, body });
    } catch {
      await route.abort();
    }
  });
  await page.goto(`${ORIGIN}/`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  return { context, page };
}

/* ── Census trong trang ────────────────────────────────────────────── */
const INTERACTIVE_SELECTOR =
  'a[href], button, input, select, textarea, summary, [role="button"], [role="radio"], [role="switch"], [tabindex]';

function collectTargets() {
  const els = [...document.querySelectorAll(window.__sel)];
  const out = [];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.display === 'none')
      continue;
    const label =
      el.getAttribute('aria-label') ||
      (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60) ||
      el.id ||
      el.tagName;
    out.push({
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      role: el.getAttribute('role'),
      type: el.getAttribute('type'),
      label,
      width: Math.round(r.width * 10) / 10,
      height: Math.round(r.height * 10) / 10,
    });
  }
  return out;
}

function collectHeadings() {
  return [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => ({
    level: Number(h.tagName.slice(1)),
    text: (h.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
  }));
}

function describeActive() {
  const el = document.activeElement;
  if (!el) return { tag: 'null' };
  return {
    tag: el.tagName.toLowerCase(),
    id: el.id || null,
    role: el.getAttribute('role'),
    type: el.getAttribute('type'),
    text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
  };
}

/* ── Chạy đo ───────────────────────────────────────────────────────── */
const browser = await chromium.launch({ executablePath: '/opt/meta-chromium/chrome' });
const raw = {
  measuredAt: new Date().toISOString(),
  userAgent: null,
  tokenPairs: [],
  computedStyles: [],
  touchTargets: {},
  headings: {},
  focus: { tabOrder: [], exits: [] },
};
raw.userAgent = await browser
  .newContext()
  .then(async (c) => {
    const p = await c.newPage();
    const ua = await p.evaluate(() => navigator.userAgent);
    await c.close();
    return ua;
  })
  .catch(() => null);

for (const [name, fg, bg, role] of PAIRS) {
  const ratio = contrastRatio(TOKENS[fg], TOKENS[bg]);
  raw.tokenPairs.push({
    pair: name,
    fg: `${fg} ${TOKENS[fg]}`,
    bg: `${bg} ${TOKENS[bg]}`,
    ratio,
    role,
    grade: grade(ratio, role),
  });
}

const VIEWPORTS = [
  ['mobile-390x844', { width: 390, height: 844 }],
  ['desktop-1440x900', { width: 1440, height: 900 }],
];

for (const [vpName, viewport] of VIEWPORTS) {
  raw.touchTargets[vpName] = {};
  // Trạng thái trống
  {
    const { context, page } = await newPage(browser, viewport, false);
    await page.evaluate((sel) => {
      window.__sel = sel;
    }, INTERACTIVE_SELECTOR);
    raw.touchTargets[vpName].empty = await page.evaluate(collectTargets);
    if (vpName === 'desktop-1440x900') raw.headings.empty = await page.evaluate(collectHeadings);
    await context.close();
  }
  // Trạng thái đã điền
  let deletedBarTargets = null;
  {
    const { context, page } = await newPage(browser, viewport, true);
    await page
      .locator('section[aria-label="Kết quả với bố"]')
      .waitFor({ state: 'attached', timeout: 20000 });
    await page.evaluate((sel) => {
      window.__sel = sel;
    }, INTERACTIVE_SELECTOR);
    raw.touchTargets[vpName].filled = await page.evaluate(collectTargets);
    if (vpName === 'desktop-1440x900') raw.headings.filled = await page.evaluate(collectHeadings);
    // Trạng thái thanh «Đã xoá» hiện
    const reset = page.getByRole('button', { name: /Làm lại từ đầu/ });
    await reset.scrollIntoViewIfNeeded();
    await reset.click();
    await page.getByRole('button', { name: 'Xoá', exact: true }).click();
    await page
      .getByRole('status')
      .filter({ hasText: 'Đã xoá.' })
      .waitFor({ state: 'visible', timeout: 10000 });
    deletedBarTargets = await page.evaluate(collectTargets);
    await context.close();
  }
  raw.touchTargets[vpName].deletedBar = deletedBarTargets;
}

/* Computed styles trên trang đã điền (desktop) */
{
  const { context, page } = await newPage(browser, { width: 1440, height: 900 }, true);
  await page
    .locator('section[aria-label="Kết quả với bố"]')
    .waitFor({ state: 'attached', timeout: 20000 });
  raw.computedStyles = await page.evaluate(() => {
    function rgbToHex(rgb) {
      const m = rgb.match(/[\d.]+/g);
      if (!m) return rgb;
      const [r, g, b] = m.slice(0, 3).map(Number);
      const a = m.length > 3 ? Number(m[3]) : 1;
      if (a === 0) return 'transparent';
      return (
        '#' +
        [r, g, b]
          .map((n) => Math.round(n).toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase()
      );
    }
    function effectiveBg(el) {
      let node = el;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        const hex = rgbToHex(bg);
        if (hex !== 'transparent') return hex;
        node = node.parentElement;
      }
      return '#FFFFFF';
    }
    const samples = [];
    const pick = (name, el) => {
      if (!el) {
        samples.push({ name, missing: true });
        return;
      }
      const cs = getComputedStyle(el);
      samples.push({
        name,
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
        color: rgbToHex(cs.color),
        background: effectiveBg(el),
        fontSizePx: parseFloat(cs.fontSize),
        fontWeight: cs.fontWeight,
      });
    };
    pick('H1 tiêu đề', document.querySelector('h1'));
    pick('ô ngày sinh #birth (chữ nhập)', document.querySelector('#birth'));
    pick(
      'nút chính «Xem còn mấy cái Tết»',
      [...document.querySelectorAll('button')].find((b) =>
        (b.textContent || '').includes('Xem còn mấy cái Tết'),
      ),
    );
    pick(
      'sân khấu bố: nhãn «Với BỐ»',
      document.querySelector('section[aria-label="Kết quả với bố"] p'),
    );
    pick(
      'sân khấu bố: con số 16',
      [...document.querySelectorAll('section[aria-label="Kết quả với bố"] p')].find(
        (p) => (p.textContent || '').trim() === '16',
      ),
    );
    pick(
      'sân khấu bố: câu hy vọng',
      [...document.querySelectorAll('section[aria-label="Kết quả với bố"] p')].find((p) =>
        (p.textContent || '').includes('trân trọng từng lần'),
      ),
    );
    pick(
      'lưới tuần: nhãn mốc tuổi',
      [...document.querySelectorAll('span')].find((s) =>
        (s.textContent || '').trim().startsWith('30 tuổi'),
      ),
    );
    pick(
      'nút Copy kết quả',
      [...document.querySelectorAll('button')].find((b) =>
        (b.textContent || '').includes('Copy kết quả'),
      ),
    );
    pick(
      'summary disclosure «Hỏi đáp»',
      [...document.querySelectorAll('summary')].find((s) =>
        (s.textContent || '').includes('Hỏi đáp'),
      ),
    );
    // placeholder của ô năm sinh bố (ô trống trong trạng thái đã điền vẫn còn placeholder khi xoá tay — đo bằng ô ở trạng thái trống riêng bên dưới)
    return samples;
  });
  // Placeholder: đo trên trang trống
  const empty = await newPage(browser, { width: 1440, height: 900 }, false);
  const ph = await empty.page.evaluate(() => {
    const el = document.querySelector('#father-year');
    const cs = getComputedStyle(el, '::placeholder');
    function rgbToHex(rgb) {
      const m = rgb.match(/[\d.]+/g);
      if (!m) return rgb;
      return (
        '#' +
        m
          .slice(0, 3)
          .map((n) => Math.round(Number(n)).toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase()
      );
    }
    let node = el;
    let bg = '#FFFFFF';
    while (node) {
      const c = getComputedStyle(node).backgroundColor;
      if (!/rgba\(0, 0, 0, 0\)|transparent/.test(c)) {
        bg = rgbToHex(c);
        break;
      }
      node = node.parentElement;
    }
    return {
      name: 'placeholder ô «Năm sinh của bố»',
      color: rgbToHex(cs.color),
      background: bg,
      fontSizePx: parseFloat(cs.fontSize),
      fontWeight: cs.fontWeight,
      opacity: cs.opacity,
    };
  });
  raw.computedStyles.push(ph);
  await empty.context.close();
  await context.close();
}

/* ── Ma trận focus (desktop) ───────────────────────────────────────── */
{
  const { context, page } = await newPage(browser, { width: 1440, height: 900 }, true);
  await page
    .locator('section[aria-label="Kết quả với bố"]')
    .waitFor({ state: 'attached', timeout: 20000 });

  // Tab từ đầu trang
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page
    .locator('body')
    .click({ position: { x: 5, y: 5 } })
    .catch(() => {});
  // Ghi cố định 32 Tab: ô date (#birth) nuốt nhiều Tab liên tiếp để đi
  // qua các segment ngày/tháng/năm trong cùng một activeElement, nên
  // không được dừng khi activeElement lặp lại.
  const tabs = [];
  for (let i = 0; i < 32; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(60);
    const d = await page.evaluate(describeActive);
    tabs.push({ step: i + 1, ...d });
  }
  raw.focus.tabOrder = tabs;

  const record = async (step) => {
    await page.waitForTimeout(250);
    raw.focus.exits.push({ step, active: await page.evaluate(describeActive) });
  };
  const openConfirm = async () => {
    const reset = page.getByRole('button', { name: /Làm lại từ đầu/ });
    await reset.scrollIntoViewIfNeeded();
    await reset.click();
    await page.getByRole('button', { name: 'Giữ lại', exact: true }).waitFor({ timeout: 10000 });
  };

  await openConfirm();
  await record('mở xác nhận xoá (kỳ vọng: nút «Giữ lại»)');
  await page.keyboard.press('Escape');
  await record('Esc tại khối xác nhận (kỳ vọng: nút «Làm lại từ đầu»)');

  await openConfirm();
  await page.getByRole('button', { name: 'Giữ lại', exact: true }).click();
  await record('bấm «Giữ lại» (kỳ vọng: nút «Làm lại từ đầu»)');

  await openConfirm();
  await page.getByRole('button', { name: 'Xoá', exact: true }).click();
  await page
    .getByRole('status')
    .filter({ hasText: 'Đã xoá.' })
    .waitFor({ state: 'visible', timeout: 10000 });
  await record('sau khi xoá (kỳ vọng: nút «Hoàn tác»)');
  await page.getByRole('button', { name: 'Hoàn tác', exact: true }).click();
  await record('bấm «Hoàn tác» (kỳ vọng: ô #birth)');

  // Hết hạn với focus trong thanh → OBS-A
  await openConfirm();
  const t0 = Date.now();
  await page.getByRole('button', { name: 'Xoá', exact: true }).click();
  await page
    .getByRole('status')
    .filter({ hasText: 'Đã xoá.' })
    .waitFor({ state: 'visible', timeout: 10000 });
  await record('xoá lần 2 — focus trong cửa sổ (kỳ vọng: nút «Hoàn tác»)');
  let goneAt = null;
  while (Date.now() - t0 < 12000) {
    const count = await page.getByRole('status').filter({ hasText: 'Đã xoá.' }).count();
    if (count === 0) {
      goneAt = Date.now() - t0;
      break;
    }
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(250);
  raw.focus.exits.push({
    step: `hết hạn 8s (thanh biến mất ở ~${goneAt}ms) — kỳ vọng: ô #birth (OBS-A)`,
    active: await page.evaluate(describeActive),
  });

  // «Sửa lại» từ SceneNav Cảnh 2 — dữ liệu đã bị xoá ở nhánh hết hạn nên
  // nạp lại bằng cách seed + tải lại trang trước bước này.
  await page.evaluate(
    (value) => localStorage.setItem('conmaytet:input:v1', value),
    JSON.stringify(SEED),
  );
  await page.reload({ waitUntil: 'load' });
  await page
    .locator('section[aria-label="Kết quả với bố"]')
    .waitFor({ state: 'attached', timeout: 20000 });
  const edit = page.getByRole('button', { name: /Sửa lại/ }).first();
  await edit.scrollIntoViewIfNeeded();
  await edit.click();
  await record('bấm «Sửa lại» ở Cảnh 2 (kỳ vọng: ô #birth)');

  await context.close();
}

await browser.close();

/* ── Ghi đầu ra ────────────────────────────────────────────────────── */
const contrastJson = {
  measuredAt: raw.measuredAt,
  method:
    'Token pairs computed from app/globals.css :root values with the WCAG 2.x relative-luminance formula; computed styles sampled live from the local production build (system Chromium 152 via CDP/Playwright, route-fulfilled from 127.0.0.1:3417).',
  tokens: TOKENS,
  tokenPairs: raw.tokenPairs,
  computedStyles: raw.computedStyles.map((s) =>
    s.missing
      ? s
      : {
          ...s,
          ratio: contrastRatio(s.color, s.background),
          grade: grade(
            contrastRatio(s.color, s.background),
            s.fontSizePx >= 24 || (s.fontSizePx >= 18.66 && Number(s.fontWeight) >= 700)
              ? 'large'
              : 'text',
          ),
        },
  ),
};
await writeFile(path.join(here, 'contrast.json'), JSON.stringify(contrastJson, null, 2) + '\n');

const touchJson = {
  measuredAt: raw.measuredAt,
  thresholdPx: 44,
  viewports: {},
};
for (const [vpName, states] of Object.entries(raw.touchTargets)) {
  touchJson.viewports[vpName] = {};
  for (const [state, list] of Object.entries(states)) {
    const below = (list || []).filter((t) => t.width < 44 || t.height < 44);
    touchJson.viewports[vpName][state] = {
      totalInteractive: (list || []).length,
      below44Count: below.length,
      below44: below,
      all: list,
    };
  }
}
await writeFile(path.join(here, 'touch-targets.json'), JSON.stringify(touchJson, null, 2) + '\n');
await writeFile(
  path.join(repoRoot, 'hygiene-evidence-w3/a11y-raw.json'),
  JSON.stringify(raw, null, 2) + '\n',
);
console.log(
  JSON.stringify(
    {
      tokenPairs: raw.tokenPairs.length,
      lowestTextPair: raw.tokenPairs
        .filter((p) => p.role === 'text')
        .sort((a, b) => a.ratio - b.ratio)[0],
      touchSummary: Object.fromEntries(
        Object.entries(touchJson.viewports).map(([k, v]) => [
          k,
          Object.fromEntries(
            Object.entries(v).map(([s, x]) => [
              s,
              `${x.below44Count}/${x.totalInteractive} below44`,
            ]),
          ),
        ]),
      ),
      headings: raw.headings,
      focusExits: raw.focus.exits,
      tabCount: raw.focus.tabOrder.length,
    },
    null,
    2,
  ),
);
