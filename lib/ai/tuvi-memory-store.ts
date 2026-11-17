// lib/ai/tuvi-memory-store.ts
import { getCurrentUser } from "../auth-store";
import { pushProfileToCloud } from "./cloud-profile-sync";
import { createDataFlowId, emitDataFlowTrace, summarizeDataFlowPayload } from "../data-flow-trace";
import type { ThienBanData } from "../types";

export interface ChatTurn { role: "user" | "ai"; text: string; ts: number; }
export interface CungAiReading { chinhTinhBanCung: string; phuTinhTuongTac: string; tamHopXungChieu: string; nhiHopGiapPhiHoa: string; ducKetLoiKhuyen: string; }
export interface ChartMemoryState {
    chartKey: string;
    compactChart: string;
    memoryNotes: string[];
    messages: ChatTurn[];
    cungReadings: Record<string, CungAiReading>;
    messagesUpdatedAt?: number;
    memoryNotesUpdatedAt?: number;
}

export type ClearMemoryTarget = "messages" | "memoryNotes";
export type ClearMemoryResult = "synced" | "local-only" | "sync-pending";

const PREFIX = "tuvi_ai_profile_v2_";
const CUNG_KEYWORDS: Record<string, string> = { "mệnh": "MỆNH", "phụ mẫu": "PHỤ MẪU", "phúc đức": "PHÚC ĐỨC", "điền trạch": "ĐIỀN TRẠCH", "quan lộc": "QUAN LỘC", "sự nghiệp": "QUAN LỘC", "nô bộc": "NÔ BỘC", "thiên di": "THIÊN DI", "tật ách": "TẬT ÁCH", "sức khỏe": "TẬT ÁCH", "tài bạch": "TÀI BẠCH", "tài chính": "TÀI BẠCH", "tử tức": "TỬ TỨC", "con cái": "TỬ TỨC", "phu thê": "PHU THÊ", "tình duyên": "PHU THÊ", "hôn nhân": "PHU THÊ", "huynh đệ": "HUYNH ĐỆ" };

