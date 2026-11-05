// lib/tu-hoa.ts
const TU_HOA: Record<string, { Loc: string; Quyen: string; Khoa: string; Ky: string }> = {
    "Giáp": { Loc: "Liêm Trinh", Quyen: "Phá Quân", Khoa: "Vũ Khúc", Ky: "Thái Dương" },
    "Ất": { Loc: "Thiên Cơ", Quyen: "Thiên Lương", Khoa: "Tử Vi", Ky: "Thái Âm" },
    "Bính": { Loc: "Thiên Đồng", Quyen: "Thiên Cơ", Khoa: "Văn Xương", Ky: "Liêm Trinh" },
    "Đinh": { Loc: "Thái Âm", Quyen: "Thiên Đồng", Khoa: "Thiên Cơ", Ky: "Cự Môn" },
    "Mậu": { Loc: "Tham Lang", Quyen: "Thái Âm", Khoa: "Hữu Bật", Ky: "Thiên Cơ" },
    "Kỷ": { Loc: "Vũ Khúc", Quyen: "Tham Lang", Khoa: "Thiên Lương", Ky: "Văn Khúc" },
    "Canh": { Loc: "Thái Dương", Quyen: "Vũ Khúc", Khoa: "Thái Âm", Ky: "Thiên Đồng" },
    "Tân": { Loc: "Cự Môn", Quyen: "Thái Dương", Khoa: "Văn Khúc", Ky: "Văn Xương" },
    "Nhâm": { Loc: "Thiên Lương", Quyen: "Tử Vi", Khoa: "Tả Phù", Ky: "Vũ Khúc" },
    "Quý": { Loc: "Phá Quân", Quyen: "Cự Môn", Khoa: "Thái Âm", Ky: "Tham Lang" }
};

export function anTuHoa(can: string, prefix: string, cungList: any[]) {
    if (!can || !cungList) return;
    const canKey = Object.keys(TU_HOA).find(k => (can || "").includes(k));
    if (!canKey) return;
    const { Loc, Quyen, Khoa, Ky } = TU_HOA[canKey];

    const hasStar = (cung: any, target: string) => {
        const check = (s: any) => {
            if (!s) return false;
            const name = typeof s === "string" ? s : (s.ten || s.Name || s.name || "");
            return name.toLowerCase().includes(target.toLowerCase());
        };
        return (cung.chinh_tinh || []).some(check) ||
            (cung.phu_tinh_tot || []).some(check) ||
            (cung.phu_tinh_xau || []).some(check);
    };

    cungList.forEach((cung: any) => {
        if (!cung.phu_tinh_tot) cung.phu_tinh_tot = [];
        if (!cung.phu_tinh_xau) cung.phu_tinh_xau = [];

        if (hasStar(cung, Loc)) cung.phu_tinh_tot.push(`${prefix}Hóa Lộc`);
        if (hasStar(cung, Quyen)) cung.phu_tinh_tot.push(`${prefix}Hóa Quyền`);
        if (hasStar(cung, Khoa)) cung.phu_tinh_tot.push(`${prefix}Hóa Khoa`);
        if (hasStar(cung, Ky)) cung.phu_tinh_xau.push(`${prefix}Hóa Kỵ`);
    });
}