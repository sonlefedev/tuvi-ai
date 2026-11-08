// lib/luan-giai/sao-y-nghia.ts
export const SAO_DETAIL: Record<string, { goc: string; nhom: string }> = {
    "Tử Vi": { goc: "Đế tinh chủ quyền uy, tự tôn, khả năng bao quát và dẫn dắt.", nhom: "Lãnh đạo" },
    "Thiên Cơ": { goc: "Thiện tinh chủ mưu lược, trí tuệ linh hoạt, nhạy bén và biến chuyển.", nhom: "Mưu lược" },
    "Thái Dương": { goc: "Quý tinh chủ quang minh, nhiệt huyết, cống hiến, danh tiếng và trách nhiệm.", nhom: "Danh vọng" },
    "Vũ Khúc": { goc: "Tài tinh chủ thực tế, kỷ luật, hành động dứt khoát và quản lý tiền bạc.", nhom: "Tài chính" },
    "Thiên Đồng": { goc: "Phúc tinh chủ ôn hòa, thích nghi, nghệ thuật và sự hưởng thụ tinh thần.", nhom: "Phúc thọ" },
    "Liêm Trinh": { goc: "Tù tinh chủ nguyên tắc, cá tính mạnh, tham vọng, ngoại giao nhưng dễ cố chấp.", nhom: "Quyền biến" },
    "Thiên Phủ": { goc: "Lệnh tinh chủ kho tàng, ổn định, bảo toàn thành quả và quản lý chắc chắn.", nhom: "Kho tàng" },
    "Thái Âm": { goc: "Phú tinh chủ nội tâm sâu sắc, tích lũy bền bỉ, tinh tế và điền sản.", nhom: "Tích lũy" },
    "Tham Lang": { goc: "Đào hoa tinh chủ khát vọng lớn, giao tế rộng, đa tài và nhạy bén cơ hội.", nhom: "Giao tế" },
    "Cự Môn": { goc: "Ám tinh chủ ngôn ngữ, phản biện, nghiên cứu sâu, dễ thị phi nếu thiếu cát hóa.", nhom: "Ngôn luận" },
    "Thiên Tướng": { goc: "Ấn tinh chủ phò tá, công tâm, giữ chữ tín, chỉn chu và trọng danh dự.", nhom: "Phò tá" },
    "Thiên Lương": { goc: "Ấm tinh chủ che chở, chuẩn mực, kinh nghiệm, y dược, giáo dục và giải ách.", nhom: "Che chở" },
    "Thất Sát": { goc: "Tướng tinh chủ tiên phong, độc lập, bản lĩnh vượt nghịch cảnh nhưng vất vả.", nhom: "Tiên phong" },
    "Phá Quân": { goc: "Hao tinh chủ đột phá, cải cách, dám phá cũ lập mới, biến động trước thành tựu.", nhom: "Cải cách" },
};

const CUNG_CONTEXT: Record<string, string> = {
    "MỆNH": "định hình cốt cách, tư duy, bản lĩnh và xu hướng hành động suốt đời của đương số.",
    "PHỤ MẪU": "phản ánh nhân duyên, sự tương hợp và mức độ hỗ trợ từ cha mẹ, cấp trên.",
    "PHÚC ĐỨC": "chi phối nền tảng phúc ấm dòng họ, đời sống tinh thần và độ an nhàn hậu vận.",
    "ĐIỀN TRẠCH": "quyết định duyên bất động sản, môi trường sống, gia đạo và khả năng giữ tài sản.",
    "QUAN LỘC": "thể hiện con đường công danh, vị thế nghề nghiệp và phong cách làm việc.",
    "NÔ BỘC": "cho thấy chất lượng bạn bè, đồng nghiệp, cộng sự và khả năng dùng người.",
    "THIÊN DI": "phản ánh vận hội khi ra ngoài xã hội, đi xa, giao tiếp và môi trường mới.",
    "TẬT ÁCH": "báo hiệu điểm yếu thể chất, nguy cơ bệnh tật tiềm ẩn và khả năng giải tai ách.",
    "TÀI BẠCH": "cho thấy năng lực kiếm tiền, cách quản lý dòng tiền và nguồn thu chính.",
    "TỬ TỨC": "phản ánh đường con cái, nhân duyên thế hệ sau và khả năng truyền thừa.",
    "PHU THÊ": "chi phối tiêu chuẩn chọn bạn đời, đời sống hôn nhân và sự đồng hành vợ chồng.",
    "HUYNH ĐỆ": "thể hiện tình cảm, sự tương trợ giữa anh chị em ruột và bạn bè thân thiết.",
};

const TRANG_THAI_DESC: Record<string, string> = {
    "(M)": "Miếu địa — phát huy tối đa sức mạnh tốt đẹp, vững vàng và chính danh.",
    "(V)": "Vượng địa — năng lượng dồi dào, thuận thời thế, dễ tạo thành tựu rõ rệt.",
    "(Đ)": "Đắc địa — có thực lực và chỗ đứng, đủ khả năng vượt qua trở ngại.",
    "(B)": "Bình hòa — tính chất trung tính, tốt hay xấu phụ thuộc mạnh vào phụ tinh đi kèm.",
    "(H)": "Hãm địa — dễ gặp trắc trở, áp lực hoặc bộc lộ mặt trái nếu thiếu cát tinh chế hóa.",
};

export function giaiNghiaSaoTaiCung(tenCungGoc: string, chinhTinh: { ten: string; trang_thai?: string }[], xungChiText: string) {
    const vaiTroCung = CUNG_CONTEXT[tenCungGoc] || "phản ánh một phương diện quan trọng trên lá số.";
    if (!chinhTinh || chinhTinh.length === 0) {
        return [
            "Cung " + tenCungGoc + " Vô Chính Diệu (không có Chính tinh tọa thủ), " + vaiTroCung,
            "Vì không có sao chủ chốt cố định nên cung này mang tính linh hoạt cao, chịu ảnh hưởng trực tiếp từ cung xung chiếu (" + xungChiText + ") và bộ phụ tinh đang đóng tại bản cung.",
        ];
    }
    return chinhTinh.map((s) => {
        const info = SAO_DETAIL[s.ten];
        const tt = s.trang_thai ? TRANG_THAI_DESC[s.trang_thai] || "" : "";
        return "★ " + s.ten + " " + (s.trang_thai || "") + ": " + (info?.goc || "") + " Ở trạng thái " + tt + " Khi an tại cung " + tenCungGoc + ", sao này " + vaiTroCung;
    });
}