import { DAYS_PER_YEAR, SYNODIC_MONTH_DAYS } from './data';
import { remainingLifeExpectancy } from './life-table';
import { countTetDays, startOfDay } from './lunar';
import type { CalcResult, InputData, LifeGrid, ParentEstimate, Sex } from './types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Tuổi (năm, số lẻ) từ ngày sinh tới `now`, tính theo LỊCH: số tuổi tròn
 * cộng phần lẻ = số ngày đã qua kể từ sinh nhật gần nhất / độ dài năm tuổi
 * hiện tại. Trả NaN nếu ngày sinh không hợp lệ.
 * Ngày sinh ở tương lai → số âm (để tầng validate bắt).
 *
 * Không chia tổng số ngày cho 365,2425: cách đó cho 110,0009 vào đúng ngày
 * tròn 110 tuổi nên bị validate báo ">110" oan (finding W3-F3) và lệch với
 * tầng bố/mẹ vốn dùng hiệu số năm lịch. Theo lịch, đúng ngày sinh nhật thì
 * tuổi là số nguyên chính xác.
 */
export function ageInYears(birth: Date, now: Date): number {
  const b = startOfDay(birth);
  const n = startOfDay(now);
  let years = n.getFullYear() - b.getFullYear();
  const anniversary = new Date(b);
  anniversary.setFullYear(b.getFullYear() + years);
  if (anniversary.getTime() > n.getTime()) {
    years -= 1;
    anniversary.setFullYear(b.getFullYear() + years);
  }
  const nextAnniversary = new Date(anniversary);
  nextAnniversary.setFullYear(anniversary.getFullYear() + 1);
  const spanMs = nextAnniversary.getTime() - anniversary.getTime();
  const fraction = spanMs > 0 ? (n.getTime() - anniversary.getTime()) / spanMs : 0;
  return years + fraction;
}

/** Parse 'yyyy-mm-dd' thành Date địa phương; null nếu không hợp lệ. */
export function parseBirthDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

function parentEstimate(birthYear: number, sex: Sex, input: InputData, now: Date): ParentEstimate {
  // Chỉ biết năm sinh → tuổi theo năm lịch (sai số ±1, ghi rõ ở UI/phương pháp).
  const currentAge = now.getFullYear() - birthYear;
  const remainingYears = remainingLifeExpectancy(currentAge, sex);
  const horizonDate = new Date(now.getTime() + remainingYears * DAYS_PER_YEAR * MS_PER_DAY);
  const tetsLeft = countTetDays(now, horizonDate);
  // visitsPerYear không hữu hạn (NaN/±Infinity) → chuẩn hoá về 0 lần gặp.
  // Tầng lib tự bảo vệ, không phụ thuộc UI (slider) hay storage chặn hộ —
  // nếu không, NaN chảy thẳng vào kết quả và share text (finding W3-F1).
  const safeVisits = Number.isFinite(input.visitsPerYear) ? Math.max(0, input.visitsPerYear) : 0;
  const meetingsLeft = input.livesWithParents
    ? Math.floor(remainingYears * DAYS_PER_YEAR)
    : Math.floor(remainingYears * safeVisits);
  return { currentAge, remainingYears, horizonDate, tetsLeft, meetingsLeft };
}

function lifeGrid(birth: Date, sex: Sex, now: Date): LifeGrid {
  const daysLived = Math.max(
    0,
    Math.floor((startOfDay(now).getTime() - startOfDay(birth).getTime()) / MS_PER_DAY),
  );
  const currentAgeYears = daysLived / DAYS_PER_YEAR;
  const remaining = remainingLifeExpectancy(currentAgeYears, sex);
  const expectedLifespanYears = currentAgeYears + remaining;
  const weeksLived = Math.floor(daysLived / 7);
  const totalWeeks = Math.max(weeksLived, Math.round(expectedLifespanYears * (DAYS_PER_YEAR / 7)));
  return {
    currentAgeYears,
    expectedLifespanYears,
    daysLived,
    weeksLived,
    totalWeeks,
    percentLived: totalWeeks > 0 ? Math.min(100, (weeksLived / totalWeeks) * 100) : 0,
    fullMoons: Math.floor(daysLived / SYNODIC_MONTH_DAYS),
    tetsExperienced: countTetDays(birth, now),
  };
}

