// lib/ai/chapter-svg-more.ts
import { ThienBanData } from "../types";
import { ChapterKey } from "./lifemap-chapters";

function esc(s?: string): string {
    return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildMoreChapterSvg(key: ChapterKey, tb: ThienBanData, defs: string, el: { name: string; primary: string; accent: string; bg: string }): { svg: string; caption: string } {
    const name = esc(tb?.ho_ten || "Đương số");
    if (key === "ch5") {
        return {
            caption: `Đồ Hình V: Hải Đăng Vượt Sóng & La Bàn Hóa Giải 8 Nghịch Cảnh`,
            svg: `<svg viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="760" height="220" rx="16" fill="url(#g-${key})" stroke="#38bdf8" stroke-opacity="0.35"/>
<polygon points="145,175 162,55 178,55 195,175" fill="#fde68a" fill-opacity="0.85"/>
<polygon points="178,62 340,25 340,105" fill="#fef08a" fill-opacity="0.18"/>
<path d="M40,175 Q110,155 180,175 T320,175 T440,175" fill="none" stroke="#38bdf8" stroke-width="2"/>
<path d="M55,192 Q130,176 205,192 T355,192" fill="none" stroke="#0284c7" stroke-width="1.6"/>
<g font-family="sans-serif"><text x="375" y="56" fill="#7dd3fc" font-size="13" font-weight="bold">QUY TRÌNH 4 BƯỚC ỨNG XỬ NGHỊCH CẢNH</text>
<text x="375" y="86" font-size="12" fill="#e2e8f0">Bước 1: Dừng phản ứng bản năng — Nhận diện tổ hợp sao</text>
<text x="375" y="114" font-size="12" fill="#e2e8f0">Bước 2: Khoanh vùng rủi ro (Tài chính / Thị phi / Gia đạo)</text>
<text x="375" y="142" font-size="12" fill="#e2e8f0">Bước 3: Kích hoạt Cát tinh &amp; Quý nhân tương ứng</text>
<text x="375" y="170" font-size="12" fill="#fde68a">Bước 4: Chuyển nguy thành cơ — Củng cố nội lực dài hạn</text></g></svg>`,
        };
    }
    if (key === "ch6") {
        return {
            caption: `Đồ Hình VI: Lá Chắn Hộ Mệnh & Lò Luyện Chuyển Hóa Sát Tinh`,
            svg: `<svg viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="760" height="220" rx="16" fill="url(#g-${key})" stroke="#fb7185" stroke-opacity="0.35"/>
<path d="M180,32 L255,64 L255,126 C255,164 220,186 180,198 C140,186 105,164 105,126 L105,64 Z" fill="#1e293b" stroke="url(#gold-${key})" stroke-width="2"/>
<circle cx="180" cy="112" r="34" fill="none" stroke="#fb7185" stroke-width="1.4" stroke-dasharray="4 3"/>
<text x="180" y="117" text-anchor="middle" fill="#fde68a" font-size="13" font-weight="bold">TĨNH TÂM</text>
<g font-family="sans-serif"><text x="305" y="56" fill="#fda4af" font-size="13" font-weight="bold">NGHỆ THUẬT TRÁNH HUNG ĐÓN CÁT</text>
<text x="305" y="86" font-size="12" fill="#e2e8f0">• Đoạn tuyệt 6 phản xạ cảm xúc tự làm hao tổn vận khí</text>
<text x="305" y="114" font-size="12" fill="#e2e8f0">• Tránh xa bẫy hùn hạp mạo hiểm &amp; cho vay thiếu kiểm soát</text>
<text x="305" y="142" font-size="12" fill="#e2e8f0">• Án binh bất động đúng lúc khi gặp hạn xung khắc nặng</text>
<text x="305" y="170" font-size="12" fill="#fde68a">• Luyện Sát tinh &amp; Hóa Kỵ thành kỷ luật thép và chiều sâu</text></g></svg>`,
        };
    }
    if (key === "ch7") {
        const pts = "65,155 155,130 245,92 335,62 425,78 515,54 605,85 695,70";
        return {
            caption: `Đồ Hình VII: Biểu Đồ Sóng Vận Trình 80 Năm Qua 8 Đại Vận`,
            svg: `<svg viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="760" height="220" rx="16" fill="url(#g-${key})" stroke="#f59e0b" stroke-opacity="0.35"/>
<text x="380" y="34" text-anchor="middle" fill="#fbbf24" font-size="13" font-weight="bold" font-family="sans-serif">NHỊP SÓNG 8 ĐẠI VẬN CUỘC ĐỜI — ${name.toUpperCase()}</text>
<line x1="45" y1="175" x2="715" y2="175" stroke="#334155" stroke-width="1.2"/>
<polyline points="${pts}" fill="none" stroke="url(#gold-${key})" stroke-width="3"/>
${[65, 155, 245, 335, 425, 515, 605, 695].map((x, i) => {
    const ys = [155, 130, 92, 62, 78, 54, 85, 70];
    return `<circle cx="${x}" cy="${ys[i]}" r="6" fill="#0f172a" stroke="#fde68a" stroke-width="2"/><text x="${x}" y="196" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="monospace">ĐV.${i + 1}</text>`;
}).join("")}</svg>`,
        };
    }
    return {
        caption: `Đồ Hình VIII: Ấn Triện Tri Kỷ & Lộ Trình 90 Ngày – 1 Năm – 5 Năm`,
        svg: `<svg viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="760" height="220" rx="16" fill="url(#g-${key})" stroke="#fbbf24" stroke-opacity="0.4"/>
<rect x="65" y="42" width="165" height="136" rx="14" fill="#450a0a" stroke="#f59e0b" stroke-width="2.2"/>
<rect x="73" y="50" width="149" height="120" rx="10" fill="none" stroke="#fde68a" stroke-width="1" stroke-dasharray="3 2"/>
<text x="147" y="92" text-anchor="middle" fill="#fde68a" font-size="12" font-family="serif" font-weight="bold">ẤN TRIỆN BẢN MỆNH</text>
<text x="147" y="118" text-anchor="middle" fill="#fbbf24" font-size="13" font-family="serif" font-weight="bold">${name}</text>
<text x="147" y="144" text-anchor="middle" fill="#fca5a5" font-size="10.5" font-family="sans-serif">${esc(tb?.nam_sinh)} • HÀNH ${el.name}</text>
<g font-family="sans-serif"><text x="270" y="58" fill="#fbbf24" font-size="13" font-weight="bold">KIM CHỈ NAM HÀNH ĐỘNG TRỌN ĐỜI</text>
<text x="270" y="88" font-size="12" fill="#6ee7b7">▶ 90 Ngày Tới: Khởi động thói quen cốt lõi &amp; khóa rủi ro</text>
<text x="270" y="116" font-size="12" fill="#7dd3fc">▶ 1 Năm Tới: Đón đúng nhịp Lưu Niên ${esc(String(tb?.nam_xem_han || tb?.nam_xem || ""))}</text>
<text x="270" y="144" font-size="12" fill="#fde68a">▶ 5 Năm Tới: Bứt phá vị thế &amp; tích lũy nền tảng vững chắc</text>
<text x="270" y="172" font-size="12" fill="#e2e8f0">▶ Trọn Đời: Tu tâm dưỡng phúc — Tự tại làm chủ vận mệnh</text></g></svg>`,
    };
}
