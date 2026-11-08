// lib/export-lifemap.ts
import { ThienBanData } from "./types";

export interface LifeMapData {
    c1CotCach: string;
    c2SuNghiep: string;
    c3TinhDuyen: string;
    c4SucKhoe: string;
    c5NenTranh: string;
    c6KimChiNam: string;
}

const cleanVi = (s?: string) => (s || "").normalize("NFC").replace(/\n/g, "<br/>");

export async function downloadLifeMapBook(tb: ThienBanData, data: LifeMapData) {
    const name = (tb?.ho_ten || "Đương số").normalize("NFC");
    const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
    const chapters = [
        ["Chương I. Cốt Cách Bản Mệnh & Định Vị Con Người", data.c1CotCach],
        ["Chương II. Con Đường Công Danh, Sự Nghiệp & Tài Lộc", data.c2SuNghiep],
        ["Chương III. Tình Duyên, Hôn Nhân, Gia Đạo & Nhân Duyên", data.c3TinhDuyen],
        ["Chương IV. Sức Khỏe Thể Chất & Bình An Nội Tâm", data.c4SucKhoe],
        ["Chương V. Những Điều Nên Tránh Làm Để An Nhiên", data.c5NenTranh],
        ["Chương VI. Kim Chỉ Nam Để Thành Công, Êm Ấm & Đủ Đầy", data.c6KimChiNam],
    ];

    const plainText = `BẢN ĐỒ CUỘC ĐỜI — ${name}\n\n` + chapters.map(([t, c]) => `${t}\n${(c || "").normalize("NFC")}`).join("\n\n---\n\n");
    const isInApp = /Zalo|FBAN|FBAV|Instagram|Line/i.test(navigator.userAgent || "");
    if (isInApp) {
        try { await navigator.clipboard.writeText(plainText); } catch { }
        alert("Zalo chặn tải file trực tiếp nên hệ thống đã TỰ ĐỘNG SAO CHÉP trọn bộ 6 chương vào bộ nhớ tạm! Bạn có thể dán vào Ghi chú (Notes), hoặc bấm dấu (•••) góc trên → 'Mở bằng Safari' để tải file.");
        return;
    }

    const bodyHtml = chapters.map(([t, c]) => `<section><h2>${t.normalize("NFC")}</h2><p>${cleanVi(c)}</p></section>`).join("");
    const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Bản Đồ Cuộc Đời — ${name}</title>
<style>body{font-family:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif;background:#0f172a;color:#e2e8f0;max-width:820px;margin:auto;padding:28px 20px;line-height:1.75}
header{text-align:center;border-bottom:1px solid #334155;padding-bottom:18px;margin-bottom:24px}h1{color:#fbbf24;margin:0 0 8px;font-size:24px}.meta{color:#94a3b8;font-size:14px}
section{background:#1e293b;border:1px solid #334155;border-radius:14px;padding:20px;margin-bottom:18px}h2{color:#38bdf8;font-size:17px;margin-top:0;border-bottom:1px dashed #334155;padding-bottom:8px}
p{font-size:15px;margin:0}.btn{background:#d97706;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:bold;margin-top:12px}
@media print{body{background:#fff;color:#111}section{background:#fff;border:1px solid #ccc}h1,h2{color:#000}.btn{display:none}}</style></head>
<body><header><h1>BẢN ĐỒ CUỘC ĐỜI TỬ VI ĐẨU SỐ</h1><div class="meta"><b>${name}</b> • ${tb?.nam_sinh} • ${tb?.am_duong} • ${tb?.ban_menh} • ${tb?.cuc_so || tb?.cuc} • ${tb?.than_cu}</div>
<button class="btn" onclick="window.print()">In / Lưu thành PDF</button></header>${bodyHtml}</body></html>`;

    const fileName = `ban-do-cuoc-doi-${slug}.html`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const file = new File([blob], fileName, { type: "text/html" });
    if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
        try { await navigator.share({ files: [file], title: fileName }); return; } catch { }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fileName; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
}