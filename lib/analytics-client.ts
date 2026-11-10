// lib/analytics-client.ts
import { getCurrentUser } from "./auth-store";

const SECTION_IDS = ["sec-intro", "sec-form", "sec-board", "sec-timeline", "sec-lifemap", "sec-cung", "sec-chart", "sec-journal", "sec-synastry", "sec-rectify", "sec-chat"];
let dwellBuffer: Record<string, number> = {};
let featureBuffer: Record<string, number> = {};
let visitSentForSession = false;
let currentSection = "sec-intro";
const sessionStartMs = typeof window !== "undefined" ? Date.now() : 0;

function getIds() {
    let vid = localStorage.getItem("tuvi_vid");
    const isReturning = Boolean(vid);
    if (!vid) { vid = "v_" + Math.random().toString(36).slice(2, 11); localStorage.setItem("tuvi_vid", vid); }
    let sid = sessionStorage.getItem("tuvi_sid");
    const isNewSession = !sid;
    if (!sid) { sid = "s_" + Math.random().toString(36).slice(2, 11); sessionStorage.setItem("tuvi_sid", sid); }
    return { vid, sid, isNewSession, isReturning };
}

function detectFullMeta(isReturning: boolean) {
    const nav: any = navigator;
    const ua = nav.userAgent || "";
    const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? "Mobile" : "Desktop";
    const os = /iPhone/i.test(ua) ? "iPhone (iOS)" : /iPad/i.test(ua) ? "iPad" : /Android/i.test(ua) ? ((ua.match(/Android[^;)]+;\s*([^;)]+)/)?.[1] || "Android").trim()) : /Windows/i.test(ua) ? "Windows PC" : /Mac OS X/i.test(ua) ? "MacBook / macOS" : "Linux";
    const browser = /Zalo/i.test(ua) ? "Zalo" : /FBAN|FBAV/i.test(ua) ? "Facebook App" : /CocCoc/i.test(ua) ? "Cốc Cốc" : /Edg\//i.test(ua) ? "Edge" : /Chrome|CriOS/i.test(ua) ? "Chrome" : /Safari/i.test(ua) ? "Safari" : "Trình duyệt";
    const ref = document.referrer || "";
    const source = /Zalo/i.test(ua) ? "Zalo" : /FBAN|FBAV|facebook/i.test(ua + ref) ? "Facebook" : /google/i.test(ref) ? "Google" : ref ? "Liên kết khác" : "Trực tiếp";
    const dpr = window.devicePixelRatio ? `@${window.devicePixelRatio.toFixed(1)}x` : "";
    const screen = `${window.innerWidth}×${window.innerHeight} ${dpr}`.trim();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lang = nav.language || "";
    const net = nav.connection?.effectiveType ? String(nav.connection.effectiveType).toUpperCase() : "";
    const hw = [nav.hardwareConcurrency ? `${nav.hardwareConcurrency} CPU` : "", nav.deviceMemory ? `${nav.deviceMemory}GB RAM` : ""].filter(Boolean).join(" • ");
    const u = getCurrentUser();
    const userLabel = u ? `@${u.username}` : "Khách vãng lai";
    return { device, deviceLabel: `${os} • ${browser}`, screen, source, tz, lang, net, hw, userLabel, isReturning };
}

export function trackFeature(featureKey: string, count = 1) {
    if (typeof window !== "undefined") featureBuffer[featureKey] = (featureBuffer[featureKey] || 0) + count;
}

export function flushAnalytics(useBeacon = false, isHeartbeat = false) {
    if (typeof window === "undefined") return;
    const { vid, sid, isNewSession, isReturning } = getIds();
    const sendVisit = isNewSession || !visitSentForSession;
    if (!sendVisit && !isHeartbeat && !Object.keys(dwellBuffer).length && !Object.keys(featureBuffer).length) return;

    const payload = JSON.stringify({
        vid, sid, heartbeat: isHeartbeat, newVisit: sendVisit ? 1 : 0,
        meta: detectFullMeta(isReturning),
        live: { section: currentSection, sessionSec: Math.round((Date.now() - sessionStartMs) / 1000), idle: Boolean(document.hidden) },
        dwell: dwellBuffer, features: featureBuffer,
    });
    visitSentForSession = true; dwellBuffer = {}; featureBuffer = {};
    if (useBeacon && navigator.sendBeacon) navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    else fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => { });
}

export function startAnalyticsTracking(): () => void {
    const visibleRatios: Record<string, number> = {};
    const io = new IntersectionObserver((entries) => { for (const e of entries) visibleRatios[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; }, { threshold: [0.15, 0.4, 0.7] });
    const observeAll = () => SECTION_IDS.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    const onClick = (e: MouseEvent) => {
        const txt = ((e.target as HTMLElement)?.closest("button")?.textContent || "").toLowerCase();
        if (!txt) return;
        if (txt.includes("an sao")) trackFeature("An sao lập lá số");
        else if (txt.includes("đại cẩm nang") || txt.includes("viết lại trọn bộ") || txt.includes("viết bổ sung")) trackFeature("Lập Đại Cẩm Nang 8 chương");
        else if (txt.includes("luận chuyên sâu") || txt.includes("luận lại cung")) trackFeature("AI Luận cung chi tiết");
        else if (txt.includes("trợ lý ai") || txt.includes("gửi câu hỏi")) trackFeature("Chat Trợ lý AI");
        else if (txt.includes("tải ảnh") || txt.includes("tải sách") || txt.includes(".ics")) trackFeature("Tải ảnh / Sách / Lịch .ICS");
        else if (txt.includes("biểu đồ")) trackFeature("Biểu đồ AI 4 tầng");
        else if (txt.includes("hợp lá số") || txt.includes("định giờ")) trackFeature("Hợp lá số / Định giờ sinh");
        else if (txt.includes("gieo quẻ") || txt.includes("video demo")) trackFeature("Gieo quẻ / Xem Video Intro");
    };
    document.addEventListener("click", onClick, true);

    const tick = setInterval(() => {
        const best = Object.entries(visibleRatios).sort((a, b) => b[1] - a[1])[0];
        if (best && best[1] > 0.1) { currentSection = best[0]; if (!document.hidden) dwellBuffer[best[0]] = (dwellBuffer[best[0]] || 0) + 2; }
    }, 2000);

    const hbTimer = setInterval(() => flushAnalytics(false, true), 8000);
    const onHide = () => flushAnalytics(true, true);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", () => flushAnalytics(document.hidden, true));
    flushAnalytics(false, true);
    return () => { io.disconnect(); mo.disconnect(); document.removeEventListener("click", onClick, true); clearInterval(tick); clearInterval(hbTimer); window.removeEventListener("pagehide", onHide); };
}
