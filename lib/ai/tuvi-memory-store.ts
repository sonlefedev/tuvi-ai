// lib/ai/tuvi-memory-store.ts
import { getCurrentUser } from "../auth-store";
import { pushProfileToCloud } from "./cloud-profile-sync";

export interface ChatTurn { role: "user" | "ai"; text: string; ts: number; }
export interface CungAiReading { chinhTinhBanCung: string; phuTinhTuongTac: string; tamHopXungChieu: string; nhiHopGiapPhiHoa: string; ducKetLoiKhuyen: string; }
export interface ChartMemoryState { chartKey: string; compactChart: string; memoryNotes: string[]; messages: ChatTurn[]; cungReadings: Record<string, CungAiReading>; }

const PREFIX = "tuvi_ai_profile_v2_";
const CUNG_KEYWORDS: Record<string, string> = { "mệnh": "MỆNH", "phụ mẫu": "PHỤ MẪU", "phúc đức": "PHÚC ĐỨC", "điền trạch": "ĐIỀN TRẠCH", "quan lộc": "QUAN LỘC", "sự nghiệp": "QUAN LỘC", "nô bộc": "NÔ BỘC", "thiên di": "THIÊN DI", "tật ách": "TẬT ÁCH", "sức khỏe": "TẬT ÁCH", "tài bạch": "TÀI BẠCH", "tài chính": "TÀI BẠCH", "tử tức": "TỬ TỨC", "con cái": "TỬ TỨC", "phu thê": "PHU THÊ", "tình duyên": "PHU THÊ", "hôn nhân": "PHU THÊ", "huynh đệ": "HUYNH ĐỆ" };

export function buildChartKey(tb: any): string {
    const uid = getCurrentUser()?.id || "guest";
    const nx = tb?.nam_xem_han || tb?.nam_xem || "";
    const raw = [tb?.ho_ten, tb?.nam_sinh, tb?.thang_sinh, tb?.ngay_sinh, tb?.gio_sinh, tb?.gioi_tinh, nx].join("_");
    return `${PREFIX}${uid}_${raw.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}

export function buildChatContext(state: ChartMemoryState, selectedCung?: { chi: string; ten_cung: string } | null, question = ""): string {
    const parts: string[] = [];
    if (selectedCung) {
        const isCuThan = selectedCung.ten_cung.includes("<THÂN>");
        const cleanName = selectedCung.ten_cung.replace("<THÂN>", "").trim();
        parts.push(`CUNG ĐANG MỞ TRÊN BÀN CỜ: ${cleanName}${isCuThan ? " [CƯ_THÂN]" : ""} tại địa chi ${selectedCung.chi}`);
        const r = state.cungReadings?.[selectedCung.chi];
        if (r?.ducKetLoiKhuyen) parts.push(`ĐÚC KẾT ĐÃ LUẬN CỦA CUNG ${cleanName}: ${r.ducKetLoiKhuyen.slice(0, 320)}`);
    }
    const qLow = question.toLowerCase();
    const matched = Object.entries(CUNG_KEYWORDS).find(([kw]) => qLow.includes(kw))?.[1];
    if (matched && (!selectedCung || !selectedCung.ten_cung.includes(matched))) {
        const entry = Object.entries(state.cungReadings || {}).find(([, v]) => v?.ducKetLoiKhuyen?.toLowerCase().includes(matched.toLowerCase()));
        if (entry?.[1]?.ducKetLoiKhuyen) parts.push(`ĐÚC KẾT LIÊN QUAN (${matched}): ${entry[1].ducKetLoiKhuyen.slice(0, 280)}`);
    }
    return parts.join("\n");
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
    const trimmed: ChartMemoryState = { ...state, memoryNotes: [...new Set(state.memoryNotes)].slice(-12), messages: state.messages.slice(-20) };
    const payload = JSON.stringify(trimmed);
    try { localStorage.setItem(state.chartKey, payload); } catch {
        Object.keys(localStorage).filter((k) => k.startsWith(PREFIX) && k !== state.chartKey).forEach((k) => localStorage.removeItem(k));
        try { localStorage.setItem(state.chartKey, payload); } catch { }
    }
    window.dispatchEvent(new Event("tuvi-memory-updated"));
    pushProfileToCloud(state.chartKey);
}

export async function clearChartMemory(chartKey: string): Promise<void> {
    if (typeof window === "undefined") return;
    const prev = loadChartMemory(chartKey, "");
    const cleared: ChartMemoryState = { ...prev, memoryNotes: [], messages: [] };
    localStorage.setItem(chartKey, JSON.stringify(cleared));
    window.dispatchEvent(new Event("tuvi-memory-updated"));
    await pushProfileToCloud(chartKey);
}
