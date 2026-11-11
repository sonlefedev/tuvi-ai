// app/api/ai-luan/route.ts
import { NextRequest } from "next/server";
import { classifyChatTask, runGeminiStreamResilient } from "@/lib/ai/gemini-models";

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const send = (obj: any) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
            try {
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) throw new Error("Chưa cấu hình GEMINI_API_KEY");
                const { compactChart, memoryNotes = [], history = [], activeContext = "", question } = await req.json();
                const task = classifyChatTask(question);
                send({ type: "step", text: `Phân loại câu hỏi (${task === "chat_deep" ? "Phân tích sâu" : "Tra cứu nhanh"}) & nạp ${memoryNotes.length} ký ức...` });

                const systemInstruction = [
                    "Bạn là đại sư Tử Vi Đẩu Số (Nam Phái & Phi Tinh Tứ Hóa). Luận giải mạch lạc, sâu sắc, súc tích (khoảng 320-450 từ, kết thúc trọn vẹn bằng câu đúc kết hoàn chỉnh để không bao giờ bị cắt dở), dùng **in đậm** cho tên sao/cung quan trọng.",
                    "QUY TẮC BẮT BUỘC VỀ ĐỘ CHÍNH XÁC TỌA ĐỘ SAO: Chỉ được nêu tên sao có mặt ĐÚNG trong dòng dữ liệu của cung đó và mục `SL:` / `L.TứHóa` / `TọaĐộSaoLưu`. Tuyệt đối KHÔNG tự suy diễn hay gán nhầm sao của cung khác sang cung đang xét. Phân biệt rõ địa chi 'Thân' (ví dụ Nhâm Thân) với cung '[CƯ_THÂN]' (chỉ cung có nhãn [CƯ_THÂN] mới là cung Cư Thân).",
                    "Ở DÒNG CUỐI CÙNG, luôn ghi đúng định dạng (không in đậm thẻ): [MEMORY]: <tóm tắt 1 câu dưới 35 từ đúng theo tọa độ sao đã kiểm chứng>",
                ].join("\n");

                const memBlock = memoryNotes.length > 0 ? "KÝ ỨC TÍCH LŨY:\n" + memoryNotes.slice(-6).map((m: string, i: number) => `${i + 1}. ${m}`).join("\n") : "";
                const histBlock = history.length > 0 ? "HỘI THOẠI GẦN ĐÂY:\n" + history.slice(-6).map((h: any) => `${h.role === "user" ? "Người hỏi" : "Đại sư"}: ${String(h.text || "").slice(0, 420)}`).join("\n") : "";
                const prompt = ["DỮ LIỆU LÁ SỐ:\n" + compactChart, activeContext, memBlock, histBlock, "CÂU HỎI HIỆN TẠI: " + question].filter(Boolean).join("\n\n");

                const fullText = await runGeminiStreamResilient(
                    apiKey, prompt, { task, temperature: 0.25, maxOutputTokens: 1350, systemInstruction },
                    (s) => send({ type: "step", text: s }),
                    (full) => send({ type: "chunk", text: full.replace(/\*{0,2}\[MEMORY\]:?[\s\S]*$/i, "").trim() })
                );

                const match = fullText.match(/\*{0,2}\[MEMORY\]:?\*{0,2}\s*([\s\S]*)$/i);
                const answer = fullText.replace(/\*{0,2}\[MEMORY\]:?[\s\S]*$/i, "").trim();
                send({ type: "done", data: { answer: answer || fullText.trim(), memoryNote: (match?.[1] || "").trim() } });
            } catch (err: any) { send({ type: "error", error: err?.message || "Lỗi kết nối AI" }); }
            finally { controller.close(); }
        },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}
