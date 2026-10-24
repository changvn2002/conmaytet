'use client';

import type { CSSProperties } from 'react';

/**
 * Bộ icon tự vẽ của conmaytet (hệ lens-04) — lưới 24 · nét 2,0 · cap
 * tròn · màu qua `currentColor` — gold KHÔNG BAO GIỜ là màu icon
 * (ngoại lệ duy nhất: chi tiết gold-tint mảnh trên hai khối đặc
 * seed của IconBanhChung và IconHome — xem chú thích ở đó).
 * Motif vòng năm của V4 ĐÃ CHẾT (chương trình conmaytet-redesign):
 * không cung tròn trang trí, không vạch chia kiểu mặt đồng hồ ở bất
 * kỳ icon nào. Cấm mọi motif bói toán (sao / quẻ / con giáp / lì xì /
 * đèn lồng…): motif văn hoá duy nhất là tờ lịch, ngôi nhà, bánh
 * chưng (motif của mẹ từ vòng 5 — icon bát cơm cũ đã bỏ, xem
 * IconBanhChung).
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
      <path d="M8 14.5h3M8 17h5" />
    </svg>
  );
}

/**
 * NGÔI NHÀ — motif của Bố (R8: đồng bộ ngôn ngữ với
 * IconBanhChung). Các vòng ≤7 nhà là nét OUTLINE mảnh trong
 * khi bánh chưng của Mẹ là KHỐI ĐẶC — panel chê lặp lại ở
 * mọi vòng («hai bộ icon chắp vào nhau», SERIOUS ở ghế 2/3/4
 * vòng 7). Nay nhà vẽ theo ĐÚNG ngữ pháp của bánh chưng:
 * MỘT khối đặc liền var(--seed) trong cùng khung 4→20 của
 * lưới 24, chi tiết gold-tint mảnh vẽ ĐÈ LÊN mặt khối (cửa
 * vòm + đường mái hiên 0,8 như dây lạt của bánh), không nét
 * currentColor. Cặp motif nay là «khối đặc seed + chi tiết
 * gold-tint» ở cả hai thẻ — phân biệt nằm ở hình (nhà/bánh),
 * không nằm ở ngôn ngữ vẽ. Cùng IconBanhChung, đây là hai
 * icon duy nhất của bộ mang màu riêng thay vì currentColor.
 */
export function IconHome(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      {/* Thân nhà: MỘT khối đặc liền — mái tam giác + tường
          trong cùng một path fill, khung 4→20 như khối bánh. */}
      <path d="M12 4 L20 11 V20 H4 V11 Z" fill="var(--seed)" stroke="none" />
      {/* Đường mái hiên gold-tint mảnh đè lên mặt khối, đầu
          chạm đúng mép tường (linecap butt như dây bánh). */}
      <path d="M4.8 11.6h14.4" stroke="var(--gold-tint)" strokeWidth={0.8} strokeLinecap="butt" />
      {/* Cửa vòm gold-tint ở tâm mặt tiền. */}
      <path d="M10.2 20 v-4.6 a1.8 1.8 0 0 1 3.6 0 V20 Z" fill="var(--gold-tint)" stroke="none" />
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
      <circle cx="12" cy="12" r="9" />
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
      {/* Nét xu hướng nối các cột. */}
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

/** «Làm lại từ đầu» — mũi tên vòng quay lại điểm đầu. */
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

/* ── Ikon phân biệt dòng «lần gặp» ở Cảnh 2 (spec lens-04) ─────── */

export function IconCheck(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );
}

export function IconShield(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 5 6v5.5c0 4.6 3 7.4 7 9 4-1.6 7-4.4 7-9V6l-7-2.5z" />
      <path d="M9 11.8 11.2 14 15.2 9.8" />
    </svg>
  );
}

