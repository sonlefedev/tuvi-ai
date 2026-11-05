// lib/sao-luu.ts
export const DIA_CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
export const CAN_LIST = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CAN_ABBR = ["G", "Ấ", "B", "Đ", "M", "K", "C", "T", "N", "Q"];
const CUNG_NAMES = ["MỆNH", "PHỤ", "PHÚC", "ĐIỀN", "QUAN", "NÔ", "DI", "TẬT", "TÀI", "TỬ", "THÊ", "BÀO"];

export function getCanCung(year: number): Record<string, string> {
    const cIdx = ((year - 4) % 10 + 10) % 10, dCan = ((cIdx % 5) * 2 + 2) % 10, m: Record<string, string> = {};
    for (let i = 0; i < 12; i++) m[DIA_CHI[(2 + i) % 12]] = `${CAN_ABBR[(dCan + i) % 10]}.${DIA_CHI[(2 + i) % 12]}`;
    return m;
}

export function tinhSaoLuu(namXem: number, namSinh: number, isNam: boolean = true, vtMenh: number = 2, cucNum: number = 3, thangSinh: number = 1, gioChi: number = 0) {
    const cIdx = ((namXem - 4) % 10 + 10) % 10, chIdx = ((namXem - 4) % 12 + 12) % 12, cSIdx = ((namSinh - 4) % 10 + 10) % 10, chSIdx = ((namSinh - 4) % 12 + 12) % 12;
    const isDuong = cSIdx % 2 === 0, step = (isDuong && isNam) || (!isDuong && !isNam) ? 1 : -1;
    const map: Record<string, { tot: string[]; xau: string[] }> = {};
    DIA_CHI.forEach(c => { map[c] = { tot: [], xau: [] }; });

    const locTonMap = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0], locTon = locTonMap[cIdx];
    const khoiMap = [1, 0, 11, 11, 1, 0, 2, 2, 3, 3], vietMap = [7, 8, 9, 9, 7, 8, 6, 6, 5, 5];
    const xuongMap = [8, 9, 8, 9, 8, 9, 11, 0, 2, 3], khucMap = [10, 5, 10, 5, 10, 5, 1, 2, 4, 5];
    const maMap = [8, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8, 5], daoHoaMap = [9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3, 0];

    // 1. Sao Lưu Niên toàn diện theo Can & Chi năm xem
    map[DIA_CHI[locTon]].tot.push("L.Lộc Tồn(V)");
    map[DIA_CHI[(locTon + 1) % 12]].xau.push("L.K Dượng(Đ)");
    map[DIA_CHI[(locTon + 11) % 12]].xau.push("L.Đà La(H)");
    map[DIA_CHI[khoiMap[cIdx]]].tot.push("L.Thiên Khôi");
    map[DIA_CHI[vietMap[cIdx]]].tot.push("L.Thiên Việt");
    map[DIA_CHI[xuongMap[cIdx]]].tot.push("L.V Xương(Đ)");
    map[DIA_CHI[khucMap[cIdx]]].tot.push("L.V Khúc(V)");
    map[DIA_CHI[chIdx]].xau.push("L.Thái Tuế");
    map[DIA_CHI[(chIdx + 2) % 12]].xau.push("L.Tang Môn(Đ)");
    map[DIA_CHI[(chIdx + 8) % 12]].xau.push("L.Bạch Hổ(H)");
    map[DIA_CHI[(6 - chIdx + 120) % 12]].xau.push("L.Thiên Khốc");
    map[DIA_CHI[(6 + chIdx) % 12]].xau.push("L.Thiên Hư(Đ)");
    map[DIA_CHI[maMap[chIdx]]].tot.push("L.Thiên Mã(V)");
    map[DIA_CHI[daoHoaMap[chIdx]]].tot.push("L.Đào Hoa");

    // Lưu Hồng Loan, Thiên Hỷ, Kiếp Sát, Song Hao, Thiên Hình, Lưu Tứ Đức
    const lHongLoan = (3 - chIdx + 120) % 12, lKiepsatMap = [5, 2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8];
    map[DIA_CHI[lHongLoan]].tot.push("L.Hồng Loan"); map[DIA_CHI[(lHongLoan + 6) % 12]].tot.push("L.Thiên Hỷ");
    map[DIA_CHI[lKiepsatMap[chIdx]]].xau.push("L.Kiếp Sát");
    map[DIA_CHI[(locTon + 3) % 12]].xau.push("L.Tiểu Hao"); map[DIA_CHI[(locTon + 9) % 12]].xau.push("L.Đại Hao");
    map[DIA_CHI[(9 + chIdx) % 12]].xau.push("L.Thiên Hình");
    map[DIA_CHI[(9 + chIdx) % 12]].tot.push("L.Thiên Đức"); map[DIA_CHI[(5 + chIdx) % 12]].tot.push("L.Nguyệt Đức");
    map[DIA_CHI[(7 + chIdx) % 12]].tot.push("L.Long Đức"); map[DIA_CHI[(9 + chIdx) % 12]].tot.push("L.Phúc Đức");

    // 2. Đại vận & Lưu Đại Vận
    const daiVanMap: Record<string, number> = {};
    for (let i = 0; i < 12; i++) daiVanMap[DIA_CHI[(vtMenh + i * step + 120) % 12]] = cucNum + i * 10;

    const tuoi = namXem - namSinh + 1, dvOffset = Math.max(0, Math.min(11, Math.floor((tuoi - cucNum) / 10)));
    const dvChiIdx = (vtMenh + dvOffset * step + 120) % 12, danCan = ((cSIdx % 5) * 2 + 2) % 10;
    const dvCanIdx = (danCan + (dvChiIdx - 2 + 12) % 12) % 10, dvLoc = locTonMap[dvCanIdx];

    map[DIA_CHI[dvLoc]].tot.push("ĐV.Lộc Tồn(V)"); map[DIA_CHI[(dvLoc + 1) % 12]].xau.push("ĐV.K Dượng(Đ)");
    map[DIA_CHI[(dvLoc + 11) % 12]].xau.push("ĐV.Đà La(H)"); map[DIA_CHI[khoiMap[dvCanIdx]]].tot.push("ĐV.Thiên Khôi");
    map[DIA_CHI[vietMap[dvCanIdx]]].tot.push("ĐV.Thiên Việt"); map[DIA_CHI[xuongMap[dvCanIdx]]].tot.push("ĐV.Xương(H)");
    map[DIA_CHI[khucMap[dvCanIdx]]].tot.push("ĐV.Khúc(Đ)"); map[DIA_CHI[maMap[dvChiIdx]]].tot.push("ĐV.T Mã(V)");

    const luuCungMap: Record<string, string> = {}, dvCungMap: Record<string, string> = {};
    for (let i = 0; i < 12; i++) {
        luuCungMap[DIA_CHI[(chIdx + i) % 12]] = `L.${CUNG_NAMES[i]}`;
        dvCungMap[DIA_CHI[(dvChiIdx + i) % 12]] = `ĐV.${CUNG_NAMES[i]}`;
    }

    // Đẩu Quân chính tông & Nguyệt Hạn 12 tháng
    const dauQuan = (chIdx - (thangSinh - 1) + gioChi + 120) % 12, nguyetHanMap: Record<string, string> = {};
    for (let m = 1; m <= 12; m++) nguyetHanMap[DIA_CHI[(dauQuan + m - 1) % 12]] = `T ${m}`;

    // Cung Tiểu Hạn của năm xem
    const khoiTieuHan = [10, 7, 4, 1][Math.floor(chSIdx / 3) % 4] || 10;
    const tieuHanIdx = (khoiTieuHan + (tuoi - 1) * (isNam ? 1 : -1) + 120) % 12;

    return { canChiNamXem: `${CAN_LIST[cIdx]} ${DIA_CHI[chIdx]}`, saoLuuMap: map, daiVanMap, luuCungMap, dvCungMap, nguyetHanMap, dvCan: CAN_LIST[dvCanIdx], canIdx: cIdx, chiIdx: chIdx, tieuHanChi: DIA_CHI[tieuHanIdx] };
}

export function parseHour(g: any): number {
    if (typeof g === "number") return g;
    const s = String(g || "").toLowerCase();
    const m = [["tý", 0], ["ti", 0], ["sửu", 2], ["dần", 4], ["mão", 6], ["thìn", 8], ["tỵ", 10], ["ngọ", 12], ["mùi", 14], ["thân", 16], ["dậu", 18], ["tuất", 20], ["hợi", 22]];
    return m.find(([k]) => s.includes(k))?.[1] ?? 12;
}

export function toTitleCase(s: string): string {
    return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}