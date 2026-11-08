// lib/ai/gemini-models.ts
let cache: { models: string[]; exp: number } | null = null;
const FALLBACK = ["gemini-3.5-flash-lite", "gemini-2.5-flash-lite", "gemini-3.8-flash", "gemini-3.6-flash"];

export async function getFastGeminiModels(apiKey: string): Promise<string[]> {
    if (cache && Date.now() < cache.exp) return cache.models;
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, { signal: AbortSignal.timeout(4000) });
        const data = await res.json();
        const list: string[] = (data.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("flash"))
            .map((m: any) => m.name.replace("models/", ""))
            .filter((n: string) => n !== "gemini-2.5-flash");
        const ok = FALLBACK.filter((p) => list.includes(p));
        const resolved = ok.length > 0 ? [...new Set([...ok, ...list])] : FALLBACK;
        cache = { models: resolved, exp: Date.now() + 10 * 60 * 1000 };
        return resolved;
    } catch {
        return FALLBACK;
    }
}