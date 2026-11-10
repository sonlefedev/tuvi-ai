// lib/poster-export.ts
export function downloadPromoPosterPng(lines: string[]) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createRadialGradient(540, 420, 80, 540, 675, 920);
    grad.addColorStop(0, "#1e1b4b");
    grad.addColorStop(0.55, "#0f172a");
    grad.addColorStop(1, "#020617");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);

    ctx.strokeStyle = "rgba(251, 191, 36, 0.45)";
    ctx.lineWidth = 4;
    ctx.strokeRect(42, 42, 996, 1266);

    ctx.beginPath();
    ctx.arc(540, 340, 195, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(251, 191, 36, 0.35)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(540, 340, 145, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.stroke();

    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 36px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("✦ TỬ VI ĐẨU SỐ AI ✦", 540, 352);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("NAM PHÁI • PHI TINH TỨ HÓA • CẨM NANG 100.000 CHỮ", 540, 600);

    const headline = (lines[0] || "KHÁM PHÁ BẢN ĐỒ CUỘC ĐỜI CỦA BẠN").toUpperCase();
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 50px Georgia, serif";
    const words = headline.split(" ");
    let line = "", y = 685;
    for (const w of words) {
        if (ctx.measureText(line + w).width > 900) { ctx.fillText(line.trim(), 540, y); line = w + " "; y += 64; }
        else line += w + " ";
    }
    if (line.trim()) ctx.fillText(line.trim(), 540, y);

    const bullets = [
        lines[1] || "An 14 Chính Tinh & 90 Phụ Tinh chuẩn Âm Dương",
        lines[2] || "Đại Cẩm Nang 8 chương minh họa (~100.000 chữ)",
        lines[3] || "Hợp Lá Số Đôi • Định Giờ Sinh • Chat AI 24/7",
    ];
    bullets.forEach((b, i) => {
        const by = 860 + i * 86;
        ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
        ctx.fillRect(110, by - 42, 860, 64);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 27px sans-serif";
        ctx.fillText(`★  ${b}`, 540, by);
    });

    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(170, 1155, 740, 78);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText("TRẢI NGHIỆM MIỄN PHÍ: sonlexinchao-tuvi.netlify.app", 540, 1204);

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "poster-quang-cao-tuvi-ai.png";
    a.click();
}
