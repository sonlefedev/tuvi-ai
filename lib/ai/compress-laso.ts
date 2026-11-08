// lib/ai/compress-laso.ts
import { CungItem, ThienBanData } from "../types";
import { DIA_CHI } from "../tuvi/can-chi";

const isFixedStar = (s: string) => !/^(L\.|ĐV\.|ĐV\s)/i.test(s);
const isFixedBadge = (b: string) => b === "Tuần" || b === "Triệt";

function formatFixedCung(role: string, c: any): string {
    const ten = (c.ten_cung || "").replace("<THÂN>", "[THÂN]");
    const badges = (c.badges || []).filter(isFixedBadge);
    const meta = [role, c.can_cung, ten, "TS:" + c.trang_sinh, ...badges].filter(Boolean).join("|");
    const ct = c.chinh_tinh?.length ? c.chinh_tinh.map((s: any) => "*" + s.ten + (s.trang_thai || "")).join(",") : "VCD";
    const tot = (c.phu_tinh_tot || []).filter(isFixedStar).join(",");
    const xau = (c.phu_tinh_xau || []).filter(isFixedStar).join(",");
    return `${meta} => ${ct} | +${tot} | -${xau} | Phi:${c.phi_loc || ""}/${c.phi_ky || ""}`;
}

export function compressCungCoDinh(tb: ThienBanData, cungList: CungItem[], targetChi: string): string {
    const idx = DIA_CHI.indexOf(targetChi);
    if (idx === -1 || !cungList?.length) return "";
    const at = (i: number) => cungList[(i + 120) % 12];

    const header = `BẢN MỆNH: ${tb?.ho_ten || "Đương số"} | ${tb?.nam_sinh} | ${tb?.am_duong} | Mệnh:${tb?.ban_menh} | Cục:${tb?.cuc_so || tb?.cuc} | ${tb?.than_cu}`;
    const blocks = [
        formatFixedCung("1.BẢN CUNG", at(idx)),
        formatFixedCung("2.TAM HỢP 1", at(idx + 4)),
        formatFixedCung("3.TAM HỢP 2", at(idx + 8)),
        formatFixedCung("4.XUNG CHIẾU", at(idx + 6)),
        formatFixedCung("5.NHỊ HỢP", at(1 - idx)),
        formatFixedCung("6.GIÁP TRƯỚC", at(idx - 1)),
        formatFixedCung("7.GIÁP SAU", at(idx + 1)),
    ];
    return header + "\n" + blocks.join("\n");
}

export function compressLaSoToText(tb: ThienBanData, cungList: CungItem[]): string {
    if (!tb || !cungList?.length) return "";
    const header = [
        "TB:" + (tb.ho_ten || "Đương số"),
        tb.nam_sinh + "|" + tb.am_duong + "(" + (tb.am_duong_ly || "") + ")",
        "Mệnh:" + tb.ban_menh + "|Cục:" + (tb.cuc_so || tb.cuc) + "|" + tb.menh_cuc,
        tb.than_cu + "|Chủ:" + tb.menh_chu + "/" + tb.than_chu + "|Phi:" + tb.cung_phi,
        "Xem:" + (tb.nam_xem || tb.nam_xem_han) + "(" + tb.tuoi_mu + "t,Hạn:" + tb.sao_han + ")",
    ].join("|");

    const lines = cungList.map((c: any) => {
        const ten = (c.ten_cung || "").replace("<THÂN>", "[THÂN]");
        const meta = [c.can_cung, ten, "ĐV" + c.dai_van, c.dv_cung, c.luu_cung, c.nguyet_han, "TS:" + c.trang_sinh, ...(c.badges || [])].filter(Boolean).join("|");
        const ct = c.chinh_tinh?.length ? c.chinh_tinh.map((s: any) => "*" + s.ten + (s.trang_thai || "")).join(",") : "VCD";
        return `${meta} => ${ct} | +${(c.phu_tinh_tot || []).join(",")} | -${(c.phu_tinh_xau || []).join(",")} | Phi:${c.phi_loc || ""}/${c.phi_ky || ""}`;
    });
    return header + "\n" + lines.join("\n");
}

export function estimateTokens(text: string): number {
    return Math.ceil((text || "").length / 3.2);
}