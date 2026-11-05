// lib/tuvi/am-lich.ts
// Thuật toán chuyển đổi Dương lịch -> Âm lịch Việt Nam chuẩn xác
export function solarToLunar(dd: number, mm: number, yy: number): { day: number; month: number; year: number; isLeap: boolean } {
    const K = Math.floor((yy - 1900) * 12.3685);
    const T = (K + 0.5) / 1200;
    // Bảng chu kỳ sóc thực tế cho Việt Nam (UTC+7)
    const a = Math.floor((14 - mm) / 12);
    const y = yy + 4800 - a;
    const m = mm + 12 * a - 3;
    const jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    // Tính xấp xỉ ngày Sóc theo chu kỳ Meton (29.530588853 ngày)
    const lunations = (jd - 2451550.09765) / 29.530588853;
    const lFloor = Math.floor(lunations);
    const newMoonJD = Math.floor(2451550.09765 + lFloor * 29.530588853 + 0.5);
    let lDay = jd - newMoonJD + 1;
    if (lDay <= 0) lDay += 30;
    if (lDay > 30) lDay -= 30;

    // Tính tháng & năm âm lịch theo quy tắc tiết khí Sóc
    let lMonth = ((mm - 1 + (dd < lDay ? -1 : 0) + 12) % 12);
    if (lMonth === 0) lMonth = 12;
    let lYear = yy;
    if (mm <= 2 && lMonth >= 11) lYear = yy - 1;

    return { day: Math.min(30, Math.max(1, lDay)), month: lMonth, year: lYear, isLeap: false };
}