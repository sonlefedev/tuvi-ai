// lib/ai/lifemap-chapters.ts
export interface LifeMapData {
    ch1?: string; ch2?: string; ch3?: string; ch4?: string;
    ch5?: string; ch6?: string; ch7?: string; ch8?: string;
    c0TongQuan?: string; c1CotCach?: string; c2SuNghiep?: string;
    c3TinhDuyen?: string; c4SucKhoe?: string; c5NenTranh?: string; c6KimChiNam?: string;
}

export type ChapterKey = "ch1" | "ch2" | "ch3" | "ch4" | "ch5" | "ch6" | "ch7" | "ch8";

export const LIFE_CHAPTERS: { num: number; key: ChapterKey; tab: string; title: string; motto: string; checks: string[] }[] = [
    { num: 1, key: "ch1", tab: "I. Bản Mệnh • Ưu Nhược", title: "Chương I. Tổng Quan Bản Mệnh, Cốt Cách, Ưu Điểm & Điểm Yếu Cần Tu Dưỡng", motto: "Biết mình là khởi đầu của mọi trí tuệ; thuận theo thiên tính mà rèn giũa tâm tính.", checks: ["Ghi nhận 3 ưu điểm cốt lõi để phát huy mỗi tuần", "Nhận diện 1 cạm bẫy cảm xúc lớn nhất cần kiềm chế", "Đối chiếu thế đứng Mệnh – Thân với hành trình hiện tại"] },
    { num: 2, key: "ch2", tab: "II. Sự Nghiệp • Tài Lộc", title: "Chương II. Bản Đồ Sự Nghiệp, Ngành Nghề Trọng Điểm & Chiến Lược Tài Lộc", motto: "Chọn đúng dòng chảy thiên thời, một bước đi bằng mười năm gắng sức ngược gió.", checks: ["Rà soát vị trí hiện tại có khớp Top 5 ngành thuận mệnh", "Khóa chặt 1 lỗ hổng thất thoát tài chính đã cảnh báo", "Xây dựng quỹ tích lũy bền vững theo cung Điền – Tài"] },
    { num: 3, key: "ch3", tab: "III. Nhân Duyên • Gia Đạo", title: "Chương III. Nhân Duyên, Hôn Nhân, Gia Đạo & Hệ Sinh Thái Quan Hệ", motto: "Gia đạo an hòa là gốc rễ nuôi dưỡng mọi thành tựu ngoài xã hội.", checks: ["Áp dụng nguyên tắc giao tiếp hóa giải xung khắc Phu Thê", "Dành thời gian chất lượng vun đắp kết nối gia đình", "Lọc lại vòng tròn cộng sự theo tiêu chuẩn cung Nô Bộc"] },
    { num: 4, key: "ch4", tab: "IV. Sức Khỏe • Nội Tâm", title: "Chương IV. Sức Khỏe Thể Chất, Tâm Lý Học Bản Mệnh & Bình An Nội Tâm", motto: "Thân an thì trí sáng; tâm tĩnh tự khắc vạn sự hanh thông.", checks: ["Chăm sóc đúng tạng phủ chủ quản của hành Bản Mệnh", "Duy trì nghi thức thư giãn / tĩnh tâm 15 phút mỗi ngày", "Điều chỉnh giờ giấc sinh hoạt thuận nhịp sinh học"] },
    { num: 5, key: "ch5", tab: "V. Gặp Cảnh Gì Làm Gì", title: "Chương V. Cẩm Nang Ứng Xử Thực Chiến: Khi Gặp Cảnh Nào Thì Phải Làm Gì?", motto: "Biến cố không đến để quật ngã, mà để kiểm nghiệm bản lĩnh và mở ra ngã rẽ mới.", checks: ["Đánh dấu tình huống thực tế bạn đang đối mặt hiện nay", "Áp dụng đúng 4 bước hóa giải thay vì phản ứng bản năng", "Ghi lại kết quả ứng nghiệm vào Nhật Ký Chiêm Nghiệm"] },
    { num: 6, key: "ch6", tab: "VI. Điều Nên Tránh", title: "Chương VI. Những Điều Tuyệt Đối Nên Tránh & Nghệ Thuật Tránh Hung Đón Cát", motto: "Tránh được một bước sai lầm trong vận xấu quý giá hơn vạn lời khen lúc thuận thời.", checks: ["Loại bỏ 1 thói quen tự hủy hoại vận khí khỏi tuần này", "Tuyệt đối tránh kiểu hợp tác / đầu cơ rủi ro đã nêu", "Thực hành chuyển hóa năng lượng Sát tinh thành kỷ luật"] },
    { num: 7, key: "ch7", tab: "VII. Lộ Trình 8 Đại Vận", title: "Chương VII. Lộ Trình 8 Đại Vận Cuộc Đời (Từ Thiếu Niên Đến Hậu Vận)", motto: "Mỗi thập kỷ là một mùa trong năm: biết mùa gieo hạt, mùa gặt hái và mùa dưỡng sức.", checks: ["Xác định rõ trọng tâm của Đại Vận hiện tại đang đứng", "Chuẩn bị nền tảng trước 2 năm cho Đại Vận kế tiếp", "Cân đối mục tiêu công danh và phúc đức từng chặng"] },
    { num: 8, key: "ch8", tab: "VIII. Kim Chỉ Nam", title: "Chương VIII. Kim Chỉ Nam Hành Động Trọn Đời & Lời Nhắn Gửi Riêng", motto: "Lá số là tấm bản đồ sao; người cầm lái con thuyền vận mệnh chính là bạn.", checks: ["Khởi động kế hoạch hành động 90 ngày đầu tiên", "Ghim 3 nguyên tắc vàng ra quyết định vào ghi chú cá nhân", "Gieo đều đặn việc thiện lành bồi đắp cung Phúc Đức"] },
];

export function isLegacyOnlyCache(raw: LifeMapData | null | undefined): boolean {
    if (!raw || typeof raw !== "object") return false;
    return !raw.ch1 && Boolean(raw.c0TongQuan || raw.c1CotCach);
}

export function normalizeLifeMap(raw: LifeMapData | null | undefined): Record<ChapterKey, string> | null {
    if (!raw || typeof raw !== "object") return null;
    const mapped: Record<ChapterKey, string> = {
        ch1: raw.ch1 || raw.c0TongQuan || "",
        ch2: raw.ch2 || raw.c2SuNghiep || "",
        ch3: raw.ch3 || raw.c3TinhDuyen || "",
        ch4: raw.ch4 || raw.c4SucKhoe || "",
        ch5: raw.ch5 || raw.c1CotCach || "",
        ch6: raw.ch6 || raw.c5NenTranh || "",
        ch7: raw.ch7 || "",
        ch8: raw.ch8 || raw.c6KimChiNam || "",
    };
    return Object.values(mapped).some((v) => v.trim().length > 0) ? mapped : null;
}

export function countLifeMapChars(raw: LifeMapData | null | undefined): number {
    const norm = normalizeLifeMap(raw);
    return norm ? Object.values(norm).reduce((s, v) => s + v.length, 0) : 0;
}
