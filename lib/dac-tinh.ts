// lib/dac-tinh.ts
const CHINH_TINH_MAP: Record<string, Record<string, string>> = {
    "tử vi": { Tý: "B", Sửu: "M", Dần: "V", Mão: "Đ", Thìn: "V", Tỵ: "V", Ngọ: "M", Mùi: "M", Thân: "V", Dậu: "Đ", Tuất: "V", Hợi: "B" },
    "liêm trinh": { Tý: "H", Sửu: "Đ", Dần: "V", Mão: "H", Thìn: "M", Tỵ: "H", Ngọ: "V", Mùi: "Đ", Thân: "V", Dậu: "H", Tuất: "M", Hợi: "H" },
    "thiên đồng": { Tý: "V", Sửu: "H", Dần: "M", Mão: "Đ", Thìn: "H", Tỵ: "H", Ngọ: "H", Mùi: "H", Thân: "M", Dậu: "Đ", Tuất: "H", Hợi: "Đ" },
    "vũ khúc": { Tý: "V", Sửu: "M", Dần: "V", Mão: "Đ", Thìn: "M", Tỵ: "B", Ngọ: "V", Mùi: "M", Thân: "V", Dậu: "Đ", Tuất: "M", Hợi: "B" },
    "thái dương": { Tý: "H", Sửu: "H", Dần: "V", Mão: "V", Thìn: "V", Tỵ: "M", Ngọ: "M", Mùi: "Đ", Thân: "B", Dậu: "H", Tuất: "H", Hợi: "H" },
    "thiên cơ": { Tý: "Đ", Sửu: "H", Dần: "V", Mão: "M", Thìn: "M", Tỵ: "H", Ngọ: "Đ", Mùi: "H", Thân: "V", Dậu: "M", Tuất: "M", Hợi: "H" },
    "thiên phủ": { Tý: "M", Sửu: "M", Dần: "M", Mão: "B", Thìn: "V", Tỵ: "M", Ngọ: "M", Mùi: "M", Thân: "M", Dậu: "B", Tuất: "V", Hợi: "M" },
    "thái âm": { Tý: "M", Sửu: "Đ", Dần: "H", Mão: "H", Thìn: "H", Tỵ: "H", Ngọ: "H", Mùi: "B", Thân: "Đ", Dậu: "V", Tuất: "V", Hợi: "M" },
    "tham lang": { Tý: "H", Sửu: "M", Dần: "B", Mão: "H", Thìn: "M", Tỵ: "H", Ngọ: "H", Mùi: "M", Thân: "B", Dậu: "H", Tuất: "M", Hợi: "H" },
    "cự môn": { Tý: "V", Sửu: "H", Dần: "V", Mão: "M", Thìn: "H", Tỵ: "H", Ngọ: "V", Mùi: "H", Thân: "V", Dậu: "M", Tuất: "H", Hợi: "V" },
    "thiên tướng": { Tý: "V", Sửu: "Đ", Dần: "M", Mão: "H", Thìn: "V", Tỵ: "Đ", Ngọ: "V", Mùi: "Đ", Thân: "M", Dậu: "H", Tuất: "V", Hợi: "Đ" },
    "thiên lương": { Tý: "V", Sửu: "V", Dần: "M", Mão: "M", Thìn: "V", Tỵ: "H", Ngọ: "M", Mùi: "V", Thân: "H", Dậu: "H", Tuất: "M", Hợi: "H" },
    "thất sát": { Tý: "M", Sửu: "Đ", Dần: "M", Mão: "H", Thìn: "H", Tỵ: "B", Ngọ: "M", Mùi: "Đ", Thân: "M", Dậu: "H", Tuất: "M", Hợi: "B" },
    "phá quân": { Tý: "M", Sửu: "V", Dần: "H", Mão: "H", Thìn: "V", Tỵ: "Đ", Ngọ: "M", Mùi: "V", Thân: "H", Dậu: "H", Tuất: "V", Hợi: "Đ" }
};

export function getDacTinh(saoName: string, chi: string): string {
    const clean = saoName.trim().toLowerCase();
    for (const k in CHINH_TINH_MAP) {
        if (clean === k || clean.includes(k)) return `(${CHINH_TINH_MAP[k][chi] || "B"})`;
    }
    return "(B)";
}

const PHU_TINH_DAC: Record<string, string[]> = {
    "kình dương": ["Thìn", "Tuất", "Sửu", "Mùi"], "đà la": ["Thìn", "Tuất", "Sửu", "Mùi"],
    "địa không": ["Dần", "Thân", "Tỵ", "Hợi"], "địa kiếp": ["Dần", "Thân", "Tỵ", "Hợi"],
    "hỏa tinh": ["Dần", "Mão", "Thìn", "Tỵ", "Ngọ"], "linh tinh": ["Dần", "Mão", "Thìn", "Tỵ", "Ngọ"],
    "tang môn": ["Dần", "Thân", "Mão", "Dậu"], "bạch hổ": ["Dần", "Thân", "Mão", "Dậu"],
    "đại hao": ["Dần", "Thân", "Mão", "Dậu"], "tiểu hao": ["Dần", "Thân", "Mão", "Dậu"],
    "thiên khốc": ["Tý", "Ngọ", "Mão", "Dậu"], "thiên hư": ["Tý", "Ngọ", "Mão", "Dậu"],
    "thiên hình": ["Dần", "Mão", "Thìn", "Dậu"], "thiên riêu": ["Mão", "Dậu"],
    "hóa kỵ": ["Thìn", "Tuất", "Sửu", "Mùi"]
};

export function ganDacTinhPhuTinh(sao: string, chi: string): string {
    if (sao.includes("(") || sao.startsWith("L.") || sao.startsWith("ĐV.")) return sao;
    const clean = sao.trim().toLowerCase();
    if (clean === "thiên mã") {
        if (["Dần", "Thân"].includes(chi)) return "Thiên Mã(V)";
        if (chi === "Tỵ") return "Thiên Mã(Đ)";
        if (chi === "Hợi") return "Thiên Mã(H)";
        return sao;
    }
    for (const k in PHU_TINH_DAC) {
        if (clean === k) return PHU_TINH_DAC[k].includes(chi) ? `${sao}(Đ)` : `${sao}(H)`;
    }
    return sao;
}