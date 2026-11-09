// lib/ai/gemini-models.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export type AiTaskKind = "chat_quick" | "chat_deep" | "chart_json" | "cung_deep" | "lifemap_book";

let cache: { all: string[]; exp: number } | null = null;
const PRO_ORDER = ["gemini-4-argon", "gemini-3.1-pro-preview", "gemini-2.5-pro", "gemini-3.8-flash"];
const FLASH_ORDER = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
const LITE_ORDER = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"];
const NON_TEXT = /image|tts|transcribe|live|omni|embedding|robotics|veo|lyria|aqa|bison|gecko|latest|exp/i;

export function classifyChatTask(question: string): AiTaskKind {
    const q = (question || "").trim().toLowerCase();
    const isComplex = q.length > 85 || /tại sao|vì sao|so sánh|phân tích sâu|chiến lược|hóa giải|đại vận|tổng hợp|toàn diện|nghiệp|tương quan|xung chiếu|tam hợp/.test(q);
    return isComplex ? "chat_deep" : "chat_quick";
}

export async function getAllAvailableTextModels(apiKey: string): Promise<string[]> {
    if (cache && Date.now() < cache.exp) return cache.all;
    const defaults = [...new Set([...LITE_ORDER, ...FLASH_ORDER, ...PRO_ORDER])];
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        const live = (data.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent") && /^models\/gemini-/i.test(m.name) && !NON_TEXT.test(m.name))
            .map((m: any) => String(m.name).replace("models/", ""));
        const merged = [...new Set([...defaults.filter((m) => live.includes(m)), ...live, ...defaults])];
        cache = { all: merged, exp: Date.now() + 10 * 60 * 1000 };
        return merged;
    } catch { return defaults; }
}

function rankModelsForTask(all: string[], task: AiTaskKind): string[] {
    const pick = (order: string[]) => order.filter((m) => all.includes(m));
    const pro = pick(PRO_ORDER), flash = pick(FLASH_ORDER), lite = pick(LITE_ORDER);
    const primary =
        task === "chart_json" || task === "chat_quick" ? [...lite, ...flash, ...pro] :
        [...flash, ...lite, ...pro];
    return [...new Set([...primary, ...all])];
}

export async function runGeminiStreamResilient(
    apiKey: string,
    prompt: string,
    cfg: { task?: AiTaskKind; temperature?: number; maxOutputTokens?: number; systemInstruction?: string },
    onStep: (s: string) => void,
    onProgress?: (fullText: string) => void
): Promise<string> {
    const all = await getAllAvailableTextModels(apiKey);
    const queue = rankModelsForTask(all, cfg.task || "cung_deep");
    const genAI = new GoogleGenerativeAI(apiKey);
    for (let i = 0; i < queue.length; i++) {
        const m = queue[i];
        try {
            onStep(`[${cfg.task || "ai"}] Đang gọi ${m} (${i + 1}/${queue.length})...`);
            const model = genAI.getGenerativeModel({ model: m, systemInstruction: cfg.systemInstruction, generationConfig: { temperature: cfg.temperature ?? 0.25, maxOutputTokens: cfg.maxOutputTokens } });
            const resStream = await model.generateContentStream(prompt, { signal: AbortSignal.timeout(7500) });
            let full = "";
            for await (const chunk of resStream.stream) {
                const t = chunk.text();
                if (t) { full += t; onProgress?.(full); }
            }
            if (full.trim()) return full;
        } catch {
            onStep(`${m} bận/giới hạn, xoay sang model kế tiếp...`);
        }
    }
    throw new Error(`Đã xoay vòng toàn bộ ${queue.length} model Gemini nhưng đều đang cao tải, bạn thử lại sau vài giây nhé!`);
}
