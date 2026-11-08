// lib/export-image.ts
import { toPng } from "html-to-image";

export interface DeviceExportSpec {
    device: "mobile" | "tablet" | "desktop";
    width: number;
    height: number;
    label: string;
}

export function detectDeviceSpec(): DeviceExportSpec {
    if (typeof window === "undefined") return { device: "desktop", width: 1280, height: 860, label: "PC" };
    const ua = navigator.userAgent || "";
    const w = window.innerWidth;
    if (/iPhone|Android.*Mobile|Windows Phone/i.test(ua) || w < 768) {
        return { device: "mobile", width: 900, height: 1850, label: "Điện thoại" };
    }
    if (/iPad|Tablet|Android/i.test(ua) || w < 1024) {
        return { device: "tablet", width: 1024, height: 1280, label: "Tablet" };
    }
    return { device: "desktop", width: 1280, height: 860, label: "Máy tính" };
}

export async function downloadLaSoPng(element: HTMLElement | null, hoTen?: string, namXem?: string | number) {
    if (!element) return;
    const spec = detectDeviceSpec();

    // Nhường 2 frame để UI kịp hiện hiệu ứng loading & khóa nút trước khi render ảnh nặng
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    const options = {
        pixelRatio: 3,
        backgroundColor: "#020617",
        width: spec.width,
        height: spec.height,
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