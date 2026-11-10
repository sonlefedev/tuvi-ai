// lib/ai/chapter-svg.ts
import { ThienBanData } from "../types";
import { ChapterKey } from "./lifemap-chapters";
import { buildMoreChapterSvg } from "./chapter-svg-more";

function esc(s?: string): string {
    return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getElementTheme(banMenh = "") {
    if (/Kim/i.test(banMenh)) return { name: "KIM", primary: "#f8fafc", accent: "#fbbf24", bg: "#1e293b" };
    if (/Mộc/i.test(banMenh)) return { name: "MỘC", primary: "#34d399", accent: "#a3e635", bg: "#064e3b" };
    if (/Thủy/i.test(banMenh)) return { name: "THỦY", primary: "#38bdf8", accent: "#818cf8", bg: "#0c4a6e" };
    if (/Hỏa/i.test(banMenh)) return { name: "HỎA", primary: "#fb7185", accent: "#fb923c", bg: "#4c0519" };
    return { name: "THỔ", primary: "#fbbf24", accent: "#d97706", bg: "#451a03" };
}

export function buildChapterIllustrationSvg(key: ChapterKey, tb: ThienBanData): { svg: string; caption: string } {
    const el = getElementTheme(tb?.ban_menh);
    const name = esc(tb?.ho_ten || "Đương số");
    const menh = esc(tb?.ban_menh || "Bản Mệnh");
    const than = esc(tb?.than_cu || "Thân Cư");
    const defs = `<defs><radialGradient id="g-${key}" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="${el.primary}" stop-opacity="0.28"/><stop offset="100%" stop-color="#020617" stop-opacity="0.95"/></radialGradient><linearGradient id="gold-${key}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde68a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient></defs>`;

    if (key === "ch1") {
        return {
            caption: `Đồ Hình I: Mạn-Đà-La Thiên Bàn & Hành Khí ${menh} — ${name}`,
            svg: `<svg viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="760" height="220" rx="16" fill="url(#g-${key})" stroke="#f59e0b" stroke-opacity="0.35"/>
<circle cx="170" cy="110" r="82" fill="none" stroke="url(#gold-${key})" stroke-width="1.3" stroke-dasharray="4 3"/>
<circle cx="170" cy="110" r="60" fill="none" stroke="${el.primary}" stroke-width="1.2" stroke-opacity="0.7"/>
<polygon points="170,38 238,88 212,168 128,168 102,88" fill="none" stroke="#fbbf24" stroke-width="1.2" stroke-opacity="0.75"/>
<circle cx="170" cy="110" r="24" fill="${el.bg}" stroke="#fde68a" stroke-width="1.5"/>
<path d="M170,86 A24,24 0 0,1 170,134 A12,12 0 0,1 170,110 A12,12 0 0,0 170,86 Z" fill="#fde68a" fill-opacity="0.85"/>
<circle cx="170" cy="98" r="3.5" fill="#0f172a"/><circle cx="170" cy="122" r="3.5" fill="#fde68a"/>
<text x="170" y="205" text-anchor="middle" fill="#fde68a" font-size="11" font-family="serif">HÀNH ${el.name} • ÂM DƯƠNG CÂN BẰNG</text>
<g fill="#e2e8f0" font-family="sans-serif"><text x="295" y="58" fill="#fbbf24" font-size="13" font-weight="bold">TRỤC CỐT CÁCH &amp; THIÊN TÍNH</text>
<rect x="295" y="72" width="420" height="32" rx="8" fill="#0f172a" stroke="#334155"/><text x="310" y="92" font-size="12" fill="#7dd3fc">★ Bản Mệnh: ${menh}</text>
<rect x="295" y="112" width="420" height="32" rx="8" fill="#0f172a" stroke="#334155"/><text x="310" y="132" font-size="12" fill="#fde68a">★ Trọng Tâm Hậu Vận: ${than}</text>
<rect x="295" y="152" width="420" height="32" rx="8" fill="#0f172a" stroke="#334155"/><text x="310" y="172" font-size="12" fill="#6ee7b7">★ Cục Số &amp; Âm Dương: ${esc(tb?.cuc_so || tb?.cuc)} • ${esc(tb?.am_duong)}</text></g></svg>`,
        };
    }
    if (key === "ch2") {
        return {
            caption: `Đồ Hình II: La Bàn Thiên Thời & Đỉnh Cao Sự Nghiệp — Tài Lộc`,
            svg: `<svg viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="760" height="220" rx="16" fill="url(#g-${key})" stroke="#f59e0b" stroke-opacity="0.35"/>
<path d="M40,185 L155,75 L235,140 L330,48 L435,185 Z" fill="#1e293b" fill-opacity="0.7" stroke="url(#gold-${key})" stroke-width="1.5"/>
<circle cx="330" cy="48" r="10" fill="#fbbf24" fill-opacity="0.3"/><circle cx="330" cy="48" r="4" fill="#fde68a"/>
<path d="M70,170 Q180,155 240,115 T380,55" fill="none" stroke="#34d399" stroke-width="2.5" stroke-dasharray="5 3"/>
<g font-family="sans-serif"><text x="465" y="54" fill="#fbbf24" font-size="13" font-weight="bold">TAM GIÁC TÀI QUAN ĐIỀN</text>
<rect x="465" y="68" width="255" height="34" rx="8" fill="#0f172a" stroke="#f59e0b" stroke-opacity="0.5"/><text x="480" y="89" font-size="12" fill="#fde68a">1. Quan Lộc → Định vị vai trò</text>
<rect x="465" y="110" width="255" height="34" rx="8" fill="#0f172a" stroke="#10b981" stroke-opacity="0.5"/><text x="480" y="131" font-size="12" fill="#6ee7b7">2. Tài Bạch → Dòng tiền cốt lõi</text>
<rect x="465" y="152" width="255" height="34" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-opacity="0.5"/><text x="480" y="173" font-size="12" fill="#7dd3fc">3. Điền Trạch → Tích sản bền vững</text></g></svg>`,
        };
    }
    if (key === "ch3") {
        return {
            caption: `Đồ Hình III: Vòng Hòa Hợp Nhân Duyên, Gia Đạo & Phúc Ấm`,
            svg: `<svg viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="760" height="220" rx="16" fill="url(#g-${key})" stroke="#f472b6" stroke-opacity="0.35"/>
<circle cx="185" cy="110" r="56" fill="none" stroke="#f472b6" stroke-width="1.6"/><circle cx="245" cy="110" r="56" fill="none" stroke="#fbbf24" stroke-width="1.6"/>
<path d="M120,165 C175,65 255,65 310,165" fill="none" stroke="#fda4af" stroke-width="1.5" stroke-dasharray="4 3"/>
<circle cx="215" cy="110" r="6" fill="#fde68a"/>
<g font-family="sans-serif"><text x="355" y="56" fill="#f9a8d4" font-size="13" font-weight="bold">HỆ SINH THÁI QUAN HỆ &amp; GIA ĐẠO</text>
<text x="355" y="86" font-size="12" fill="#e2e8f0">• Phu Thê &amp; Mệnh: Đồng thanh tương ứng, thấu hiểu</text>
<text x="355" y="114" font-size="12" fill="#e2e8f0">• Phúc Đức &amp; Tử Tức: Nền tảng phước báu truyền thừa</text>
<text x="355" y="142" font-size="12" fill="#e2e8f0">• Phụ Mẫu &amp; Huynh Đệ: Hóa giải khác biệt thế hệ</text>
<text x="355" y="170" font-size="12" fill="#fde68a">• Nô Bộc: Kết giao quý nhân, tránh xa tiểu nhân</text></g></svg>`,
        };
    }
    if (key === "ch4") {
        return {
            caption: `Đồ Hình IV: Liên Hoa Tĩnh Tâm & Cân Bằng Ngũ Tạng (${menh})`,
            svg: `<svg viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="760" height="220" rx="16" fill="url(#g-${key})" stroke="#34d399" stroke-opacity="0.35"/>
<g transform="translate(185,115)" stroke="#6ee7b7" fill="#10b981" fill-opacity="0.16" stroke-width="1.4">
<ellipse rx="18" ry="58" transform="rotate(0)"/><ellipse rx="18" ry="58" transform="rotate(45)"/><ellipse rx="18" ry="58" transform="rotate(-45)"/><ellipse rx="18" ry="58" transform="rotate(90)"/>
<circle r="16" fill="#fde68a" fill-opacity="0.85"/></g>
<g font-family="sans-serif"><text x="320" y="58" fill="#6ee7b7" font-size="13" font-weight="bold">DƯỠNG THÂN &amp; AN TÂM THEO HÀNH ${el.name}</text>
<text x="320" y="88" font-size="12" fill="#e2e8f0">1. Tật Ách &amp; Tạng Phủ: Phòng ngừa sớm điểm yếu ngũ hành</text>
<text x="320" y="116" font-size="12" fill="#e2e8f0">2. Tâm Lý Học Bản Mệnh: Chuyển hóa áp lực thành tĩnh tại</text>
<text x="320" y="144" font-size="12" fill="#e2e8f0">3. Nhịp Sinh Học &amp; Không Gian Sống: Hài hòa khí trường</text>
<text x="320" y="172" font-size="12" fill="#fde68a">4. Nghi Thức Dưỡng Tâm: 15 phút thiền định tái tạo mỗi ngày</text></g></svg>`,
        };
    }
    return buildMoreChapterSvg(key, tb, defs, el);
}
