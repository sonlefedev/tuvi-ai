// lib/ngu-hanh.ts
const KIM = [
    "vũ khúc", "thất sát", "văn xương", "kình dương", "đà la", "bạch hổ",
    "địa võng", "thiên la", "tấu thư", "phá toái", "hoa cái"
];
const MOC = [
    "thiên cơ", "tham lang", "thiên lương", "hóa lộc", "hóa quyền", "đào hoa",
    "long đức", "tang môn", "tuế phá", "thiên y", "thiếu dương", "tam thai", "thiên quan", "đường phù"
];
const THUY = [
    "thái âm", "thiên đồng", "cự môn", "phá quân", "thiên tướng", "văn khúc",
    "hóa khoa", "hóa kỵ", "hồng loan", "thiên hỷ", "thiên khốc", "thiên hư",
    "thanh long", "long trì", "bác sĩ", "lưu hà", "thiên sứ", "thiên thương",
    "thiên trù", "thiên riêu", "bát tọa"
];
const HOA = [
    "thái dương", "liêm trinh", "hỏa tinh", "linh tinh", "địa không", "địa kiếp",
    "thiên mã", "thiên khôi", "thiên việt", "thái tuế", "tiểu hao", "đại hao",
    "thiên hình", "kiếp sát", "phi liêm", "lực sĩ", "hỷ thần", "thiếu âm",
    "quan phù", "điếu khách", "trực phù", "tử phù", "cô thần", "quả tú",
    "thiên đức", "nguyệt đức", "thiên giải", "thiên không"
];
const THO = [
    "tử vi", "thiên phủ", "tả phù", "hữu bật", "lộc tồn", "ân quang", "thiên quý",
    "quốc ấn", "thiên phúc", "tướng quân", "bệnh phù", "phục binh", "quan phủ",
    "thai phụ", "phong cáo", "địa giải", "thiên tài", "thiên thọ"
];

export function getStarColor(name: string): string {
    if (!name) return "text-slate-300 font-medium";
    const clean = name.replace(/^(L\.|ĐV\.|ĐV\s*)/i, "")
        .replace(/\(.*?\)/g, "")
        .replace(/k dượng/i, "kình dương")
        .replace(/v xương/i, "văn xương")
        .replace(/v khúc/i, "văn khúc")
        .replace(/t mã/i, "thiên mã")
        .trim().toLowerCase();

    // 1. HỎA: Màu Đỏ Hồng (bao gồm Thiên Không, Địa Không, Thái Dương...)
    if (HOA.some(s => clean === s || clean.includes(s) || s.includes(clean))) return "text-rose-400 font-bold";
    // 2. THỔ: Màu Vàng Hổ Phách
    if (THO.some(s => clean === s || clean.includes(s) || s.includes(clean))) return "text-amber-300 font-bold";
    // 3. MỘC: Màu Xanh Lục Bảo (bao gồm Đường Phù, Thiên Cơ, Đào Hoa...)
    if (MOC.some(s => clean === s || clean.includes(s) || s.includes(clean))) return "text-emerald-400 font-bold";
    // 4. THỦY: Màu Xanh Biển
    if (THUY.some(s => clean === s || clean.includes(s) || s.includes(clean))) return "text-cyan-400 font-bold";
    // 5. KIM: Màu Trắng Sáng Tự Nhiên (Không viền hộp, phẳng mịn)
    if (KIM.some(s => clean === s || clean.includes(s) || s.includes(clean))) return "text-white font-bold";

    return "text-slate-200 font-medium";
}