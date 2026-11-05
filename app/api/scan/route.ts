import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

let activeModelName: string | null = null;

// Tự động tìm model Flash nhanh nhất đang hoạt động trên tài khoản của bạn
async function getBestModel(apiKey: string): Promise<string> {
    if (activeModelName) return activeModelName;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        const available = data.models
            ?.filter((m: any) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("flash"))
            ?.map((m: any) => m.name.replace("models/", ""));

        console.log("Danh sách model Flash trên tài khoản của bạn:", available);

        // Ưu tiên flash-lite hoặc model flash đầu tiên
        activeModelName = available?.find((m: string) => m.includes("lite")) || available?.[0] || "gemini-2.5-flash-lite";
        console.log(`🎯 Đã chọn model tối ưu: ${activeModelName}`);
        return activeModelName;
    } catch {
        return "gemini-2.5-flash-lite";
    }
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Chưa có API Key" }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Không tìm thấy file ảnh" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString("base64");

        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = await getBestModel(apiKey);

        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: 0.1,
            },
        });

        const prompt = `
      Bạn là chuyên gia trích xuất dữ liệu lá số Tử Vi Đẩu Số.
      Quét ảnh lá số này và trích xuất dữ liệu ở ô Thiên Bàn và các cung.
      
      Trả về kết quả DUY NHẤT chuỗi JSON (không kèm markdown):
      {
        "ho_ten": "Họ và tên nếu có",
        "gioi_tinh": "Nam hoặc Nữ",
        "ngay_sinh_duong": "DD/MM/YYYY",
        "gio_sinh": "Ví dụ: 14:30 hoặc Giờ Mùi",
        "ngay_sinh_am": "Ví dụ: 15/08 năm Giáp Tý",
        "ban_menh": "Ví dụ: Hải Trung Kim",
        "cuc": "Ví dụ: Thủy Nhị Cục",
        "cung_than_cu": "Ví dụ: Thân cư Thê hoặc Thân cư Phúc",
        "am_duong": "Ví dụ: Dương Nam / Âm Nữ",
        "confidence_score": 95,
        "ghi_chu": "Lưu ý nếu ảnh mờ"
      }
    `;

        const startTime = Date.now();
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type || "image/jpeg",
                },
            },
        ]);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`⚡ Xử lý xong trong: ${duration} giây!`);

        const responseText = result.response.text().trim();
        const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedData = JSON.parse(cleanedJson);

        return NextResponse.json({ success: true, data: parsedData });
    } catch (error: any) {
        console.error("Lỗi:", error);
        return NextResponse.json({ error: error.message || "Không thể xử lý ảnh" }, { status: 500 });
    }
}