export const TAM_HOP_MAP: Record<string, string[]> = {
    Thân: ["Tý", "Thìn"], Tý: ["Thân", "Thìn"], Thìn: ["Thân", "Tý"],
    Dần: ["Ngọ", "Tuất"], Ngọ: ["Dần", "Tuất"], Tuất: ["Dần", "Ngọ"],
    Tỵ: ["Dậu", "Sửu"], Dậu: ["Tỵ", "Sửu"], Sửu: ["Tỵ", "Dậu"],
    Hợi: ["Mão", "Mùi"], Mão: ["Hợi", "Mùi"], Mùi: ["Hợi", "Mão"],
};

export const XUNG_CHIEU_MAP: Record<string, string> = {
    Tý: "Ngọ", Ngọ: "Tý", Sửu: "Mùi", Mùi: "Sửu",
    Dần: "Thân", Thân: "Dần", Mão: "Dậu", Dậu: "Mão",
    Thìn: "Tuất", Tuất: "Thìn", Tỵ: "Hợi", Hợi: "Tỵ",
};