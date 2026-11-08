// lib/ai/cung-ai-store.ts
import { loadChartMemory, saveChartMemory } from "./tuvi-memory-store";

export interface CungAiReading {
    chinhTinhBanCung: string;
    phuTinhTuongTac: string;
    tamHopXungChieu: string;
    nhiHopGiapPhiHoa: string;
    ducKetLoiKhuyen: string;
}

export function getCachedCungAi(chartKey: string, chi: string): CungAiReading | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(`${chartKey}_cung_v2_${chi}`);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function saveCachedCungAi(chartKey: string, chi: string, fullCompactChart: string, reading: CungAiReading, memoryNote?: string): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(`${chartKey}_cung_v2_${chi}`, JSON.stringify(reading));
        if (memoryNote) {
            const mem = loadChartMemory(chartKey, fullCompactChart);
            saveChartMemory({ ...mem, memoryNotes: [...mem.memoryNotes, memoryNote] });
        }
    } catch { }
}