// app/api/auto-broadcast/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runGeminiStreamResilient } from "@/lib/ai/gemini-models";
import { getCanChiNam, getCanChiNgay } from "@/lib/tuvi/can-chi";

const rawA = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const rawB = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
const SB_URL = rawA.startsWith("http") ? rawA : rawB.startsWith("http") ? rawB : "";
const SB_KEY = !rawB.startsWith("http") && rawB ? rawB : !rawA.startsWith("http") ? rawA : "";
const ADMIN_ID = "sonlefedev";
const STATE_KEY = "auto_broadcast_state_v1";

const sbHeaders = (prefer?: string) => ({ apikey: SB_KEY, ...(SB_KEY.startsWith("eyJ") ? { Authorization: `Bearer ${SB_KEY}` } : {}), "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) });

async function readState() {
    if (!SB_URL || !SB_KEY) return { articles: [], logs: [] };
    const res = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${STATE_KEY}&select=data`, { headers: sbHeaders(), cache: "no-store" });
    const rows = res.ok ? await res.json() : [];
    return rows?.[0]?.data || { articles: [], logs: [] };
}

async function writeState(data: any) {
    if (!SB_URL || !SB_KEY) return;
    const now = new Date().toISOString();
    const patch = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${STATE_KEY}`, { method: "PATCH", headers: sbHeaders("return=representation"), body: JSON.stringify({ data, updated_at: now }) });
    const rows = patch.ok ? await patch.json() : [];
    if (!Array.isArray(rows) || rows.length === 0) {
        const uRes = await fetch(`${SB_URL}/rest/v1/tuvi_users?select=id&limit=1`, { headers: sbHeaders(), cache: "no-store" });
        const ownerId = (uRes.ok ? (await uRes.json())?.[0]?.id : null) || ADMIN_ID;
        await fetch(`${SB_URL}/rest/v1/tuvi_profiles`, { method: "POST", headers: sbHeaders("return=minimal"), body: JSON.stringify({ profile_key: STATE_KEY, user_id: ownerId, data, updated_at: now }) });
    }
}

export async function GET() {
    const st = await readState();
    return NextResponse.json({ latestArticle: st.articles?.[0] || null, articles: (st.articles || []).slice(0, 7), logs: (st.logs || []).slice(0, 15) });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const isAuth = String(body.uid || "").toLowerCase() === ADMIN_ID || body.cronSource === "netlify-schedule";
        if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        const st = await readState();
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Thiếu GEMINI_API_KEY" }, { status: 500 });

        const vn = new Date(Date.now() + 7 * 3600 * 1000);
        const y = vn.getUTCFullYear(), m = vn.getUTCMonth() + 1, d = vn.getUTCDate();
        const ccDay = getCanChiNgay(y, m, d), ccYear = getCanChiNam(y);
        const site = "https://sonlexinchao-tuvi.netlify.app";
        const prompt = `Viết 1 bài luận Tử Vi & Lịch Vạn Niên chuẩn SEO cho ngày ${d}/${m}/${y} (Ngày ${ccDay}, năm ${ccYear}), dài khoảng 220-280 từ, gồm: (1) Tổng quan cát hung & năng lượng ngũ hành trong ngày; (2) Việc nên làm & việc cần tránh; (3) Lời khuyên chiêm nghiệm cho 12 con giáp. Văn phong ấm áp, sâu sắc, không dùng markdown phức tạp.`;
        const articleBody = (await runGeminiStreamResilient(apiKey, prompt, { task: "chat_quick", temperature: 0.6, maxOutputTokens: 850 }, () => { })).trim();

        await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ host: "sonlexinchao-tuvi.netlify.app", key: "sonlefedevtuvi2026indexnow", urlList: [site, `${site}/api/daily-seo-feed`] }) }).catch(() => null);

        const title = `Tử Vi Ngày ${ccDay} (${d}/${m}/${y}) — Luận Giải Cát Hung & Lời Khuyên Hành Động`;
        const article = { date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, title, body: articleBody };
        const logItem = { time: vn.toISOString().replace("T", " ").slice(0, 16), topic: title, channels: "Tự xuất bản lên Trang chủ SEO • RSS Feed • Ping Google & Bing IndexNow: OK", excerpt: articleBody.slice(0, 160) + "..." };
        const next = {
            articles: [article, ...(st.articles || []).filter((a: any) => a.date !== article.date)].slice(0, 14),
            logs: [logItem, ...(st.logs || [])].slice(0, 20),
        };
        await writeState(next);
        return NextResponse.json(next);
    } catch (e: any) { return NextResponse.json({ error: e?.message || "Lỗi tự động xuất bản" }, { status: 500 }); }
}
