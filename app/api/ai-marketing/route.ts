// app/api/ai-marketing/route.ts
import { NextRequest } from "next/server";
import { runGeminiStreamResilient } from "@/lib/ai/gemini-models";

const ADMIN_ID = "sonlefedev";

function getTag(raw: string, tag: string, next: string[]): string {
    const s = raw.indexOf(tag);
    if (s === -1) return "";
    const after = raw.slice(s + tag.length);
    const ends = next.map((t) => after.indexOf(t)).filter((i) => i !== -1);
    return (ends.length > 0 ? after.slice(0, Math.min(...ends)) : after).trim();
}

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const send = (obj: any) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
            try {
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) throw new Error("Chưa cấu hình GEMINI_API_KEY");
                const { uid, focus = "auto", trendHint = "" } = await req.json();
                if (String(uid || "").toLowerCase() !== ADMIN_ID) throw new Error("Chỉ tài khoản quản trị mới dùng được tính năng này");

                const url = `https://sonlexinchao-tuvi.netlify.app/?utm_source=social&utm_campaign=${encodeURIComponent(focus)}`;
                const prompt = [
                    `Bạn là chuyên gia Growth Marketing & SEO cho website Tử Vi Đẩu Số AI (${url}).`,
                    `Chủ đề chiến dịch: ${focus === "auto" ? "Tự chọn góc tiếp cận hấp dẫn nhất dựa trên hành vi người dùng hôm nay" : focus}. ${trendHint ? `Dữ liệu hôm nay: ${trendHint}.` : ""}`,
                    `Viết trọn bộ 5 nội dung quảng cáo chuẩn SEO, tự nhiên, cuốn hút, chèn khéo link ${url} theo đúng 5 thẻ sau:`,
                    "[FB]\nBài đăng Facebook / Threads cá nhân (150-220 từ): Mở đầu đánh trúng tâm lý tò mò vận mệnh, 3 gạch đầu dòng nêu điểm độc đáo (Đại Cẩm Nang 8 chương 100k chữ, Hợp lá số đôi, Định giờ sinh ngược, miễn phí 100%), CTA + link + 5 hashtag chuẩn SEO.\n[ZALO]\nTin nhắn / Nhật ký Zalo (70-110 từ): Giọng chia sẻ chân thành như giới thiệu công cụ hay cho bạn bè, kèm link.\n[TIKTOK]\nKịch bản Video ngắn TikTok / Reels 35 giây: [0-3s Hook], [3-25s Demo màn hình], [25-35s Kêu gọi] + Caption chuẩn SEO.\n[BLOG]\nBài viết Blog / Fanpage chuẩn SEO (350-450 từ): Có Tiêu đề H1 chứa từ khóa 'Lập lá số Tử Vi Đẩu Số AI', các tiêu đề phụ H2 và link.\n[POSTER]\nDòng 1: Tiêu đề ngắn gọn in trên Poster (tối đa 8 từ)\nDòng 2: Ý nổi bật 1 (tối đa 9 từ)\nDòng 3: Ý nổi bật 2 (tối đa 9 từ)\nDòng 4: Ý nổi bật 3 (tối đa 9 từ)",
                ].join("\n\n");

                const full = await runGeminiStreamResilient(
                    apiKey,
                    prompt,
                    { task: "cung_deep", temperature: 0.6, maxOutputTokens: 2100 },
                    (s) => send({ type: "step", text: s }),
                    (partial) => send({ type: "chunk", text: `AI đang viết chiến dịch SEO (${partial.length.toLocaleString("vi-VN")} ký tự)...`, raw: partial })
                );

                send({
                    type: "done",
                    data: {
                        fb: getTag(full, "[FB]", ["[ZALO]", "[TIKTOK]", "[BLOG]", "[POSTER]"]) || full.trim(),
                        zalo: getTag(full, "[ZALO]", ["[TIKTOK]", "[BLOG]", "[POSTER]"]),
                        tiktok: getTag(full, "[TIKTOK]", ["[BLOG]", "[POSTER]"]),
                        blog: getTag(full, "[BLOG]", ["[POSTER]"]),
                        posterLines: getTag(full, "[POSTER]", []).split("\n").map((l) => l.replace(/^[-*•\d.)\s]+|Dòng \d+:\s*/gi, "").trim()).filter(Boolean).slice(0, 4),
                    },
                });
            } catch (e: any) {
                send({ type: "error", error: e?.message || "Lỗi tạo nội dung quảng cáo AI" });
            } finally {
                controller.close();
            }
        },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}
