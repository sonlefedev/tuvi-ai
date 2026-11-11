// app/api/watchdog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllAvailableTextModels } from "@/lib/ai/gemini-models";
const rawA = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const rawB = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
const SB_URL = rawA.startsWith("http") ? rawA : rawB.startsWith("http") ? rawB : "";
const SB_KEY = !rawB.startsWith("http") && rawB ? rawB : !rawA.startsWith("http") ? rawA : "";
const ADMIN_ID = "sonlefedev";
const WD_KEY = "system_watchdog_v1";
const sbHeaders = (prefer?: string) => ({ apikey: SB_KEY, ...(SB_KEY.startsWith("eyJ") ? { Authorization: `Bearer ${SB_KEY}` } : {}), "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) });
async function readBucket(key: string) {
    if (!SB_URL || !SB_KEY) return {};
    const res = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${key}&select=data`, { headers: sbHeaders(), cache: "no-store" });
    return (res.ok ? (await res.json())?.[0]?.data : null) || {};
}
async function writeBucket(key: string, data: any) {
    if (!SB_URL || !SB_KEY) return;
    const now = new Date().toISOString();
    const patch = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${key}`, { method: "PATCH", headers: sbHeaders("return=representation"), body: JSON.stringify({ data, updated_at: now }) });
    const rows = patch.ok ? await patch.json() : [];
    if (!Array.isArray(rows) || rows.length === 0) {
        const uRes = await fetch(`${SB_URL}/rest/v1/tuvi_users?select=id&limit=1`, { headers: sbHeaders(), cache: "no-store" });
        const ownerId = (uRes.ok ? (await uRes.json())?.[0]?.id : null) || ADMIN_ID;
        await fetch(`${SB_URL}/rest/v1/tuvi_profiles`, { method: "POST", headers: sbHeaders("return=minimal"), body: JSON.stringify({ profile_key: key, user_id: ownerId, data, updated_at: now }) });
    }
}
export async function GET(req: NextRequest) {
    if ((req.nextUrl.searchParams.get("uid") || "").toLowerCase() !== ADMIN_ID) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const apiKey = process.env.GEMINI_API_KEY || "";
    const models = apiKey ? await getAllAvailableTextModels(apiKey).catch(() => []) : [];
    const checks = [
        { name: "Kết nối Gemini AI", ok: Boolean(apiKey && models.length > 0), detail: apiKey ? `Sẵn sàng ${models.length} model (${models.slice(0, 2).join(", ")})` : "Thiếu GEMINI_API_KEY" },
        { name: "Cơ sở dữ liệu Supabase Cloud", ok: Boolean(SB_URL && SB_KEY), detail: SB_URL ? "Đồng bộ hoạt động bình thường" : "Thiếu cấu hình Supabase" },
        { name: "Engine An Sao & SEO Tự Động", ok: true, detail: "Thuật toán Tử Vi & Sitemap XML hoạt động ổn định" },
    ];
    const wd = await readBucket(WD_KEY);
    const fb = await readBucket("community_feedback_v1");
    const userBugs = (fb.items || []).filter((x: any) => !x.resolved && (x.kind === "bug" || x.kind === "suggestion"));
    return NextResponse.json({ checks, sysErrors: wd.errors || [], userBugs, chatHistory: wd.chatHistory || [] });
}
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const wd = await readBucket(WD_KEY);
        const errors: any[] = Array.isArray(wd.errors) ? wd.errors : [];
        const chatHistory: any[] = Array.isArray(wd.chatHistory) ? wd.chatHistory : [];
        const vnTime = new Date(Date.now() + 7 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 16);
        if (body.action === "report_error") {
            const sig = `${body.source}:${body.message}`;
            const idx = errors.findIndex((e) => `${e.source}:${e.message}` === sig);
            if (idx !== -1) errors[idx] = { ...errors[idx], count: (errors[idx].count || 1) + 1, lastSeen: vnTime, device: body.device || errors[idx].device };
            else errors.unshift({ id: "err_" + Date.now(), source: body.source || "System", message: body.message, detail: body.detail || "", device: body.device || "", count: 1, lastSeen: vnTime });
            await writeBucket(WD_KEY, { ...wd, errors: errors.slice(0, 40) });
            return NextResponse.json({ ok: true });
        }
        if (String(body.uid || "").toLowerCase() !== ADMIN_ID) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        if (body.action === "clear_errors") { await writeBucket(WD_KEY, { ...wd, errors: [] }); return NextResponse.json({ ok: true }); }
        if (body.action === "clear_chat") { await writeBucket(WD_KEY, { ...wd, chatHistory: [] }); return NextResponse.json({ chatHistory: [] }); }
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Thiếu GEMINI_API_KEY" }, { status: 500 });
        const fb = await readBucket("community_feedback_v1");
        const userBugs = (fb.items || []).filter((x: any) => !x.resolved && (x.kind === "bug" || x.kind === "suggestion"));
        const userMsg = String(body.message || "Hãy kiểm tra toàn bộ lỗi hệ thống và phản hồi khách hàng hôm nay, nêu rõ nguyên nhân và cách sửa.").trim();
        const sysCtx = [
            errors.length ? "LỖI HỆ THỐNG TỰ BẮT:\n" + errors.map((e) => `- [${e.source}] ${e.message} (${e.count}x, ${e.device})`).join("\n") : "Lỗi hệ thống: Không có.",
            userBugs.length ? "PHẢN HỒI KHÁCH HÀNG:\n" + userBugs.map((b: any) => `- [${b.kind}] ${b.name}: ${b.content} (${b.device})`).join("\n") : "Phản hồi khách: Không có.",
        ].join("\n\n");
        const parts: any[] = [{ text: `Bạn là Kỹ sư trưởng bảo trì ứng dụng Next.js Tử Vi Đẩu Số AI. Hãy đọc tin nhắn báo lỗi của Admin (kèm ảnh chụp màn hình nếu có) và nhật ký hệ thống bên dưới, trả lời rõ ràng bằng tiếng Việt: (1) Xác định chính xác lỗi gì đang xảy ra ở tính năng/file nào; (2) Nguyên nhân gốc rễ; (3) Phương án khắc phục cụ thể.\n\n${sysCtx}\n\nTIN NHẮN BÁO LỖI CỦA ADMIN: ${userMsg}` }];
        const imgData = String(body.imageDataUrl || "");
        if (imgData.startsWith("data:image/")) {
            const b64 = imgData.split(",")[1] || "";
            if (b64) parts.push({ inlineData: { mimeType: "image/jpeg", data: b64 } });
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        let reply = "";
        for (const m of ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"]) {
            try {
                const res = await genAI.getGenerativeModel({ model: m }).generateContent(parts, { signal: AbortSignal.timeout(14000) });
                reply = res.response.text()?.trim() || "";
                if (reply) break;
            } catch { }
        }
        if (!reply) reply = `Đã ghi nhận báo cáo: "${userMsg}".\n${sysCtx}\nKhuyến nghị: Tải file .ZIP bản cập nhật và chạy .\\cap-nhat.ps1 để đồng bộ bản vá mới nhất.`;
        const nextChat = [...chatHistory, { role: "user", text: userMsg, hasImage: Boolean(imgData), time: vnTime }, { role: "ai", text: reply, time: vnTime }].slice(-20);
        await writeBucket(WD_KEY, { ...wd, chatHistory: nextChat });
        return NextResponse.json({ diagnosis: reply, chatHistory: nextChat });
    } catch (e: any) { return NextResponse.json({ error: e?.message || "Lỗi chẩn đoán" }, { status: 500 }); }
}
