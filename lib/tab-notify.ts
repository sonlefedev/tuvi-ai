// lib/tab-notify.ts
let baseTitle = "Tử Vi Đẩu Số AI — Lập Lá Số & Luận Giải";

export function setBaseTabTitle(hoTen?: string, namXem?: string | number) {
    baseTitle = hoTen ? `Lá Số ${hoTen} (${namXem || 2026}) — Tử Vi AI` : "Tử Vi Đẩu Số AI — Lập Lá Số & Luận Giải";
    if (typeof document !== "undefined") document.title = baseTitle;
}

export function notifyTabStatus(statusText: string, autoResetMs?: number) {
    if (typeof document === "undefined") return;
    document.title = `${statusText} — Tử Vi AI`;

    if (autoResetMs) {
        setTimeout(() => { document.title = baseTitle; }, autoResetMs);
        return;
    }
    const restore = () => {
        if (!document.hidden) {
            document.title = baseTitle;
            window.removeEventListener("focus", restore);
            document.removeEventListener("visibilitychange", restore);
        }
    };
    window.addEventListener("focus", restore);
    window.addEventListener("visibilitychange", restore);
}