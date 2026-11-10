// lib/ai/lifemap-chapters.ts
export interface LifeMapData {
    ch1?: string;
    ch2?: string;
    ch3?: string;
    ch4?: string;
    ch5?: string;
    ch6?: string;
    ch7?: string;
    ch8?: string;
    c0TongQuan?: string;
    c1CotCach?: string;
    c2SuNghiep?: string;
    c3TinhDuyen?: string;
    c4SucKhoe?: string;
    c5NenTranh?: string;
    c6KimChiNam?: string;
}

export type ChapterKey = "ch1" | "ch2" | "ch3" | "ch4" | "ch5" | "ch6" | "ch7" | "ch8";

export const LIFE_CHAPTERS: { num: number; key: ChapterKey; tab: string; title: string }[] = [
    { num: 1, key: "ch1", tab: "I. Bản Mệnh • Ưu Nhược", title: "Chương I. Tổng Quan Bản Mệnh, Cốt Cách, Ưu Điểm & Điểm Yếu Cần Tu Dưỡng" },
    { num: 2, key: "ch2", tab: "II. Sự Nghiệp • Tài Lộc", title: "Chương II. Bản Đồ Sự Nghiệp, Ngành Nghề Trọng Điểm & Chiến Lược Tài Lộc" },
    { num: 3, key: "ch3", tab: "III. Nhân Duyên • Gia Đạo", title: "Chương III. Nhân Duyên, Hôn Nhân, Gia Đạo & Hệ Sinh Thái Quan Hệ" },
    { num: 4, key: "ch4", tab: "IV. Sức Khỏe • Nội Tâm", title: "Chương IV. Sức Khỏe Thể Chất, Tâm Lý Học Bản Mệnh & Bình An Nội Tâm" },
    { num: 5, key: "ch5", tab: "V. Gặp Cảnh Gì Làm Gì", title: "Chương V. Cẩm Nang Ứng Xử Thực Chiến: Khi Gặp Cảnh Nào Thì Phải Làm Gì?" },
    { num: 6, key: "ch6", tab: "VI. Điều Nên Tránh", title: "Chương VI. Những Điều Tuyệt Đối Nên Tránh & Nghệ Thuật Tránh Hung Đón Cát" },
    { num: 7, key: "ch7", tab: "VII. Lộ Trình 8 Đại Vận", title: "Chương VII. Lộ Trình 8 Đại Vận Cuộc Đời (Từ Thiếu Niên Đến Hậu Vận)" },
    { num: 8, key: "ch8", tab: "VIII. Kim Chỉ Nam", title: "Chương VIII. Kim Chỉ Nam Hành Động Trọn Đời & Lời Nhắn Gửi Riêng" },
];

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
