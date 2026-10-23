import { EMPTY_INPUT, type InputData, type Sex } from './types';

/**
 * Lưu dữ liệu nhập của người dùng vào localStorage của trình duyệt để lần
 * mở sau còn nguyên. App không có backend — không có gì rời khỏi máy này.
 */
const STORAGE_KEY = 'conmaytet:input:v1';

export function loadInput(): InputData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return sanitize(parsed as Partial<InputData>);
  } catch {
    return null;
  }
}

export function saveInput(input: InputData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
  } catch {
    // localStorage bị chặn (ẩn danh/quá dung lượng) — app vẫn chạy trong
    // phiên hiện tại, chỉ không nhớ qua lần mở sau.
  }
}

export function clearInput(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Bỏ qua: không có gì để xoá khi storage bị chặn.
  }
}

function sanitize(v: Partial<InputData>): InputData {
  const sex: Sex = v.mySex === 'male' || v.mySex === 'female' ? v.mySex : 'unspecified';
  const year = (n: unknown) =>
    typeof n === 'number' && Number.isFinite(n) && n >= 1900 && n <= 2100 ? Math.floor(n) : null;
  const visits =
    typeof v.visitsPerYear === 'number' && Number.isFinite(v.visitsPerYear)
      ? Math.min(365, Math.max(0, Math.floor(v.visitsPerYear)))
      : EMPTY_INPUT.visitsPerYear;
  return {
    myBirthDate: typeof v.myBirthDate === 'string' ? v.myBirthDate : '',
    mySex: sex,
    fatherBirthYear: year(v.fatherBirthYear),
    motherBirthYear: year(v.motherBirthYear),
    visitsPerYear: visits,
    livesWithParents: v.livesWithParents === true,
  };
}
