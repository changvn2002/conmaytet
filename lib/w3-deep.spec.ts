/**
 * W3 — TEAM TEST: bộ test sâu độc lập cho app "Còn Mấy Cái Tết Nữa?"
 * (viết bởi W3, không sửa code app — test là bằng chứng).
 *
 * Bao phủ 5 mục theo nhiệm vụ:
 *  1. Fuzz năm sinh / ngày sinh biên (validateInput + calculate).
 *  2. Âm lịch dải rộng 1950–2050: roundtrip dương↔âm, ngày Tết 2024–2035
 *     đối chiếu DATA-VERIFIED.md mục 3, tháng nhuận.
 *  3. Ma trận share text mọi nhánh (lib/share-card.ts).
 *  4. Nhất quán số học: công thức số lần gặp, cận số Tết, tính đơn điệu.
 *  5. Đối chiếu bảng sống WHO Vietnam 2019 với DATA-VERIFIED.md mục 2.1
 *     + các mốc chuẩn trong nhiệm vụ (e0/e60/e65/e70/e75/e80).
 *
 * Quy ước: test có tiền tố [FINDING F*] là test ĐANG FAIL có chủ đích —
 * mỗi test như vậy là một finding có input tái hiện cụ thể (xem báo cáo
 * ~/workspace/mini-apps/test-findings/w3-conmaytet/SUMMARY.md).
 * Mọi test còn lại phải PASS.
 *
 * Ngày "hôm nay" cố định: 23/10/2026 (sau Tết 2026, trước Tết 2027),
 * trùng convention của lib/calc.spec.ts.
 */
import { describe, expect, it } from 'vitest';
import { ageInYears, calculate, parseBirthDate, validateInput } from './calc';
import { FEMALE_REMAINING, LIFE_EXPECTANCY_AT_BIRTH, MALE_REMAINING } from './data';
import { remainingLifeExpectancy } from './life-table';
import { countTetDays, lunarToSolar, solarToLunar, tetDate } from './lunar';
import { buildShareText } from './share-card';
import { loadInput, saveInput } from './storage';
import { EMPTY_INPUT, type InputData } from './types';

const NOW = new Date(2026, 9, 23);
const inp = (p: Partial<InputData>): InputData => ({ ...EMPTY_INPUT, ...p });
const nf = new Intl.NumberFormat('vi-VN');

/* ═══════════════ 1. FUZZ NĂM SINH / NGÀY SINH BIÊN ═══════════════ */

describe('W3-1 fuzz năm sinh bố/mẹ — validateInput là cổng chặn của UI', () => {
  it.each([
    [1900, 'lớn hơn 110'], // tuổi lịch 126 → lỗi tuổi
    [1915, 'lớn hơn 110'], // tuổi lịch 111 → lỗi tuổi
    [2027, '1900–2026'], // tương lai gần → lỗi khoảng
    [2035, '1900–2026'], // tương lai xa
    [2100, '1900–2026'], // mốc xa trong nhiệm vụ
    [1899, '1900–2026'], // dưới sàn
  ])('năm sinh bố %i → lỗi cứng thân thiện', (year, fragment) => {
    const v = validateInput(inp({ fatherBirthYear: year }), NOW);
    expect(v.errors.length).toBeGreaterThan(0);
    expect(v.errors.join(' ')).toContain(fragment);
  });

  it('năm sinh 1916 (đúng 110 tuổi theo năm lịch) và 2026 (0 tuổi) → không lỗi', () => {
    expect(validateInput(inp({ fatherBirthYear: 1916 }), NOW).errors).toHaveLength(0);
    expect(validateInput(inp({ motherBirthYear: 1916 }), NOW).errors).toHaveLength(0);
    expect(validateInput(inp({ fatherBirthYear: 2026 }), NOW).errors).toHaveLength(0);
    expect(validateInput(inp({ motherBirthYear: 2026 }), NOW).errors).toHaveLength(0);
  });

  it('năm sinh NaN / Infinity → lỗi cứng (không lọt qua cổng)', () => {
    for (const y of [NaN, Infinity, -Infinity]) {
      expect(validateInput(inp({ fatherBirthYear: y }), NOW).errors.length).toBeGreaterThan(0);
      expect(validateInput(inp({ motherBirthYear: y }), NOW).errors.length).toBeGreaterThan(0);
    }
  });

  it('calculate() trực tiếp với năm biên vẫn cho số hữu hạn, không âm, không crash (UI đã chặn bằng validate)', () => {
    for (const y of [1900, 1916, 2026, 2027, 2100]) {
      const r = calculate(inp({ fatherBirthYear: y, motherBirthYear: y }), NOW);
      for (const est of [r.father!, r.mother!]) {
        expect(Number.isFinite(est.remainingYears)).toBe(true);
        expect(est.tetsLeft).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(est.meetingsLeft)).toBe(true);
      }
    }
  });

  it('bố/mẹ sinh năm hiện tại (0 tuổi) tính xác định: tuổi 0, tetsLeft > 0', () => {
    const r = calculate(inp({ fatherBirthYear: 2026, motherBirthYear: 2026 }), NOW);
    expect(r.father!.currentAge).toBe(0);
    expect(r.mother!.currentAge).toBe(0);
    expect(r.father!.tetsLeft).toBeGreaterThan(0);
    expect(r.mother!.tetsLeft).toBeGreaterThan(0);
  });
});

