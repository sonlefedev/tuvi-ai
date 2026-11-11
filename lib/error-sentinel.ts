// lib/error-sentinel.ts
const sentFingerprints = new Set<string>();

export function reportSystemError(source: string, message: string, detail = "") {
    if (typeof window === "undefined") return;
    const msg = String(message || "").trim();
    if (!msg || /AbortError|The user aborted|ResizeObserver/i.test(msg)) return;
    const fp = `${source}:${msg.slice(0, 80)}`;
    if (sentFingerprints.has(fp)) return;
    sentFingerprints.add(fp);

    const ua = navigator.userAgent || "";
    const device = `${/iPhone|iPad/i.test(ua) ? "iOS" : /Android/i.test(ua) ? "Android" : "PC"} • ${/Zalo/i.test(ua) ? "Zalo" : /Chrome/i.test(ua) ? "Chrome" : /Safari/i.test(ua) ? "Safari" : "Web"}`;
    fetch("/api/watchdog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report_error", source, message: msg.slice(0, 300), detail: detail.slice(0, 400), device }),
    }).catch(() => { });
}

export function startErrorSentinel(): () => void {
    if (typeof window === "undefined") return () => { };
    const onErr = (e: ErrorEvent) => reportSystemError("JS Runtime", e.message, `${e.filename || ""}:${e.lineno || 0}`);
    const onRej = (e: PromiseRejectionEvent) => reportSystemError("Promise", e.reason?.message || String(e.reason || "Unhandled rejection"));

    const origFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const res = await origFetch(input, init);
        if (url.includes("/api/") && !url.includes("/api/watchdog") && !url.includes("/api/analytics") && res.status >= 500) {
            reportSystemError(`API ${res.status}`, `Lỗi máy chủ tại ${url.split("?")[0]}`, `HTTP ${res.status}`);
        }
        return res;
    };

    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => { window.removeEventListener("error", onErr); window.removeEventListener("unhandledrejection", onRej); window.fetch = origFetch; };
}
