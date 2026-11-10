// lib/ai/cloud-profile-sync.ts
import { getCurrentUser } from "../auth-store";
const LOCK_TTL_MS = 95000;
let isPushing = false;
let lastLocalWriteAt = 0;
function getDeviceId(): string {
    if (typeof window === "undefined") return "srv";
    let id = sessionStorage.getItem("tuvi_dev_id");
    if (!id) { id = Math.random().toString(36).slice(2, 10); sessionStorage.setItem("tuvi_dev_id", id); }
    return id;
}
function emitSyncStatus(status: "syncing" | "synced" | "error", detail = "") {
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("tuvi-sync-status", { detail: { status, detail, ts: Date.now() } }));
}
export async function pushProfileToCloud(chartKey: string, formData?: any): Promise<boolean> {
    if (typeof window === "undefined") return false;
    const user = getCurrentUser();
    if (!user || !chartKey) return false;
    lastLocalWriteAt = Date.now();
    isPushing = true;
    emitSyncStatus("syncing");
    try {
        const mem = JSON.parse(localStorage.getItem(chartKey) || "{}");
        const lifeMap = JSON.parse(localStorage.getItem(`${chartKey}_lifemap_v1`) || "null");
        const charts = JSON.parse(localStorage.getItem(`${chartKey}_charts_v1`) || "{}");
        const busyLocks = JSON.parse(localStorage.getItem(`${chartKey}_locks_v1`) || "{}");
        const journal = JSON.parse(localStorage.getItem(`${chartKey}_journal_v1`) || "[]");
        const synastry = localStorage.getItem(`${chartKey}_synastry_v1`) || "";
        const rectify = localStorage.getItem(`${chartKey}_rectify_v1`) || "";
        const lastForm = formData || JSON.parse(localStorage.getItem(`${chartKey}_form_v1`) || "null");
        if (formData) localStorage.setItem(`${chartKey}_form_v1`, JSON.stringify(formData));
        const res = await fetch("/api/profile-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileKey: chartKey, userId: user.id, data: { mem, lifeMap, charts, busyLocks, lastForm, journal, synastry, rectify } }),
        });
        const j = await res.json();
        if (!res.ok || !j.ok) { emitSyncStatus("error", j.error || "Không lưu được Cloud"); return false; }
        emitSyncStatus("synced");
        return true;
    } catch (e: any) { emitSyncStatus("error", e?.message || "Lỗi mạng"); return false; }
    finally { isPushing = false; lastLocalWriteAt = Date.now(); }
}
export async function setOperationLock(chartKey: string, lockId: string, busy: boolean): Promise<void> {
    if (typeof window === "undefined" || !chartKey) return;
    try {
        const locks = JSON.parse(localStorage.getItem(`${chartKey}_locks_v1`) || "{}");
        if (busy) locks[lockId] = { ts: Date.now(), by: getDeviceId() };
        else delete locks[lockId];
        localStorage.setItem(`${chartKey}_locks_v1`, JSON.stringify(locks));
        window.dispatchEvent(new Event("tuvi-memory-updated"));
        await pushProfileToCloud(chartKey);
    } catch { }
}
export function isOperationLockedRemotely(chartKey: string, lockId: string, isLocalRunning: boolean): boolean {
    if (typeof window === "undefined" || !chartKey || isLocalRunning) return false;
    try {
        const locks = JSON.parse(localStorage.getItem(`${chartKey}_locks_v1`) || "{}");
        const item = locks[lockId];
        if (!item) return false;
        const ts = typeof item === "number" ? item : Number(item.ts || 0);
        const by = typeof item === "object" ? item.by : "";
        if (by && by === getDeviceId()) return false;
        return ts > 0 && Date.now() - ts < LOCK_TTL_MS;
    } catch { return false; }
}
export async function pullProfileFromCloud(chartKey?: string): Promise<any | null> {
    if (typeof window === "undefined" || isPushing || Date.now() - lastLocalWriteAt < 2500) return null;
    const user = getCurrentUser();
    if (!user) return null;
    try {
        const res = await fetch(`/api/profile-sync?userId=${encodeURIComponent(user.id)}&key=${encodeURIComponent(chartKey || "")}`, { cache: "no-store" });
        const { rows } = await res.json();
        if (!Array.isArray(rows) || rows.length === 0) return null;
        const exact = chartKey ? rows.find((r: any) => r.profile_key === chartKey) : null;
        const primary = exact || rows[0];
        const targetKey = chartKey || primary.profile_key;
        const allReadings = rows.reduce((acc: any, r: any) => ({ ...acc, ...(r.data?.mem?.cungReadings || {}) }), {});
        const d = primary.data || {};
        if (targetKey) {
            const localMem = JSON.parse(localStorage.getItem(targetKey) || "{}");
            const mergedMsgs = (d.mem?.messages?.length || 0) >= (localMem.messages?.length || 0) ? (d.mem?.messages || []) : localMem.messages;
            const mergedMem = { ...localMem, ...(d.mem || {}), messages: mergedMsgs, cungReadings: { ...(localMem.cungReadings || {}), ...allReadings }, memoryNotes: [...new Set([...(localMem.memoryNotes || []), ...(d.mem?.memoryNotes || [])])].slice(-12) };
            localStorage.setItem(targetKey, JSON.stringify(mergedMem));
            if (d.lifeMap) localStorage.setItem(`${targetKey}_lifemap_v1`, JSON.stringify(d.lifeMap));
            if (Array.isArray(d.journal)) localStorage.setItem(`${targetKey}_journal_v1`, JSON.stringify(d.journal));
            if (d.synastry) localStorage.setItem(`${targetKey}_synastry_v1`, d.synastry);
            if (d.rectify) localStorage.setItem(`${targetKey}_rectify_v1`, d.rectify);
            if (d.charts) localStorage.setItem(`${targetKey}_charts_v1`, JSON.stringify({ ...JSON.parse(localStorage.getItem(`${targetKey}_charts_v1`) || "{}"), ...d.charts }));
            localStorage.setItem(`${targetKey}_locks_v1`, JSON.stringify(d.busyLocks || {}));
            window.dispatchEvent(new Event("tuvi-memory-updated"));
        }
        return d.lastForm || null;
    } catch { return null; }
}
