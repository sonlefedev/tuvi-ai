// lib/luan-giai/cach-cuc.ts
import { CungItem } from "../types";

export function phanTichPhanUngSao(cung: CungItem, allStarsInTamHop: string[]): string[] {
    const ct = (cung.chinh_tinh || []).map((s) => s.ten);
    const local = [...ct, ...(cung.phu_tinh_tot || []), ...(cung.phu_tinh_xau || [])];
    const hasLocal = (kw: string) => local.some((s) => s.toLowerCase().includes(kw.toLowerCase()));
    const hasTH = (kw: string) => allStarsInTamHop.some((s) => s.toLowerCase().includes(kw.toLowerCase()));
    const res: string[] = [];

    if (hasLocal("Tử Vi") && (hasTH("Tả Phù") || hasTH("Hữu Bật") || hasTH("Thiên Khôi") || hasTH("Thiên Việt"))) {
        res.push("• Tổ hợp Đế Tinh gặp Phụ Bật / Khôi Việt (Quân thần khánh hội): Được quý nhân và cộng sự nâng đỡ, tăng uy tín và khả năng hóa giải khó khăn.");
    }
    if (hasLocal("Tử Vi") && (hasLocal("Phục Binh") || hasLocal("Địa Không") || hasLocal("Địa Kiếp"))) {
        res.push("• Tổ hợp Tử Vi gặp Phục Binh / Không Kiếp: Dễ có người đố kỵ ngầm, cạnh tranh sau lưng hoặc áp lực tâm lý; cần minh bạch trong mọi cam kết.");
    }
    if ((hasLocal("Lộc Tồn") && hasTH("Thiên Mã")) || (hasLocal("Thiên Mã") && hasTH("Lộc Tồn"))) {
        res.push("• Cách cục Lộc Mã Giao Trì: Càng năng động, di chuyển, mở rộng môi trường hoặc giao thương càng dễ sinh tài lộc và cơ hội mới.");
    }
    if ((hasLocal("Đào Hoa") || hasLocal("Hồng Loan")) && (hasLocal("Nguyệt Đức") || hasLocal("Thiên Đức") || hasLocal("Long Đức"))) {
        res.push("• Tổ hợp Đào Hồng gặp Đức Tinh: Nhân duyên hài hòa, tăng sức hút thiện cảm, dễ gặp người khác phái hỗ trợ chân thành và hóa giải đào hoa xấu.");
    }
    if (hasTH("Văn Xương") && hasTH("Văn Khúc") && (hasTH("Hóa Khoa") || hasTH("Thiên Khôi") || hasTH("Thiên Việt"))) {
        res.push("• Cách cục Khoa Danh Văn Tinh (Xương Khúc hội Khoa / Khôi Việt): Lợi về học thuật, thi cử, bằng cấp, chuyên môn và danh tiếng trí tuệ.");
    }
    if ((hasLocal("Phá Quân") || hasLocal("Thất Sát") || hasLocal("Tham Lang")) && (hasLocal("Địa Không") || hasLocal("Địa Kiếp") || hasLocal("Hỏa Tinh") || hasLocal("Linh Tinh"))) {
        res.push("• Tổ hợp Sát Phá Tham gặp Hỏa Linh / Không Kiếp: Tư duy táo bạo, bứt phá nhanh nhưng biên độ biến động lớn; tránh đầu tư mạo hiểm thiếu kiểm soát.");
    }
    if (hasLocal("Hóa Kỵ") || hasLocal("L.Hóa Kỵ") || hasLocal("ĐV.Hóa Kỵ")) {
        res.push("• Tác động của Hóa Kỵ tại cung: Dễ phát sinh trăn trở, hiểu lầm, vướng mắc thủ tục hoặc sự cầu toàn quá mức; cần rà soát kỹ chi tiết trước khi quyết định.");
    }
    if (cung.badges?.some((b) => b.includes("Tuần") || b.includes("Triệt"))) {
        const isHam = (cung.chinh_tinh || []).some((s) => s.trang_thai === "(H)");
        const isVCD = (cung.chinh_tinh || []).length === 0;
        res.push(
            isVCD || isHam
                ? "• Tuần / Triệt án ngữ gặp Vô Chính Diệu hoặc sao Hãm địa: Đóng vai trò kìm hãm bớt tính hung, mở lối xoay chuyển tích cực ở giai đoạn sau."
                : "• Tuần / Triệt án ngữ gặp Chính tinh Miếu/Vượng: Giai đoạn đầu thường bị chậm nhịp, cản trở hoặc phải tự lực vượt qua trước khi ổn định."
        );
    }

    if (res.length === 0) {
        res.push("• Các chính tinh và phụ tinh trong cung phối hợp ở mức cân bằng, không tạo xung đột cực đoan; cát hung tùy thuộc vào từng năm vận hạn kích hoạt.");
    }
    return res;
}