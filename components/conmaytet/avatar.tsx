'use client';

import { useEffect, useState } from 'react';
import { initialsForName } from '@/lib/avatar-initials';

/* ------------------------------------------------------------------ */
/* Avatar DiceBear `initials` (REDESIGN-V4, TYPE-AND-ICON §4) —        */
/* @dicebear/core + @dicebear/initials ghim 9.4.3, import TỪNG          */
/* style-package (không qua @dicebear/collection — collection không     */
/* tree-shake được ở phép đo của app chị em), render 100% client-side,  */
/* KHÔNG qua HTTP API. Chỉ style `initials` được phép ở app này; mọi    */
/* style có mặt đều bị cấm (hồ sơ §4).                                  */
/*                                                                     */
/* PROBE cơ chế glyph (2026-10-24, chạy trên chính package 9.4.3 đã     */
/* cài — script + kết quả ở ~/workspace/mini-apps/tmp/probe-conmaytet/):*/
/* `getInitials` của @dicebear/initials suy glyph TỪ SEED:              */
/*   seed chuẩn `conmaytet:v1:profile:father-1965` → "CF" (vô nghĩa)   */
/*   seed chuẩn `…:mother-1968` → "CM" · `…:self-1995` → "CS"           */
/*   nhãn vai 1 từ, mặc định chars=2 → "BỐ" / "MẸ" / "BẠ" (2 ký tự)    */
/*   nhãn vai 1 từ + chars:1 → "B" / "M" / "B" — ĐÚNG luật X1          */
/*   seed là 1 ký tự glyph ("B"/"M"/"N"/"A"/"H") → glyph giữ nguyên    */
/* Vì vậy cơ chế ÉP GLYPH chắc chắn ở đây (tiền lệ dichbome):           */
/*   glyph = initialsForName(tên/nhãn) — hàm X1 thuần đã unit-test —    */
/*   được dùng làm seed-glyph cho DiceBear kèm chars:1; còn seed        */
/*   CHUẨN `conmaytet:v1:profile:<role>-<năm sinh>` chỉ dùng để chọn    */
/*   cặp nền/chữ bằng FNV-1a trong 4 cặp palette đã khoá của hồ sơ.     */
/*                                                                     */
/* Render bằng SVG INLINE (không data-URI — tiền lệ chiatien/dichbome). */
/* Tên chữ Be Vietnam Pro LUÔN đi kèm avatar ở mọi call-site             */
/* (C-11.10): avatar là kênh định danh phụ, không đứng một mình.        */
/* ------------------------------------------------------------------ */

/** 4 cặp palette khoá (TYPE-AND-ICON §4, đã đo tương phản 13,71–16,45).
 *  Giá trị hex ĐỌC TỪ CSS vars của app/tokens.css lúc chạy — component
 *  không chứa hex literal (luật sink của tokens:verify). */
export const AVATAR_PALETTE_PAIRS: ReadonlyArray<readonly [bgVar: string, inkVar: string]> = [
  ['--brand-10', '--brand-90'],
  ['--brand-10', '--neutral-100'],
  ['--neutral-10', '--neutral-100'],
  ['--neutral-20', '--neutral-100'],
];

/** FNV-1a 32-bit trên UTF-8 (hàm hash palette chuẩn của nhà). */
export function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(text)) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function profileSeed(role: string, birthYear: number | null): string {
  return `conmaytet:v1:profile:${role}-${birthYear ?? 'x'}`;
}

function cssVarHex(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace('#', '');
}

const svgCache = new Map<string, string>();

type DicebearModule = {
  createAvatar: typeof import('@dicebear/core').createAvatar;
  initials: typeof import('@dicebear/initials');
};

let dicebearPromise: Promise<DicebearModule> | null = null;
function loadDicebear(): Promise<DicebearModule> {
  dicebearPromise ??= (async () => {
    const [core, initials] = await Promise.all([
      import('@dicebear/core'),
      import('@dicebear/initials'),
    ]);
    return { createAvatar: core.createAvatar, initials };
  })();
  return dicebearPromise;
}

function stripMetadataAndHide(svg: string): string {
  // DiceBear nhúng khối <metadata> RDF dài vào đầu SVG — lột bỏ và gắn
  // aria-hidden ở gốc: avatar là trang trí, nhãn chữ thật luôn đi kèm.
  return svg
    .replace(/<metadata[\s\S]*?<\/metadata>/, '')
    .replace(/<svg/, '<svg aria-hidden="true"');
}

async function buildAvatarSvg(role: string, birthYear: number | null, name: string) {
  const seed = profileSeed(role, birthYear);
  const glyph = initialsForName(name);
  const cacheKey = `${seed}|${glyph}`;
  const cached = svgCache.get(cacheKey);
  if (cached) return cached;
  const { createAvatar, initials } = await loadDicebear();
  const pair = AVATAR_PALETTE_PAIRS[fnv1a(seed) % AVATAR_PALETTE_PAIRS.length];
  const raw = createAvatar(initials, {
    // Seed-glyph = ĐÚNG ký tự X1 (probe ở đầu file: seed 1 ký tự cho
    // glyph nguyên vẹn; chars:1 khoá thêm một lớp nữa).
    seed: glyph,
    chars: 1,
    backgroundColor: [cssVarHex(pair[0])],
    textColor: [cssVarHex(pair[1])],
    fontFamily: ['Baloo 2', 'Be Vietnam Pro', 'sans-serif'],
    fontWeight: 800,
    fontSize: 50,
  }).toString();
  const svg = stripMetadataAndHide(raw);
  svgCache.set(cacheKey, svg);
  return svg;
}

/**
 * Đĩa initials tròn cho một hồ sơ (bố / mẹ / người dùng). Trước khi
 * chunk DiceBear tải xong (hoặc khi tải lỗi), hiện đĩa tĩnh cùng kích
 * thước — nền var(--*) của đúng cặp palette đã chọn + chữ Baloo 2 800 —
 * không giật layout.
 */
export function ProfileAvatar({
  role,
  birthYear,
  name,
  size = 32,
}: {
  role: 'father' | 'mother' | 'self';
  birthYear: number | null;
  /** Tên/nhãn vai mà glyph X1 suy từ đó («Bố» → B, «Bạn» → B). */
  name: string;
  size?: number;
}) {
  const seed = profileSeed(role, birthYear);
  const glyph = initialsForName(name);
  const pair = AVATAR_PALETTE_PAIRS[fnv1a(seed) % AVATAR_PALETTE_PAIRS.length];
  const [svg, setSvg] = useState<string | null>(() => svgCache.get(`${seed}|${glyph}`) ?? null);

  useEffect(() => {
    let cancelled = false;
    buildAvatarSvg(role, birthYear, name)
      .then((built) => {
        if (!cancelled) setSvg(built);
      })
      .catch(() => {
        // Tải chunk lỗi: giữ đĩa tĩnh dự phòng.
      });
    return () => {
      cancelled = true;
    };
  }, [role, birthYear, name]);

  if (!svg) {
    return (
      <span
        aria-hidden
        className="font-display inline-flex shrink-0 items-center justify-center rounded-full font-extrabold"
        style={{
          width: size,
          height: size,
          fontSize: Math.round(size * 0.5),
          backgroundColor: `var(${pair[0]})`,
          color: `var(${pair[1]})`,
        }}
      >
        {glyph}
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 overflow-hidden rounded-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
