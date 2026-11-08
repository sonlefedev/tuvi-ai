// lib/export-image.ts
import { toPng } from "html-to-image";

function showInAppImageModal(dataUrl: string, fileName: string) {
    const wrap = document.createElement("div");
    wrap.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(2,6,23,.95);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;gap:12px";
    wrap.innerHTML = `<div style="color:#fbbf24;font:bold 13px sans-serif;text-align:center">Chạm giữ vào ảnh bên dưới → chọn "Lưu vào Ảnh"<br/><span style="color:#94a3b8;font-weight:normal;font-size:11px">(${fileName})</span></div>
  <img src="${dataUrl}" style="max-width:100%;max-height:76vh;border-radius:12px;border:1px solid #334155"/>
  <button id="close-img-prev" style="background:#e11d48;color:#fff;border:none;padding:8px 20px;border-radius:99px;font:bold 13px sans-serif">Đóng lại</button>`;
    document.body.appendChild(wrap);
    wrap.querySelector("#close-img-prev")?.addEventListener("click", () => wrap.remove());
}

export async function downloadLaSoPng(element: HTMLElement | null, hoTen?: string, namXem?: string | number) {
    if (!element) return;
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    const options = { pixelRatio: 3, backgroundColor: "#020617", width: 1440, height: 1060, style: { opacity: "1", transform: "none" } };
    await toPng(element, options);
    const dataUrl = await toPng(element, options);

    const cleanName = (hoTen || "").trim() || "duong-so";
    const slug = cleanName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
    const fileName = `la-so-${slug}-${namXem || 2026}.png`;

    const isInApp = /Zalo|FBAN|FBAV|Instagram|Line/i.test(navigator.userAgent || "");
    if (isInApp) {
        showInAppImageModal(dataUrl, fileName);
        return;
    }

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], fileName, { type: "image/png" });
    if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
        try { await navigator.share({ files: [file], title: fileName }); return; } catch { }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
}