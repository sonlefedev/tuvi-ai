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
    if (!SB_URL || !SB_KEY) return { config: { enabled: true }, logs: [] };
    const res = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${STATE_KEY}&select=data`, { headers: sbHeaders(), cache: "no-store" });
    const rows = res.ok ? await res.json() : [];
    return rows?.[0]?.data || { config: { enabled: true }, logs: [] };
}

async function writeState(data: any) {
    const now = new Date().toISOString();
    const patch = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${STATE_KEY}`, { method: "PATCH", headers: sbHeaders("return=representation"), body: JSON.stringify({ data, updated_at: now }) });
    const rows = patch.ok ? await patch.json() : [];
    if (!Array.isArray(rows) || rows.length === 0) {
        const uRes = await fetch(`${SB_URL}/rest/v1/tuvi_users?select=id&limit=1`, { headers: sbHeaders(), cache: "no-store" });
        const ownerId = (uRes.ok ? (await uRes.json())?.[0]?.id : null) || ADMIN_ID;
        await fetch(`${SB_URL}/rest/v1/tuvi_profiles`, { method: "POST", headers: sbHeaders("return=minimal"), body: JSON.stringify({ profile_key: STATE_KEY, user_id: ownerId, data, updated_at: now }) });
    }
}

export async function GET(req: NextRequest) {
    if ((req.nextUrl.searchParams.get("uid") || "").toLowerCase() !== ADMIN_ID) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return NextResponse.json(await readState());
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const isAuth = String(body.uid || "").toLowerCase() === ADMIN_ID || body.cronSource === "netlify-schedule";
        if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        const st = await readState();

        if (body.action === "save_config") {
            const next = { ...st, config: { ...st.config, ...(body.config || {}) } };
            await writeState(next);
            return NextResponse.json(next);
        }

        const cfg = st.config || {};
        if (body.cronSource === "netlify-schedule" && cfg.enabled === false) return NextResponse.json({ skipped: true });
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Thiếu GEMINI_API_KEY" }, { status: 500 });

        const vn = new Date(Date.now() + 7 * 3600 * 1000);
        const y = vn.getUTCFullYear(), m = vn.getUTCMonth() + 1, d = vn.getUTCDate();
        const ccDay = getCanChiNgay(y, m, d), ccYear = getCanChiNam(y);
        const site = "https://sonlexinchao-tuvi.netlify.app";
        const link = `${site}/?utm_source=autopromo&utm_campaign=${y}-${m}-${d}`;
        const prompt = `Viết 1 bài đăng mạng xã hội chuẩn SEO ngắn gọn (140-190 từ, hấp dẫn, tự nhiên) về vận khí ngày ${d}/${m}/${y} (Ngày ${ccDay}, năm ${ccYear}), gợi ý việc nên làm và mời mọi người lập lá số Tử Vi miễn phí + Đại Cẩm Nang 8 chương tại ${link}. Kèm 5 hashtag tiếng Việt.`;
        const postText = (await runGeminiStreamResilient(apiKey, prompt, { task: "chat_quick", temperature: 0.65, maxOutputTokens: 700 }, () => { })).trim();

        const results: string[] = [];
        if (cfg.fbPageId && cfg.fbPageToken) {
            const r = await fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(cfg.fbPageId)}/feed`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: postText, link, access_token: cfg.fbPageToken }) }).catch(() => null);
            results.push(r?.ok ? "Facebook Page: OK" : "Facebook Page: Lỗi token");
        }
        if (cfg.tgBotToken && cfg.tgChatId) {
            const r = await fetch(`https://api.telegram.org/bot${cfg.tgBotToken}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: cfg.tgChatId, text: postText }) }).catch(() => null);
            results.push(r?.ok ? "Telegram: OK" : "Telegram: Lỗi");
        }
        if (cfg.discordWebhook) {
            const r = await fetch(cfg.discordWebhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: postText }) }).catch(() => null);
            results.push(r?.ok ? "Discord: OK" : "Discord: Lỗi");
        }
        if (cfg.universalWebhook) {
            const r = await fetch(cfg.universalWebhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: `Tử Vi Ngày ${ccDay} (${d}/${m}/${y})`, content: postText, link, rssFeed: `${site}/api/daily-seo-feed`, coverImage: `${site}/og-cover.svg` }) }).catch(() => null);
            results.push(r?.ok ? "Webhook MXH (Make/n8n): OK" : "Webhook MXH: Lỗi");
        }
        await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ host: "sonlexinchao-tuvi.netlify.app", key: "sonlefedevtuvi2026indexnow", urlList: [site, `${site}/api/daily-seo-feed`] }) }).catch(() => null);
        results.push("SEO Ping (IndexNow & RSS): OK");

        const logItem = { time: vn.toISOString().replace("T", " ").slice(0, 16), topic: `Ngày ${ccDay} (${d}/${m}/${y})`, channels: results.join(" • "), excerpt: postText.slice(0, 180) + "..." };
        const next = { ...st, logs: [logItem, ...(st.logs || [])].slice(0, 20) };
        await writeState(next);
        return NextResponse.json(next);
    } catch (e: any) { return NextResponse.json({ error: e?.message || "Lỗi phát sóng tự động" }, { status: 500 }); }
}
