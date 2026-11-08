// lib/ai/cloud-profile-sync.ts
import { getCurrentUser } from "../auth-store";

export async function pushProfileToCloud(chartKey: string): Promise<void> {
    if (typeof window === "undefined") return;
    const user = getCurrentUser();
    if (!user || !chartKey) return;

    try {
        const mem = JSON.parse(localStorage.getItem(chartKey) || "{}");
        const lifeMap = JSON.parse(localStorage.getItem(`${chartKey}_lifemap_v1`) || "null");
        const charts = JSON.parse(localStorage.getItem(`${chartKey}_charts_v1`) || "{}");
        const bundle = { mem, lifeMap, charts };

        await fetch("/api/profile-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileKey: chartKey, userId: user.id, data: bundle }),
        });
    } catch { }
}

export async function pullProfileFromCloud(chartKey: string): Promise<void> {
    if (typeof window === "undefined") return;
    const user = getCurrentUser();
    if (!user || !chartKey) return;

    try {
        const res = await fetch(`/api/profile-sync?key=${encodeURIComponent(chartKey)}`, { cache: "no-store" });
        const { data } = await res.json();
        if (!data) return;

        if (data.mem) localStorage.setItem(chartKey, JSON.stringify(data.mem));
        if (data.lifeMap) localStorage.setItem(`${chartKey}_lifemap_v1`, JSON.stringify(data.lifeMap));
        if (data.charts && Object.keys(data.charts).length > 0) {
            localStorage.setItem(`${chartKey}_charts_v1`, JSON.stringify(data.charts));
        }
        window.dispatchEvent(new Event("tuvi-memory-updated"));
    } catch { }
}