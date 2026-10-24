'use client';

import type { CSSProperties } from 'react';

/**
 * Bộ icon «Vòng Năm» của REDESIGN-V4 (TYPE-AND-ICON §3) — thay toàn bộ
 * bộ icon stock trước đây trong components/. Luật cấu trúc: lưới 24 ·
 * nét 2,0 · cap tròn · một nét cong không khép cùng họ với mark, đầu
 * nét mở ở góc 45° phải-trên · icon có khung (lịch, nhà) mang một cung
 * vòng-năm nhỏ ở góc phải-trên · màu qua `currentColor` — gold KHÔNG
 * BAO GIỜ là màu icon. Cấm mọi motif bói toán (sao / quẻ / con giáp /
 * lì xì / đèn lồng…): motif văn hoá duy nhất là tờ lịch / vòng thời gian.
 *
 * API như tiền lệ chiatien: props {size, className, aria-hidden mặc
 * định true, style}. Icon là trang trí; nơi gọi chịu trách nhiệm nhãn
 * của nút/chữ đi kèm.
 */
export type CmIconProps = {
  size?: number;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
  style?: CSSProperties;
};

function base(props: CmIconProps) {
  const { size = 24, className, style } = props;
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    style,
    'aria-hidden': props['aria-hidden'] ?? true,
    focusable: false as const,
  };
}

/* ── Bộ 8 icon hồ sơ (TYPE-AND-ICON §3) ─────────────────────────── */

export function IconCalendar(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10.5h16M8 4v4" />
      {/* Cung vòng-năm nhỏ ở góc phải-trên của khung, đầu mở 45°. */}
      <path d="M15.6 3.4a2.9 2.9 0 0 1 2.5 2.5" />
      <path d="M8 14.5h3M8 17h5" />
    </svg>
  );
}

export function IconHome(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5h4v5" />
      {/* Cung vòng-năm nhỏ ở góc phải-trên của khung nhà. */}
      <path d="M16.8 5.6a2.6 2.6 0 0 1 1.9 2.1" />
    </svg>
  );
}

export function IconShare(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 14V4" />
      {/* Đầu mũi tên mở về phía phải-trên (45°). */}
      <path d="M7.5 7.5 12 3l4.5 4.5" />
      <path d="M5 13v6a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6" />
    </svg>
  );
}

export function IconEdit(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5.2 18.8 6.3 14.9 16.6 4.6a2.05 2.05 0 0 1 2.9 0l.1.1a2.05 2.05 0 0 1 0 2.9L9.3 17.9l-4.1.9z" />
      <path d="M14.8 6.4l2.9 2.9" />
    </svg>
  );
}

export function IconInfo(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      {/* Vòng không khép: khe hở ở góc 45° phải-trên như đầu nét của mark. */}
      <path d="M18.4 5.6A9 9 0 1 0 21 12" />
      <path d="M12 11v5M12 7.8v.01" />
    </svg>
  );
}

export function IconBack(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  );
}

export function IconUsers(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M3.5 20c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M16 5.2a3.4 3.4 0 0 1 0 6M17.8 15.3c1.9.7 3.2 2.3 3.7 4.7" />
    </svg>
  );
}

export function IconChart(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 4v15.5h16" />
      <path d="M8.5 16v-4.5M12.5 16V8.5M16.5 16v-6.5" />
      {/* Nét cong mở đầu 45° phải-trên nối các cột — cùng họ mark. */}
      <path d="M8.5 9.8 12.5 6l3 2.2 3.2-3" />
    </svg>
  );
}

/* ── Glyph UI hiện hành không có đối ứng trong bộ 8 — vẽ cùng luật ── */

export function IconCopy(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
      <path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

export function IconDownload(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v10.5" />
      <path d="M7 10.5l5 5 5-5" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

/** «Làm lại từ đầu» — vòng mở quay lại điểm đầu, đầu nét ở 45° phải-trên. */
export function IconReset(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path d="M20.2 3.2v4.3h-4.3" />
    </svg>
  );
}

export function IconWifiOff(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 3l18 18" />
      <path d="M8.6 16.4a5 5 0 0 1 6.8 0M5.2 12.8a10.5 10.5 0 0 1 3.4-2.4M18.8 12.8a10.5 10.5 0 0 0-2-1.5M12 19.8v.01" />
    </svg>
  );
}

export function IconChevronRight(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

/** Chevron xuống = CÙNG path chevron-right xoay 90° (tiền lệ chiatien). */
export function IconChevronDown(props: CmIconProps) {
  const { style, ...rest } = props;
  return (
    <svg {...base({ ...rest, style: { transform: 'rotate(90deg)', ...style } })}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

/** Chevron lên = CÙNG path chevron-right xoay −90°. */
export function IconChevronUp(props: CmIconProps) {
  const { style, ...rest } = props;
  return (
    <svg {...base({ ...rest, style: { transform: 'rotate(-90deg)', ...style } })}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function IconArrowDown(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v16" />
      <path d="M6 14l6 6 6-6" />
    </svg>
  );
}

export function IconArrowUp(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20V4" />
      <path d="M6 10l6-6 6 6" />
    </svg>
  );
}

/**
 * Glyph «tuần này» (thay MapPin theo M6/D4-CM-5): vòng năm TĨNH thu nhỏ —
 * vòng tròn + vạch tháng 1 dài hơn ở hướng phải-trên, không pulse, không
 * chuyển động. Kênh nhận diện chính vẫn là nhãn chữ đi kèm ở nơi gọi.
 */
export function IconWeekRing(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 4.5v2.6M17.3 6.7l-1.8 1.8M19.5 12H17M12 19.5v-2.6M4.5 12H7" />
    </svg>
  );
}

/* ── Spot cho tầng disclosure (ink-only, VISUAL-LAYER §3) ──────────
 * Chỉ 2 motif được phép ở tầng đọc: vạch tháng đơn và hoa đơn outline.
 * Cả hai vẽ bằng currentColor (nơi gọi đặt màu mực), không gold. */

export function SpotMonthTick({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 60"
      width={120}
      height={60}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      {/* Một cung của vòng năm + vạch tháng đơn dài ở đỉnh. */}
      <path d="M8 52a52 52 0 0 1 104 0" />
      <path d="M60 8v18M28 20l6 12M92 20l-6 12" strokeWidth={2.5} />
    </svg>
  );
}

export function SpotFlower({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 60"
      width={120}
      height={60}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      className={className}
      aria-hidden
      focusable={false}
    >
      {/* Hoa đơn: 5 vòng outline quanh tâm, tâm là chấm mực nhỏ. */}
      <circle cx="60" cy="19" r="10" />
      <circle cx="70.5" cy="26.6" r="10" />
      <circle cx="66.5" cy="39" r="10" />
      <circle cx="53.5" cy="39" r="10" />
      <circle cx="49.5" cy="26.6" r="10" />
      <circle cx="60" cy="30" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}
