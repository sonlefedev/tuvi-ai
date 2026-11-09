// app/api/ai-cung/route.ts
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
                const { fixedContext, cungName, cungChi } = await req.json();
                send({ type: "step", text: `Nén lục diện sao cố định của cung ${cungName} (${cungChi})...` });

                const prompt = [
                    "Bạn là đại sư Tử Vi Đẩu Số (Nam Phái & Phi Tinh Tứ Hóa). Hãy viết bài luận giải CHUYÊN SÂU, SÚC TÍCH (khoảng 2.000 - 2.600 ký tự tiếng Việt) về BẢN CHẤT CỐ ĐỊNH TRỌN ĐỜI của CUNG " + cungName + " (" + cungChi + ").",
                    "NGUYÊN TẮC: Chỉ phân tích SAO CỐ ĐỊNH BẢN MỆNH bên dưới (tuyệt đối KHÔNG nhắc đến đại vận, tiểu hạn, lưu niên hay năm xem hạn). Mỗi mục viết 1-2 đoạn mạch lạc (~420-520 ký tự/mục).",
                    "DỮ LIỆU 6 VỊ TRÍ CỐ ĐỊNH LIÊN QUAN:\n" + fixedContext,
                    "Trình bày đúng 6 thẻ đánh dấu sau (không dùng markdown codeblock):\n[P1]\nLuận sâu Chính tinh (hoặc Vô Chính Diệu), trạng thái Miếu/Vượng/Đắc/Bình/Hãm và khí chất cốt lõi tại Bản cung.\n[P2]\nLuận sâu toàn bộ Cát tinh, Sát/Bại tinh, Vòng Tràng Sinh và phản ứng sinh khắc giữa các cặp sao nội cung.\n[P3]\nLuận thế Tam Phương Tứ Chính: sự hội chiếu từ 2 cung Tam hợp, cung Xung chiếu và tác động Tuần/Triệt bản mệnh.\n[P4]\nLuận 3 lớp ẩn: Cung Nhị hợp, thế Giáp trước - Giáp sau và 4 đường Phi Cung Tứ Hóa Lộc/Quyền/Khoa/Kỵ.\n[P5]\nĐúc kết định vị trọn đời cho phương diện " + cungName + ", ưu thế lớn nhất, rủi ro tiềm ẩn và chiến lược hành động bền vững.\n[MEM]\nTóm tắt 1 câu dưới 35 từ về đặc điểm cố định của cung " + cungName,
                ].join("\n\n");

                const fullText = await runGeminiStreamResilient(
                    apiKey, prompt, { task: "cung_deep", temperature: 0.3, maxOutputTokens: 2400 },
                    (s) => send({ type: "step", text: s }),
                    (full) => send({ type: "chunk", text: `Đang viết luận giải (${full.length} / ~2.400 ký tự)...`, raw: full })
                );

                const getPart = (tag: string, next: string[]) => {
                    const s = fullText.indexOf(tag);
                    if (s === -1) return "";
                    const after = fullText.slice(s + tag.length);
                    const ends = next.map((t) => after.indexOf(t)).filter((i) => i !== -1);
                    return (ends.length > 0 ? after.slice(0, Math.min(...ends)) : after).trim();
                };
                send({ type: "done", data: { reading: { chinhTinhBanCung: getPart("[P1]", ["[P2]", "[P3]", "[P4]", "[P5]", "[MEM]"]) || fullText.trim(), phuTinhTuongTac: getPart("[P2]", ["[P3]", "[P4]", "[P5]", "[MEM]"]), tamHopXungChieu: getPart("[P3]", ["[P4]", "[P5]", "[MEM]"]), nhiHopGiapPhiHoa: getPart("[P4]", ["[P5]", "[MEM]"]), ducKetLoiKhuyen: getPart("[P5]", ["[MEM]"]) }, memoryNote: getPart("[MEM]", []) } });
            } catch (err: any) { send({ type: "error", error: err?.message || "Lỗi luận cung AI" }); }
            finally { controller.close(); }
        },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}
