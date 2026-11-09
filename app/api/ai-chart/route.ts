// app/api/ai-chart/route.ts
import { NextRequest } from "next/server";
import { runGeminiStreamResilient } from "@/lib/ai/gemini-models";

const LAYER_RULES: Record<string, string> = {
    codinh: "TẦNG 1 - LÁ SỐ CỐ ĐỊNH BẢN MỆNH: Chỉ xét 100% sao cố định gốc, đánh giá nền tảng trọn đời của đương số.",
    daivan: "TẦNG 2 - TẦNG ĐẠI VẬN 10 NĂM: Lấy cung có ĐV.MỆNH làm trục gốc 10 năm, kết hợp các cung ĐV.* và sao lưu ĐV.* để đánh giá xu hướng cả đại vận.",
    luunien: "TẦNG 3 - TẦNG LƯU NIÊN (LƯU THÁI TUẾ LÀM CHUẨN L.MỆNH): Lấy cung có L.Thái Tuế (L.MỆNH) làm gốc xoay 12 cung lưu niên L.* cùng L.Tứ Hóa để đánh giá vận thế năm xem.",
    tieuhan: "TẦNG 4 - TẦNG ĐẾM TUỔI TIỂU HẠN & LƯU NIÊN ĐẠI VẬN: Lấy cung có nhãn Tiểu Hạn làm trọng tâm kết hợp cung Đại vận ĐV và 12 Nguyệt hạn T1..T12 để chấm điểm biến động theo tuổi mụ hiện tại.",
};

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const send = (obj: any) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
            try {
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) throw new Error("Chưa cấu hình GEMINI_API_KEY");
                const { compactChart, layerId, layerLabel, aspect } = await req.json();
                send({ type: "step", text: `Nén toàn bộ 12 cung cho ${layerLabel}...` });

                const prompt = [
                    "Bạn là chuyên gia phân tích định lượng Tử Vi Đẩu Số. Hãy chấm điểm và xuất dữ liệu vẽ biểu đồ đánh giá khía cạnh: \"" + aspect + "\".",
                    LAYER_RULES[layerId] || LAYER_RULES.codinh,
                    "DỮ LIỆU LÁ SỐ NÉN:\n" + compactChart,
                    "YÊU CẦU: Chia khía cạnh này thành 6 đến 8 trục tiêu chí (hoặc 12 tháng T1..T12 nếu hỏi về diễn biến tháng), chấm điểm khách quan từ 15 đến 98 dựa trên sao Miếu/Vượng/Hãm, Cát/Sát tinh, Tuần/Triệt và Tứ Hóa.",
                    'Trả về DUY NHẤT chuỗi JSON hợp lệ (không viết thêm chữ nào ngoài JSON): {"title": "Tên biểu đồ ngắn gọn", "chartType": "radar", "summary": "Nhận định tổng quan 2-3 câu về biểu đồ này", "items": [{"label": "Tên trục ngắn gọn", "score": 82, "note": "Giải thích ngắn vì sao đạt điểm này theo sao"}], "memory_note": "Tóm tắt 1 câu dưới 35 từ về kết quả biểu đồ này"}',
                ].join("\n\n");

                const fullText = await runGeminiStreamResilient(
                    apiKey, prompt, { temperature: 0.35 },
                    (s) => send({ type: "step", text: s }),
                    (full) => send({ type: "chunk", text: `Đang tổng hợp dữ liệu biểu đồ (${full.length} ký tự)...` })
                );

                const rawJson = fullText.slice(fullText.indexOf("{"), fullText.lastIndexOf("}") + 1);
                const parsed = JSON.parse(rawJson);
                send({ type: "done", data: { spec: { title: parsed.title || aspect, layerLabel, chartType: parsed.chartType || "radar", summary: parsed.summary || "", items: parsed.items || [] }, memoryNote: parsed.memory_note || "" } });
            } catch (err: any) { send({ type: "error", error: err?.message || "Lỗi lập biểu đồ AI" }); }
            finally { controller.close(); }
        },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}