describe('W3-1 fuzz ngày sinh của mình', () => {
  it.each([
    ['2026-10-24', 'tương lai'], // ngày mai
    ['2030-01-01', 'tương lai'], // tương lai xa
    ['2100-01-01', 'tương lai'],
    ['1906-01-01', 'lớn hơn 110'], // 120 tuổi
    ['1915-06-15', 'lớn hơn 110'], // 111 tuổi
    ['2026-02-30', 'chưa hợp lệ'], // 30/02 không tồn tại
    ['2023-02-29', 'chưa hợp lệ'], // 2023 không nhuận
    ['1900-02-29', 'chưa hợp lệ'], // 1900 không nhuận (quy tắc thế kỷ)
    ['1996-13-01', 'chưa hợp lệ'], // tháng 13
    ['0000-01-01', 'chưa hợp lệ'], // năm 0 — JS Date ánh xạ 0–99 → 19xx, parse phải loại
    ['not-a-date', 'chưa hợp lệ'],
    ['15/06/1996', 'chưa hợp lệ'], // sai định dạng ISO
  ])('ngày sinh %s → lỗi cứng', (birth, fragment) => {
    const v = validateInput(inp({ myBirthDate: birth }), NOW);
    expect(v.errors.length).toBeGreaterThan(0);
    expect(v.errors.join(' ')).toContain(fragment);
  });

  it('sinh hôm nay (0 tuổi) và 29/02 năm nhuận → hợp lệ, lưới đời người không NaN', () => {
    expect(validateInput(inp({ myBirthDate: '2026-10-23' }), NOW).errors).toHaveLength(0);
    expect(validateInput(inp({ myBirthDate: '2000-02-29' }), NOW).errors).toHaveLength(0);
    const r = calculate(inp({ myBirthDate: '2026-10-23' }), NOW);
    expect(r.life!.daysLived).toBe(0);
    expect(r.life!.percentLived).toBe(0);
    expect(r.life!.tetsExperienced).toBe(0);
    expect(Number.isFinite(r.life!.totalWeeks)).toBe(true);
  });

  it('parseBirthDate: biên tháng/ngày và định dạng', () => {
    expect(parseBirthDate('2000-02-29')).not.toBeNull();
    expect(parseBirthDate('1900-02-29')).toBeNull();
    expect(parseBirthDate('2026-04-31')).toBeNull();
    expect(parseBirthDate(' 1996-06-15 ')).not.toBeNull(); // trim khoảng trắng
    expect(parseBirthDate('1996-6-15')).toBeNull(); // bắt buộc 2 chữ số
  });

  it('[FINDING F3] sinh đúng ngày tròn 110 tuổi phải được chấp nhận (tuổi ≤ 110)', () => {
    // Tái hiện: NOW = 23/10/2026, sinh 23/10/1916 → đúng 110 tuổi 0 ngày.
    // ageInYears chia tổng số ngày cho 365,2425 → 110,0009 > 110 → bị loại oan.
    // Bố/mẹ cùng mốc 110 (luật hiệu số năm lịch) thì qua — hai tầng lệch nhau.
    const v = validateInput(inp({ myBirthDate: '1916-10-23' }), NOW);
    expect(v.errors).toHaveLength(0);
    expect(ageInYears(new Date(1916, 9, 23), NOW)).toBeLessThanOrEqual(110);
  });

  it('calculate() trực tiếp cho người 120 tuổi: lưới đời người vẫn hữu hạn (UI chặn ở validate)', () => {
    const r = calculate(inp({ myBirthDate: '1906-06-15', mySex: 'male' }), NOW);
    expect(r.life!.currentAgeYears).toBeGreaterThan(119);
    expect(Number.isFinite(r.life!.percentLived)).toBe(true);
    expect(r.life!.percentLived).toBeLessThanOrEqual(100);
    expect(r.life!.totalWeeks).toBeGreaterThan(r.life!.weeksLived);
    expect(r.life!.tetsExperienced).toBe(120);
  });
});

describe('W3-1 chênh lệch tuổi bố mẹ – con: <15 tuổi cảnh báo mềm; bằng/trẻ hơn con → lỗi cứng V122', () => {
  it('mẹ 10 tuổi khi sinh con → cảnh báo mềm, không lỗi, vẫn tính', () => {
    const v = validateInput(inp({ myBirthDate: '1996-06-15', motherBirthYear: 1986 }), NOW);
    expect(v.errors).toHaveLength(0);
    expect(v.warnings.some((w) => w.includes('mẹ') && w.includes('10 tuổi'))).toBe(true);
    const r = calculate(inp({ myBirthDate: '1996-06-15', motherBirthYear: 1986 }), NOW);
    expect(r.mother!.tetsLeft).toBeGreaterThan(0);
  });

  it('biên cảnh báo: lớn hơn con 14 tuổi → có cảnh báo; đúng 15 tuổi → không', () => {
    const v14 = validateInput(inp({ myBirthDate: '1996-06-15', motherBirthYear: 1982 }), NOW);
    expect(v14.warnings.some((w) => w.includes('mẹ'))).toBe(true);
    const v15 = validateInput(inp({ myBirthDate: '1996-06-15', motherBirthYear: 1981 }), NOW);
    expect(v15.warnings).toHaveLength(0);
  });

  it('[V122] bố bằng tuổi con → lỗi cứng kiểm chéo (trước V122 là cảnh báo mềm)', () => {
    // Panel v1.2.1 (ghế 5) nâng ca bằng/trẻ hơn con thành chặn cứng:
    // năm sinh bố/mẹ phải NHỎ HƠN năm sinh của người dùng, vi phạm
    // thì tầng UI không sinh kết quả cho người đó.
    const v = validateInput(inp({ myBirthDate: '1996-06-15', fatherBirthYear: 1996 }), NOW);
    expect(v.errors).toHaveLength(1);
    expect(v.errors[0]).toContain('nhỏ hơn năm sinh của bạn (1996)');
    expect(v.warnings.some((w) => w.includes('bố'))).toBe(false);
  });

  it('[V122] bố nhỏ tuổi hơn con → lỗi cứng kiểm chéo, không còn cảnh báo mềm', () => {
    const v = validateInput(inp({ myBirthDate: '1996-06-15', fatherBirthYear: 2000 }), NOW);
    expect(v.errors).toHaveLength(1);
    expect(v.errors[0]).toContain('của bố');
    expect(v.warnings.some((w) => w.includes('bố'))).toBe(false);
    // calculate() thuần toán không tự validate — cổng chặn là
    // validateInput (tầng component null-hoá phần có lỗi cứng).
    const r = calculate(inp({ myBirthDate: '1996-06-15', fatherBirthYear: 2000 }), NOW);
    expect(r.father!.currentAge).toBe(26);
  });

  it('[FINDING F6 → V122] bố NHỎ hơn con: thông báo lỗi không in số tuổi âm', () => {
    // Tái hiện gốc: con sinh 1996, bố sinh 2000 → app từng in
    // "bố chỉ lớn hơn bạn -4 tuổi". Nay ca này là lỗi cứng kiểm chéo
    // và thông báo không chứa diễn đạt tuổi âm nào.
    const v = validateInput(inp({ myBirthDate: '1996-06-15', fatherBirthYear: 2000 }), NOW);
    const err = v.errors.find((w) => w.includes('bố')) ?? '';
    expect(err).toContain('nhỏ hơn năm sinh của bạn');
    expect(err).not.toMatch(/lớn hơn bạn -\d/);
    expect(v.warnings.find((w) => w.includes('bố'))).toBeUndefined();
  });
});

