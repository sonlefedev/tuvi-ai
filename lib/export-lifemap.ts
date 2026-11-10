// lib/export-lifemap.ts
import { ThienBanData } from "./types";
import { LIFE_CHAPTERS, LifeMapData, normalizeLifeMap, countLifeMapChars } from "./ai/lifemap-chapters";

export type { LifeMapData };

function formatBodyHtml(s?: string): string {
    return (s || "")
        .normalize("NFC")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n\n+/g, "</p><p>")
        .replace(/\n/g, "<br/>");
}

export async function downloadLifeMapBook(tb: ThienBanData, raw: LifeMapData) {
    const norm = normalizeLifeMap(raw);
    if (!norm) return;
    const name = (tb?.ho_ten || "Đương số").normalize("NFC");
    const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
    const chapters = LIFE_CHAPTERS.filter((c) => norm[c.key]?.trim()).map((c) => [c.title, norm[c.key]] as [string, string]);
    const totalChars = countLifeMapChars(raw).toLocaleString("vi-VN");

    const plainText = `ĐẠI CẨM NANG BẢN ĐỒ CUỘC ĐỜI — ${name} (${totalChars} ký tự)\n\n` + chapters.map(([t, c]) => `${t}\n${c.normalize("NFC")}`).join("\n\n====================================\n\n");
    if (/Zalo|FBAN|FBAV|Instagram|Line/i.test(navigator.userAgent || "")) {
        try { await navigator.clipboard.writeText(plainText); } catch { }
        alert("Zalo chặn tải file trực tiếp nên hệ thống đã TỰ ĐỘNG SAO CHÉP trọn bộ Đại Cẩm Nang vào bộ nhớ tạm! Bạn có thể dán vào Ghi chú (Notes), hoặc bấm dấu (•••) góc trên → 'Mở bằng Safari' để tải file.");
        return;
    }

    const tocHtml = `<nav class="toc"><b>MỤC LỤC (${chapters.length} CHƯƠNG • ${totalChars} KÝ TỰ)</b><ol>${chapters.map(([t], i) => `<li><a href="#ch-${i + 1}">${t}</a></li>`).join("")}</ol></nav>`;
    const bodyHtml = chapters.map(([t, c], i) => `<section id="ch-${i + 1}"><h2>${t.normalize("NFC")}</h2><p>${formatBodyHtml(c)}</p></section>`).join("");
    const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Đại Cẩm Nang Bản Đồ Cuộc Đời — ${name}</title>
<style>body{font-family:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif;background:#0f172a;color:#e2e8f0;max-width:880px;margin:auto;padding:28px 20px;line-height:1.85}
header{text-align:center;border-bottom:1px solid #334155;padding-bottom:20px;margin-bottom:24px}h1{color:#fbbf24;margin:0 0 8px;font-size:25px}.meta{color:#94a3b8;font-size:14px}
.toc{background:#1e293b;border:1px solid #475569;border-radius:14px;padding:18px 22px;margin-bottom:22px}.toc ol{margin:10px 0 0;padding-left:20px}.toc a{color:#7dd3fc;text-decoration:none}
section{background:#1e293b;border:1px solid #334155;border-radius:14px;padding:24px;margin-bottom:20px;page-break-inside:avoid}h2{color:#fbbf24;font-size:18px;margin-top:0;border-bottom:1px dashed #334155;padding-bottom:10px}
h3{color:#38bdf8;font-size:15.5px;margin:18px 0 8px}p{font-size:15px;margin:0 0 12px}strong{color:#fde68a}.btn{background:#d97706;color:#fff;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;font-weight:bold;margin-top:12px}
@media print{body{background:#fff;color:#111}section,.toc{background:#fff;border:1px solid #ccc}h1,h2,h3,strong,.toc a{color:#000}.btn{display:none}}</style></head>
<body><header><h1>ĐẠI CẨM NANG BẢN ĐỒ CUỘC ĐỜI TỬ VI</h1><div class="meta"><b>${name}</b> • ${tb?.nam_sinh} • ${tb?.am_duong} • ${tb?.ban_menh} • ${tb?.cuc_so || tb?.cuc} • ${tb?.than_cu}</div>
<button class="btn" onclick="window.print()">In / Lưu thành PDF</button></header>${tocHtml}${bodyHtml}</body></html>`;

    const fileName = `dai-cam-nang-cuoc-doi-${slug}.html`;
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
