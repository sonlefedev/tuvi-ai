// app/api/ai-lifemap/route.ts
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

                const { compactChart, hoTen } = await req.json();
                send({ type: "step", text: `Nén toàn bộ 12 cung & 48 đường Phi Hóa của ${hoTen || "đương số"}...` });

                const models = await getFastGeminiModels(apiKey);
                const prompt = [
                    "Bạn là bậc thầy Tử Vi Đẩu Số (tinh thông Nam Phái & Phi Tinh Tứ Hóa) đồng thời là nhà tham vấn tâm lý – định hướng cuộc đời sâu sắc. Hãy viết một BẢN ĐỒ CUỘC ĐỜI TOÀN DIỆN, SÂU SẮC VÀ GIÀU TÍNH THỰC TIỄN (tổng độ dài khoảng 6.500 - 8.000 ký tự tiếng Việt) cho đương số có lá số dưới đây.",
                    "DỮ LIỆU TOÀN LÁ SỐ:\n" + compactChart,
                    "Hãy viết thật kỹ, dẫn chứng rõ các bộ sao trên lá số và trình bày đúng 7 thẻ đánh dấu sau (mỗi chương viết 3-4 đoạn văn sâu sắc ~1.000-1.300 ký tự, không dùng markdown codeblock):\n[M1]\nCHƯƠNG I - CỐT CÁCH BẢN MỆNH & ĐỊNH VỊ CON NGƯỜI: Phân tích sâu Mệnh, Thân, Cục, Âm Dương, khí chất thiên bẩm, nội tâm và vai trò xã hội.\n[M2]\nCHƯƠNG II - CON ĐƯỜNG CÔNG DANH, SỰ NGHIỆP & TÀI LỘC: Phân tích Quan Lộc, Tài Bạch, Thiên Di, ngành nghề/môi trường phát huy tối đa năng lực, cách tạo và giữ tài sản bền vững.\n[M3]\nCHƯƠNG III - TÌNH DUYÊN, HÔN NHÂN, GIA ĐẠO & NHÂN DUYÊN: Phân tích Phu Thê, Phúc Đức, Tử Tức, Phụ Mẫu, Huynh Đệ, Nô Bộc, chữ duyên vợ chồng và cách vun đắp gia đạo êm ấm.\n[M4]\nCHƯƠNG IV - SỨC KHỎE THỂ CHẤT & BÌNH AN NỘI TÂM: Phân tích Tật Ách và Phúc Đức, điểm yếu sức khỏe cần phòng ngừa và cách nuôi dưỡng sự tĩnh tại.\n[M5]\nCHƯƠNG V - NHỮNG ĐIỀU NÊN TRÁNH LÀM ĐỂ TÂM ĐƯỢC AN NHIÊN: Chỉ rõ các cạm bẫy tâm lý, kiểu hợp tác/đầu tư mạo hiểm, thói quen hoặc môi trường dễ gây thị phi/hao tổn từ các Sát tinh & Hóa Kỵ trên lá số.\n[M6]\nCHƯƠNG VI - KIM CHỈ NAM HÀNH ĐỘNG ĐỂ THÀNH CÔNG, ÊM ẤM & ĐỦ ĐẦY: Tổng kết lộ trình tu dưỡng, nguyên tắc vàng trong sự nghiệp – tài chính – gia đình để đạt cuộc sống viên mãn.\n[MEM]\nTóm tắt 1 câu dưới 40 từ đúc kết cốt lõi toàn lá số để lưu ký ức chung.",
                ].join("\n\n");

                const genAI = new GoogleGenerativeAI(apiKey);
                let fullText = "", success = false, lastErr: any = null;
                for (const m of models.slice(0, 3)) {
                    try {
                        send({ type: "step", text: `Model ${m} đang biên soạn Bản Đồ Cuộc Đời 6 chương...` });
                        const model = genAI.getGenerativeModel({ model: m, generationConfig: { temperature: 0.45, maxOutputTokens: 8192 } });
                        const resStream = await model.generateContentStream(prompt);
                        fullText = "";
                        for await (const chunk of resStream.stream) {
                            const t = chunk.text();
                            if (t) { fullText += t; send({ type: "chunk", text: `Đang viết Bản Đồ Cuộc Đời (${fullText.length.toLocaleString("vi-VN")} / ~7.000 ký tự)...` }); }
                        }
                        success = true;
                        break;
                    } catch (e: any) { lastErr = e; send({ type: "step", text: `Model ${m} bận, chuyển sang model dự phòng...` }); }
                }
                if (!success) throw lastErr || new Error("Model đang bận");

                const getPart = (tag: string, next: string[]) => {
                    const s = fullText.indexOf(tag);
                    if (s === -1) return "";
                    const after = fullText.slice(s + tag.length);
                    const ends = next.map((t) => after.indexOf(t)).filter((i) => i !== -1);
                    return (ends.length > 0 ? after.slice(0, Math.min(...ends)) : after).trim();
                };

                const lifeMap = {
                    c1CotCach: getPart("[M1]", ["[M2]", "[M3]", "[M4]", "[M5]", "[M6]", "[MEM]"]) || fullText.trim(),
                    c2SuNghiep: getPart("[M2]", ["[M3]", "[M4]", "[M5]", "[M6]", "[MEM]"]),
                    c3TinhDuyen: getPart("[M3]", ["[M4]", "[M5]", "[M6]", "[MEM]"]),
                    c4SucKhoe: getPart("[M4]", ["[M5]", "[M6]", "[MEM]"]),
                    c5NenTranh: getPart("[M5]", ["[M6]", "[MEM]"]),
                    c6KimChiNam: getPart("[M6]", ["[MEM]"]),
                };
                send({ type: "done", data: { lifeMap, memoryNote: getPart("[MEM]", []) } });
            } catch (err: any) { send({ type: "error", error: err?.message || "Lỗi lập Bản Đồ Cuộc Đời" }); }
            finally { controller.close(); }
        },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}