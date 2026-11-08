// app/api/ai-luan/route.ts
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFastGeminiModels } from "@/lib/ai/gemini-models";

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const send = (obj: any) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
            try {
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) throw new Error("Chưa cấu hình GEMINI_API_KEY");

                const { compactChart, memoryNotes = [], question } = await req.json();
                send({ type: "step", text: `Nén lá số & nạp ${memoryNotes.length} ký ức tích lũy...` });

                const models = await getFastGeminiModels(apiKey);
                const memBlock = memoryNotes.length > 0 ? "KÝ ỨC ĐÃ LƯU:\n" + memoryNotes.map((m: string, i: number) => (i + 1) + ". " + m).join("\n") : "";
                const prompt = [
                    "Bạn là đại sư Tử Vi Đẩu Số (Nam Phái & Phi Tinh Tứ Hóa). Hãy luận giải sâu sắc, mạch lạc, thực tế.",
                    "DỮ LIỆU LÁ SỐ NÉN:\n" + compactChart,
                    memBlock,
                    "CÂU HỎI: " + question,
                    "Trả lời trực tiếp bằng tiếng Việt rõ ràng (chia gạch đầu dòng). Ở DÒNG CUỐI CÙNG, viết đúng định dạng: [MEMORY]: <tóm tắt 1 câu dưới 40 từ để lưu ký ức cho lần hỏi sau>",
                ].join("\n\n");

                const genAI = new GoogleGenerativeAI(apiKey);
                let fullText = "", success = false, lastErr: any = null;
                for (const m of models.slice(0, 3)) {
                    try {
                        send({ type: "step", text: `Đang kết nối model ${m}...` });
                        const model = genAI.getGenerativeModel({ model: m, generationConfig: { temperature: 0.45 } });
                        const resStream = await model.generateContentStream(prompt);
                        fullText = "";
                        for await (const chunk of resStream.stream) {
                            const t = chunk.text();
                            if (t) { fullText += t; send({ type: "chunk", text: fullText.split("[MEMORY]:")[0].trim() }); }
                        }
                        success = true;
                        break;
                    } catch (e: any) { lastErr = e; send({ type: "step", text: `Model ${m} bận, chuyển sang model dự phòng...` }); }
                }
                if (!success) throw lastErr || new Error("Tất cả model đều đang bận");

                const [answerPart, memPart] = fullText.split("[MEMORY]:");
                send({ type: "done", data: { answer: (answerPart || fullText).trim(), memoryNote: (memPart || "").trim() } });
            } catch (err: any) { send({ type: "error", error: err?.message || "Lỗi kết nối AI" }); }
            finally { controller.close(); }
        },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}