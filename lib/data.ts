/**
 * Bảng tuổi thọ Việt Nam — tuổi thọ kỳ vọng còn lại (e_x, đơn vị: năm) tại các
 * mốc tuổi, theo giới tính. App nội suy tuyến tính giữa các mốc (giá trị giữa
 * hai mốc là ƯỚC TÍNH NỘI SUY, không phải số liệu gốc — luôn ghi rõ khi hiển
 * thị, xem DATA_SOURCE_VI).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * NGUỒN SỐ LIỆU (ghi nguyên văn để đội verify độc lập đối chiếu):
 *
 * Toàn app dùng DUY NHẤT MỘT hệ số liệu: bảng sống (life table) Việt Nam
 * năm 2019 của Tổ chức Y tế Thế giới — World Health Organization (2020),
 * "Life Table 2019" for Viet Nam, công bố trên WHO Global Health Observatory
 * (https://apps.who.int/gho/data/view.main.61830?lang=en).
 *
 * Bảng dưới đây chép cột e_x của Phụ lục A1 (nữ) và A2 (nam) trong:
 * Dang, Truc Ngoc Hoang & Do, Hang Thi Thuy (2025), "Assessment of Social
 * Development Across Age Groups in Vietnam: Employing the Demographic Metric
 * of Literate Life Expectancy", SAGE Open 2/2025,
 * DOI: 10.1177/21582440251324694 — phụ lục ghi rõ "Source: World Health
 * Organization (2020)".
 *
 * Headline cùng hệ (tuổi thọ kỳ vọng khi sinh, WHO 2019): chung 73,7 năm —
 * nam 69,6 — nữ 78,1. Mọi con số tuổi thọ trong app (khi sinh lẫn còn lại
 * theo tuổi) đều lấy từ bảng này; app KHÔNG trộn số liệu của hệ khác
 * (Tổng cục Thống kê sơ bộ 2024 cho tách giới khác hẳn: nam 72,3 / nữ 77,3 —
 * hai hệ lệch nhau ở phương pháp nên tuyệt đối không đắp chéo).
 *
 * Kiểm chứng chéo (đội DataVerify độc lập, 2026-10-23,
 * ~/workspace/mini-apps/conmaytet-launch/DATA-VERIFIED.md mục 2.1):
 * e_60 nam 16,9 / nữ 22,0 — e_65 nam 13,6 / nữ 17,9 — e_70 nam 10,7 /
 * nữ 14,1 — e_75 nam 8,2 / nữ 10,7 — e_80 nam 6,1 / nữ 7,8: khớp với cột
 * e_x dưới đây ở độ chính xác 1 chữ số thập phân (bảng gốc của WHO trình
 * bày qua World Life Expectancy cho tuổi kỳ vọng tổng tại 60: nam 76,9 —
 * nữ 82,0).
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Các mốc tuổi: 0, 1, rồi mỗi 5 năm tới 80, và 85 (nhóm mở 85+ của bảng gốc —
 * e_85 là kỳ vọng còn lại trung bình của nhóm tuổi 85+; tuổi trên 85 dùng
 * nguyên giá trị này, xem lib/life-table.ts).
 */

export interface LifeTableKnot {
  /** Mốc tuổi (năm). */
  age: number;
  /** Tuổi thọ kỳ vọng còn lại tại đúng mốc tuổi đó (năm). */
  years: number;
}

/** Nữ — Phụ lục A1, WHO (2020) Life Table 2019, Việt Nam. */
export const FEMALE_REMAINING: LifeTableKnot[] = [
  { age: 0, years: 78.11 },
  { age: 1, years: 78.17 },
  { age: 5, years: 74.38 },
  { age: 10, years: 69.43 },
  { age: 15, years: 64.51 },
  { age: 20, years: 59.62 },
  { age: 25, years: 54.73 },
  { age: 30, years: 49.86 },
  { age: 35, years: 45.0 },
  { age: 40, years: 40.2 },
  { age: 45, years: 35.47 },
  { age: 50, years: 30.85 },
  { age: 55, years: 26.36 },
  { age: 60, years: 22.03 },
  { age: 65, years: 17.92 },
  { age: 70, years: 14.1 },
  { age: 75, years: 10.69 },
  { age: 80, years: 7.76 },
  { age: 85, years: 5.43 },
];

/** Nam — Phụ lục A2, WHO (2020) Life Table 2019, Việt Nam. */
export const MALE_REMAINING: LifeTableKnot[] = [
  { age: 0, years: 69.56 },
  { age: 1, years: 69.8 },
  { age: 5, years: 66.17 },
  { age: 10, years: 61.25 },
  { age: 15, years: 56.37 },
  { age: 20, years: 51.65 },
  { age: 25, years: 47.02 },
  { age: 30, years: 42.35 },
  { age: 35, years: 37.68 },
  { age: 40, years: 33.1 },
  { age: 45, years: 28.66 },
  { age: 50, years: 24.45 },
  { age: 55, years: 20.51 },
  { age: 60, years: 16.88 },
  { age: 65, years: 13.6 },
  { age: 70, years: 10.68 },
  { age: 75, years: 8.21 },
  { age: 80, years: 6.12 },
  { age: 85, years: 4.44 },
];

/** Tuổi thọ kỳ vọng khi sinh theo cùng bảng WHO 2019 — chỉ dùng cho nội dung giới thiệu/FAQ. */
export const LIFE_EXPECTANCY_AT_BIRTH = {
  both: 73.7,
  male: 69.6,
  female: 78.1,
} as const;

/** Chu kỳ trăng tròn trung bình (ngày) — dùng cho mốc "số lần trăng tròn". */
export const SYNODIC_MONTH_DAYS = 29.53059;

/** Số ngày trong một năm trung bình (năm nhuận đã tính) cho các phép quy đổi. */
export const DAYS_PER_YEAR = 365.2425;

/**
 * Nguồn số liệu hiển thị cho người dùng — một hệ duy nhất (WHO 2019),
 * kèm lưu ý nội suy. Giữ đồng bộ với comment ở đầu file.
 */
export const DATA_SOURCE_VI =
  'Nguồn số liệu: Bảng sống Việt Nam 2019 của Tổ chức Y tế Thế giới (WHO, công bố 2020) — tuổi thọ trung bình khi sinh theo bảng này là 73,7 năm (nam 69,6; nữ 78,1). Giá trị ở các tuổi lẻ giữa hai mốc 5 năm là nội suy tuyến tính ước tính từ bảng gốc.';
