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

                const { compactChart, memoryNotes = [], history = [], activeContext = "", question } = await req.json();
                send({ type: "step", text: `Nạp lá số, ${history.length} lượt thoại & ${memoryNotes.length} ký ức...` });

                const models = await getFastGeminiModels(apiKey);
                const systemInstruction = [
                    "Bạn là đại sư Tử Vi Đẩu Số (Nam Phái & Phi Tinh Tứ Hóa). Luận giải chuẩn xác dựa trên dữ liệu lá số, đối chiếu rõ Chính tinh, Ngũ hành, Tam hợp, Xung chiếu, Tuần/Triệt và Tứ Hóa.",
                    "Trả lời bằng tiếng Việt mạch lạc, chia gạch đầu dòng rõ ràng, dùng **in đậm** cho tên sao/cung quan trọng.",
                    "Ở DÒNG CUỐI CÙNG, luôn ghi đúng định dạng (không in đậm thẻ): [MEMORY]: <tóm tắt 1 câu dưới 35 từ về ý vừa luận>",
                ].join("\n");

                const memBlock = memoryNotes.length > 0 ? "KÝ ỨC TÍCH LŨY:\n" + memoryNotes.slice(-8).map((m: string, i: number) => `${i + 1}. ${m}`).join("\n") : "";
                const histBlock = history.length > 0 ? "HỘI THOẠI GẦN ĐÂY:\n" + history.slice(-6).map((h: any) => `${h.role === "user" ? "Người hỏi" : "Đại sư"}: ${String(h.text || "").slice(0, 420)}`).join("\n") : "";
                const prompt = ["DỮ LIỆU LÁ SỐ:\n" + compactChart, activeContext, memBlock, histBlock, "CÂU HỎI HIỆN TẠI: " + question].filter(Boolean).join("\n\n");

                const genAI = new GoogleGenerativeAI(apiKey);
                let fullText = "", success = false, lastErr: any = null;
                for (const m of models.slice(0, 3)) {
                    try {
                        send({ type: "step", text: `Đang kết nối model ${m}...` });
                        const model = genAI.getGenerativeModel({ model: m, systemInstruction, generationConfig: { temperature: 0.45, maxOutputTokens: 4096 } });
                        const resStream = await model.generateContentStream(prompt);
                        fullText = "";
                        for await (const chunk of resStream.stream) {
                            const t = chunk.text();
                            if (t) { fullText += t; send({ type: "chunk", text: fullText.replace(/\*{0,2}\[MEMORY\]:?[\s\S]*$/i, "").trim() }); }
                        }
                        success = true;
                        break;
                    } catch (e: any) { lastErr = e; send({ type: "step", text: `Model ${m} bận, chuyển sang model dự phòng...` }); }
                }
                if (!success) throw lastErr || new Error("Tất cả model đều đang bận");

                const match = fullText.match(/\*{0,2}\[MEMORY\]:?\*{0,2}\s*([\s\S]*)$/i);
                const answer = fullText.replace(/\*{0,2}\[MEMORY\]:?[\s\S]*$/i, "").trim();
                send({ type: "done", data: { answer: answer || fullText.trim(), memoryNote: (match?.[1] || "").trim() } });
            } catch (err: any) { send({ type: "error", error: err?.message || "Lỗi kết nối AI" }); }
            finally { controller.close(); }
        },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}
