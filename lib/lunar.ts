/**
 * Âm lịch Việt Nam theo thuật toán của Hồ Ngọc Đức (múi giờ UTC+7) —
 * triển khai chuẩn từ thuật toán công bố rộng rãi (amlich của Hồ Ngọc Đức),
 * KHÔNG hardcode danh sách ngày Tết: mọi ngày âm lịch đều được tính.
 *
 * Kiểm chứng (test lib/lunar.spec.ts) với ground truth đã verify độc lập
 * (~/workspace/mini-apps/conmaytet-launch/DATA-VERIFIED.md mục 3, nguồn gốc:
 * Wikipedia tiếng Việt "Tết Nguyên Đán", tính theo giờ Hà Nội UTC+7):
 * mùng 1 Tết 2024–2035 = 10/02/2024, 29/01/2025, 17/02/2026, 06/02/2027,
 * 26/01/2028, 13/02/2029, 02/02/2030, 23/01/2031, 11/02/2032, 31/01/2033,
 * 19/02/2034, 08/02/2035. (Riêng 2030: một nguồn ngoài ghi 03/02, đa số
 * 4/5 nguồn + Wikipedia cho 02/02 — thuật toán này cho 02/02.)
 *
 * Mọi Date ở đây là ngày dương lịch địa phương (chỉ dùng phần năm/tháng/ngày).
 */

export const VIETNAM_TZ = 7;

const INT = (x: number) => Math.floor(x);

/** Số ngày Julius từ ngày dương lịch (công thức chuẩn của thuật toán). */
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
}

/** Đổi số ngày Julius về ngày dương lịch {day, month, year}. */
export function jdToDate(jd: number): { day: number; month: number; year: number } {
  let a: number, b: number, c: number;
  if (jd > 2299160) {
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = INT((4 * c + 3) / 1461);
  const e = c - INT((1461 * d) / 4);
  const m = INT((5 * e + 2) / 153);
  const day = e - INT((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * INT(m / 10);
  const year = b * 100 + d - 4800 + INT(m / 10);
  return { day, month, year };
}

/** Ngày sóc (trăng mới) thứ k kể từ 01/01/1900. */
function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  const C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
    0.0021 * Math.sin(2 * dr * M) -
    0.4068 * Math.sin(Mpr * dr) +
    0.0161 * Math.sin(2 * dr * Mpr) -
    0.0004 * Math.sin(3 * dr * Mpr) -
    0.0104 * Math.sin(2 * dr * F) -
    0.0051 * Math.sin((M + Mpr) * dr) -
    0.0074 * Math.sin((M - Mpr) * dr) +
    0.0004 * Math.sin((2 * F + M) * dr) -
    0.0004 * Math.sin((2 * F - M) * dr) -
    0.0006 * Math.sin((2 * F + Mpr) * dr) +
    0.001 * Math.sin((2 * F - Mpr) * dr) +
    0.0005 * Math.sin((2 * Mpr + M) * dr);
  let deltat: number;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  const JdNew = Jd1 + C1 - deltat;
  return INT(JdNew + 0.5 + timeZone / 24);
}

/** Kinh độ mặt trời tại ngày Julius (0..11 = cung hoàng đạo, dùng xác định trung khí). */
function getSunLongitude(jdn: number, timeZone: number): number {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  const DL =
    (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M) +
    (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
    0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L = L - Math.PI * 2 * INT(L / (Math.PI * 2));
  return INT(L / (Math.PI / 6));
}

/** Ngày sóc bắt đầu tháng 11 âm lịch của năm dương lịch yy. */
function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

/** Thứ tự tháng nhuận trong năm âm lịch bắt đầu từ a11 (0 = tháng 11 không nhuận...). */
function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  leap: boolean;
}

/** Đổi dương lịch → âm lịch Việt Nam. */
export function solarToLunar(dd: number, mm: number, yy: number, timeZone = VIETNAM_TZ): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) lunarLeap = true;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap };
}

/** Đổi âm lịch Việt Nam → dương lịch {day, month, year}. */
export function lunarToSolar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  lunarLeap: boolean,
  timeZone = VIETNAM_TZ,
): { day: number; month: number; year: number } {
  let a11: number, b11: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }
  if (lunarLeap && b11 - a11 <= 365) {
    // Năm âm lịch không có tháng nhuận → ngày nhuận không tồn tại. Trả
    // sentinel {0,0,0} thay vì lặng lẽ bỏ qua cờ nhuận và trả ngày của
    // tháng thường — nhất quán với ca năm nhuận nhưng sai tháng ở dưới
    // (finding W3-F4).
    return { day: 0, month: 0, year: 0 };
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (lunarLeap && lunarMonth !== leapMonth) {
      return { day: 0, month: 0, year: 0 };
    }
    if (lunarLeap || off >= leapOff) {
      off += 1;
    }
  }
  const monthStart = getNewMoonDay(k + off, timeZone);
  return jdToDate(monthStart + lunarDay - 1);
}

/**
 * Ngày mùng 1 Tết Nguyên Đán của năm âm lịch `lunarYear`
 * (rơi vào tháng 1–2 dương lịch cùng năm) — Date địa phương lúc 00:00.
 */
export function tetDate(lunarYear: number): Date {
  const s = lunarToSolar(1, 1, lunarYear, false, VIETNAM_TZ);
  return new Date(s.year, s.month - 1, s.day);
}

/**
 * Đếm số ngày mùng 1 Tết nằm trong khoảng (fromExclusive, toInclusive]
 * theo ngày dương lịch. Quét năm âm lịch quanh khoảng để không sót biên.
 */
export function countTetDays(fromExclusive: Date, toInclusive: Date): number {
  const from = startOfDay(fromExclusive).getTime();
  const to = startOfDay(toInclusive).getTime();
  if (to <= from) return 0;
  let count = 0;
  const firstYear = fromExclusive.getFullYear() - 1;
  const lastYear = toInclusive.getFullYear() + 1;
  for (let y = firstYear; y <= lastYear; y++) {
    const t = tetDate(y).getTime();
    if (t > from && t <= to) count++;
  }
  return count;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
