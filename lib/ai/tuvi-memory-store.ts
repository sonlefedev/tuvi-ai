// lib/ai/tuvi-memory-store.ts
export interface ChatTurn { role: "user" | "ai"; text: string; ts: number; }
export interface CungAiReading {
    chinhTinhBanCung: string;
    phuTinhTuongTac: string;
    tamHopXungChieu: string;
    nhiHopGiapPhiHoa: string;
    ducKetLoiKhuyen: string;
}
export interface ChartMemoryState {
    chartKey: string;
    compactChart: string;
    memoryNotes: string[];
    messages: ChatTurn[];
    cungReadings: Record<string, CungAiReading>;
}

const PREFIX = "tuvi_ai_profile_v2_";

export function buildChartKey(tb: any): string {
    const raw = [tb?.ho_ten, tb?.nam_sinh, tb?.thang_sinh, tb?.ngay_sinh, tb?.gio_sinh, tb?.gioi_tinh].join("_");
    return PREFIX + raw.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function loadChartMemory(chartKey: string, compactChart: string): ChartMemoryState {
    const empty: ChartMemoryState = { chartKey, compactChart, memoryNotes: [], messages: [], cungReadings: {} };
    if (typeof window === "undefined") return empty;
    try {
        const saved = localStorage.getItem(chartKey);
        if (saved) return { ...empty, ...JSON.parse(saved), compactChart };
    } catch { }
    return empty;
}

export function saveChartMemory(state: ChartMemoryState): void {
    if (typeof window === "undefined") return;
    const trimmed: ChartMemoryState = {
        ...state,
        memoryNotes: [...new Set(state.memoryNotes)].slice(-12),
        messages: state.messages.slice(-20),
    };
    const payload = JSON.stringify(trimmed);
    try {
        localStorage.setItem(state.chartKey, payload);
    } catch {
        // Nếu đầy bộ nhớ trình duyệt, tự xóa các profile cũ khác rồi lưu lại
        Object.keys(localStorage).filter((k) => k.startsWith(PREFIX) && k !== state.chartKey).forEach((k) => localStorage.removeItem(k));
        try { localStorage.setItem(state.chartKey, payload); } catch { }
    }
    window.dispatchEvent(new Event("tuvi-memory-updated"));
}

export function clearChartMemory(chartKey: string): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(chartKey);
        window.dispatchEvent(new Event("tuvi-memory-updated"));
    }
}