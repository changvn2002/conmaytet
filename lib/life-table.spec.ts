import { describe, expect, it } from 'vitest';
import { remainingLifeExpectancy } from './life-table';

/**
 * Số đối chiếu là cột e_x của bảng sống Việt Nam 2019 (WHO, 2020) —
 * xem lib/data.ts. Các mốc 60/65/70/75/80 đã được đội DataVerify độc lập
 * kiểm chứng chéo (DATA-VERIFIED.md mục 2.1, độ chính xác 1 chữ số thập phân).
 */
describe('remainingLifeExpectancy — đúng số gốc tại các mốc', () => {
  it('nam 60 tuổi còn 16,88 năm; nữ 60 còn 22,03', () => {
    expect(remainingLifeExpectancy(60, 'male')).toBeCloseTo(16.88, 2);
    expect(remainingLifeExpectancy(60, 'female')).toBeCloseTo(22.03, 2);
  });

  it('nam 65 còn 13,60; nữ 65 còn 17,92', () => {
    expect(remainingLifeExpectancy(65, 'male')).toBeCloseTo(13.6, 2);
    expect(remainingLifeExpectancy(65, 'female')).toBeCloseTo(17.92, 2);
  });

  it('70/75/80 khớp bảng WHO', () => {
    expect(remainingLifeExpectancy(70, 'male')).toBeCloseTo(10.68, 2);
    expect(remainingLifeExpectancy(70, 'female')).toBeCloseTo(14.1, 2);
    expect(remainingLifeExpectancy(75, 'male')).toBeCloseTo(8.21, 2);
    expect(remainingLifeExpectancy(75, 'female')).toBeCloseTo(10.69, 2);
    expect(remainingLifeExpectancy(80, 'male')).toBeCloseTo(6.12, 2);
    expect(remainingLifeExpectancy(80, 'female')).toBeCloseTo(7.76, 2);
  });

  it('khi sinh: nam 69,56 — nữ 78,11', () => {
    expect(remainingLifeExpectancy(0, 'male')).toBeCloseTo(69.56, 2);
    expect(remainingLifeExpectancy(0, 'female')).toBeCloseTo(78.11, 2);
  });
});

describe('remainingLifeExpectancy — nội suy và biên', () => {
  it('giữa hai mốc là trung bình tuyến tính (nam 62,5 tuổi)', () => {
    expect(remainingLifeExpectancy(62.5, 'male')).toBeCloseTo((16.88 + 13.6) / 2, 6);
  });

  it('tuổi trên 85 dùng e_85 của nhóm mở 85+', () => {
    expect(remainingLifeExpectancy(90, 'female')).toBeCloseTo(5.43, 2);
    expect(remainingLifeExpectancy(100, 'male')).toBeCloseTo(4.44, 2);
  });

  it("'unspecified' là trung bình hai bảng", () => {
    expect(remainingLifeExpectancy(60, 'unspecified')).toBeCloseTo((16.88 + 22.03) / 2, 6);
  });

  it('kỳ vọng còn lại giảm dần theo tuổi trong vùng tuổi già', () => {
    const ages = [50, 60, 70, 80];
    const vals = ages.map((a) => remainingLifeExpectancy(a, 'female'));
    for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeLessThan(vals[i - 1]);
  });
});
