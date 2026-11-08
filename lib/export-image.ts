// lib/export-image.ts
import { toPng } from "html-to-image";

export async function downloadLaSoPng(element: HTMLElement | null, hoTen?: string, namXem?: string | number) {
    if (!element) return;

    // Nhường 2 frame để UI kịp hiện hiệu ứng xoay & khóa nút trước khi render ảnh 4K
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    const options = {
        pixelRatio: 3,
        backgroundColor: "#020617",
        width: 1440,
        height: 1060,
        style: { opacity: "1", transform: "none" },
    };

    await toPng(element, options);
    const dataUrl = await toPng(element, options);

    const blob = await (await fetch(dataUrl)).blob();
    const url = URL.createObjectURL(blob);
    const cleanName = (hoTen || "").trim() || "duong-so";
    const slug = cleanName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();

    const link = document.createElement("a");
    link.download = `la-so-${slug}-${namXem || 2026}.png`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
}