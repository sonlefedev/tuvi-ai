// lib/ai/cloud-profile-sync.ts
import { getCurrentUser } from "../auth-store";

const LOCK_TTL_MS = 45000;

export async function pushProfileToCloud(chartKey: string): Promise<void> {
    if (typeof window === "undefined") return;
    const user = getCurrentUser();
    if (!user || !chartKey) return;

    try {
        const mem = JSON.parse(localStorage.getItem(chartKey) || "{}");
        const lifeMap = JSON.parse(localStorage.getItem(`${chartKey}_lifemap_v1`) || "null");
        const charts = JSON.parse(localStorage.getItem(`${chartKey}_charts_v1`) || "{}");
        const busyLocks = JSON.parse(localStorage.getItem(`${chartKey}_locks_v1`) || "{}");
        await fetch("/api/profile-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileKey: chartKey, userId: user.id, data: { mem, lifeMap, charts, busyLocks } }),
        });
    } catch { }
}

export async function setPalaceBusyLock(chartKey: string, chi: string, busy: boolean): Promise<void> {
    if (typeof window === "undefined" || !chartKey) return;
    try {
        const locks = JSON.parse(localStorage.getItem(`${chartKey}_locks_v1`) || "{}");
        if (busy) locks[chi] = Date.now();
        else delete locks[chi];
        localStorage.setItem(`${chartKey}_locks_v1`, JSON.stringify(locks));
        await pushProfileToCloud(chartKey);
    } catch { }
}

export function isPalaceLockedRemotely(chartKey: string, chi: string, isLocalRunning: boolean): boolean {
    if (typeof window === "undefined" || !chartKey || isLocalRunning) return false;
    try {
        const locks = JSON.parse(localStorage.getItem(`${chartKey}_locks_v1`) || "{}");
        const ts = Number(locks[chi] || 0);
        return ts > 0 && Date.now() - ts < LOCK_TTL_MS;
    } catch {
        return false;
    }
}

export async function pullProfileFromCloud(chartKey: string): Promise<void> {
    if (typeof window === "undefined") return;
    const user = getCurrentUser();
    if (!user || !chartKey) return;

    try {
        const res = await fetch(`/api/profile-sync?key=${encodeURIComponent(chartKey)}`, { cache: "no-store" });
        const { data } = await res.json();
        if (!data) return;

        if (data.mem) {
            const localMem = JSON.parse(localStorage.getItem(chartKey) || "{}");
            const mergedMem = {
                ...localMem,
                ...data.mem,
                cungReadings: { ...(localMem.cungReadings || {}), ...(data.mem.cungReadings || {}) },
                memoryNotes: [...new Set([...(localMem.memoryNotes || []), ...(data.mem.memoryNotes || [])])].slice(-12),
            };
            localStorage.setItem(chartKey, JSON.stringify(mergedMem));
        }
        if (data.lifeMap) localStorage.setItem(`${chartKey}_lifemap_v1`, JSON.stringify(data.lifeMap));
        if (data.charts && Object.keys(data.charts).length > 0) {
            const localCharts = JSON.parse(localStorage.getItem(`${chartKey}_charts_v1`) || "{}");
            localStorage.setItem(`${chartKey}_charts_v1`, JSON.stringify({ ...localCharts, ...data.charts }));
        }
        localStorage.setItem(`${chartKey}_locks_v1`, JSON.stringify(data.busyLocks || {}));
        window.dispatchEvent(new Event("tuvi-memory-updated"));
    } catch { }
}