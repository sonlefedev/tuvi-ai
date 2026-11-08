// app/api/ai-cung/route.ts
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function getFastModels(apiKey: string): Promise<string[]> {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, { signal: AbortSignal.timeout(4000) });
        const data = await res.json();
        const list: string[] = (data.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("flash"))
            .map((m: any) => m.name.replace("models/", ""))
            .filter((n: string) => n !== "gemini-2.5-flash");
        const pref = ["gemini-3.5-flash-lite", "gemini-2.5-flash-lite", "gemini-3.8-flash", "gemini-3.6-flash"];
        const ok = pref.filter((p) => list.includes(p));
        return ok.length > 0 ? [...new Set([...ok, ...list])] : pref;
    } catch {
        return ["gemini-3.5-flash-lite", "gemini-2.5-flash-lite", "gemini-3.8-flash"];
    }
}

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const send = (obj: any) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
            try {
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) throw new Error("Chưa cấu hình GEMINI_API_KEY");

                const { fixedContext, cungName, cungChi } = await req.json();
                send({ type: "step", text: `Nén lục diện sao cố định của cung ${cungName} (${cungChi})...` });

                const models = await getFastModels(apiKey);
                const prompt = [
                    "Bạn là đại sư Tử Vi Đẩu Số (Nam Phái & Phi Tinh Tứ Hóa). Hãy viết bài luận giải CHUYÊN SÂU, CHI TIẾT (tổng độ dài khoảng 4.200 - 5.000 ký tự tiếng Việt) về BẢN CHẤT CỐ ĐỊNH TRỌN ĐỜI của CUNG " + cungName + " (" + cungChi + ").",
                    "NGUYÊN TẮC: Chỉ phân tích SAO CỐ ĐỊNH BẢN MỆNH bên dưới (tuyệt đối KHÔNG nhắc đến đại vận, tiểu hạn, lưu niên hay năm xem hạn). Mỗi mục viết 2-3 đoạn văn mạch lạc, giàu dẫn chứng sao cụ thể (~850-1.000 ký tự/mục).",
                    "DỮ LIỆU 6 VỊ TRÍ CỐ ĐỊNH LIÊN QUAN:\n" + fixedContext,
                    "Trình bày đúng 6 thẻ đánh dấu sau (không dùng markdown codeblock):\n[P1]\nLuận sâu Chính tinh (hoặc Vô Chính Diệu), trạng thái Miếu/Vượng/Đắc/Bình/Hãm và khí chất cốt lõi tại Bản cung.\n[P2]\nLuận sâu toàn bộ Cát tinh, Sát/Bại tinh, Vòng Tràng Sinh và phản ứng sinh khắc giữa các cặp sao nội cung.\n[P3]\nLuận thế Tam Phương Tứ Chính: sự hội chiếu từ 2 cung Tam hợp, cung Xung chiếu và tác động Tuần/Triệt bản mệnh.\n[P4]\nLuận 3 lớp ẩn: Cung Nhị hợp (hậu thuẫn/ràng buộc ngầm), thế Giáp trước - Giáp sau và 4 đường Phi Cung Tứ Hóa Lộc/Quyền/Khoa/Kỵ.\n[P5]\nĐúc kết định vị trọn đời cho phương diện " + cungName + ", ưu thế lớn nhất, rủi ro tiềm ẩn và chiến lược hành động bền vững.\n[MEM]\nTóm tắt 1 câu dưới 35 từ về đặc điểm cố định của cung " + cungName,
                ].join("\n\n");

                const genAI = new GoogleGenerativeAI(apiKey);
                let fullText = "", success = false, lastErr: any = null;

                for (const m of models.slice(0, 3)) {
                    try {
                        send({ type: "step", text: `Model ${m} đang viết luận giải chuyên sâu (~4.500 ký tự)...` });
                        const model = genAI.getGenerativeModel({ model: m, generationConfig: { temperature: 0.45, maxOutputTokens: 8192 } });
                        const resStream = await model.generateContentStream(prompt);
                        fullText = "";
                        for await (const chunk of resStream.stream) {
                            const t = chunk.text();
                            if (t) { fullText += t; send({ type: "chunk", text: `Đang viết luận giải chuyên sâu (${fullText.length} / ~4.500 ký tự)...` }); }
                        }
                        success = true;
                        break;
                    } catch (e: any) {
                        lastErr = e;
                        send({ type: "step", text: `Model ${m} bận, chuyển sang model dự phòng...` });
                    }
                }
                if (!success) throw lastErr || new Error("Tất cả model đều đang bận");

                const getPart = (tag: string, nextTags: string[]) => {
                    const s = fullText.indexOf(tag);
                    if (s === -1) return "";
                    const after = fullText.slice(s + tag.length);
                    const ends = nextTags.map((t) => after.indexOf(t)).filter((i) => i !== -1);
                    return (ends.length > 0 ? after.slice(0, Math.min(...ends)) : after).trim();
                };

                const reading = {
                    chinhTinhBanCung: getPart("[P1]", ["[P2]", "[P3]", "[P4]", "[P5]", "[MEM]"]) || fullText.trim(),
                    phuTinhTuongTac: getPart("[P2]", ["[P3]", "[P4]", "[P5]", "[MEM]"]),
                    tamHopXungChieu: getPart("[P3]", ["[P4]", "[P5]", "[MEM]"]),
                    nhiHopGiapPhiHoa: getPart("[P4]", ["[P5]", "[MEM]"]),
                    ducKetLoiKhuyen: getPart("[P5]", ["[MEM]"]),
                };
                send({ type: "done", data: { reading, memoryNote: getPart("[MEM]", []) } });
            } catch (err: any) {
                send({ type: "error", error: err?.message || "Lỗi luận cung AI" });
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}