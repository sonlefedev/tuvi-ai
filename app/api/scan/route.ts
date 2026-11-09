// app/api/scan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllAvailableTextModels } from "@/lib/ai/gemini-models";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Chưa cấu hình GEMINI_API_KEY" }, { status: 500 });
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) return NextResponse.json({ error: "Không tìm thấy file ảnh" }, { status: 400 });

        const base64Data = Buffer.from(await file.arrayBuffer()).toString("base64");
        const prompt = `Trích xuất thông tin lá số Tử Vi trong ảnh và trả về DUY NHẤT JSON hợp lệ (không markdown):
{"ho_ten":"","gioi_tinh":"Nam hoặc Nữ","ngay_sinh_duong":"DD/MM/YYYY","gio_sinh":"","ngay_sinh_am":"","ban_menh":"","cuc":"","cung_than_cu":"","am_duong":"","confidence_score":95,"ghi_chu":""}`;

        const models = await getAllAvailableTextModels(apiKey);
        const genAI = new GoogleGenerativeAI(apiKey);
        for (const m of models.slice(0, 5)) {
            try {
                const model = genAI.getGenerativeModel({ model: m, generationConfig: { temperature: 0.1 } });
                const res = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType: file.type || "image/jpeg" } }], { signal: AbortSignal.timeout(12000) });
                const txt = res.response.text();
                const rawJson = txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1);
                return NextResponse.json({ success: true, data: JSON.parse(rawJson) });
            } catch { }
        }
        return NextResponse.json({ error: "Tất cả model quét ảnh đang bận, vui lòng thử lại sau vài giây!" }, { status: 503 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Không thể xử lý ảnh" }, { status: 500 });
    }
}
