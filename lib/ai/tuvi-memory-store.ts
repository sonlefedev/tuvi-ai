// lib/ai/tuvi-memory-store.ts
export interface ChatTurn {
    role: "user" | "ai";
    text: string;
    ts: number;
}

export interface ChartMemoryState {
    chartKey: string;
    compactChart: string;
    memoryNotes: string[];
    messages: ChatTurn[];
}

const PREFIX = "tuvi_ai_mem_v1_";

export function buildChartKey(tb: any): string {
    const raw = [tb?.ho_ten, tb?.nam_sinh, tb?.thang_sinh, tb?.ngay_sinh, tb?.gio_sinh, tb?.gioi_tinh].join("_");
    return PREFIX + raw.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function loadChartMemory(chartKey: string, compactChart: string): ChartMemoryState {
    if (typeof window === "undefined") return { chartKey, compactChart, memoryNotes: [], messages: [] };
    try {
        const saved = localStorage.getItem(chartKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...parsed, compactChart };
        }
    } catch { }
    return { chartKey, compactChart, memoryNotes: [], messages: [] };
}

export function saveChartMemory(state: ChartMemoryState): void {
    if (typeof window === "undefined") return;
    try {
        const trimmed: ChartMemoryState = {
            ...state,
            memoryNotes: state.memoryNotes.slice(-8), // Giữ tối đa 8 ký ức chưng cất gần nhất để tiết kiệm token
            messages: state.messages.slice(-20),
        };
        localStorage.setItem(state.chartKey, JSON.stringify(trimmed));
    } catch { }
}

export function clearChartMemory(chartKey: string): void {
    if (typeof window !== "undefined") localStorage.removeItem(chartKey);
}