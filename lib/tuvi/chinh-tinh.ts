// lib/tuvi/chinh-tinh.ts
import { DIA_CHI } from "./can-chi";

// Bảng vị trí Tử Vi chuẩn cổ điển 30 ngày cho 5 Cục: Thủy(2), Mộc(3), Kim(4), Thổ(5), Hỏa(6)
const TU_VI_TABLE: Record<number, number[]> = {
    2: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0, 0, 1, 1, 2, 2, 3, 3, 4],
    3: [4, 1, 2, 5, 2, 3, 6, 3, 4, 7, 4, 5, 8, 5, 6, 9, 6, 7, 10, 7, 8, 11, 8, 9, 0, 9, 10, 1, 10, 11],
    4: [11, 4, 1, 2, 0, 5, 2, 3, 1, 6, 3, 4, 2, 7, 4, 5, 3, 8, 5, 6, 4, 9, 6, 7, 5, 10, 7, 8, 6, 11],
    5: [6, 11, 4, 1, 2, 7, 0, 5, 2, 3, 8, 1, 6, 3, 4, 9, 2, 7, 4, 5, 10, 3, 8, 5, 6, 11, 4, 9, 6, 7],
    6: [9, 6, 11, 4, 1, 2, 10, 7, 0, 5, 2, 3, 11, 8, 1, 6, 3, 4, 0, 9, 2, 7, 4, 5, 1, 10, 3, 8, 5, 6]
};

export function getTuViPos(cucNum: number, ngayAm: number): number {
    const table = TU_VI_TABLE[cucNum] || TU_VI_TABLE[2];
    return table[Math.min(29, Math.max(0, ngayAm - 1))];
}

export function an14ChinhTinh(tuViPos: number): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    DIA_CHI.forEach(c => { map[c] = []; });

    // 1. Chòm Tử Vi (đi nghịch)
    map[DIA_CHI[tuViPos]].push("Tử Vi");
    map[DIA_CHI[(tuViPos - 1 + 12) % 12]].push("Thiên Cơ");
    map[DIA_CHI[(tuViPos - 3 + 12) % 12]].push("Thái Dương");
    map[DIA_CHI[(tuViPos - 4 + 12) % 12]].push("Vũ Khúc");
    map[DIA_CHI[(tuViPos - 5 + 12) % 12]].push("Thiên Đồng");
    map[DIA_CHI[(tuViPos - 8 + 12) % 12]].push("Liêm Trinh");

    // 2. Chòm Thiên Phủ (đối xứng trục Dần - Thân, đi thuận)
    const tpPos = (4 - tuViPos + 120) % 12;
    map[DIA_CHI[tpPos]].push("Thiên Phủ");
    map[DIA_CHI[(tpPos + 1) % 12]].push("Thái Âm");
    map[DIA_CHI[(tpPos + 2) % 12]].push("Tham Lang");
    map[DIA_CHI[(tpPos + 3) % 12]].push("Cự Môn");
    map[DIA_CHI[(tpPos + 4) % 12]].push("Thiên Tướng");
    map[DIA_CHI[(tpPos + 5) % 12]].push("Thiên Lương");
    map[DIA_CHI[(tpPos + 6) % 12]].push("Thất Sát");
    map[DIA_CHI[(tpPos + 10) % 12]].push("Phá Quân");

    return map;
}