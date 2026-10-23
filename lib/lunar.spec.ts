import { describe, expect, it } from 'vitest';
import { countTetDays, lunarToSolar, solarToLunar, tetDate } from './lunar';

/**
 * Ground truth mùng 1 Tết Nguyên Đán — đã verify độc lập trong
 * ~/workspace/mini-apps/conmaytet-launch/DATA-VERIFIED.md (mục 3):
 * nguồn gốc Wikipedia tiếng Việt "Tết Nguyên Đán" (tính theo giờ Hà Nội,
 * UTC+7), kiểm chứng chéo nhiều nguồn lịch Việt cho 2026/2027/2030/2033.
 * [năm âm lịch, ngày, tháng dương lịch]
 */
const TET_GROUND_TRUTH: [number, number, number][] = [
  [2024, 10, 2],
  [2025, 29, 1],
  [2026, 17, 2],
  [2027, 6, 2],
  [2028, 26, 1],
  [2029, 13, 2],
  [2030, 2, 2], // Đa số 4/5 nguồn + Wikipedia: 02/02/2030 (một nguồn ngoài ghi 03/02 — sai).
  [2031, 23, 1],
  [2032, 11, 2],
  [2033, 31, 1],
  [2034, 19, 2],
  [2035, 8, 2],
];

describe('tetDate khớp ground truth 2024–2035', () => {
  it.each(TET_GROUND_TRUTH)('Tết %i = %i/%i', (year, day, month) => {
    const t = tetDate(year);
    expect(t.getFullYear()).toBe(year);
    expect(t.getMonth() + 1).toBe(month);
    expect(t.getDate()).toBe(day);
  });

  it('đủ 12/12 năm trong ground truth', () => {
    expect(TET_GROUND_TRUTH).toHaveLength(12);
  });
});

describe('lunarToSolar / solarToLunar', () => {
  it('lunarToSolar(1,1,2030) = 02/02/2030 (năm có nguồn mâu thuẫn)', () => {
    expect(lunarToSolar(1, 1, 2030, false)).toEqual({ day: 2, month: 2, year: 2030 });
  });

  it('solarToLunar(17/02/2026) = mùng 1 tháng 1 năm 2026', () => {
    const l = solarToLunar(17, 2, 2026);
    expect(l).toMatchObject({ day: 1, month: 1, year: 2026, leap: false });
  });

  it('solarToLunar(10/02/2024) = mùng 1 Tết Giáp Thìn', () => {
    const l = solarToLunar(10, 2, 2024);
    expect(l).toMatchObject({ day: 1, month: 1, year: 2024, leap: false });
  });

  it('roundtrip: âm → dương → âm giữ nguyên ngày thường', () => {
    const s = lunarToSolar(15, 8, 2026, false); // rằm tháng 8/2026
    const back = solarToLunar(s.day, s.month, s.year);
    expect(back).toMatchObject({ day: 15, month: 8, year: 2026, leap: false });
  });
});

describe('countTetDays', () => {
  it('đếm đúng 4 cái Tết trong (01/01/2024, 31/12/2027]', () => {
    // 10/02/2024, 29/01/2025, 17/02/2026, 06/02/2027
    expect(countTetDays(new Date(2024, 0, 1), new Date(2027, 11, 31))).toBe(4);
  });

  it('khoảng rỗng / đảo ngược cho 0', () => {
    expect(countTetDays(new Date(2026, 5, 1), new Date(2026, 5, 1))).toBe(0);
    expect(countTetDays(new Date(2027, 0, 1), new Date(2026, 0, 1))).toBe(0);
  });

  it('không tính Tết đã qua trong năm hiện tại', () => {
    // Sau Tết 2026 (17/02), khoảng tới 31/12/2026 không còn Tết nào.
    expect(countTetDays(new Date(2026, 9, 23), new Date(2026, 11, 31))).toBe(0);
    // Kéo tới sau Tết 2027 (06/02/2027) thì có đúng 1.
    expect(countTetDays(new Date(2026, 9, 23), new Date(2027, 11, 31))).toBe(1);
  });
});