describe('W3-1 fuzz số lần về thăm (visitsPerYear)', () => {
  it('visits = 0 → cảnh báo mềm + meetingsLeft = 0 (không lỗi chữ, không NaN)', () => {
    const v = validateInput(inp({ fatherBirthYear: 1961, visitsPerYear: 0 }), NOW);
    expect(v.errors).toHaveLength(0);
    expect(v.warnings.some((w) => w.includes('0'))).toBe(true);
    const r = calculate(inp({ fatherBirthYear: 1961, visitsPerYear: 0 }), NOW);
    expect(r.father!.meetingsLeft).toBe(0);
    expect(r.father!.tetsLeft).toBeGreaterThan(0);
  });

  it('visits âm → calculate kẹp về 0 lần gặp (Math.max(0, …)), không ra số âm', () => {
    for (const v of [-1, -100, -Infinity]) {
      const r = calculate(inp({ fatherBirthYear: 1961, visitsPerYear: v }), NOW);
      expect(r.father!.meetingsLeft).toBe(0);
    }
  });

  it('visits rất lớn (365, 10^6) → meetingsLeft hữu hạn, đúng công thức, không crash', () => {
    for (const v of [365, 1_000_000]) {
      const r = calculate(inp({ fatherBirthYear: 1961, visitsPerYear: v }), NOW);
      expect(r.father!.meetingsLeft).toBe(Math.floor(13.6 * v));
      expect(Number.isFinite(r.father!.meetingsLeft)).toBe(true);
    }
  });

  it('[FINDING F1a] visits = NaN không được sinh meetingsLeft = NaN và validate phải lên tiếng', () => {
    // Tái hiện: calculate({fatherBirthYear: 1961, visitsPerYear: NaN})
    //   → meetingsLeft = NaN; validateInput → errors=[] warnings=[] (im lặng).
    // UI thật được slider (0–24) + storage sanitize che chắn, nhưng tầng
    // lib/validate — nơi tài liệu gọi là cổng kiểm tra — không guard NaN.
    const r = calculate(inp({ fatherBirthYear: 1961, visitsPerYear: NaN }), NOW);
    expect(Number.isFinite(r.father!.meetingsLeft)).toBe(true);
    const v = validateInput(inp({ fatherBirthYear: 1961, visitsPerYear: NaN }), NOW);
    expect(v.errors.length + v.warnings.length).toBeGreaterThan(0);
  });

  it('[FINDING F1b] visits = Infinity không được sinh meetingsLeft = Infinity', () => {
    const r = calculate(inp({ fatherBirthYear: 1961, visitsPerYear: Infinity }), NOW);
    expect(Number.isFinite(r.father!.meetingsLeft)).toBe(true);
  });

  it('sống cùng bố mẹ: visits bị bỏ qua hoàn toàn (kể cả visits cực đoan)', () => {
    const r = calculate(
      inp({ fatherBirthYear: 1961, livesWithParents: true, visitsPerYear: 999 }),
      NOW,
    );
    expect(r.father!.meetingsLeft).toBe(Math.floor(13.6 * 365.2425));
  });
});

describe('W3-1 lớp storage sanitize (cổng thứ hai của UI) — stub localStorage', () => {
  const store = new Map<string, string>();
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
  };

  it('visits lưu 10^9 → nạp lại bị kẹp còn 365; visits NaN (JSON → null) → về mặc định 2', () => {
    saveInput(inp({ visitsPerYear: 1_000_000_000 }));
    expect(loadInput()!.visitsPerYear).toBe(365);
    saveInput(inp({ visitsPerYear: NaN }));
    expect(loadInput()!.visitsPerYear).toBe(2);
  });

  it('năm sinh ngoài 1900–2100 khi nạp → null; trong khoảng → giữ nguyên (làm tròn xuống)', () => {
    saveInput(inp({ fatherBirthYear: 1850, motherBirthYear: 2100 }));
    const loaded = loadInput()!;
    expect(loaded.fatherBirthYear).toBeNull();
    expect(loaded.motherBirthYear).toBe(2100); // validate sẽ chặn tiếp vì > năm hiện tại
    saveInput(inp({ fatherBirthYear: 1961.9 }));
    expect(loadInput()!.fatherBirthYear).toBe(1961);
  });

  it('giới tính lạ trong storage → unspecified; JSON hỏng → null, không crash', () => {
    saveInput(inp({ mySex: 'alien' as InputData['mySex'] }));
    expect(loadInput()!.mySex).toBe('unspecified');
    store.set('conmaytet:input:v1', '{hỏng json');
    expect(loadInput()).toBeNull();
  });
});

/* ═══════════════ 2. ÂM LỊCH DẢI RỘNG 1950–2050 ═══════════════ */