/**
 * BÁNH CHƯNG — motif của Mẹ (J3 vòng 5 · K2 vòng 6 · L1 vòng 7).
 * Bản vòng 6 (khối đặc + chữ thập kem 1,5 + nút r=1,6 + vệt cong
 * ở góc trên-trái) vẫn bị panel vòng 6 đọc thành 4 Ô RỜI /
 * cửa sổ / waffle (4/5 ghế): chữ thập THÒ RA NGOÀI chu vi khối
 * (đầu dây ở 4,5/19,5 trong khi khối ở 4/20) và vệt cong đọc
 * như bóng gloss trên một ô kính, nút thắt lớn làm các góc
 * trong quanh tâm trông bo tròn như 4 ô tách nhau.
 * Bản vòng 7 theo đúng lệnh L1 — vẽ theo CẤU TRÚC GÓI THẬT:
 * MỘT khối vuông đặc liền var(--seed), bo góc CHỈ ở chu vi
 * ngoài (rx nhỏ 2,2; bên trong khối không tồn tại góc nào để
 * bo), dây lạt MẢNH rõ rệt (0,8 — mỏng gần một nửa so với 1,5)
 * vẽ ĐÈ LÊN mặt gói và KẾT THÚC ĐÚNG mép khối (4→20, không
 * thò ra ngoài), nút thắt nhỏ như hạt (r=1,0) ở tâm, BỎ HẲN
 * vệt cong gloss. Ở cả 82px lẫn 14px đều đọc một mạch: «một
 * gói liền bị dây mảnh siết». Đây là icon duy nhất của bộ mang
 * màu riêng (đặc + kem) thay vì nét currentColor — ngoại lệ có
 * chủ đích, ghi rõ tại đây.
 */
export function IconBanhChung(props: CmIconProps) {
  return (
    <svg {...base(props)}>
      {/* Thân bánh: MỘT khối vuông đặc liền, bo góc chỉ ở chu vi ngoài. */}
      <rect x="4" y="4" width="16" height="16" rx="2.2" fill="var(--seed)" stroke="none" />
      {/* Dây lạt MẢNH đè lên mặt gói: 1 dọc + 1 ngang, đầu dây
          chạm đúng mép khối, không thò ra ngoài chu vi (linecap
          butt — cap tròn của bộ icon sẽ thò đầu dây ra ngoài
          mép gói ~nửa bề rộng nét). */}
      <path d="M12 4v16M4 12h16" stroke="var(--gold-tint)" strokeWidth={0.8} strokeLinecap="butt" />
      {/* Nút thắt nhỏ hình hạt ở tâm. */}
      <circle cx="12" cy="12" r="1" fill="var(--gold-tint)" stroke="none" />
    </svg>
  );
}

/** Tên cũ của motif mẹ — giữ alias để không vỡ import ngoài ý muốn;
 *  hình vẽ nay là bánh chưng (xem IconBanhChung). */
export const IconMeal = IconBanhChung;

/* ── Spot cho tầng disclosure (ink-only) ──────────────────────────
 * Chỉ 2 motif: cành đào thu nhỏ và hoa đào path cánh thật (cùng họ
 * hình với components/conmaytet/branch.tsx), vẽ bằng currentColor. */

const SPOT_PETAL = 'M0 0 C-7.5 -2.5 -10 -9.5 -3.4 -15.2 L0 -13.4 L3 -15.4 C9.5 -10 7 -2.8 0 0 Z';

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
      {/* Cành đào thu nhỏ: thân cong + 2 hoa cánh thật. */}
      <path d="M8 50 C36 44 58 34 82 20 C94 13 104 9 114 7" />
      <g transform="translate(96 12) scale(0.55)" fill="currentColor" stroke="none">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d={SPOT_PETAL} transform={`rotate(${a})`} />
        ))}
      </g>
      <g transform="translate(52 32) scale(0.42)" fill="currentColor" stroke="none">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d={SPOT_PETAL} transform={`rotate(${a})`} />
        ))}
      </g>
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
      {/* Hoa đào đơn: 5 cánh path thật quanh tâm, tâm là chấm nhỏ. */}
      <g transform="translate(60 32) scale(1.05)" fill="none">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d={SPOT_PETAL} transform={`rotate(${a})`} />
        ))}
      </g>
      <circle cx="60" cy="32" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}
