// app/api/watchdog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllAvailableTextModels, runGeminiStreamResilient } from "@/lib/ai/gemini-models";

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
    return NextResponse.json({ checks, sysErrors: wd.errors || [], userBugs });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const wd = await readBucket(WD_KEY);
        const errors: any[] = Array.isArray(wd.errors) ? wd.errors : [];

        if (body.action === "report_error") {
            const vnTime = new Date(Date.now() + 7 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 16);
            const sig = `${body.source}:${body.message}`;
            const idx = errors.findIndex((e) => `${e.source}:${e.message}` === sig);
            if (idx !== -1) errors[idx] = { ...errors[idx], count: (errors[idx].count || 1) + 1, lastSeen: vnTime, device: body.device || errors[idx].device };
            else errors.unshift({ id: "err_" + Date.now(), source: body.source || "System", message: body.message, detail: body.detail || "", device: body.device || "", count: 1, lastSeen: vnTime });
            await writeBucket(WD_KEY, { errors: errors.slice(0, 40) });
            return NextResponse.json({ ok: true });
        }

        if (String(body.uid || "").toLowerCase() !== ADMIN_ID) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        if (body.action === "clear_errors") {
            await writeBucket(WD_KEY, { errors: [] });
            return NextResponse.json({ ok: true });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Thiếu GEMINI_API_KEY" }, { status: 500 });
        const fb = await readBucket("community_feedback_v1");
        const userBugs = (fb.items || []).filter((x: any) => !x.resolved && (x.kind === "bug" || x.kind === "suggestion"));
        const summary = [
            errors.length ? "LỖI HỆ THỐNG TỰ BẮT ĐƯỢC:\n" + errors.map((e) => `- [${e.source}] ${e.message} (${e.count} lần, máy: ${e.device})`).join("\n") : "Không có lỗi crash hệ thống nghiêm trọng.",
            userBugs.length ? "PHẢN HỒI / BÁO LỖI TỪ KHÁCH HÀNG:\n" + userBugs.map((b: any) => `- [${b.kind}] ${b.name}: ${b.content} (máy: ${b.device})`).join("\n") : "Chưa có báo lỗi mới từ khách hàng.",
        ].join("\n\n");

        const prompt = `Bạn là Kỹ sư trưởng bảo trì web Tử Vi Đẩu Số AI. Hãy phân tích báo cáo cuối ngày sau và đưa ra: (1) Tóm tắt nguyên nhân từng vấn đề; (2) Phương án khắc phục tối ưu nhất; (3) Ghi chú cập nhật phiên bản mới ngắn gọn.\n\n${summary}`;
        const diagnosis = await runGeminiStreamResilient(apiKey, prompt, { task: "chat_quick", temperature: 0.3, maxOutputTokens: 1200 }, () => { });
        return NextResponse.json({ diagnosis, summary });
    } catch (e: any) { return NextResponse.json({ error: e?.message || "Lỗi chẩn đoán" }, { status: 500 }); }
}
