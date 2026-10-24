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

describe('validateInput — kiểm chéo năm sinh bố/mẹ phải nhỏ hơn năm sinh của bạn (V122)', () => {
  // MINOR mới của ghế 5 (panel v1.2.1): trước V122, bố/mẹ bằng hoặc
  // trẻ hơn người dùng chỉ nhận cảnh báo mềm và app vẫn sinh kết quả
  // vô nghĩa («bố 1 tuổi · 70 cái Tết nữa»). Nay là lỗi cứng.
  const ME = '1990-06-15'; // nữ 1990 — bộ dữ liệu chuẩn của ghế 5

  it('ca hợp lệ của ghế 5 (nữ 1990, bố 1960, mẹ 1963): không lỗi, không cảnh báo', () => {
    const v = validateInput(
      input({ myBirthDate: ME, mySex: 'female', fatherBirthYear: 1960, motherBirthYear: 1963 }),
      NOW,
    );
    expect(v.errors).toHaveLength(0);
    expect(v.warnings).toHaveLength(0);
  });

  it('bố sinh SAU người dùng (2025 vs 1990 — ca ghế 5) → lỗi cứng, không cảnh báo mềm', () => {
    const v = validateInput(input({ myBirthDate: ME, fatherBirthYear: 2025 }), NOW);
    expect(v.errors).toHaveLength(1);
    expect(v.errors[0]).toContain('của bố');
    expect(v.errors[0]).toContain('nhỏ hơn năm sinh của bạn (1990)');
    expect(v.warnings.some((w) => w.includes('bố'))).toBe(false);
  });

  it('bố sinh CÙNG năm người dùng (1990) → lỗi cứng', () => {
    const v = validateInput(input({ myBirthDate: ME, fatherBirthYear: 1990 }), NOW);
    expect(v.errors).toHaveLength(1);
    expect(v.errors[0]).toContain('của bố');
  });

  it('mẹ sinh CÙNG năm người dùng (1990) → lỗi cứng cho mẹ, bố hợp lệ không bị kéo theo', () => {
    const v = validateInput(
      input({ myBirthDate: ME, fatherBirthYear: 1960, motherBirthYear: 1990 }),
      NOW,
    );
    expect(v.errors).toHaveLength(1);
    expect(v.errors[0]).toContain('của mẹ');
  });

  it('mẹ sinh SAU người dùng (2001 vs 1990) → lỗi cứng', () => {
    const v = validateInput(input({ myBirthDate: ME, motherBirthYear: 2001 }), NOW);
    expect(v.errors).toHaveLength(1);
    expect(v.errors[0]).toContain('của mẹ');
  });

  it('bố sinh năm HIỆN TẠI (2026) → lỗi cứng kiểm chéo (không chỉ lỗi khoảng)', () => {
    const v = validateInput(input({ myBirthDate: ME, fatherBirthYear: 2026 }), NOW);
    expect(v.errors).toHaveLength(1);
    expect(v.errors[0]).toContain('nhỏ hơn năm sinh của bạn (1990)');
  });

  it('người dùng sinh năm hiện tại, bố cũng sinh năm hiện tại → lỗi cứng (gap = 0)', () => {
    const v = validateInput(input({ myBirthDate: '2026-01-15', fatherBirthYear: 2026 }), NOW);
    expect(v.errors).toHaveLength(1);
    expect(v.errors[0]).toContain('nhỏ hơn năm sinh của bạn (2026)');
  });

  it('bố lớn hơn con 1–14 tuổi vẫn chỉ là cảnh báo mềm (1979 vs 1990 = 11 tuổi)', () => {
    const v = validateInput(input({ myBirthDate: ME, fatherBirthYear: 1979 }), NOW);
    expect(v.errors).toHaveLength(0);
    expect(v.warnings.some((w) => w.includes('bố') && w.includes('11 tuổi'))).toBe(true);
  });

  it('chưa nhập ngày sinh của bạn → không kiểm chéo (giữ hành vi cũ)', () => {
    const v = validateInput(input({ fatherBirthYear: 2026, motherBirthYear: 2026 }), NOW);
    expect(v.errors).toHaveLength(0);
  });
});
