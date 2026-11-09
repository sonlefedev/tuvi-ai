// app/api/ai-rectify/route.ts
import { NextRequest } from "next/server";
import { runGeminiStreamResilient } from "@/lib/ai/gemini-models";

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const send = (obj: any) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
            try {
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) throw new Error("Chưa cấu hình GEMINI_API_KEY");
                const { candidates, clues } = await req.json();
                send({ type: "step", text: `Đang đối chiếu ${candidates.length} lá số ứng viên với dữ kiện thực tế...` });

                const blocks = candidates.map((c: any, i: number) => `=== ỨNG VIÊN ${i + 1}: GIỜ ${c.hour} ===\n${c.compact}`).join("\n\n");
                const prompt = [
                    "Bạn là chuyên gia Định Giờ Sinh (Rectification) trong Tử Vi Đẩu Số. Hãy đối chiếu các lá số ứng viên bên dưới với DỮ KIỆN THỰC TẾ của đương số để tìm ra giờ sinh khớp nhất:",
                    "DỮ KIỆN THỰC TẾ ĐƯƠNG SỐ CUNG CẤP:\n" + clues,
                    blocks,
                    "YÊU CẦU TRẢ LỜI:\n1. Chấm điểm độ khớp (%) cho từng giờ sinh ứng viên kèm dẫn chứng cụ thể từ sao ở Mệnh, Thân, Huynh Đệ, Phụ Mẫu và Đại vận.\n2. Kết luận **GIỜ SINH KHỚP NHẤT** và giải thích ngắn gọn.",
                ].join("\n\n");

                const reply = await runGeminiStreamResilient(
                    apiKey, prompt, { task: "cung_deep", temperature: 0.25, maxOutputTokens: 1800 },
                    (s) => send({ type: "step", text: s }),
                    (full) => send({ type: "chunk", text: full })
                );
                send({ type: "done", data: { reply } });
            } catch (err: any) { send({ type: "error", error: err?.message || "Lỗi định giờ sinh" }); }
            finally { controller.close(); }
        },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}
