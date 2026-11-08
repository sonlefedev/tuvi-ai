// lib/ai/tuvi-memory-store.ts
export interface ChatTurn { role: "user" | "ai"; text: string; ts: number; }
export interface ChartMemoryState { chartKey: string; compactChart: string; memoryNotes: string[]; messages: ChatTurn[]; }

const PREFIX = "tuvi_ai_mem_v1_";

export function buildChartKey(tb: any): string {
    const raw = [tb?.ho_ten, tb?.nam_sinh, tb?.thang_sinh, tb?.ngay_sinh, tb?.gio_sinh, tb?.gioi_tinh].join("_");
    return PREFIX + raw.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function loadChartMemory(chartKey: string, compactChart: string): ChartMemoryState {
    if (typeof window === "undefined") return { chartKey, compactChart, memoryNotes: [], messages: [] };
    try {
        const saved = localStorage.getItem(chartKey);
        if (saved) return { ...JSON.parse(saved), compactChart };
    } catch { }
    return { chartKey, compactChart, memoryNotes: [], messages: [] };
}

export function saveChartMemory(state: ChartMemoryState): void {
    if (typeof window === "undefined") return;
    try {
        const trimmed: ChartMemoryState = {
            ...state,
            memoryNotes: [...new Set(state.memoryNotes)].slice(-10), // Lọc trùng & giữ tối đa 10 ký ức cốt lõi
            messages: state.messages.slice(-20),
        };
        localStorage.setItem(state.chartKey, JSON.stringify(trimmed));
        window.dispatchEvent(new Event("tuvi-memory-updated"));
    } catch { }
}

export function clearChartMemory(chartKey: string): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(chartKey);
        window.dispatchEvent(new Event("tuvi-memory-updated"));
    }
}