describe('W3-2 ngày Tết 2024–2035 đối chiếu DATA-VERIFIED.md mục 3', () => {
  const TRUTH: [number, number, number][] = [
    [2024, 10, 2],
    [2025, 29, 1],
    [2026, 17, 2],
    [2027, 6, 2],
    [2028, 26, 1],
    [2029, 13, 2],
    [2030, 2, 2],
    [2031, 23, 1],
    [2032, 11, 2],
    [2033, 31, 1],
    [2034, 19, 2],
    [2035, 8, 2],
  ];
  it.each(TRUTH)('Tết %i = %i/%i (2030 = 02/02 theo đa số 4/5 nguồn)', (y, d, m) => {
    const t = tetDate(y);
    expect([t.getFullYear(), t.getDate(), t.getMonth() + 1]).toEqual([y, d, m]);
    expect(solarToLunar(d, m, y)).toMatchObject({ day: 1, month: 1, year: y, leap: false });
  });
});

describe('W3-2 roundtrip dương → âm → dương phải khớp tuyệt đối', () => {
  it('lấy mẫu 5 ngày/tháng × 12 tháng × 101 năm (1950–2050) = 6.060 ngày', () => {
    let bad = 0;
    for (let y = 1950; y <= 2050; y++)
      for (let m = 1; m <= 12; m++)
        for (const d of [1, 8, 15, 22, 28]) {
          const l = solarToLunar(d, m, y);
          const s = lunarToSolar(l.day, l.month, l.year, l.leap);
          if (s.day !== d || s.month !== m || s.year !== y) bad++;
          expect(l.day).toBeGreaterThanOrEqual(1);
          expect(l.day).toBeLessThanOrEqual(30);
          expect(l.month).toBeGreaterThanOrEqual(1);
          expect(l.month).toBeLessThanOrEqual(12);
        }
    expect(bad).toBe(0);
  }, 60_000);

  it('mọi ngày trong 2 năm trọn: 2025 (có tháng 6 nhuận) và 2032', () => {
    for (const y of [2025, 2032]) {
      const start = new Date(y, 0, 1).getTime();
      for (let i = 0; i < 366; i++) {
        const dt = new Date(start + i * 86_400_000);
        if (dt.getFullYear() !== y) break;
        const l = solarToLunar(dt.getDate(), dt.getMonth() + 1, y);
        const s = lunarToSolar(l.day, l.month, l.year, l.leap);
        expect([s.day, s.month, s.year]).toEqual([dt.getDate(), dt.getMonth() + 1, y]);
      }
    }
  }, 60_000);

  it('roundtrip âm → dương → âm cho ngày thường và ngày rằm nhiều năm', () => {
    for (const ly of [1950, 1980, 2000, 2024, 2049]) {
      for (const lm of [1, 4, 8, 12]) {
        const s = lunarToSolar(15, lm, ly, false);
        expect(solarToLunar(s.day, s.month, s.year)).toMatchObject({
          day: 15,
          month: lm,
          year: ly,
          leap: false,
        });
      }
    }
  });
});

