// lib/export-image.ts
import { toPng } from "html-to-image";

export async function downloadLaSoPng(element: HTMLElement | null, hoTen?: string, namXem?: string | number) {
    if (!element) return;

    const options = {
        pixelRatio: 3,
        backgroundColor: "#020617",
        width: 900,
        height: 1850,
        style: { opacity: "1", transform: "none" },
    };

    await toPng(element, options);
    const dataUrl = await toPng(element, options);

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const slug = (hoTen || "duong-so")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/gi, "d").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();

    const link = document.createElement("a");
    link.download = `la-so-${slug}-${namXem || 2026}.png`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
}