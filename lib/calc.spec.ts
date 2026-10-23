import { describe, expect, it } from 'vitest';
import { calculate, validateInput } from './calc';
import { EMPTY_INPUT, type InputData } from './types';

// Ngày "hôm nay" cố định cho mọi test: 23/10/2026 (sau Tết 2026, trước Tết 2027).
const NOW = new Date(2026, 9, 23);

function input(patch: Partial<InputData>): InputData {
  return { ...EMPTY_INPUT, visitsPerYear: 2, ...patch };
}

describe('calculate — số Tết và số lần gặp còn lại với bố mẹ', () => {
  it('bố sinh 1961 (65 tuổi, nam): còn 13,6 năm → 14 cái Tết, 27 lần gặp ở nhịp 2 lần/năm', () => {
    const r = calculate(input({ fatherBirthYear: 1961 }), NOW);
    expect(r.father).not.toBeNull();
    expect(r.father!.currentAge).toBe(65);
    expect(r.father!.remainingYears).toBeCloseTo(13.6, 2);
    // Tết 2027…2040 nằm trong (23/10/2026, ~05/2040] — đúng 14 cái.
    expect(r.father!.tetsLeft).toBe(14);
    expect(r.father!.meetingsLeft).toBe(Math.floor(13.6 * 2));
  });

  it('mẹ sinh 1961 (65 tuổi, nữ): còn 17,92 năm → 18 cái Tết', () => {
    const r = calculate(input({ motherBirthYear: 1961 }), NOW);
    expect(r.mother!.currentAge).toBe(65);
    expect(r.mother!.remainingYears).toBeCloseTo(17.92, 2);
    // Tết 2027…2044 — đúng 18 cái.
    expect(r.mother!.tetsLeft).toBe(18);
  });

  it('tăng số lần về thăm thì số lần gặp tăng theo đúng hệ số', () => {
    const r = calculate(input({ fatherBirthYear: 1961, visitsPerYear: 4 }), NOW);
    expect(r.father!.meetingsLeft).toBe(Math.floor(13.6 * 4));
    expect(r.father!.tetsLeft).toBe(14); // số Tết không đổi theo nhịp về thăm
  });

  it('sống cùng bố mẹ: số lần gặp tính theo ngày', () => {
    const r = calculate(input({ fatherBirthYear: 1961, livesWithParents: true }), NOW);
    expect(r.father!.meetingsLeft).toBe(Math.floor(13.6 * 365.2425));
  });

  it('bỏ qua người nào thì kết quả người đó là null', () => {
    const r = calculate(input({ fatherBirthYear: 1961 }), NOW);
    expect(r.mother).toBeNull();
    const r2 = calculate(input({}), NOW);
    expect(r2.father).toBeNull();
    expect(r2.mother).toBeNull();
    expect(r2.life).toBeNull();
  });
});

describe('calculate — lưới tuần cuộc đời', () => {
  const r = calculate(input({ myBirthDate: '1996-06-15', mySex: 'female' }), NOW);
  const life = r.life!;

  it('ngày đã sống và tuần đã sống nhất quán', () => {
    expect(life.daysLived).toBeGreaterThan(0);
    expect(life.weeksLived).toBe(Math.floor(life.daysLived / 7));
  });

  it('tổng tuần kỳ vọng lớn hơn tuần đã sống, % trong (0, 100)', () => {
    expect(life.totalWeeks).toBeGreaterThan(life.weeksLived);
    expect(life.percentLived).toBeGreaterThan(0);
    expect(life.percentLived).toBeLessThan(100);
    expect(life.percentLived).toBeCloseTo((life.weeksLived / life.totalWeeks) * 100, 6);
  });

  it('số Tết đã trải qua: sinh 15/06/1996 → Tết 1997…2026 = 30 cái', () => {
    // Tết 1996 (19/02/1996) xảy ra trước ngày sinh nên không tính.
    expect(life.tetsExperienced).toBe(30);
  });

  it('số lần trăng tròn xấp xỉ = floor(ngày đã sống / 29,53059)', () => {
    expect(life.fullMoons).toBe(Math.floor(life.daysLived / 29.53059));
  });

  it('tuổi kỳ vọng tổng của nữ 30 tuổi ≈ 30 + e_30 (49,86) ≈ 80', () => {
    expect(life.expectedLifespanYears).toBeGreaterThan(79);
    expect(life.expectedLifespanYears).toBeLessThan(81);
  });
});

describe('validateInput', () => {
  it('ngày sinh ở tương lai là lỗi cứng', () => {
    const v = validateInput(input({ myBirthDate: '2030-01-01' }), NOW);
    expect(v.errors.length).toBeGreaterThan(0);
  });

  it('năm sinh bố ngoài khoảng 1900–năm hiện tại là lỗi cứng', () => {
    const v = validateInput(input({ fatherBirthYear: 1850 }), NOW);
    expect(v.errors.length).toBeGreaterThan(0);
  });

  it('bố mẹ lớn hơn con dưới 15 tuổi → cảnh báo mềm, không chặn', () => {
    const v = validateInput(input({ myBirthDate: '1996-06-15', fatherBirthYear: 1985 }), NOW);
    expect(v.errors).toHaveLength(0);
    expect(v.warnings.some((w) => w.includes('bố'))).toBe(true);
  });

  it('input bình thường không lỗi không cảnh báo', () => {
    const v = validateInput(
      input({ myBirthDate: '1996-06-15', fatherBirthYear: 1961, motherBirthYear: 1963 }),
      NOW,
    );
    expect(v.errors).toHaveLength(0);
    expect(v.warnings).toHaveLength(0);
  });
});
