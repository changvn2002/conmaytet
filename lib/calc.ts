import { DAYS_PER_YEAR, SYNODIC_MONTH_DAYS } from './data';
import { remainingLifeExpectancy } from './life-table';
import { countTetDays, startOfDay } from './lunar';
import type { CalcResult, InputData, LifeGrid, ParentEstimate, Sex } from './types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Tuổi (năm, số lẻ) từ ngày sinh tới `now`. Trả NaN nếu ngày sinh không hợp lệ.
 * Ngày sinh ở tương lai → số âm (để tầng validate bắt).
 */
export function ageInYears(birth: Date, now: Date): number {
  return (startOfDay(now).getTime() - startOfDay(birth).getTime()) / (DAYS_PER_YEAR * MS_PER_DAY);
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
  const meetingsLeft = input.livesWithParents
    ? Math.floor(remainingYears * DAYS_PER_YEAR)
    : Math.floor(remainingYears * Math.max(0, input.visitsPerYear));
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
      if (myBirthYear - year < 15) {
        warnings.push(
          `${label} chỉ lớn hơn bạn ${myBirthYear - year} tuổi — nếu đúng là vậy thì cứ tiếp tục, còn không hãy kiểm tra lại năm sinh.`,
        );
      }
    }
  };
  checkParent(input.fatherBirthYear, 'bố');
  checkParent(input.motherBirthYear, 'mẹ');

  if (!input.livesWithParents && input.visitsPerYear <= 0) {
    warnings.push('Số lần về thăm đang là 0 — số lần gặp còn lại sẽ bằng 0.');
  }
  return { errors, warnings };
}
