export type DataFlowStage = "browser" | "calculation" | "packaging" | "api" | "ai" | "memory" | "cloud";
export type DataFlowStatus = "active" | "success" | "error" | "info";

export interface DataFlowPayloadSummary {
    fields: string[];
    bytes: number;
    preview: string;
    truncated: boolean;
}

export interface DataFlowTraceEvent {
    flowId: string;
    timestamp: number;
    stage: DataFlowStage;
    status: DataFlowStatus;
    title: string;
    detail: string;
    payload?: DataFlowPayloadSummary;
}

export const DATA_FLOW_EVENT = "tuvi:data-flow";

export function createDataFlowId(): string {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `flow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function summarizeDataFlowPayload(payload: unknown): DataFlowPayloadSummary {
    const serialized = JSON.stringify(payload ?? null);
    const bytes = new TextEncoder().encode(serialized).length;
    const record = payload !== null && typeof payload === "object" && !Array.isArray(payload)
        ? payload as Record<string, unknown>
        : null;
    const fields = record ? Object.keys(record) : [];
    const previewField = record && ["chartContext", "compactChart", "fixedContext", "chartA", "question"].find((key) => typeof record[key] === "string");
    const rawPreview = previewField && record
        ? `${previewField}:\n${record[previewField]}`
        : record
            ? Object.entries(record).map(([key, value]) => {
                if (Array.isArray(value)) return `${key}: array (${value.length} items)`;
                if (value !== null && typeof value === "object") return `${key}: object (${Object.keys(value).length} fields)`;
                if (typeof value === "string") return `${key}: "${value}"`;
                return `${key}: ${String(value)}`;
            }).join("\n")
            : serialized;
    const previewLimit = 680;

    return {
        fields,
        bytes,
        preview: rawPreview.slice(0, previewLimit),
        truncated: rawPreview.length > previewLimit,
    };
}

export function emitDataFlowTrace(event: Omit<DataFlowTraceEvent, "timestamp">): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent<DataFlowTraceEvent>(DATA_FLOW_EVENT, {
        detail: { ...event, timestamp: Date.now() },
    }));
}
