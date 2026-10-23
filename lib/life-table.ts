import { FEMALE_REMAINING, MALE_REMAINING, type LifeTableKnot } from './data';
import type { Sex } from './types';

/**
 * Tra tuổi thọ kỳ vọng còn lại (năm) cho một người đang ở `age` tuổi,
 * theo bảng sống Việt Nam 2019 của WHO (lib/data.ts).
 *
 * - Đúng mốc tuổi (0, 1, 5, 10, …, 80, 85): trả đúng số liệu gốc của bảng.
 * - Giữa hai mốc: NỘI SUY TUYẾN TÍNH — là ước tính cho trải nghiệm liên tục,
 *   không phải số liệu gốc (app ghi rõ điều này cạnh kết quả).
 * - Tuổi > 85: dùng e_85 (kỳ vọng trung bình của nhóm mở 85+ trong bảng gốc).
 * - 'unspecified': trung bình cộng của bảng nam và nữ tại cùng tuổi.
 */
export function remainingLifeExpectancy(age: number, sex: Sex): number {
  const a = Math.max(0, age);
  if (sex === 'male') return interpolate(MALE_REMAINING, a);
  if (sex === 'female') return interpolate(FEMALE_REMAINING, a);
  return (interpolate(MALE_REMAINING, a) + interpolate(FEMALE_REMAINING, a)) / 2;
}

function interpolate(knots: LifeTableKnot[], age: number): number {
  if (age <= knots[0].age) return knots[0].years;
  for (let i = 1; i < knots.length; i++) {
    const prev = knots[i - 1];
    const next = knots[i];
    if (age <= next.age) {
      const t = (age - prev.age) / (next.age - prev.age);
      return prev.years + t * (next.years - prev.years);
    }
  }
  // Quá mốc cuối (85+): giữ nguyên e_85 của nhóm mở.
  return knots[knots.length - 1].years;
}
