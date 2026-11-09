// lib/ai/compress-laso.ts
import { CungItem, ThienBanData } from "../types";
import { DIA_CHI } from "../tuvi/can-chi";
import { getStarElement } from "../ngu-hanh";

const CAN_FULL: Record<string, string> = { G: "Giáp", Ấ: "Ất", B: "Bính", Đ: "Đinh", M: "Mậu", K: "Kỷ", C: "Canh", T: "Tân", N: "Nhâm", Q: "Quý" };
const CHI_EL: Record<string, string> = { Tý: "T", Sửu: "Th", Dần: "M", Mão: "M", Thìn: "Th", Tỵ: "H", Ngọ: "H", Mùi: "Th", Thân: "K", Dậu: "K", Tuất: "Th", Hợi: "T" };
const isFixedStar = (s: string) => !/^(L\.|ĐV\.|ĐV\s)/i.test(s);
const isFixedBadge = (b: string) => b === "Tuần" || b === "Triệt";

function expandCanChi(raw?: string): string {
    if (!raw) return "";
    const [c, chi] = raw.split(".");
    return chi ? `${CAN_FULL[c] || c} ${chi}` : raw;
}

function extractPhi4(c: any): string {
    const m = (c.phi_hoa_full || "").match(/\[(.*?)\]/g);
    return m ? "Phi:" + m.map((x: string) => x.replace(/[\[\]]/g, "")).join("-") : `Phi:${c.phi_loc || ""}-${c.phi_ky || ""}`;
}

function fmtChinhTinh(list?: any[]): string {
    if (!list?.length) return "VCD";
    return list.map((s: any) => `*${s.ten}[${getStarElement(s.ten)}]${s.trang_thai || ""}`).join(",");
}

function formatFixedCung(role: string, c: any): string {
    const ten = (c.ten_cung || "").replace("<THÂN>", "[THÂN]");
    const badges = (c.badges || []).filter(isFixedBadge);
    const meta = [role, `${expandCanChi(c.can_cung)}[${CHI_EL[c.chi] || ""}]`, ten, "TS:" + c.trang_sinh, ...badges].filter(Boolean).join("|");
    return `${meta} => ${fmtChinhTinh(c.chinh_tinh)} | +${(c.phu_tinh_tot || []).filter(isFixedStar).join(",")} | -${(c.phu_tinh_xau || []).filter(isFixedStar).join(",")} | ${extractPhi4(c)}`;
}

export function compressCungCoDinh(tb: ThienBanData, cungList: CungItem[], targetChi: string): string {
    const idx = DIA_CHI.indexOf(targetChi);
    if (idx === -1 || !cungList?.length) return "";
    const at = (i: number) => cungList[(i + 120) % 12];
    const header = `BẢN MỆNH: ${tb?.ho_ten || "Đương số"} | ${tb?.gioi_tinh || ""} | ${tb?.nam_sinh}, ${tb?.thang_sinh}, ${tb?.ngay_sinh}, Giờ ${tb?.gio_sinh} | ${tb?.am_duong} | Mệnh:${tb?.ban_menh} | Cục:${tb?.cuc_so || tb?.cuc} | ${tb?.than_cu}`;
    const blocks = [
        formatFixedCung("1.BẢN CUNG", at(idx)), formatFixedCung("2.TAM HỢP 1", at(idx + 4)),
        formatFixedCung("3.TAM HỢP 2", at(idx + 8)), formatFixedCung("4.XUNG CHIẾU", at(idx + 6)),
        formatFixedCung("5.NHỊ HỢP", at(1 - idx)), formatFixedCung("6.GIÁP TRƯỚC", at(idx - 1)), formatFixedCung("7.GIÁP SAU", at(idx + 1)),
    ];
    return header + "\n" + blocks.join("\n");
}

export function compressLaSoToText(tb: ThienBanData, cungList: CungItem[]): string {
    if (!tb || !cungList?.length) return "";
    const dvCung = cungList.find((c) => c.dv_cung === "ĐV.MỆNH");
    const luuCung = cungList.find((c) => c.luu_cung === "L.MỆNH");
    const thCung = cungList.find((c) => c.badges?.includes("Tiểu Hạn"));
    const dvRange = dvCung ? `${expandCanChi(dvCung.can_cung)}(${dvCung.dai_van}-${Number(dvCung.dai_van) + 9}t)` : "";
    const hoaLocs = ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"].map((h) => {
        const found = cungList.find((c) => [...(c.phu_tinh_tot || []), ...(c.phu_tinh_xau || [])].includes(h));
        return `${h.replace("Hóa ", "")}@${found ? `${found.ten_cung.replace("<THÂN>", "").trim()}(${found.chi})` : "?"}`;
    }).join("|");

    const header = [
        `TB:${tb.ho_ten || "Đương số"}|Giới:${tb.gioi_tinh || ""}|${tb.nam_sinh}, ${tb.thang_sinh}, ${tb.ngay_sinh}, Giờ ${tb.gio_sinh}`,
        `${tb.am_duong}(${tb.am_duong_ly || ""})|Mệnh:${tb.ban_menh}|Cục:${tb.cuc_so || tb.cuc}|${tb.menh_cuc}`,
        `${tb.than_cu}|Chủ:${tb.menh_chu}/${tb.than_chu}|Phi:${tb.cung_phi}|HóaGốc:${hoaLocs}`,
        `Xem:${tb.nam_xem || tb.nam_xem_han}(${tb.tuoi_mu}t,Hạn:${tb.sao_han})|ĐV_HiệnTại:${dvRange}|L.Mệnh:${expandCanChi(luuCung?.can_cung)}|TiểuHạn:${expandCanChi(thCung?.can_cung)}`,
        `TrụcTamHợp: Thân-Tý-Thìn | Dần-Ngọ-Tuất | Tỵ-Dậu-Sửu | Hợi-Mão-Mùi (NgũHành: K=Kim,M=Mộc,T=Thủy,H=Hỏa,Th=Thổ)`,
    ].join("\n");

    const lines = cungList.map((c: any) => {
        const ten = (c.ten_cung || "").replace("<THÂN>", "[THÂN]");
        const meta = [`${expandCanChi(c.can_cung)}[${CHI_EL[c.chi] || ""}]`, ten, "ĐV" + c.dai_van, c.dv_cung, c.luu_cung, c.nguyet_han, "TS:" + c.trang_sinh, ...(c.badges || [])].filter(Boolean).join("|");
        return `${meta} => ${fmtChinhTinh(c.chinh_tinh)} | +${(c.phu_tinh_tot || []).join(",")} | -${(c.phu_tinh_xau || []).join(",")} | ${extractPhi4(c)}`;
    });
    return header + "\n" + lines.join("\n");
}

export function estimateTokens(text: string): number {
    return Math.ceil((text || "").length / 3.2);
}
