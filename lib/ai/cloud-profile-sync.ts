// lib/ai/cloud-profile-sync.ts
import { getCurrentUser } from "../auth-store";
import { createDataFlowId, emitDataFlowTrace, summarizeDataFlowPayload } from "../data-flow-trace";
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
    const flowId = createDataFlowId();
    if (!user || !chartKey) {
        if (chartKey) emitDataFlowTrace({ flowId, stage: "memory", status: "info", title: "Giữ dữ liệu trên thiết bị", detail: "Chưa đăng nhập; profile không được gửi lên Cloud." });
        return false;
    }
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
        const requestBody = { profileKey: chartKey, userId: user.id, data: { mem, lifeMap, charts, busyLocks, lastForm, journal, synastry, rectify } };
        emitDataFlowTrace({ flowId, stage: "packaging", status: "success", title: "Đóng gói profile Cloud", detail: `${Object.keys(requestBody.data).length} nhóm dữ liệu trong profile.`, payload: summarizeDataFlowPayload(requestBody) });
        emitDataFlowTrace({ flowId, stage: "cloud", status: "active", title: "Đang đồng bộ lên Cloud", detail: "POST /api/profile-sync" });
        const res = await fetch("/api/profile-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });
        const j = await res.json();
        if (!res.ok || !j.ok) {
            emitSyncStatus("error", j.error || "Không lưu được Cloud");
            emitDataFlowTrace({ flowId, stage: "cloud", status: "error", title: "Đồng bộ Cloud thất bại", detail: j.error || "Không lưu được profile." });
            return false;
        }
        emitSyncStatus("synced");
        emitDataFlowTrace({ flowId, stage: "cloud", status: "success", title: "Đã đồng bộ Cloud", detail: "Profile đã được máy chủ xác nhận lưu." });
        return true;
    } catch (e: any) {
        emitSyncStatus("error", e?.message || "Lỗi mạng");
        emitDataFlowTrace({ flowId, stage: "cloud", status: "error", title: "Đồng bộ Cloud gặp lỗi", detail: e?.message || "Lỗi mạng." });
        return false;
    }
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
export async function pullProfileFromCloud(chartKey?: string, shouldTrace = true): Promise<any | null> {
    if (typeof window === "undefined" || isPushing || Date.now() - lastLocalWriteAt < 2500) return null;
    const user = getCurrentUser();
    const flowId = shouldTrace ? createDataFlowId() : "";
    const trace = (stage: "cloud" | "memory", status: "active" | "success" | "error" | "info", title: string, detail: string, payload?: ReturnType<typeof summarizeDataFlowPayload>) => {
        if (shouldTrace) emitDataFlowTrace({ flowId, stage, status, title, detail, payload });
    };
    if (!user) {
        trace("memory", "info", "Bỏ qua Cloud", "Chưa đăng nhập; dữ liệu tiếp tục được dùng từ thiết bị.");
        return null;
    }
    try {
        trace("cloud", "active", "Đang tải profile Cloud", chartKey ? "Tìm profile của lá số hiện tại." : "Tìm profile gần nhất trong tài khoản.");
        const res = await fetch(`/api/profile-sync?userId=${encodeURIComponent(user.id)}&key=${encodeURIComponent(chartKey || "")}`, { cache: "no-store" });
        const response = await res.json();
        if (!res.ok) throw new Error(response.error || "Không tải được profile Cloud.");
        const { rows } = response;
        if (!Array.isArray(rows) || rows.length === 0) {
            trace("cloud", "info", "Không có profile Cloud", "Chưa tìm thấy profile phù hợp.");
            return null;
        }
        const exact = chartKey ? rows.find((r: any) => r.profile_key === chartKey) : null;
        if (chartKey && !exact) {
            trace("cloud", "info", "Không khớp chart trên Cloud", "Không ghi đè bộ nhớ của lá số hiện tại.");
            return null;
        }
        const primary = exact || rows[0];
        const targetKey = chartKey || primary.profile_key;
        const d = primary.data || {};
        if (targetKey) {
            const localMem = JSON.parse(localStorage.getItem(targetKey) || "{}");
            const mergedMsgs = (d.mem?.messages?.length || 0) >= (localMem.messages?.length || 0) ? (d.mem?.messages || []) : localMem.messages;
            const mergedMem = { ...localMem, ...(d.mem || {}), messages: mergedMsgs, cungReadings: { ...(localMem.cungReadings || {}), ...(d.mem?.cungReadings || {}) }, memoryNotes: [...new Set([...(localMem.memoryNotes || []), ...(d.mem?.memoryNotes || [])])].slice(-12) };
            localStorage.setItem(targetKey, JSON.stringify(mergedMem));
            if (d.lifeMap) localStorage.setItem(`${targetKey}_lifemap_v1`, JSON.stringify(d.lifeMap));
            if (Array.isArray(d.journal)) localStorage.setItem(`${targetKey}_journal_v1`, JSON.stringify(d.journal));
            if (d.synastry) localStorage.setItem(`${targetKey}_synastry_v1`, d.synastry);
            if (d.rectify) localStorage.setItem(`${targetKey}_rectify_v1`, d.rectify);
            if (d.charts) localStorage.setItem(`${targetKey}_charts_v1`, JSON.stringify({ ...JSON.parse(localStorage.getItem(`${targetKey}_charts_v1`) || "{}"), ...d.charts }));
            localStorage.setItem(`${targetKey}_locks_v1`, JSON.stringify(d.busyLocks || {}));
            window.dispatchEvent(new Event("tuvi-memory-updated"));
            trace("memory", "success", "Đã nhập profile vào bộ nhớ", "Gộp dữ liệu Cloud vào localStorage của chart hiện tại.", summarizeDataFlowPayload(d));
        }
        trace("cloud", "success", "Tải profile hoàn tất", "Dữ liệu Cloud đã được đối chiếu với chart hiện tại.");
        return d.lastForm || null;
    } catch (error) {
        trace("cloud", "error", "Tải profile gặp lỗi", error instanceof Error ? error.message : "Lỗi không xác định.");
        return null;
    }
}
