// lib/luan-giai-cung.ts
import { CungItem } from "./types";
import { DIA_CHI } from "./tuvi/can-chi";
import { TAM_HOP_MAP, XUNG_CHIEU_MAP } from "./tuong-tac";

const CHINH_TINH_Y: Record<string, string> = {
    "Tử Vi": "Chủ về quyền uy, lãnh đạo, tính tự tôn cao và khả năng bao quát đại cục.",
    "Thiên Cơ": "Chủ về mưu lược, sự linh hoạt, tư duy phân tích nhanh nhạy và biến chuyển.",
    "Thái Dương": "Chủ về quang minh, nhiệt huyết, cống hiến, danh tiếng và tinh thần trách nhiệm.",
    "Vũ Khúc": "Chủ về thực tế, quyết đoán, năng lực tài chính, kỷ luật và hành động dứt khoát.",
    "Thiên Đồng": "Chủ về phúc hậu, ôn hòa, khả năng thích nghi, nghệ thuật và sự hưởng thụ tinh thần.",
    "Liêm Trinh": "Chủ về nguyên tắc, cá tính mạnh, tham vọng, ngoại giao khéo léo nhưng dễ cố chấp.",
    "Thiên Phủ": "Chủ về kho tàng, sự ổn định, giữ gìn thành quả, bao dung và quản lý chắc chắn.",
    "Thái Âm": "Chủ về nội tâm sâu sắc, tích lũy bền bỉ, tinh tế, điền sản và sự chăm chút.",
    "Tham Lang": "Chủ về khát vọng lớn, giao tế rộng, đa tài, nhạy bén cơ hội và sức hút cá nhân.",
    "Cự Môn": "Chủ về ngôn ngữ, phản biện, nghiên cứu sâu, dễ vướng thị phi nếu thiếu cát hóa.",
    "Thiên Tướng": "Chủ về phò tá, công tâm, giữ chữ tín, ngoại hình chỉn chu và trọng danh dự.",
    "Thiên Lương": "Chủ về che chở, chuẩn mực, kinh nghiệm, y dược, giáo dục và giải trừ tai ách.",
    "Thất Sát": "Chủ về tiên phong, độc lập, bản lĩnh vượt nghịch cảnh, uy quyền nhưng vất vả.",
    "Phá Quân": "Chủ về đột phá, cải cách, dám phá cũ lập mới, biến động mạnh trước khi thành tựu.",
};

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
        const target = findCung(chi);
        if (!target) return chi;
        const ct = target.chinh_tinh?.map((s) => `${s.ten}${s.trang_thai}`).join(", ") || "Vô chính diệu";
        return `${target.ten_cung.replace("<THÂN>", "").trim()} (${chi}: ${ct})`;
    };

    // Truy vết 4 sao Phi Hóa bay đến cung nào
    const canName = (cung.can_cung || "").split(".")[0];
    const hoaStars = PHI_HOA_FULL[canName] || ["", "", "", ""];
    const labels = ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"];
    const phiHoaList = hoaStars.map((star, idx) => {
        const dest = cungList.find((c) =>
            [...(c.chinh_tinh || []).map((s) => s.ten), ...(c.phu_tinh_tot || []), ...(c.phu_tinh_xau || [])].some((n) => n.toLowerCase().includes(star.toLowerCase()))
        );
        const destName = dest ? `${dest.ten_cung.replace("<THÂN>", "").trim()} (${dest.chi})` : "—";
        return { label: labels[idx], star, destName };
    });

    // Luận giải động theo Chính tinh + Cát/Sát + Sao Lưu
    const ctList = cung.chinh_tinh || [];
    const cotLoi = ctList.length > 0
        ? ctList.map((s) => `• ${s.ten} ${s.trang_thai}: ${CHINH_TINH_Y[s.ten] || ""}`).join(" ")
        : `Cung ${tenGoc} Vô Chính Diệu, cần mượn bộ sao từ cung xung chiếu ${fmtCung(xungChi)} để định hình cách cục.`;

    const allTot = cung.phu_tinh_tot || [];
    const allXau = cung.phu_tinh_xau || [];
    const catNoiBat = allTot.filter((s) => !s.startsWith("L.") && !s.startsWith("ĐV.")).slice(0, 6).join(", ");
    const satNoiBat = allXau.filter((s) => !s.startsWith("L.") && !s.startsWith("ĐV.")).slice(0, 6).join(", ");
    const badgesText = cung.badges?.length ? ` Đang chịu tác động của ${cung.badges.join(", ")}.` : "";

    const tuongTac = `Cát tinh trợ lực: ${catNoiBat || "ít cát tinh trực chiếu"}. Sát/bại tinh cần lưu ý: ${satNoiBat || "không đáng kể"}.${badgesText}`;
    const saoLuu = cung.sao_luu || [];
    const vanHan = saoLuu.length > 0
        ? `Năm ${namXem} (Đại vận ${cung.dv_cung}, Lưu niên ${cung.luu_cung}, Nguyệt hạn ${cung.nguyet_han}) có bộ sao lưu ${saoLuu.join(", ")} hội tụ tại ${tenGoc}, báo hiệu sự dịch chuyển và kích hoạt trực tiếp phương diện này.`
        : `Năm ${namXem} (Đại vận ${cung.dv_cung}, Lưu niên ${cung.luu_cung}, Nguyệt hạn ${cung.nguyet_han}) cung ${tenGoc} ở trạng thái bình ổn, chịu tác động gián tiếp từ tam hợp chiếu về.`;

    return {
        tamHopText: tamHopChis.map(fmtCung).join(" • "),
        xungChieuText: fmtCung(xungChi),
        phiHoaList,
        cotLoi,
        tuongTac,
        vanHan,
    };
}