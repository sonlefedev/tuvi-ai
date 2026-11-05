// lib/boundary.ts
export function getTuanCung(canIdx: number, chiIdx: number, diaChi: string[]): string[] {
    if (canIdx === undefined || chiIdx === undefined || isNaN(canIdx) || isNaN(chiIdx)) return [];
    const offset = ((chiIdx - canIdx) % 12 + 12) % 12;
    const c1 = (offset + 10) % 12, c2 = (offset + 11) % 12;
    return [diaChi[c1] || "", diaChi[c2] || ""].filter(Boolean);
}

export function getTrietCung(canIdx: number, diaChi: string[]): string[] {
    if (canIdx === undefined || isNaN(canIdx)) return [];
    const map: Record<number, number[]> = {
        0: [8, 9], 5: [8, 9], // Giáp, Kỷ -> Thân, Dậu
        1: [6, 7], 6: [6, 7], // Ất, Canh -> Ngọ, Mùi
        2: [4, 5], 7: [4, 5], // Bính, Tân -> Thìn, Tỵ
        3: [2, 3], 8: [2, 3], // Đinh, Nhâm -> Dần, Mão
        4: [0, 1], 9: [0, 1]  // Mậu, Quý -> Tý, Sửu
    };
    const normCan = ((canIdx % 10) + 10) % 10;
    const pair = map[normCan] || [];
    return pair.map(i => diaChi[i] || "").filter(Boolean);
}

export function getBoundaryPosition(c1?: string, c2?: string): string {
    return "hidden";
}