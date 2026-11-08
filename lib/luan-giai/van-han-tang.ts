// lib/luan-giai/van-han-tang.ts
import { CungItem } from "../types";

const CUNG_CHUC_Y: Record<string, string> = {
    "MỆNH": "bản thân, định hướng lớn và sức khỏe tinh thần",
    "PHỤ": "cha mẹ, cấp trên, cơ quan chủ quản và giấy tờ pháp lý",
    "PHÚC": "tư tưởng, đời sống tinh thần, họ hàng và phúc phần",
    "ĐIỀN": "nhà cửa, đất đai, nơi làm việc và tích lũy tài sản",
    "QUAN": "công việc, chức vụ, dự án và hiệu suất sự nghiệp",
    "NÔ": "bạn bè, đồng nghiệp, đối tác và nhân sự hỗ trợ",
    "DI": "xuất hành, di chuyển, thay đổi môi trường và quan hệ xã hội",
    "TẬT": "sức khỏe thể chất, áp lực công việc và giải trừ rủi ro",
    "TÀI": "thu nhập, chi tiêu, dòng tiền và cơ hội tài chính",
    "TỬ": "con cái, học trò, sản phẩm sáng tạo và thế hệ kế cận",
    "THÊ": "tình cảm, hôn nhân và sự hợp tác song phương",
    "BÀO": "anh chị em, bạn thân thiết và nguồn vốn liên kết",
};

export function phanTichBaTangVanHan(cung: CungItem, namXem: number) {
    const tenGoc = cung.ten_cung.replace("<THÂN>", "").trim();
    const dvKey = (cung.dv_cung || "").replace("ĐV.", "").trim();
    const luuKey = (cung.luu_cung || "").replace("L.", "").trim();

    const dvStars = [...(cung.phu_tinh_tot || []), ...(cung.phu_tinh_xau || [])].filter((s) => s.startsWith("ĐV."));
    const luuStars = cung.sao_luu || [];
    const isTieuHan = cung.badges?.includes("Tiểu Hạn");

    const coDinh = `Đây là cung ${tenGoc} gốc của đương số (khởi đại vận từ ${cung.dai_van} tuổi, vận hành theo vòng Tràng Sinh ở bước "${cung.trang_sinh}"), phản ánh nền tảng dài hạn về ${CUNG_CHUC_Y[tenGoc.slice(0, 4)] || tenGoc.toLowerCase()}.`;

    const daiVan = `Trong đại vận 10 năm hiện tại, cung ${tenGoc} kiêm vai trò là ${cung.dv_cung} (liên quan đến ${CUNG_CHUC_Y[dvKey] || dvKey}). ` +
        (dvStars.length > 0
            ? `Có bộ sao lưu đại vận [${dvStars.join(", ")}] chiếu trực tiếp, tạo lực đẩy (hoặc áp lực) xuyên suốt cả chu kỳ 10 năm lên mối liên kết giữa ${tenGoc} và ${cung.dv_cung}.`
            : `Không có sao lưu đại vận đóng trực tiếp, nên sự biến chuyển chủ yếu đến từ sao gốc và cung tam hợp đại vận chiếu về.`);

    const tieuVan = `Riêng trong năm ${namXem}, cung này hóa thân thành ${cung.luu_cung} (kích hoạt chuyện ${CUNG_CHUC_Y[luuKey] || luuKey})${isTieuHan ? " và ĐANG LÀ CUNG TIỂU HẠN CỦA NĂM" : ""}, ứng với Nguyệt hạn ${cung.nguyet_han}. ` +
        (luuStars.length > 0
            ? `Sự hội tụ của [${luuStars.join(", ")}] kích hoạt mạnh các sự kiện liên quan đến ${tenGoc} và ${cung.luu_cung}, đặc biệt rõ nét vào thời điểm ${cung.nguyet_han}.`
            : `Năm nay cung này không có sao lưu niên đóng trực tiếp nên diễn biến ở mức ôn hòa, cần xem thêm cung xung chiếu để biết tác động bên ngoài.`);

    return { coDinh, daiVan, tieuVan };
}