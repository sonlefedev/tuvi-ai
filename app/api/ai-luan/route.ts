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
                const rawBody: unknown = await req.json();
                if (!rawBody || typeof rawBody !== "object") throw new Error("Dữ liệu yêu cầu không hợp lệ");
                const body = rawBody as Record<string, unknown>;
                const chartContext = typeof body.chartContext === "string" ? body.chartContext.trim()
                    : typeof body.compactChart === "string" ? body.compactChart.trim() : "";
                const question = typeof body.question === "string" ? body.question.trim() : "";
                if (!chartContext) throw new Error("Thiếu dữ liệu lá số để phân tích");
                if (!question) throw new Error("Vui lòng nhập câu hỏi");
                const memoryNotes = Array.isArray(body.memoryNotes) ? body.memoryNotes.filter((note): note is string => typeof note === "string") : [];
                const history = Array.isArray(body.history)
                    ? body.history.filter((turn): turn is Record<string, unknown> => typeof turn === "object" && turn !== null && !Array.isArray(turn))
                    : [];
                const activeContext = typeof body.activeContext === "string" ? body.activeContext : "";
                const task = classifyChatTask(question);
                send({ type: "step", text: `Phân loại câu hỏi (${task === "chat_deep" ? "Phân tích sâu" : "Tra cứu nhanh"}) & nạp ${memoryNotes.length} ký ức...` });

                const systemInstruction = [
                    "Bạn là người luận giải Tử Vi Đẩu Số (Nam Phái & Phi Tinh Tứ Hóa), diễn đạt rõ ràng, thấu cảm, sâu sắc và hướng tới năng lực tự quyết của đương số; không phán số mệnh như định mệnh.",
                    "DỮ LIỆU CHUẨN: chartContext là JSON gồm `thien_ban` và 12 phần tử `cung_12`. Mỗi phần tử là một cung riêng, xác định bằng `ten_cung` và `chi`; chỉ gán sao cho đúng cung chứa nó. `chinh_tinh` là chính tinh và trạng thái; `phu_tinh_tot` / `phu_tinh_xau` có thể chứa sao gốc lẫn sao lưu. Tiền tố `L.` hoặc `ĐV.` quyết định sao lưu/đại vận, không chỉ dựa vào tên mảng; `sao_luu` là danh sách đối chiếu, không đếm sao lặp hai lần. `dv_cung` / `dai_van` là lớp đại vận, `nguyet_han` là tháng hạn. Không trộn sao gốc với sao lưu hay các tầng vận hạn. Nếu dữ liệu thiếu hoặc không đủ căn cứ, nói rõ giới hạn thay vì tự điền.",
                    "LẬP LUẬN CÓ KIỂM CHỨNG: Mọi nhận định quan trọng phải nêu dấu hiệu cụ thể từ cung/sao/trạng thái liên quan, giải thích vì sao dấu hiệu đó hỗ trợ nhận định, đồng thời cân nhắc yếu tố trái chiều. Không khẳng định sự kiện tương lai chắc chắn, không bịa tên sao, tọa độ, thời điểm hay hoàn cảnh. Tử Vi là hệ quy chiếu tham khảo, không thay thế tư vấn y tế, pháp lý hoặc tài chính.",
                    "VỚI CÂU HỎI TỔNG QUAN, LUẬN GIẢI RỘNG: xem xét tính cách và năng lực cốt lõi; học tập/phát triển kỹ năng; hướng nghề nghiệp và môi trường làm việc; tài chính, tích lũy và quản trị rủi ro; quan hệ, tình cảm và gia đạo; sức khỏe tinh thần/thói quen chăm sóc bản thân ở mức khuyến nghị chung; cơ hội, trở lực và cách ứng xử. Phân biệt nền tảng trọn đời với năm xem, đại vận và tiểu hạn khi dữ liệu có liên quan. Không ép các khía cạnh không liên quan vào câu hỏi chuyên biệt.",
                    "KIM CHỈ NAM PHẢI HÀNH ĐỘNG ĐƯỢC: nối lời khuyên với ưu thế/rủi ro đã chỉ ra; đưa ra 3-5 nguyên tắc ra quyết định, việc ưu tiên trong 90 ngày, mục tiêu và dấu hiệu đo tiến độ trong 1 năm, cùng hướng phát triển 3-5 năm. Ưu tiên học tập, kỷ luật, sức khỏe, uy tín, quan hệ lành mạnh và quản trị tiền bạc; không hứa hẹn giàu sang hay thành công chắc chắn.",
                    "ĐỘ DÀI: câu hỏi tổng quan/định hướng khoảng 700-1.000 từ tiếng Việt; câu hỏi hẹp khoảng 350-600 từ, tập trung đúng trọng tâm. Dùng tiêu đề rõ, đoạn văn mạch lạc, **in đậm** cho sao/cung then chốt, tránh lặp ý và kết thúc trọn vẹn.",
                    "Ở DÒNG CUỐI CÙNG, luôn ghi đúng định dạng (không in đậm thẻ): [MEMORY]: <tóm tắt 1 câu dưới 35 từ, dựa trên dữ liệu đã kiểm chứng>",
                ].join("\n");

                const memBlock = memoryNotes.length > 0 ? "KÝ ỨC TÍCH LŨY:\n" + memoryNotes.slice(-6).map((m: string, i: number) => `${i + 1}. ${m}`).join("\n") : "";
                const histBlock = history.length > 0 ? "HỘI THOẠI GẦN ĐÂY:\n" + history.slice(-6).map((h) => `${h.role === "user" ? "Người hỏi" : "Đại sư"}: ${String(h.text || "").slice(0, 420)}`).join("\n") : "";
                const prompt = ["DỮ LIỆU LÁ SỐ (JSON):\n" + chartContext, activeContext, memBlock, histBlock, "CÂU HỎI HIỆN TẠI: " + question].filter(Boolean).join("\n\n");

                const fullText = await runGeminiStreamResilient(
                    apiKey, prompt, { task, temperature: 0.25, maxOutputTokens: 3000, systemInstruction },
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
