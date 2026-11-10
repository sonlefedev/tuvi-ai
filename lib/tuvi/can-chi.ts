// lib/tuvi/can-chi.ts
export const DIA_CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
export const THIEN_CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];

export function getCanChiNam(year: number): string {
    return `${THIEN_CAN[(year + 6) % 10]} ${DIA_CHI[(year + 8) % 12]}`;
}

export function getCanChiNgay(year: number, month: number, day: number): string {
    const a = Math.floor((14 - month) / 12), yr = year + 4800 - a, mo = month + 12 * a - 3;
    const jdn = day + Math.floor((153 * mo + 2) / 5) + 365 * yr + Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
    return `${THIEN_CAN[(jdn + 9) % 10]} ${DIA_CHI[(jdn + 1) % 12]}`;
}

export function getVitriMenh(thangAm: number, gioChi: number): number {
    return (2 + thangAm - 1 - gioChi + 120) % 12;
}

export function getVitriThan(thangAm: number, gioChi: number): number {
    return (2 + thangAm - 1 + gioChi) % 12;
}

const CAN_VAL = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
const CHI_VAL = [0, 0, 1, 1, 2, 2, 0, 0, 1, 1, 2, 2];
const HANH_CUC: Record<number, { num: number; name: string }> = {
    1: { num: 4, name: "Kim tứ cục" },
    2: { num: 2, name: "Thủy nhị cục" },
    3: { num: 6, name: "Hỏa lục cục" },
    4: { num: 5, name: "Thổ ngũ cục" },
    5: { num: 3, name: "Mộc tam cục" }
};

export function getCucSo(canNamIdx: number, vtMenh: number): { cucNum: number; cucName: string } {
    const danCan = ((canNamIdx % 5) * 2 + 2) % 10;
    const cungCan = (danCan + (vtMenh - 2 + 120) % 12) % 10;
    let v = CAN_VAL[cungCan] + CHI_VAL[vtMenh];
    if (v > 5) v -= 5;
    const res = HANH_CUC[v] || { num: 2, name: "Thủy nhị cục" };
    return { cucNum: res.num, cucName: res.name };
}

export function getCanCungBanDau(canNamIdx: number, chiIdx: number): string {
    const danCan = ((canNamIdx % 5) * 2 + 2) % 10;
    const cungCan = (danCan + (chiIdx - 2 + 120) % 12) % 10;
    return `${THIEN_CAN[cungCan]}.${DIA_CHI[chiIdx]}`;
}