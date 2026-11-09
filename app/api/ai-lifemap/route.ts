// app/api/ai-lifemap/route.ts
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
                const { compactChart, hoTen } = await req.json();
                send({ type: "step", text: `Nén toàn bộ 12 cung & 48 đường Phi Hóa của ${hoTen || "đương số"}...` });

                const prompt = [
                    "Bạn là bậc thầy Tử Vi Đẩu Số (Nam Phái & Phi Tinh Tứ Hóa). Hãy viết một BẢN ĐỒ CUỘC ĐỜI TOÀN DIỆN, SÂU SẮC VÀ GIÀU TÍNH THỰC TIỄN (khoảng 4.000 - 5.200 ký tự tiếng Việt) cho đương số có lá số dưới đây.",
                    "DỮ LIỆU TOÀN LÁ SỐ:\n" + compactChart,
                    "Dẫn chứng rõ các bộ sao trên lá số và trình bày đúng 7 thẻ đánh dấu sau (mỗi chương viết 2-3 đoạn văn sâu sắc ~700-850 ký tự, không dùng markdown codeblock):\n[M1]\nCHƯƠNG I - CỐT CÁCH BẢN MỆNH & ĐỊNH VỊ CON NGƯỜI\n[M2]\nCHƯƠNG II - CON ĐƯỜNG CÔNG DANH, SỰ NGHIỆP & TÀI LỘC\n[M3]\nCHƯƠNG III - TÌNH DUYÊN, HÔN NHÂN, GIA ĐẠO & NHÂN DUYÊN\n[M4]\nCHƯƠNG IV - SỨC KHỎE THỂ CHẤT & BÌNH AN NỘI TÂM\n[M5]\nCHƯƠNG V - NHỮNG ĐIỀU NÊN TRÁNH LÀM ĐỂ TÂM ĐƯỢC AN NHIÊN\n[M6]\nCHƯƠNG VI - KIM CHỈ NAM HÀNH ĐỘNG ĐỂ THÀNH CÔNG, ÊM ẤM & ĐỦ ĐẦY\n[MEM]\nTóm tắt 1 câu dưới 40 từ đúc kết cốt lõi toàn lá số.",
                ].join("\n\n");

                const fullText = await runGeminiStreamResilient(
                    apiKey, prompt, { task: "lifemap_book", temperature: 0.4, maxOutputTokens: 3600 },
                    (s) => send({ type: "step", text: s }),
                    (full) => send({ type: "chunk", text: `Đang viết Bản Đồ Cuộc Đời (${full.length.toLocaleString("vi-VN")} / ~4.800 ký tự)...` })
                );

                const getPart = (tag: string, next: string[]) => {
                    const s = fullText.indexOf(tag);
                    if (s === -1) return "";
                    const after = fullText.slice(s + tag.length);
                    const ends = next.map((t) => after.indexOf(t)).filter((i) => i !== -1);
                    return (ends.length > 0 ? after.slice(0, Math.min(...ends)) : after).trim();
                };
                send({ type: "done", data: { lifeMap: { c1CotCach: getPart("[M1]", ["[M2]", "[M3]", "[M4]", "[M5]", "[M6]", "[MEM]"]) || fullText.trim(), c2SuNghiep: getPart("[M2]", ["[M3]", "[M4]", "[M5]", "[M6]", "[MEM]"]), c3TinhDuyen: getPart("[M3]", ["[M4]", "[M5]", "[M6]", "[MEM]"]), c4SucKhoe: getPart("[M4]", ["[M5]", "[M6]", "[MEM]"]), c5NenTranh: getPart("[M5]", ["[M6]", "[MEM]"]), c6KimChiNam: getPart("[M6]", ["[MEM]"]) }, memoryNote: getPart("[MEM]", []) } });
            } catch (err: any) { send({ type: "error", error: err?.message || "Lỗi lập Bản Đồ Cuộc Đời" }); }
            finally { controller.close(); }
        },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}
