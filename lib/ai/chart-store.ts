// lib/ai/chart-store.ts
import { loadChartMemory, saveChartMemory } from "./tuvi-memory-store";

export type ChartKind = "radar" | "bar" | "line";

export interface ChartPoint {
    label: string;
    score: number;
    note: string;
}

export interface TuviChartSpec {
    id: string;
    title: string;
    layerLabel: string;
    chartType: ChartKind;
    summary: string;
    items: ChartPoint[];
}

export function getSavedCharts(chartKey: string): Record<string, TuviChartSpec> {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(`${chartKey}_charts_v1`);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function saveChartSpec(chartKey: string, fullCompactChart: string, spec: TuviChartSpec, memoryNote?: string): void {
    if (typeof window === "undefined") return;
    try {
        const all = getSavedCharts(chartKey);
        all[spec.id] = spec;
        localStorage.setItem(`${chartKey}_charts_v1`, JSON.stringify(all));
        if (memoryNote) {
            const mem = loadChartMemory(chartKey, fullCompactChart);
            saveChartMemory({ ...mem, memoryNotes: [...mem.memoryNotes, memoryNote] });
        }
    } catch { }
}