describe('W3-2 tháng nhuận trong dải 1950–2050', () => {
  /** Quét toàn bộ ngày dương thuộc năm âm `ly` để tìm tháng nhuận. */
  function leapMonthsOf(ly: number): number[] {
    const found = new Set<number>();
    const start = new Date(ly, 0, 1).getTime();
    for (let i = 0; i < 400; i++) {
      const dt = new Date(start + i * 86_400_000);
      const l = solarToLunar(dt.getDate(), dt.getMonth() + 1, dt.getFullYear());
      if (l.year === ly && l.leap) found.add(l.month);
    }
    return [...found];
  }

  it('mỗi năm âm 1950–2050 có tối đa MỘT tháng nhuận; năm nhuận thì roundtrip ngày nhuận khớp', () => {
    for (let ly = 1950; ly <= 2050; ly++) {
      const leaps = leapMonthsOf(ly);
      expect(leaps.length).toBeLessThanOrEqual(1);
      if (leaps.length === 1) {
        const s = lunarToSolar(10, leaps[0], ly, true);
        expect(solarToLunar(s.day, s.month, s.year)).toMatchObject({
          day: 10,
          month: leaps[0],
          year: ly,
          leap: true,
        });
      }
    }
  }, 120_000);

  it('2025 nhuận tháng 6 (mốc trong nhiệm vụ): 25/07/2025 DL = 01/06 nhuận ÂL, hai chiều', () => {
    expect(leapMonthsOf(2025)).toEqual([6]);
    expect(lunarToSolar(1, 6, 2025, true)).toEqual({ day: 25, month: 7, year: 2025 });
    expect(solarToLunar(25, 7, 2025)).toMatchObject({ day: 1, month: 6, year: 2025, leap: true });
    expect(lunarToSolar(15, 6, 2025, true)).toEqual({ day: 8, month: 8, year: 2025 });
  });

  it('2023 nhuận tháng 2 (roundtrip hai chiều khớp; DATA-VERIFIED không chứa mốc tháng nhuận — ghi nhận nguồn là tính nhất quán nội bộ + lịch VN phổ biến)', () => {
    expect(leapMonthsOf(2023)).toEqual([2]);
    expect(lunarToSolar(1, 2, 2023, true)).toEqual({ day: 22, month: 3, year: 2023 });
    expect(solarToLunar(22, 3, 2023)).toMatchObject({ day: 1, month: 2, year: 2023, leap: true });
  });

  it('2032: thuật toán KHÔNG có tháng nhuận nào (mốc "nhuận 2/2032" trong brief = UNKNOWN, không có nguồn trong DATA-VERIFIED)', () => {
    expect(leapMonthsOf(2032)).toEqual([]);
  });

  it('cờ nhuận sai tháng trong năm CÓ nhuận → sentinel {0,0,0} xác định, không crash', () => {
    expect(lunarToSolar(1, 3, 2025, true)).toEqual({ day: 0, month: 0, year: 0 });
    expect(lunarToSolar(1, 6, 2025, false)).not.toEqual({ day: 0, month: 0, year: 0 });
  });

  it('[FINDING F4] cờ nhuận ở năm KHÔNG nhuận phải bị từ chối (sentinel), không được lặng lẽ bỏ qua', () => {
    // Tái hiện: 2026 không có tháng nhuận nhưng lunarToSolar(1,6,2026,true)
    // trả {14,7,2026} — một ngày thật của tháng 6 thường — vì khối xử lý
    // nhuận bị bỏ qua khi b11 - a11 <= 365. Không nhất quán với năm nhuận.
    expect(lunarToSolar(1, 6, 2026, true)).toEqual({ day: 0, month: 0, year: 0 });
    expect(lunarToSolar(1, 1, 2026, true)).toEqual({ day: 0, month: 0, year: 0 });
  });

  it('ngày âm 30/31 vượt độ dài tháng: lăn sang tháng sau một cách xác định, không crash, không ngày 0/âm', () => {
    for (const [d, m, y] of [
      [30, 2, 2025],
      [31, 1, 2025],
      [31, 12, 2030],
    ] as const) {
      const s = lunarToSolar(d, m, y, false);
      expect(s.day).toBeGreaterThanOrEqual(1);
      expect(s.day).toBeLessThanOrEqual(31);
      expect(s.month).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('W3-2 bất biến cấu trúc ngày Tết 1950–2050', () => {
  it('khoảng cách hai Tết liên tiếp ∈ [354, 384] ngày; Tết luôn rơi 19/01–21/02', () => {
    let prev = tetDate(1950).getTime();
    for (let y = 1951; y <= 2050; y++) {
      const t = tetDate(y);
      const gap = Math.round((t.getTime() - prev) / 86_400_000);
      expect(gap).toBeGreaterThanOrEqual(354);
      expect(gap).toBeLessThanOrEqual(384);
      const inJan = t.getMonth() === 0 && t.getDate() >= 19;
      const inFeb = t.getMonth() === 1 && t.getDate() <= 21;
      expect(inJan || inFeb).toBe(true);
      prev = t.getTime();
    }
  });

  it('countTetDays: biên trái loại trừ, biên phải bao gồm (đúng ngày Tết)', () => {
    const tet26 = tetDate(2026); // 17/02/2026
    const dayBefore = new Date(2026, 1, 16);
    expect(countTetDays(dayBefore, tet26)).toBe(1); // toInclusive chứa Tết
    expect(countTetDays(tet26, new Date(2026, 11, 31))).toBe(0); // fromExclusive loại Tết
    expect(countTetDays(dayBefore, dayBefore)).toBe(0);
    expect(countTetDays(new Date(2030, 0, 1), new Date(2024, 0, 1))).toBe(0); // đảo ngược
  });
});

/* ═══════════════ 3. MA TRẬN SHARE TEXT ═══════════════ */

describe('W3-3 share text — mọi nhánh', () => {
  const BAN = ['undefined', 'NaN', 'Infinity', 'lần lần', 'ngày ngày', '[object', 'null'];

  function checkClean(text: string) {
    for (const b of BAN) expect(text).not.toContain(b);
    expect(text).toContain('conmaytet.vercel.app');
    // 2026-10-23 (redesign-v2): dòng miễn trừ trong share text đổi thành hai
    // câu theo COPY-DIET #15 — câu hai viết hoa đầu câu («Không phải dự đoán
    // cho bất kỳ ai.») nên kiểm trên bản lowercase; ý đồ kiểm chứng không
    // đổi: mọi nhánh share text đều phải chứa lời phủ định dự đoán.
    expect(text.toLowerCase()).toContain('không phải dự đoán');
  }

  it('đủ bố + mẹ, ở xa, visits = 2: số trong text khớp số tính được, đơn vị "lần"', () => {
    const input = inp({ fatherBirthYear: 1961, motherBirthYear: 1963, visitsPerYear: 2 });
    const r = calculate(input, NOW);
    const text = buildShareText(r, input);
    checkClean(text);
    expect(text).toContain(
      `Với bố (${r.father!.currentAge} tuổi): theo thống kê tuổi thọ trung bình, còn khoảng ${nf.format(r.father!.tetsLeft)} cái Tết — tương đương khoảng ${nf.format(r.father!.meetingsLeft)} lần gặp nữa`,
    );
    expect(text).toContain(
      `Với mẹ (${r.mother!.currentAge} tuổi): theo thống kê tuổi thọ trung bình, còn khoảng ${nf.format(r.mother!.tetsLeft)} cái Tết — tương đương khoảng ${nf.format(r.mother!.meetingsLeft)} lần gặp nữa`,
    );
    expect(text).not.toContain('ngày gặp');
  });

  it('sống cùng bố mẹ: đơn vị "ngày", số ngày khớp meetingsLeft (cả bố lẫn mẹ)', () => {
    const input = inp({ fatherBirthYear: 1961, motherBirthYear: 1963, livesWithParents: true });
    const r = calculate(input, NOW);
    const text = buildShareText(r, input);
    checkClean(text);
    expect(text).toContain(`${nf.format(r.father!.meetingsLeft)} ngày gặp nữa`);
    expect(text).toContain(`${nf.format(r.mother!.meetingsLeft)} ngày gặp nữa`);
    expect(text).not.toContain('lần gặp');
  });

  it('chỉ còn một phụ huynh: chỉ in đúng một dòng phụ huynh', () => {
    const onlyFather = buildShareText(
      calculate(inp({ fatherBirthYear: 1961 }), NOW),
      inp({ fatherBirthYear: 1961 }),
    );
    checkClean(onlyFather);
    expect(onlyFather).toContain('Với bố');
    expect(onlyFather).not.toContain('Với mẹ');

    const onlyMother = buildShareText(
      calculate(inp({ motherBirthYear: 1963 }), NOW),
      inp({ motherBirthYear: 1963 }),
    );
    checkClean(onlyMother);
    expect(onlyMother).toContain('Với mẹ');
    expect(onlyMother).not.toContain('Với bố');
  });

  it('visits = 0: text ghi 0 lần gặp, không lỗi chữ', () => {
    const input = inp({ fatherBirthYear: 1961, visitsPerYear: 0 });
    const text = buildShareText(calculate(input, NOW), input);
    checkClean(text);
    expect(text).toContain('0 lần gặp nữa');
  });

  it('visits rất lớn (365): số trong text định dạng vi-VN khớp meetingsLeft', () => {
    const input = inp({ fatherBirthYear: 1961, visitsPerYear: 365 });
    const r = calculate(input, NOW);
    const text = buildShareText(r, input);
    checkClean(text);
    expect(text).toContain(`${nf.format(r.father!.meetingsLeft)} lần gặp nữa`);
  });

  it('Tết còn lại = 0 (kết quả biên dựng trực tiếp): text vẫn đúng ngữ pháp, đủ số 0', () => {
    const zeroResult = {
      father: {
        currentAge: 110,
        remainingYears: 0.2,
        horizonDate: NOW,
        tetsLeft: 0,
        meetingsLeft: 0,
      },
      mother: null,
      life: null,
    } as Parameters<typeof buildShareText>[0];
    const text = buildShareText(zeroResult, inp({ visitsPerYear: 0 }));
    checkClean(text);
    expect(text).toContain('còn khoảng 0 cái Tết — tương đương khoảng 0 lần gặp nữa');
  });

  it('chỉ có lưới đời người (không bố mẹ): dòng % khớp số liệu, không dòng phụ huynh', () => {
    const input = inp({ myBirthDate: '1996-06-15', mySex: 'female' });
    const r = calculate(input, NOW);
    const text = buildShareText(r, input);
    checkClean(text);
    expect(text).not.toContain('Với bố');
    expect(text).not.toContain('Với mẹ');
    expect(text).toContain(
      `${nf.format(r.life!.weeksLived)} / ${nf.format(r.life!.totalWeeks)} tuần`,
    );
  });

  it('kết quả rỗng hoàn toàn: text vẫn sạch (tiêu đề + miễn trừ + URL), không crash', () => {
    const text = buildShareText(calculate(inp({}), NOW), inp({}));
    checkClean(text);
    expect(text).not.toContain('Với bố');
    expect(text).not.toContain('Còn mình');
  });

  it('hồi quy lỗi "lần lần": quét toàn ma trận nhánh × chế độ, không nhánh nào dính', () => {
    for (const lives of [true, false])
      for (const visits of [0, 1, 2, 24, 365])
        for (const combo of [
          { fatherBirthYear: 1961, motherBirthYear: 1963 },
          { fatherBirthYear: 1961 },
          { motherBirthYear: 1963 },
        ]) {
          const input = inp({ ...combo, livesWithParents: lives, visitsPerYear: visits });
          const text = buildShareText(calculate(input, NOW), input);
          checkClean(text);
        }
  });

  it('[FINDING F1c] share text sinh từ input visits = NaN không được chứa "NaN"', () => {
    // Hệ quả cuối chuỗi của F1a: meetingsLeft = NaN chảy thẳng vào text copy.
    const input = inp({ fatherBirthYear: 1961, visitsPerYear: NaN });
    const text = buildShareText(calculate(input, NOW), input);
    expect(text).not.toContain('NaN');
  });
});

/* ═══════════════ 4. NHẤT QUÁN SỐ HỌC ═══════════════ */

describe('W3-4 công thức số lần gặp — khớp công bố trong FAQ/phương pháp', () => {
  it('không sống cùng: meetingsLeft = floor(remainingYears × visitsPerYear) trên lưới tuổi × nhịp về', () => {
    for (const year of [1930, 1946, 1961, 1980, 2000, 2020]) {
      for (const visits of [0, 1, 2, 3, 7, 12, 24]) {
        const rf = calculate(inp({ fatherBirthYear: year, visitsPerYear: visits }), NOW);
        expect(rf.father!.meetingsLeft).toBe(Math.floor(rf.father!.remainingYears * visits));
        const rm = calculate(inp({ motherBirthYear: year, visitsPerYear: visits }), NOW);
        expect(rm.mother!.meetingsLeft).toBe(Math.floor(rm.mother!.remainingYears * visits));
      }
    }
  });

  it('sống cùng: meetingsLeft = floor(remainingYears × 365,2425) ngày', () => {
    for (const year of [1930, 1961, 1990, 2020]) {
      const r = calculate(inp({ fatherBirthYear: year, livesWithParents: true }), NOW);
      expect(r.father!.meetingsLeft).toBe(Math.floor(r.father!.remainingYears * 365.2425));
    }
  });

  it('tăng visits không đổi tetsLeft; horizonDate = now + remainingYears (sai số < 1 ngày)', () => {
    const a = calculate(inp({ fatherBirthYear: 1961, visitsPerYear: 1 }), NOW);
    const b = calculate(inp({ fatherBirthYear: 1961, visitsPerYear: 24 }), NOW);
    expect(a.father!.tetsLeft).toBe(b.father!.tetsLeft);
    const expectedMs = NOW.getTime() + a.father!.remainingYears * 365.2425 * 86_400_000;
    expect(Math.abs(a.father!.horizonDate.getTime() - expectedMs)).toBeLessThan(1000);
  });
});

describe('W3-4 cận số Tết còn lại', () => {
  it('cận đúng theo phương pháp đếm: tetsLeft ≤ floor(remainingYears) + 2 trên lưới dày', () => {
    // +2 (không phải +1): khoảng (now, horizon] có thể chứa cả Tết ngay
    // sau now lẫn Tết rơi đúng ngày horizon sau ~35 chu kỳ âm lịch lệch
    // pha — xem test tái hiện F5 ngay dưới.
    const nows = [
      new Date(2026, 0, 1),
      new Date(2026, 1, 16),
      new Date(2026, 1, 17),
      new Date(2026, 9, 23),
      new Date(2026, 11, 31),
    ];
    for (const now of nows)
      for (let age = 0; age <= 110; age++)
        for (const key of ['fatherBirthYear', 'motherBirthYear'] as const) {
          const r = calculate(inp({ [key]: now.getFullYear() - age }), now);
          const est = key === 'fatherBirthYear' ? r.father! : r.mother!;
          expect(est.tetsLeft).toBeLessThanOrEqual(Math.floor(est.remainingYears) + 2);
          expect(est.tetsLeft).toBeGreaterThanOrEqual(
            Math.max(0, Math.floor(est.remainingYears) - 1),
          );
        }
  }, 120_000);

  it('[F5 — kỳ vọng đã đính chính] cận đúng tại ca biên horizon rơi đúng ngày Tết là floor(remainingYears) + 2', () => {
    // Tái hiện duy nhất trong 59.130 tổ hợp quét (mọi ngày 2026 × tuổi
    // 20–100 × 2 phụ huynh): now = 16/02/2026, bố sinh 1988 (38 tuổi,
    // remaining = 34,932 năm) → horizon = 21/01/2061 ĐÚNG ngày Tết 2061.
    // Đếm tay độc lập (test dưới) xác nhận 36 cái Tết đều thật trong
    // khoảng → app đếm ĐÚNG theo phương pháp công bố; bất đẳng thức +1
    // trong bản gốc của test này là cận sai ở ca biên. Đính chính
    // 2026-10-23 (parent, theo phân tích của W3 + xác nhận của Team Fix):
    // cận đúng là floor(remainingYears) + 2 — khớp test lưới ở trên.
    const now = new Date(2026, 1, 16);
    const r = calculate(inp({ fatherBirthYear: 1988 }), now);
    expect(r.father!.tetsLeft).toBe(36);
    expect(r.father!.tetsLeft).toBeLessThanOrEqual(Math.floor(r.father!.remainingYears) + 2);
  });

  it('bằng chứng đếm tay cho ca F5: liệt kê Tết 2026–2061 đều nằm trong (now, horizon]', () => {
    const now = new Date(2026, 1, 16);
    const r = calculate(inp({ fatherBirthYear: 1988 }), now);
    expect(tetDate(2061).toDateString()).toBe(r.father!.horizonDate.toDateString());
    let manual = 0;
    for (let y = 2024; y <= 2063; y++) {
      const t = tetDate(y).getTime();
      if (t > now.getTime() && t <= r.father!.horizonDate.getTime()) manual++;
    }
    expect(manual).toBe(36);
    expect(countTetDays(now, r.father!.horizonDate)).toBe(36);
  });
});

describe('W3-4 tính đơn điệu: tuổi phụ huynh tăng 1 → số Tết không tăng', () => {
  const NOWS = [
    new Date(2026, 0, 5),
    new Date(2026, 1, 17),
    new Date(2026, 9, 23),
    new Date(2027, 0, 1),
  ];

  it('đơn điệu không tăng trên tuổi 2–110 tại 4 thời điểm now khác nhau', () => {
    for (const now of NOWS)
      for (const key of ['fatherBirthYear', 'motherBirthYear'] as const) {
        let prev = Infinity;
        for (let age = 2; age <= 110; age++) {
          const r = calculate(inp({ [key]: now.getFullYear() - age }), now);
          const est = key === 'fatherBirthYear' ? r.father! : r.mother!;
          expect(est.tetsLeft).toBeLessThanOrEqual(prev);
          prev = est.tetsLeft;
        }
      }
  }, 60_000);

  it('ghi nhận ngoại lệ dữ liệu ở tuổi 0→1 (bảng WHO: e_1 > e_0 nên horizon của trẻ 1 tuổi dài hơn)', () => {
    // Không phải lỗi code: e_0 nữ = 78,11 < e_1 nữ = 78,17 trong chính
    // bảng nguồn. Tại now = 01/01/2027, mẹ 0 tuổi → 78 Tết, 1 tuổi → 79 Tết.
    const now = new Date(2027, 0, 1);
    const age0 = calculate(inp({ motherBirthYear: 2027 }), now).mother!;
    const age1 = calculate(inp({ motherBirthYear: 2026 }), now).mother!;
    expect(age0.remainingYears).toBeCloseTo(78.11, 2);
    expect(age1.remainingYears).toBeCloseTo(78.17, 2);
    expect([age0.tetsLeft, age1.tetsLeft]).toEqual([78, 79]);
  });

  it('remainingYears của phụ huynh khớp tra bảng theo tuổi năm lịch (sai số ±1 đã công bố)', () => {
    const r = calculate(inp({ fatherBirthYear: 1961, motherBirthYear: 1961 }), NOW);
    expect(r.father!.currentAge).toBe(65);
    expect(r.father!.remainingYears).toBe(remainingLifeExpectancy(65, 'male'));
    expect(r.mother!.remainingYears).toBe(remainingLifeExpectancy(65, 'female'));
  });
});

/* ═══════════════ 5. ĐỐI CHIẾU BẢNG SỐNG VỚI DATA-VERIFIED ═══════════════ */

describe('W3-5 bảng sống trong code = bảng WHO Vietnam 2019 (DATA-VERIFIED mục 2.1 + mốc nhiệm vụ)', () => {
  // Toàn bộ mốc chép từ Phụ lục A1/A2 (WHO 2020) như ghi trong lib/data.ts;
  // các mốc 60/65/70/75/80 + e0 được kiểm chứng độc lập bởi DATA-VERIFIED
  // và danh sách mốc chuẩn trong nhiệm vụ W3.
  const EXPECTED_MALE: [number, number][] = [
    [0, 69.56],
    [1, 69.8],
    [5, 66.17],
    [10, 61.25],
    [15, 56.37],
    [20, 51.65],
    [25, 47.02],
    [30, 42.35],
    [35, 37.68],
    [40, 33.1],
    [45, 28.66],
    [50, 24.45],
    [55, 20.51],
    [60, 16.88],
    [65, 13.6],
    [70, 10.68],
    [75, 8.21],
    [80, 6.12],
    [85, 4.44],
  ];
  const EXPECTED_FEMALE: [number, number][] = [
    [0, 78.11],
    [1, 78.17],
    [5, 74.38],
    [10, 69.43],
    [15, 64.51],
    [20, 59.62],
    [25, 54.73],
    [30, 49.86],
    [35, 45.0],
    [40, 40.2],
    [45, 35.47],
    [50, 30.85],
    [55, 26.36],
    [60, 22.03],
    [65, 17.92],
    [70, 14.1],
    [75, 10.69],
    [80, 7.76],
    [85, 5.43],
  ];

  it('toàn bộ 19 mốc × 2 giới trong lib/data.ts khớp số gốc từng mốc', () => {
    expect(MALE_REMAINING).toEqual(EXPECTED_MALE.map(([age, years]) => ({ age, years })));
    expect(FEMALE_REMAINING).toEqual(EXPECTED_FEMALE.map(([age, years]) => ({ age, years })));
  });

  it.each(EXPECTED_MALE)('tra bảng nam tại mốc %i = %f', (age, years) => {
    expect(remainingLifeExpectancy(age, 'male')).toBeCloseTo(years, 10);
  });
  it.each(EXPECTED_FEMALE)('tra bảng nữ tại mốc %i = %f', (age, years) => {
    expect(remainingLifeExpectancy(age, 'female')).toBeCloseTo(years, 10);
  });

  it('mốc chuẩn nhiệm vụ: e60 M 16,88/F 22,03 · e65 13,60/17,92 · e70 10,68/14,10 · e75 8,21/10,69 · e80 6,12/7,76', () => {
    const std: [number, number, number][] = [
      [60, 16.88, 22.03],
      [65, 13.6, 17.92],
      [70, 10.68, 14.1],
      [75, 8.21, 10.69],
      [80, 6.12, 7.76],
    ];
    for (const [age, m, f] of std) {
      expect(remainingLifeExpectancy(age, 'male')).toBeCloseTo(m, 2);
      expect(remainingLifeExpectancy(age, 'female')).toBeCloseTo(f, 2);
    }
  });

  it('khớp DATA-VERIFIED 2.1 ở độ chính xác 1 chữ số thập phân (16,9/22,0 · 13,6/17,9 · 10,7/14,1 · 8,2/10,7 · 6,1/7,8)', () => {
    const round1 = (n: number) => Math.round(n * 10) / 10;
    const dv: [number, number, number][] = [
      [60, 16.9, 22.0],
      [65, 13.6, 17.9],
      [70, 10.7, 14.1],
      [75, 8.2, 10.7],
      [80, 6.1, 7.8],
    ];
    for (const [age, m, f] of dv) {
      expect(round1(remainingLifeExpectancy(age, 'male'))).toBeCloseTo(m, 6);
      expect(round1(remainingLifeExpectancy(age, 'female'))).toBeCloseTo(f, 6);
    }
  });

  it('e0: hằng số khi sinh 73,7 chung / 69,6 nam / 78,1 nữ — và tra bảng 0 tuổi làm tròn về đúng các số đó', () => {
    expect(LIFE_EXPECTANCY_AT_BIRTH).toEqual({ both: 73.7, male: 69.6, female: 78.1 });
    expect(Math.round(remainingLifeExpectancy(0, 'male') * 10) / 10).toBe(69.6);
    expect(Math.round(remainingLifeExpectancy(0, 'female') * 10) / 10).toBe(78.1);
  });

  it('nội suy tuyến tính: trung điểm mọi đoạn 5 tuổi = trung bình cộng hai đầu mốc', () => {
    for (const table of [EXPECTED_MALE, EXPECTED_FEMALE]) {
      const sex = table === EXPECTED_MALE ? 'male' : 'female';
      for (let i = 1; i < table.length; i++) {
        const [a0, y0] = table[i - 1];
        const [a1, y1] = table[i];
        if (a1 - a0 !== 5) continue;
        expect(remainingLifeExpectancy((a0 + a1) / 2, sex)).toBeCloseTo((y0 + y1) / 2, 10);
      }
    }
    // Đoạn 0→1 và 1→5 cũng tuyến tính theo đúng hai đầu mốc.
    expect(remainingLifeExpectancy(0.5, 'male')).toBeCloseTo((69.56 + 69.8) / 2, 10);
    expect(remainingLifeExpectancy(3, 'female')).toBeCloseTo((78.17 + 74.38) / 2, 10);
  });

  it('biên bảng: tuổi > 85 dùng e_85; tuổi âm kẹp về e_0; unspecified = trung bình hai bảng', () => {
    expect(remainingLifeExpectancy(86, 'male')).toBeCloseTo(4.44, 10);
    expect(remainingLifeExpectancy(120, 'female')).toBeCloseTo(5.43, 10);
    expect(remainingLifeExpectancy(-3, 'female')).toBeCloseTo(78.11, 10);
    for (const age of [0, 37, 60, 85, 100]) {
      expect(remainingLifeExpectancy(age, 'unspecified')).toBeCloseTo(
        (remainingLifeExpectancy(age, 'male') + remainingLifeExpectancy(age, 'female')) / 2,
        10,
      );
    }
  });

  it('tính chất bảng: từ tuổi 1 trở đi e_x giảm nghiêm ngặt theo tuổi (cả hai giới)', () => {
    for (const table of [MALE_REMAINING, FEMALE_REMAINING]) {
      for (let i = 2; i < table.length; i++) {
        expect(table[i].years).toBeLessThan(table[i - 1].years);
      }
    }
    // Ngoại lệ duy nhất của bảng nguồn: e_1 > e_0 (cả hai giới).
    expect(MALE_REMAINING[1].years).toBeGreaterThan(MALE_REMAINING[0].years);
    expect(FEMALE_REMAINING[1].years).toBeGreaterThan(FEMALE_REMAINING[0].years);
  });
});
