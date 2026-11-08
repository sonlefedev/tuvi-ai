// lib/tuvi/phu-tinh.ts
import { DIA_CHI } from "./can-chi";

export function anDayDuPhuTinh(canNam: number, chiNam: number, thangAm: number, gioChi: number, cucNum: number, isDuongNam: boolean, ngayAm: number, vtMenh: number, vtThan: number) {
    const tot: Record<string, string[]> = {}, xau: Record<string, string[]> = {};
    DIA_CHI.forEach(c => { tot[c] = []; xau[c] = []; });

    // 1. Lục Cát & Lục Sát (Địa Không Dần, Địa Kiếp Thân cho giờ Dậu)
    const taPhu = (4 + thangAm - 1) % 12, huuBat = (10 - thangAm + 1 + 120) % 12;
    const vanXuong = (10 - gioChi + 120) % 12, vanKhuc = (4 + gioChi) % 12;
    tot[DIA_CHI[taPhu]].push("Tả Phù"); tot[DIA_CHI[huuBat]].push("Hữu Bật");
    tot[DIA_CHI[vanXuong]].push("Văn Xương"); tot[DIA_CHI[vanKhuc]].push("Văn Khúc");
    const khoi = [1, 0, 11, 11, 1, 0, 2, 2, 3, 3], viet = [7, 8, 9, 9, 7, 8, 6, 6, 5, 5];
    tot[DIA_CHI[khoi[canNam]]].push("Thiên Khôi"); tot[DIA_CHI[viet[canNam]]].push("Thiên Việt");

    const locTonMap = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0], lPos = locTonMap[canNam];
    tot[DIA_CHI[lPos]].push("Lộc Tồn");
    xau[DIA_CHI[(lPos + 1) % 12]].push("Kình Dương"); xau[DIA_CHI[(lPos - 1 + 12) % 12]].push("Đà La");
    xau[DIA_CHI[(11 - gioChi + 120) % 12]].push("Địa Không"); xau[DIA_CHI[(11 + gioChi) % 12]].push("Địa Kiếp");

    const hoaChi = [8, 1, 2, 7][Math.floor(chiNam / 3) % 4] || 2, linhChi = [10, 3, 10, 10][Math.floor(chiNam / 3) % 4] || 10;
    xau[DIA_CHI[isDuongNam ? (hoaChi + gioChi) % 12 : (hoaChi - gioChi + 120) % 12]].push("Hỏa Tinh");
    xau[DIA_CHI[isDuongNam ? (linhChi - gioChi + 120) % 12 : (linhChi + gioChi) % 12]].push("Linh Tinh");

    // 2. Vòng Thái Tuế (12 sao) & Thiên Không
    const tt = ["Thái Tuế", "Thiếu Dương", "Tang Môn", "Thiếu Âm", "Quan Phù", "Tử Phù", "Tuế Phá", "Long Đức", "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù"];
    tt.forEach((s, i) => { const p = (chiNam + i) % 12; ([2, 6, 8, 10].includes(i) ? xau : tot)[DIA_CHI[p]].push(s); });
    xau[DIA_CHI[(chiNam + 1) % 12]].push("Thiên Không");

    // 3. Vòng Bác Sĩ (12 sao) & Vòng Tràng Sinh (12 sao)
    const bs = ["Bác Sĩ", "Lực Sĩ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư", "Phi Liêm", "Hỷ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ"];
    const bsStep = isDuongNam ? 1 : -1;
    bs.forEach((s, i) => { const p = (lPos + i * bsStep + 120) % 12; ([1, 3, 8, 9, 10, 11].includes(i) ? xau : tot)[DIA_CHI[p]].push(s); });

    const tsStart = { 2: 8, 3: 11, 4: 5, 5: 8, 6: 2 }[cucNum] || 8;
    const tsNames = ["Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy", "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"];
    const trangSinhRes: Record<string, string> = {};
    tsNames.forEach((s, i) => { trangSinhRes[DIA_CHI[(tsStart + i * bsStep + 120) % 12]] = s; });

    // 4. Các sao theo Chi & Can năm
    const maMap = [8, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8, 5], daoHoaMap = [9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3, 0], hoaCaiMap = [4, 1, 10, 7, 4, 1, 10, 7, 4, 1, 10, 7];
    tot[DIA_CHI[maMap[chiNam]]].push("Thiên Mã"); tot[DIA_CHI[daoHoaMap[chiNam]]].push("Đào Hoa"); tot[DIA_CHI[hoaCaiMap[chiNam]]].push("Hoa Cái");
    tot[DIA_CHI[(3 - chiNam + 120) % 12]].push("Hồng Loan"); tot[DIA_CHI[(9 - chiNam + 120) % 12]].push("Thiên Hỷ");
    xau[DIA_CHI[(6 - chiNam + 120) % 12]].push("Thiên Khốc"); xau[DIA_CHI[(6 + chiNam) % 12]].push("Thiên Hư");
    const coThan = [2, 2, 5, 5, 5, 8, 8, 8, 11, 11, 11, 2][chiNam], quaTu = (coThan + 8) % 12;
    xau[DIA_CHI[coThan]].push("Cô Thần"); xau[DIA_CHI[quaTu]].push("Quả Tú");
    xau[DIA_CHI[[5, 2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8][chiNam]]].push("Kiếp Sát");
    xau[DIA_CHI[[5, 1, 9, 5, 1, 9, 5, 1, 9, 5, 1, 9][chiNam]]].push("Phá Toái");

    // Long Phượng, Tứ Đức
    tot[DIA_CHI[(4 + chiNam) % 12]].push("Long Trì");
    tot[DIA_CHI[(10 - chiNam + 120) % 12]].push("Phượng Các");
    tot[DIA_CHI[(10 - chiNam + 120) % 12]].push("Giải Thần");
    tot[DIA_CHI[(9 + chiNam) % 12]].push("Thiên Đức");
    tot[DIA_CHI[(5 + chiNam) % 12]].push("Nguyệt Đức");

    // 5. Các sao theo Can, Tháng, Giờ & Cố Định
    tot[DIA_CHI[(lPos + 8) % 12]].push("Quốc Ấn"); tot[DIA_CHI[(lPos + 5) % 12]].push("Đường Phù");
    const thienQuan = [7, 4, 5, 2, 3, 9, 11, 9, 10, 6][canNam], thienPhuc = [9, 8, 0, 11, 3, 2, 6, 5, 6, 5][canNam];
    tot[DIA_CHI[thienQuan]].push("Thiên Quan"); tot[DIA_CHI[thienPhuc]].push("Thiên Phúc");
    tot[DIA_CHI[[2, 3, 6, 7, 4, 5, 8, 9, 11, 10][canNam]]].push("Lưu Hà");
    tot[DIA_CHI[[5, 6, 0, 5, 6, 8, 2, 6, 9, 10][canNam]]].push("Thiên Trù");

    xau[DIA_CHI[(9 + thangAm - 1) % 12]].push("Thiên Hình"); xau[DIA_CHI[(1 + thangAm - 1) % 12]].push("Thiên Riêu");
    tot[DIA_CHI[(1 + thangAm - 1) % 12]].push("Thiên Y");
    tot[DIA_CHI[(8 + thangAm - 1) % 12]].push("Thiên Giải");
    tot[DIA_CHI[(7 + thangAm - 1) % 12]].push("Địa Giải");
    tot[DIA_CHI[(vanKhuc + 2) % 12]].push("Thai Phụ"); tot[DIA_CHI[(vanKhuc - 2 + 12) % 12]].push("Phong Cáo");

    const tamThai = (taPhu + ngayAm - 1) % 12, batToa = (huuBat - ngayAm + 1 + 120) % 12;
    tot[DIA_CHI[tamThai]].push("Tam Thai"); tot[DIA_CHI[batToa]].push("Bát Tọa");
    const anQuang = (vanXuong + ngayAm - 2 + 120) % 12, thienQuy = (vanKhuc - ngayAm + 2 + 120) % 12;
    tot[DIA_CHI[anQuang]].push("Ân Quang"); tot[DIA_CHI[thienQuy]].push("Thiên Quý");

    tot[DIA_CHI[(vtMenh + chiNam) % 12]].push("Thiên Tài");
    tot[DIA_CHI[(vtThan + chiNam) % 12]].push("Thiên Thọ");
    xau[DIA_CHI[4]].push("Thiên La"); xau[DIA_CHI[10]].push("Địa Võng");
    xau[DIA_CHI[(vtMenh + 5) % 12]].push("Thiên Thương");
    xau[DIA_CHI[(vtMenh + 7) % 12]].push("Thiên Sứ");

    return { tot, xau, trangSinhRes };
}