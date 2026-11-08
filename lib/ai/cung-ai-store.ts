// lib/ai/cung-ai-store.ts
import { CungAiReading, loadChartMemory, saveChartMemory } from "./tuvi-memory-store";
export type { CungAiReading };

export function getCachedCungAi(chartKey: string, chi: string): CungAiReading | null {
    return loadChartMemory(chartKey, "").cungReadings?.[chi] || null;
}

export function saveCachedCungAi(chartKey: string, chi: string, fullCompactChart: string, reading: CungAiReading, memoryNote?: string): void {
    const mem = loadChartMemory(chartKey, fullCompactChart);
    saveChartMemory({
        ...mem,
        cungReadings: { ...mem.cungReadings, [chi]: reading },
        memoryNotes: memoryNote ? [...mem.memoryNotes, memoryNote] : mem.memoryNotes,
    });
}