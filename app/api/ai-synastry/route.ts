// app/api/ai-synastry/route.ts
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
                const { chartA, chartB, relation = "Vợ chồng / Tình duyên" } = await req.json();
                send({ type: "step", text: "Đang đối chiếu Ngũ hành, Phu Thê & Tứ Hóa chéo giữa 2 lá số..." });

                const prompt = [
                    `Bạn là đại sư Tử Vi Đẩu Số. Hãy luận giải HỢP LÁ SỐ ĐÔI (${relation}) giữa Đương số A và Đương số B thật súc tích, chuẩn xác (~1.600 - 2.100 ký tự, dùng **in đậm** cho tên sao/cung, đối chiếu đúng tọa độ sao trên 2 lá số):`,
                    "LÁ SỐ A:\n" + chartA,
                    "LÁ SỐ B:\n" + chartB,
                    "Trình bày 4 mục ngắn gọn, đi thẳng vào trọng tâm:\n### 1. Tương hợp Bản Mệnh, Cục & Cung Phi\n### 2. Đối chiếu Mệnh – Thân & Phu Thê / Nô Bộc\n### 3. Tương tác Phi Tinh Tứ Hóa chéo (Lộc/Quyền/Khoa/Kỵ)\n### 4. Điểm sáng gắn kết & Lời khuyên dung hòa",
                ].join("\n\n");

                const reply = await runGeminiStreamResilient(
                    apiKey, prompt, { task: "cung_deep", temperature: 0.25, maxOutputTokens: 2000 },
                    (s) => send({ type: "step", text: s }),
                    (full) => send({ type: "chunk", text: full })
                );
                send({ type: "done", data: { reply } });
            } catch (err: any) { send({ type: "error", error: err?.message || "Lỗi hợp lá số" }); }
            finally { controller.close(); }
        },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}
