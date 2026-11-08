// lib/tuvi/am-lich.ts
const PI = Math.PI;
const jdFromDate = (dd: number, mm: number, yy: number) => {
    const a = Math.floor((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
    return dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
};

function getNewMoonDay(k: number, tz = 7): number {
    const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    const C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M) - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr)
        - 0.0004 * Math.sin(dr * 3 * Mpr) + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr)) - 0.0074 * Math.sin(dr * (M - Mpr))
        + 0.0004 * Math.sin(dr * (2 * F + M)) - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr)) + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    const dt = T < -11 ? 0.000278 + 0.000265 * T + 0.000262 * T2 : -0.000278 + 0.000265 * T + 0.000262 * T2;
    return Math.floor(Jd1 + C1 - dt + 0.5 + tz / 24);
}

function getSunLongitude(jdn: number, tz = 7): number {
    const T = (jdn - 2451545.5 - tz / 24) / 36525, T2 = T * T, dr = PI / 180;
    const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    const DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M) + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
    let L = (L0 + DL) * dr;
    L -= PI * 2 * Math.floor(L / (PI * 2));
    return Math.floor((L / PI) * 6);
}

function getLunarMonth11(yy: number, tz = 7): number {
    const k = Math.floor((jdFromDate(31, 12, yy) - 2415021) / 29.530588853);
    const nm = getNewMoonDay(k, tz);
    return getSunLongitude(nm, tz) >= 9 ? getNewMoonDay(k - 1, tz) : nm;
}

function getLeapMonthOffset(a11: number, tz = 7): number {
    const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last = 0, i = 1, arc = getSunLongitude(getNewMoonDay(k + i, tz), tz);
    while (arc !== last && i < 14) { last = arc; i++; arc = getSunLongitude(getNewMoonDay(k + i, tz), tz); }
    return i - 1;
}

export function solarToLunar(dd: number, mm: number, yy: number): { day: number; month: number; year: number; isLeap: boolean } {
    const dayNumber = jdFromDate(dd, mm, yy), k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1, 7);
    if (monthStart > dayNumber) monthStart = getNewMoonDay(k, 7);
    let a11 = getLunarMonth11(yy, 7), b11 = a11, lunarYear = yy;
    if (a11 >= monthStart) a11 = getLunarMonth11(yy - 1, 7);
    else { lunarYear = yy + 1; b11 = getLunarMonth11(yy + 1, 7); }
    const lunarDay = dayNumber - monthStart + 1, diff = Math.floor((monthStart - a11) / 29);
    let isLeap = false, lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
        const leapDiff = getLeapMonthOffset(a11, 7);
        if (diff >= leapDiff) { lunarMonth = diff + 10; if (diff === leapDiff) isLeap = true; }
    }
    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeap };
}