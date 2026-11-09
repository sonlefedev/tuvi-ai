// lib/ai/gemini-models.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

let cache: { models: string[]; exp: number } | null = null;
const FALLBACK = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash-lite", "gemini-2.5-flash"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getFastGeminiModels(apiKey: string): Promise<string[]> {
    if (cache && Date.now() < cache.exp) return cache.models;
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, { signal: AbortSignal.timeout(3500) });
        const data = await res.json();
        const list: string[] = (data.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("flash") && !/image|audio|tts|thinking|latest|preview|exp/i.test(m.name))
            .map((m: any) => m.name.replace("models/", ""));
        const resolved = [...new Set([...FALLBACK.filter((p) => list.includes(p)), ...list, ...FALLBACK])];
        cache = { models: resolved, exp: Date.now() + 10 * 60 * 1000 };
        return resolved;
    } catch { return FALLBACK; }
}

export async function runGeminiStreamResilient(
    apiKey: string,
    prompt: string,
    cfg: { temperature?: number; maxOutputTokens?: number; systemInstruction?: string },
    onStep: (s: string) => void,
    onProgress?: (fullText: string) => void
): Promise<string> {
    const models = await getFastGeminiModels(apiKey);
    const genAI = new GoogleGenerativeAI(apiKey);
    for (const m of models.slice(0, 5)) {
        try {
            onStep(`Đang kết nối ${m}...`);
            const model = genAI.getGenerativeModel({ model: m, systemInstruction: cfg.systemInstruction, generationConfig: { temperature: cfg.temperature ?? 0.45, maxOutputTokens: cfg.maxOutputTokens } });
            const resStream = await model.generateContentStream(prompt, { signal: AbortSignal.timeout(14000) });
            let full = "";
            for await (const chunk of resStream.stream) {
                const t = chunk.text();
                if (t) { full += t; onProgress?.(full); }
            }
            if (full.trim()) return full;
        } catch {
            try {
                const model = genAI.getGenerativeModel({ model: m, systemInstruction: cfg.systemInstruction, generationConfig: { temperature: cfg.temperature ?? 0.45, maxOutputTokens: cfg.maxOutputTokens } });
                const single = await model.generateContent(prompt, { signal: AbortSignal.timeout(10000) });
                const txt = single.response.text();
                if (txt.trim()) { onProgress?.(txt); return txt; }
            } catch {
                onStep(`Model ${m} đang quá tải, tự động chuyển model dự phòng...`);
                await sleep(250);
            }
        }
    }
    throw new Error("Máy chủ Gemini đang quá tải giờ cao điểm (503). Bạn đợi 10 giây rồi bấm lại nhé!");
}
