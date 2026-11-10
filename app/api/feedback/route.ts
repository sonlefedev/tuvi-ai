// app/api/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";

const rawA = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const rawB = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
const SB_URL = rawA.startsWith("http") ? rawA : rawB.startsWith("http") ? rawB : "";
const SB_KEY = !rawB.startsWith("http") && rawB ? rawB : !rawA.startsWith("http") ? rawA : "";
const ADMIN_ID = "sonlefedev";
const FB_KEY = "community_feedback_v1";

const sbHeaders = (prefer?: string) => ({ apikey: SB_KEY, ...(SB_KEY.startsWith("eyJ") ? { Authorization: `Bearer ${SB_KEY}` } : {}), "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) });

async function readItems(): Promise<any[]> {
    if (!SB_URL || !SB_KEY) return [];
    const res = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${FB_KEY}&select=data`, { headers: sbHeaders(), cache: "no-store" });
    const rows = res.ok ? await res.json() : [];
    return Array.isArray(rows?.[0]?.data?.items) ? rows[0].data.items : [];
}

async function writeItems(items: any[]) {
    const now = new Date().toISOString();
    const patch = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${FB_KEY}`, { method: "PATCH", headers: sbHeaders("return=representation"), body: JSON.stringify({ data: { items: items.slice(0, 100) }, updated_at: now }) });
    const rows = patch.ok ? await patch.json() : [];
    if (!Array.isArray(rows) || rows.length === 0) {
        const uRes = await fetch(`${SB_URL}/rest/v1/tuvi_users?select=id&limit=1`, { headers: sbHeaders(), cache: "no-store" });
        const ownerId = (uRes.ok ? (await uRes.json())?.[0]?.id : null) || ADMIN_ID;
        await fetch(`${SB_URL}/rest/v1/tuvi_profiles`, { method: "POST", headers: sbHeaders("return=minimal"), body: JSON.stringify({ profile_key: FB_KEY, user_id: ownerId, data: { items: items.slice(0, 100) }, updated_at: now }) });
    }
}

export async function GET() {
    return NextResponse.json({ items: await readItems() });
}

export async function POST(req: NextRequest) {
    if (!SB_URL || !SB_KEY) return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 500 });
    try {
        const body = await req.json();
        const items = await readItems();
        const isAdmin = String(body.uid || "").toLowerCase() === ADMIN_ID;

        if (body.action === "admin_reply" && isAdmin) {
            const next = items.map((x) => (x.id === body.id ? { ...x, adminReply: String(body.reply || "").trim(), resolved: body.resolved ?? x.resolved } : x));
            await writeItems(next);
            return NextResponse.json({ items: next });
        }
        if (body.action === "admin_toggle" && isAdmin) {
            const next = items.map((x) => (x.id === body.id ? { ...x, resolved: !x.resolved } : x));
            await writeItems(next);
            return NextResponse.json({ items: next });
        }
        if (body.action === "admin_delete" && isAdmin) {
            const next = items.filter((x) => x.id !== body.id);
            await writeItems(next);
            return NextResponse.json({ items: next });
        }

        const text = String(body.content || "").trim();
        if (text.length < 4) return NextResponse.json({ error: "Nội dung góp ý tối thiểu 4 ký tự" }, { status: 400 });
        const vnTime = new Date(Date.now() + 7 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 16);
        const entry = {
            id: "fb_" + Date.now(),
            name: String(body.name || "Khách ẩn danh").trim().slice(0, 40),
            kind: ["bug", "suggestion", "comment"].includes(body.kind) ? body.kind : "comment",
            rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
            content: text.slice(0, 600),
            device: String(body.device || "").slice(0, 80),
            createdAt: vnTime,
            resolved: false,
            adminReply: "",
        };
        const next = [entry, ...items];
        await writeItems(next);
        return NextResponse.json({ items: next });
    } catch (e: any) { return NextResponse.json({ error: e?.message || "Lỗi gửi góp ý" }, { status: 500 }); }
}
