// lib/luan-giai-cung.ts
import { CungItem } from "./types";
import { TAM_HOP_MAP, XUNG_CHIEU_MAP } from "./tuong-tac";
import { giaiNghiaSaoTaiCung } from "./luan-giai/sao-y-nghia";
import { phanTichPhanUngSao } from "./luan-giai/cach-cuc";
import { phanTichBaTangVanHan } from "./luan-giai/van-han-tang";

const PHI_HOA_FULL: Record<string, [string, string, string, string]> = {
    "Giáp": ["Liêm Trinh", "Phá Quân", "Vũ Khúc", "Thái Dương"], "Ất": ["Thiên Cơ", "Thiên Lương", "Tử Vi", "Thái Âm"],
    "Bính": ["Thiên Đồng", "Thiên Cơ", "Văn Xương", "Liêm Trinh"], "Đinh": ["Thái Âm", "Thiên Đồng", "Thiên Cơ", "Cự Môn"],
    "Mậu": ["Tham Lang", "Thái Âm", "Hữu Bật", "Thiên Cơ"], "Kỷ": ["Vũ Khúc", "Tham Lang", "Thiên Lương", "Văn Khúc"],
    "Canh": ["Thái Dương", "Vũ Khúc", "Thái Âm", "Thiên Đồng"], "Tân": ["Cự Môn", "Thái Dương", "Văn Khúc", "Văn Xương"],
    "Nhâm": ["Thiên Lương", "Tử Vi", "Tả Phù", "Vũ Khúc"], "Quý": ["Phá Quân", "Cự Môn", "Thái Âm", "Tham Lang"],
};

export function phanTichCung(cung: CungItem, cungList: CungItem[], namXem: number) {
    const tenGoc = cung.ten_cung.replace("<THÂN>", "").trim();
    const tamHopChis = (TAM_HOP_MAP[cung.chi] || []).filter((c) => c !== cung.chi);
    const xungChi = XUNG_CHIEU_MAP[cung.chi] || "";
    const findCung = (chi: string) => cungList.find((x) => x.chi === chi);

    const fmtCung = (chi: string) => {
        const t = findCung(chi);
        if (!t) return chi;
        const ct = t.chinh_tinh?.map((s) => `${s.ten}${s.trang_thai}`).join(", ") || "Vô chính diệu";
        return `${t.ten_cung.replace("<THÂN>", "").trim()} (${chi}: ${ct})`;
    };

    const canName = (cung.can_cung || "").split(".")[0];
    const hoaStars = PHI_HOA_FULL[canName] || ["", "", "", ""];
    const labels = ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"];
    const phiHoaList = hoaStars.map((star, idx) => {
        const dest = cungList.find((c) => [...(c.chinh_tinh || []).map((s) => s.ten), ...(c.phu_tinh_tot || []), ...(c.phu_tinh_xau || [])].some((n) => n.toLowerCase().includes(star.toLowerCase())));
        return { label: labels[idx], star, destName: dest ? `${dest.ten_cung.replace("<THÂN>", "").trim()} (${dest.chi})` : "—" };
    });

    const allTamHopCungs = [cung, ...tamHopChis.map(findCung), findCung(xungChi)].filter(Boolean) as CungItem[];
    const allStars = allTamHopCungs.flatMap((c) => [...(c.chinh_tinh || []).map((s) => s.ten), ...(c.phu_tinh_tot || []), ...(c.phu_tinh_xau || [])]);

    return {
        tamHopText: tamHopChis.map(fmtCung).join(" • "),
        xungChieuText: fmtCung(xungChi),
        phiHoaList,
        yNghiaSao: giaiNghiaSaoTaiCung(tenGoc, cung.chinh_tinh || [], fmtCung(xungChi)),
        phanUngSao: phanTichPhanUngSao(cung, allStars),
        baTang: phanTichBaTangVanHan(cung, namXem),
    };
}