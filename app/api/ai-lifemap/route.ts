// app/api/ai-lifemap/route.ts
import { NextRequest } from "next/server";
import { runGeminiStreamResilient } from "@/lib/ai/gemini-models";
import { buildChapterPrompt } from "@/lib/ai/lifemap-prompts";
import { LIFE_CHAPTERS } from "@/lib/ai/lifemap-chapters";

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const send = (obj: any) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
            try {
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) throw new Error("Chưa cấu hình GEMINI_API_KEY");
                const { compactChart, chapter = 1 } = await req.json();
                const chNum = Math.min(8, Math.max(1, Number(chapter) || 1));
                const meta = LIFE_CHAPTERS[chNum - 1];
                const prompt = buildChapterPrompt(chNum, compactChart);

                const fullText = await runGeminiStreamResilient(
                    apiKey,
                    prompt,
                    { task: "lifemap_book", temperature: 0.45, maxOutputTokens: 8192 },
                    (s) => send({ type: "step", text: `[Chương ${chNum}/8] ${s}` }),
                    (full) => send({ type: "chunk", text: `Chương ${chNum}/8: đã viết ${full.length.toLocaleString("vi-VN")} ký tự...`, raw: full })
                );

                const memIdx = fullText.indexOf("[MEM]");
                const content = (memIdx !== -1 ? fullText.slice(0, memIdx) : fullText).trim();
                const memoryNote = memIdx !== -1 ? fullText.slice(memIdx + 5).trim() : "";
                send({ type: "done", data: { chapter: chNum, key: meta.key, content, memoryNote } });
            } catch (err: any) {
                send({ type: "error", error: err?.message || "Lỗi biên soạn chương sách" });
            } finally {
                controller.close();
            }
        },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}
