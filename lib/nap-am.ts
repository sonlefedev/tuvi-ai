// lib/nap-am.ts
const NAP_AM: Record<string, string> = {
    "Giáp Tý": "Hải Trung Kim", "Ất Sửu": "Hải Trung Kim", "Bính Dần": "Lư Trung Hỏa", "Đinh Mão": "Lư Trung Hỏa",
    "Mậu Thìn": "Đại Lâm Mộc", "Kỷ Tỵ": "Đại Lâm Mộc", "Canh Ngọ": "Lộ Bàng Thổ", "Tân Mùi": "Lộ Bàng Thổ",
    "Nhâm Thân": "Kiếm Phong Kim", "Quý Dậu": "Kiếm Phong Kim", "Giáp Tuất": "Sơn Đầu Hỏa", "Ất Hợi": "Sơn Đầu Hỏa",
    "Bính Tý": "Giản Hạ Thủy", "Đinh Sửu": "Giản Hạ Thủy", "Mậu Dần": "Thành Đầu Thổ", "Kỷ Mão": "Thành Đầu Thổ",
    "Canh Thìn": "Bạch Lạp Kim", "Tân Tỵ": "Bạch Lạp Kim", "Nhâm Ngọ": "Dương Liễu Mộc", "Quý Mùi": "Dương Liễu Mộc",
    "Giáp Thân": "Tuyền Trung Thủy", "Ất Dậu": "Tuyền Trung Thủy", "Bính Tuất": "Ốc Thượng Thổ", "Đinh Hợi": "Ốc Thượng Thổ",
    "Mậu Tý": "Tích Lịch Hỏa", "Kỷ Sửu": "Tích Lịch Hỏa", "Canh Dần": "Tùng Bách Mộc", "Tân Mão": "Tùng Bách Mộc",
    "Nhâm Thìn": "Trường Lưu Thủy", "Quý Tỵ": "Trường Lưu Thủy", "Giáp Ngọ": "Sa Trung Kim", "Ất Mùi": "Sa Trung Kim",
    "Bính Thân": "Sơn Hạ Hỏa", "Đinh Dậu": "Sơn Hạ Hỏa", "Mậu Tuất": "Bình Địa Mộc", "Kỷ Hợi": "Bình Địa Mộc",
    "Canh Tý": "Bích Thượng Thổ", "Tân Sửu": "Bích Thượng Thổ", "Nhâm Dần": "Kim Bạch Kim", "Quý Mão": "Kim Bạch Kim",
    "Giáp Thìn": "Phúc Đăng Hỏa", "Ất Tỵ": "Phúc Đăng Hỏa", "Bính Ngọ": "Thiên Hà Thủy", "Đinh Mùi": "Thiên Hà Thủy",
    "Mậu Thân": "Đại Dịch Thổ", "Kỷ Dậu": "Đại Dịch Thổ", "Canh Tuất": "Thoa Xuyến Kim", "Tân Hợi": "Thoa Xuyến Kim",
    "Nhâm Tý": "Tang Đố Mộc", "Quý Sửu": "Tang Đố Mộc", "Giáp Dần": "Đại Khê Thủy", "Ất Mão": "Đại Khê Thủy",
    "Bính Thìn": "Sa Trung Thổ", "Đinh Tỵ": "Sa Trung Thổ", "Mậu Ngọ": "Thiên Thượng Hỏa", "Kỷ Mùi": "Thiên Thượng Hỏa",
    "Canh Thân": "Thạch Lựu Mộc", "Tân Dậu": "Thạch Lựu Mộc", "Nhâm Tuất": "Đại Hải Thủy", "Quý Hợi": "Đại Hải Thủy"
};

const MENH_CHU: Record<string, string> = { "Tý": "Tham Lang", "Sửu": "Cự Môn", "Dần": "Lộc Tồn", "Mão": "Văn Khúc", "Thìn": "Liêm Trinh", "Tỵ": "Vũ Khúc", "Ngọ": "Phá Quân", "Mùi": "Vũ Khúc", "Thân": "Liêm Trinh", "Dậu": "Văn Khúc", "Tuất": "Lộc Tồn", "Hợi": "Cự Môn" };
const THAN_CHU: Record<string, string> = { "Tý": "Hỏa Tinh", "Sửu": "Thiên Tướng", "Dần": "Thiên Lương", "Mão": "Thiên Đồng", "Thìn": "Văn Xương", "Tỵ": "Thiên Cơ", "Ngọ": "Hỏa Tinh", "Mùi": "Thiên Tướng", "Thân": "Thiên Lương", "Dậu": "Thiên Đồng", "Tuất": "Văn Xương", "Hợi": "Thiên Cơ" };
const CUU_DIEU_NAM = ["La Hầu", "Thổ Tú", "Thủy Diệu", "Thái Bạch", "Thái Dương", "Vân Hớn", "Kế Đô", "Thái Âm", "Mộc Đức"];
const CUU_DIEU_NU = ["Kế Đô", "Vân Hớn", "Mộc Đức", "Thái Âm", "Thổ Tú", "La Hầu", "Thái Dương", "Thái Bạch", "Thủy Diệu"];
const CUNG_NAMES = ["", "Khảm (Thủy)", "Khôn (Thổ)", "Chấn (Mộc)", "Tốn (Mộc)", "", "Càn (Kim)", "Đoài (Kim)", "Cấn (Thổ)", "Ly (Hỏa)"];

export function getNapAm(canChi: string): string {
    const norm = (canChi || "").replace(/Quí/g, "Quý").replace(/Kỉ/g, "Kỷ").trim();
    return NAP_AM[norm] || "Tuyền Trung Thủy";
}

export function getMenhChu(chi: string): string { return MENH_CHU[chi] || "Tham Lang"; }
export function getThanChu(chi: string): string { return THAN_CHU[chi] || "Thiên Tướng"; }

export function getSaoHan(tuoiMu: number, isNam: boolean): string {
    const idx = ((tuoiMu - 10) % 9 + 9) % 9;
    return isNam ? CUU_DIEU_NAM[idx] : CUU_DIEU_NU[idx];
}

export function getCungPhi(year: number, isNam: boolean): string {
    const last2 = year % 100;
    let sum = Math.floor(last2 / 10) + (last2 % 10);
    while (sum > 9) sum = Math.floor(sum / 10) + (sum % 10);
    let q = year < 2000 ? (isNam ? (10 - sum) : (5 + sum) % 9) : (isNam ? (9 - sum <= 0 ? 9 - sum + 9 : 9 - sum) : (6 + sum) % 9);
    if (q === 0) q = 9; if (q === 5) q = isNam ? 2 : 8;
    return CUNG_NAMES[q] || "Khôn (Thổ)";
}

export function getMenhCucTuongQuan(banMenh: string, cucName: string): string {
    const hM = banMenh.split(" ").pop() || "", hC = cucName.includes("Thủy") ? "Thủy" : cucName.includes("Mộc") ? "Mộc" : cucName.includes("Kim") ? "Kim" : cucName.includes("Hỏa") ? "Hỏa" : "Thổ";
    if (hM === hC) return "Mệnh Cục tương hòa";
    const sinh: Record<string, string> = { "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc" };
    const khac: Record<string, string> = { "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc" };
    if (sinh[hM] === hC) return "Mệnh sinh Cục";
    if (sinh[hC] === hM) return "Cục sinh Mệnh (Đại cát)";
    if (khac[hM] === hC) return "Mệnh khắc Cục";
    return "Cục khắc Mệnh";
}