export function buildChartKey(tb: Partial<ThienBanData> | null | undefined): string {
    const uid = getCurrentUser()?.id || "guest";
    const nx = tb?.nam_xem_han || tb?.nam_xem || "";
    const raw = [tb?.ho_ten, tb?.nam_sinh, tb?.thang_sinh, tb?.ngay_sinh, tb?.gio_sinh, tb?.gioi_tinh, nx].join("_");
    return `${PREFIX}${uid}_${raw.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}

export function buildChatContext(
    state: ChartMemoryState,
    selectedCung?: { chi: string; ten_cung: string } | null,
    question = "",
    options: { includeCungContext?: boolean; includeJournal?: boolean } = {}
): string {
    const parts: string[] = [];
    if (options.includeCungContext !== false && selectedCung) {
        const isCuThan = selectedCung.ten_cung.includes("<THÂN>");
        const cleanName = selectedCung.ten_cung.replace("<THÂN>", "").trim();
        parts.push(`CUNG ĐANG MỞ TRÊN BÀN CỜ: ${cleanName}${isCuThan ? " [CƯ_THÂN]" : ""} tại địa chi ${selectedCung.chi}`);
        const r = state.cungReadings?.[selectedCung.chi];
        if (r?.ducKetLoiKhuyen) parts.push(`ĐÚC KẾT ĐÃ LUẬN CỦA CUNG ${cleanName}: ${r.ducKetLoiKhuyen.slice(0, 320)}`);
    }
    if (options.includeCungContext !== false) {
        const qLow = question.toLowerCase();
        const matched = Object.entries(CUNG_KEYWORDS).find(([kw]) => qLow.includes(kw))?.[1];
        if (matched && (!selectedCung || !selectedCung.ten_cung.includes(matched))) {
            const entry = Object.entries(state.cungReadings || {}).find(([, v]) => v?.ducKetLoiKhuyen?.toLowerCase().includes(matched.toLowerCase()));
            if (entry?.[1]?.ducKetLoiKhuyen) parts.push(`ĐÚC KẾT LIÊN QUAN (${matched}): ${entry[1].ducKetLoiKhuyen.slice(0, 280)}`);
        }
    }
    if (options.includeJournal) {
        try {
            const storedJournal: unknown = JSON.parse(localStorage.getItem(`${state.chartKey}_journal_v1`) || "[]");
            if (Array.isArray(storedJournal) && storedJournal.length) {
                const journal = storedJournal.filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null && !Array.isArray(entry));
                parts.push("NHẬT KÝ THỰC TẾ ĐƯƠNG SỐ:\n" + journal.slice(0, 4).map((entry) => `- [${String(entry.tag ?? "")}] ${String(entry.text ?? "")}`).join("\n"));
            }
        } catch { }
    }
    return parts.join("\n");
}

export function getChartJournalCount(chartKey: string): number {
    if (typeof window === "undefined") return 0;
    try {
        const journal: unknown = JSON.parse(localStorage.getItem(`${chartKey}_journal_v1`) || "[]");
        return Array.isArray(journal) ? journal.length : 0;
    } catch {
        return 0;
    }
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

export function saveChartMemory(state: ChartMemoryState, options: { syncCloud?: boolean } = {}): boolean {
    if (typeof window === "undefined") return false;
    const flowId = createDataFlowId();
    const previous = loadChartMemory(state.chartKey, state.compactChart);
    const now = Date.now();
    const notesChanged = JSON.stringify(previous.memoryNotes) !== JSON.stringify(state.memoryNotes);
    const messagesChanged = JSON.stringify(previous.messages) !== JSON.stringify(state.messages);
    const trimmed: ChartMemoryState = {
        ...state,
        memoryNotes: [...new Set(state.memoryNotes)].slice(-12),
        messages: state.messages.slice(-20),
        messagesUpdatedAt: messagesChanged ? Math.max(now, (previous.messagesUpdatedAt || 0) + 1) : state.messagesUpdatedAt || previous.messagesUpdatedAt,
        memoryNotesUpdatedAt: notesChanged ? Math.max(now, (previous.memoryNotesUpdatedAt || 0) + 1) : state.memoryNotesUpdatedAt || previous.memoryNotesUpdatedAt,
    };
    const payload = JSON.stringify(trimmed);
    try {
        localStorage.setItem(state.chartKey, payload);
    } catch {
        try {
            Object.keys(localStorage).filter((k) => k.startsWith(PREFIX) && k !== state.chartKey).forEach((k) => localStorage.removeItem(k));
            localStorage.setItem(state.chartKey, payload);
        } catch (error) {
            emitDataFlowTrace({ flowId, stage: "memory", status: "error", title: "Không lưu được ký ức", detail: error instanceof Error ? error.message : "Không thể ghi vào bộ nhớ trình duyệt." });
            return false;
        }
    }
    window.dispatchEvent(new Event("tuvi-memory-updated"));
    emitDataFlowTrace({ flowId, stage: "memory", status: "success", title: "Đã lưu ký ức trên thiết bị", detail: `${trimmed.messages.length} lượt chat · ${trimmed.memoryNotes.length} ghi chú AI.`, payload: summarizeDataFlowPayload(trimmed) });
    if (options.syncCloud !== false) pushProfileToCloud(state.chartKey);
    return true;
}

export async function clearChartMemory(chartKey: string, target: ClearMemoryTarget): Promise<ClearMemoryResult> {
    if (typeof window === "undefined") throw new Error("Không thể xóa dữ liệu khi ứng dụng chưa sẵn sàng.");
    const flowId = createDataFlowId();
    const prev = loadChartMemory(chartKey, "");
    const cleared: ChartMemoryState = {
        ...prev,
        ...(target === "messages" ? { messages: [] } : { memoryNotes: [] }),
    };
    if (!saveChartMemory(cleared, { syncCloud: false })) {
        throw new Error("Không thể lưu thao tác xóa trên thiết bị.");
    }
    emitDataFlowTrace({
        flowId,
        stage: "memory",
        status: "success",
        title: target === "messages" ? "Đã xóa hội thoại trên thiết bị" : "Đã xóa ký ức AI trên thiết bị",
        detail: "Thao tác xóa được đánh dấu phiên bản để dữ liệu đồng bộ cũ không ghi đè.",
    });
    if (!getCurrentUser()) return "local-only";
    return await pushProfileToCloud(chartKey) ? "synced" : "sync-pending";
}
