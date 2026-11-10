// lib/export-lifemap.ts
import { ThienBanData } from "./types";
import { LIFE_CHAPTERS, LifeMapData, normalizeLifeMap, countLifeMapChars } from "./ai/lifemap-chapters";
import { buildChapterIllustrationSvg } from "./ai/chapter-svg";

export type { LifeMapData };

function formatBodyHtml(s?: string): string {
    return (s || "")
        .normalize("NFC")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
        .replace(/^&gt;\s*(.+)$/gm, "<blockquote>“$1”</blockquote>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n\n+/g, "</p><p>")
        .replace(/\n/g, "<br/>");
}

export async function downloadLifeMapBook(tb: ThienBanData, raw: LifeMapData) {
    const norm = normalizeLifeMap(raw);
    if (!norm) return;
    const name = (tb?.ho_ten || "Đương số").normalize("NFC");
    const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
    const chapters = LIFE_CHAPTERS.filter((c) => norm[c.key]?.trim());
    const totalChars = countLifeMapChars(raw).toLocaleString("vi-VN");

    const plainText = `ĐẠI CẨM NANG BẢN ĐỒ CUỘC ĐỜI — ${name} (${totalChars} ký tự)\n\n` + chapters.map((c) => `${c.title}\n“${c.motto}”\n\n${norm[c.key].normalize("NFC")}`).join("\n\n====================================\n\n");
    if (/Zalo|FBAN|FBAV|Instagram|Line/i.test(navigator.userAgent || "")) {
        try { await navigator.clipboard.writeText(plainText); } catch { }
        alert("Zalo chặn tải file trực tiếp nên hệ thống đã TỰ ĐỘNG SAO CHÉP trọn bộ Đại Cẩm Nang vào bộ nhớ tạm! Bạn có thể dán vào Ghi chú (Notes), hoặc bấm dấu (•••) góc trên → 'Mở bằng Safari' để tải file.");
        return;
    }

    const tocHtml = `<nav class="toc"><b>MỤC LỤC (${chapters.length} CHƯƠNG MINH HỌA • ${totalChars} KÝ TỰ)</b><ol>${chapters.map((c, i) => `<li><a href="#ch-${i + 1}">${c.title}</a></li>`).join("")}</ol></nav>`;
    const bodyHtml = chapters.map((c, i) => {
        const art = buildChapterIllustrationSvg(c.key, tb);
        return `<section id="ch-${i + 1}"><h2>${c.title}</h2><div class="motto">“${c.motto}”</div><figure>${art.svg}<figcaption>${art.caption}</figcaption></figure><p>${formatBodyHtml(norm[c.key])}</p></section>`;
    }).join("");
    const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Đại Cẩm Nang Minh Họa — ${name}</title>
<style>body{font-family:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif;background:#0f172a;color:#e2e8f0;max-width:880px;margin:auto;padding:28px 20px;line-height:1.85}
header{text-align:center;border-bottom:1px solid #334155;padding-bottom:20px;margin-bottom:24px}h1{color:#fbbf24;margin:0 0 8px;font-size:25px}.meta{color:#94a3b8;font-size:14px}
.toc{background:#1e293b;border:1px solid #475569;border-radius:14px;padding:18px 22px;margin-bottom:22px}.toc ol{margin:10px 0 0;padding-left:20px}.toc a{color:#7dd3fc;text-decoration:none}
section{background:#1e293b;border:1px solid #334155;border-radius:14px;padding:24px;margin-bottom:20px}h2{color:#fbbf24;font-size:18px;margin:0 0 6px}
.motto{color:#fde68a;font-style:italic;font-size:13.5px;border-bottom:1px dashed #334155;padding-bottom:10px;margin-bottom:14px}
figure{margin:0 0 16px;text-align:center}figure svg{max-width:100%;height:auto;border-radius:12px}figcaption{font-size:12px;color:#94a3b8;margin-top:6px;font-style:italic}
h3{color:#38bdf8;font-size:15.5px;margin:18px 0 8px}blockquote{margin:12px 0;padding:10px 14px;background:rgba(245,158,11,0.12);border-left:4px solid #fbbf24;border-radius:8px;font-style:italic;color:#fef3c7}
p{font-size:15px;margin:0 0 12px}strong{color:#fde68a}.btn{background:#d97706;color:#fff;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;font-weight:bold;margin-top:12px}
@media print{body{background:#fff;color:#111}section,.toc{background:#fff;border:1px solid #ccc}h1,h2,h3,strong,.toc a,.motto{color:#000}blockquote{background:#fffbeb;color:#111}.btn{display:none}}</style></head>
<body><header><h1>ĐẠI CẨM NANG BẢN ĐỒ CUỘC ĐỜI TỬ VI</h1><div class="meta"><b>${name}</b> • ${tb?.nam_sinh} • ${tb?.am_duong} • ${tb?.ban_menh} • ${tb?.cuc_so || tb?.cuc} • ${tb?.than_cu}</div>
<button class="btn" onclick="window.print()">In / Lưu thành PDF</button></header>${tocHtml}${bodyHtml}</body></html>`;

    const fileName = `dai-cam-nang-minh-hoa-${slug}.html`;
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
