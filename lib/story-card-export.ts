// lib/story-card-export.ts
export function downloadDailyFortuneStory(card: { star: string; color: string; hour: string; num: string; msg: string }) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createRadialGradient(540, 620, 90, 540, 960, 1250);
    grad.addColorStop(0, "#311042");
    grad.addColorStop(0.55, "#0f172a");
    grad.addColorStop(1, "#020617");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
    ctx.lineWidth = 5;
    ctx.strokeRect(48, 48, 984, 1824);

    ctx.beginPath();
    ctx.arc(540, 520, 230, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✦ THÔNG ĐIỆP TINH TÚ HÔM NAY ✦", 540, 220);

    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 56px Georgia, serif";
    ctx.fillText(card.star.toUpperCase(), 540, 535);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "34px sans-serif";
    const words = card.msg.split(" ");
    let line = "", y = 860;
    for (const w of words) {
        if (ctx.measureText(line + w).width > 880) { ctx.fillText(line.trim(), 540, y); line = w + " "; y += 52; }
        else line += w + " ";
    }
    if (line.trim()) ctx.fillText(line.trim(), 540, y);

    const rows = [`Màu cát tường: ${card.color}`, `Giờ hoàng đạo: ${card.hour}`, `Con số may mắn: ${card.num}`];
    rows.forEach((r, i) => {
        const ry = 1140 + i * 96;
        ctx.fillStyle = "rgba(30, 41, 59, 0.92)";
        ctx.fillRect(130, ry - 48, 820, 72);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 30px sans-serif";
        ctx.fillText(`★  ${r}`, 540, ry);
    });

    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(140, 1560, 800, 88);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText("GIEO QUẺ & LẬP LÁ SỐ: sonlexinchao-tuvi.netlify.app", 540, 1614);

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "que-may-man-tuvi-ai.png";
    a.click();
}
