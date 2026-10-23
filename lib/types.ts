/**
 * Kiểu dữ liệu lõi của "Còn Mấy Cái Tết Nữa?".
 *
 * Mọi con số trong app là ƯỚC TÍNH THỐNG KÊ từ bảng tuổi thọ dân số
 * (xem lib/data.ts) — không phải dự đoán cho bất kỳ cá nhân nào.
 */

/** Giới tính dùng để tra bảng tuổi thọ. 'unspecified' = trung bình hai bảng nam/nữ. */
export type Sex = 'male' | 'female' | 'unspecified';

/** Dữ liệu người dùng nhập — được lưu vào localStorage (lib/storage.ts). */
export interface InputData {
  /** Ngày sinh của bạn, ISO 'yyyy-mm-dd'. Rỗng = chưa nhập. */
  myBirthDate: string;
  mySex: Sex;
  /** Năm sinh của bố — null = bỏ qua. */
  fatherBirthYear: number | null;
  /** Năm sinh của mẹ — null = bỏ qua. */
  motherBirthYear: number | null;
  /** Số lần về thăm bố mẹ mỗi năm (khi không sống cùng). */
  visitsPerYear: number;
  /** Đang sống cùng bố mẹ — khi đó "số lần gặp" được tính theo ngày. */
  livesWithParents: boolean;
}

export const EMPTY_INPUT: InputData = {
  myBirthDate: '',
  mySex: 'unspecified',
  fatherBirthYear: null,
  motherBirthYear: null,
  visitsPerYear: 2,
  livesWithParents: false,
};

/** Kết quả ước tính cho một người (bố hoặc mẹ). */
export interface ParentEstimate {
  /** Tuổi hiện tại (năm sinh chỉ biết theo năm nên tuổi có sai số ±1). */
  currentAge: number;
  /** Tuổi thọ kỳ vọng còn lại (năm, số lẻ) theo bảng tuổi thọ. */
  remainingYears: number;
  /** Ngày ước tính cuối khoảng kỳ vọng = hôm nay + remainingYears. */
  horizonDate: Date;
  /** Số mùng 1 Tết Nguyên Đán còn lại trong khoảng (hôm nay, horizonDate]. */
  tetsLeft: number;
  /**
   * Số lần gặp còn lại ước tính.
   * - Không sống cùng: floor(remainingYears × visitsPerYear).
   * - Sống cùng: số ngày còn lại (gặp nhau mỗi ngày), UI hiển thị khác.
   */
  meetingsLeft: number;
}

/** Lưới tuần cuộc đời của chính người dùng. */
export interface LifeGrid {
  /** Tuổi hiện tại, số lẻ (từ ngày sinh tới hôm nay). */
  currentAgeYears: number;
  /** Tuổi thọ kỳ vọng tổng (tuổi hiện tại + số năm còn lại kỳ vọng). */
  expectedLifespanYears: number;
  /** Số ngày đã sống. */
  daysLived: number;
  /** Số tuần đã sống (trọn tuần). */
  weeksLived: number;
  /** Tổng số tuần kỳ vọng của cả đời (làm tròn). */
  totalWeeks: number;
  /** Phần trăm đời người đã qua theo kỳ vọng thống kê, 0–100. */
  percentLived: number;
  /** Số lần trăng tròn xấp xỉ đã trôi qua (ngày đã sống / 29,53059). */
  fullMoons: number;
  /** Số cái Tết bạn đã trải qua (mùng 1 Tết sau ngày sinh, tính tới hôm nay). */
  tetsExperienced: number;
}

/** Toàn bộ kết quả tính cho một bộ input hợp lệ. */
export interface CalcResult {
  /** null khi người dùng chưa nhập năm sinh cho người đó. */
  father: ParentEstimate | null;
  mother: ParentEstimate | null;
  /** null khi chưa nhập ngày sinh của bạn. */
  life: LifeGrid | null;
}