/**
 * Tính toàn bộ kết quả cho một bộ input. `now` được truyền vào để test
 * dùng ngày cố định. Phần nào thiếu dữ liệu đầu vào thì trả null phần đó.
 */
export function calculate(input: InputData, now: Date): CalcResult {
  const birth = input.myBirthDate ? parseBirthDate(input.myBirthDate) : null;
  return {
    father:
      input.fatherBirthYear != null
        ? parentEstimate(input.fatherBirthYear, 'male', input, now)
        : null,
    mother:
      input.motherBirthYear != null
        ? parentEstimate(input.motherBirthYear, 'female', input, now)
        : null,
    life: birth ? lifeGrid(birth, input.mySex, now) : null,
  };
}

export interface Validation {
  /** Lỗi cứng — không tính kết quả khi có. */
  errors: string[];
  /** Cảnh báo mềm — vẫn tính, hiển thị để người dùng biết. */
  warnings: string[];
}

/**
 * Validate input theo quy tắc của app:
 * - Ngày sinh của bạn: không ở tương lai, tuổi ≤ 110.
 * - Năm sinh bố/mẹ: 1900 → năm hiện tại, tuổi ≤ 110.
 * - Bố/mẹ lớn hơn con dưới 15 tuổi → cảnh báo mềm (vẫn tính).
 * - Số lần về thăm phải là số hữu hạn (khi không sống cùng bố mẹ).
 */
export function validateInput(input: InputData, now: Date): Validation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const thisYear = now.getFullYear();

  let myAge: number | null = null;
  if (input.myBirthDate) {
    const birth = parseBirthDate(input.myBirthDate);
    if (!birth) {
      errors.push('Ngày sinh của bạn chưa hợp lệ.');
    } else {
      myAge = ageInYears(birth, now);
      if (myAge < 0) errors.push('Ngày sinh của bạn đang ở tương lai.');
      else if (myAge > 110)
        errors.push('Tuổi của bạn đang lớn hơn 110 — hãy kiểm tra lại năm sinh.');
    }
  }

  const checkParent = (year: number | null, label: string) => {
    if (year == null) return;
    if (!Number.isFinite(year) || year < 1900 || year > thisYear) {
      errors.push(`Năm sinh của ${label} phải trong khoảng 1900–${thisYear}.`);
      return;
    }
    const age = thisYear - year;
    if (age > 110) {
      errors.push(`Tuổi của ${label} đang lớn hơn 110 — hãy kiểm tra lại năm sinh.`);
      return;
    }
    if (myAge != null) {
      const myBirthYear = Number(input.myBirthDate.slice(0, 4));
      const gap = myBirthYear - year;
      if (gap < 15) {
        // Diễn đạt theo đúng dấu của hiệu số: phụ huynh có thể bằng tuổi
        // hoặc NHỎ hơn con (năm sinh nhập nhầm) — không in "lớn hơn bạn
        // -4 tuổi" (finding W3-F6).
        const relation =
          gap > 0
            ? `chỉ lớn hơn bạn ${gap} tuổi`
            : gap === 0
              ? 'bằng tuổi bạn'
              : `còn nhỏ hơn bạn ${-gap} tuổi`;
        warnings.push(
          `${label} ${relation} — nếu đúng là vậy thì cứ tiếp tục, còn không hãy kiểm tra lại năm sinh.`,
        );
      }
    }
  };
  checkParent(input.fatherBirthYear, 'bố');
  checkParent(input.motherBirthYear, 'mẹ');

  if (!input.livesWithParents && !Number.isFinite(input.visitsPerYear)) {
    // NaN/±Infinity không phải một nhịp về thăm hợp lệ — validate phải lên
    // tiếng thay vì im lặng để NaN chảy xuống kết quả (finding W3-F1).
    // (Khi sống cùng bố mẹ, visitsPerYear bị bỏ qua hoàn toàn nên không kiểm.)
    errors.push('Số lần về thăm mỗi năm chưa hợp lệ — hãy nhập một số cụ thể.');
  }
  if (!input.livesWithParents && input.visitsPerYear <= 0) {
    warnings.push('Số lần về thăm đang là 0 — số lần gặp còn lại sẽ bằng 0.');
  }
  return { errors, warnings };
}
