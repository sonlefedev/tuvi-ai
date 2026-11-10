// app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";

const rawA = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const rawB = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
const SB_URL = rawA.startsWith("http") ? rawA : rawB.startsWith("http") ? rawB : "";
const SB_KEY = !rawB.startsWith("http") && rawB ? rawB : !rawA.startsWith("http") ? rawA : "";
const ADMIN_ID = "sonlefedev";

function sbHeaders(prefer?: string) {
    const isJwt = SB_KEY.startsWith("eyJ");
    return { apikey: SB_KEY, ...(isJwt ? { Authorization: `Bearer ${SB_KEY}` } : {}), "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) };
}

function vnNow() {
    return new Date(Date.now() + 7 * 3600 * 1000);
}

function vnDateKey(offsetDays = 0): string {
    const d = new Date(vnNow().getTime() - offsetDays * 86400 * 1000);
    return `analytics_daily_${d.toISOString().slice(0, 10)}`;
}

async function resolveOwnerUserId(): Promise<string> {
    const res = await fetch(`${SB_URL}/rest/v1/tuvi_users?select=id&limit=1`, { headers: sbHeaders(), cache: "no-store" });
    const rows = res.ok ? await res.json() : [];
    return rows?.[0]?.id || ADMIN_ID;
}

export async function GET(req: NextRequest) {
    const uid = (req.nextUrl.searchParams.get("uid") || "").trim().toLowerCase();
    if (uid !== ADMIN_ID) return NextResponse.json({ days: [], error: "Chỉ tài khoản quản trị mới được xem thống kê" }, { status: 403 });
    if (!SB_URL || !SB_KEY) return NextResponse.json({ days: [], error: "Chưa cấu hình Supabase" });
    const keys = [0, 1, 2, 3, 4, 5, 6].map((i) => vnDateKey(i));
    const inList = keys.map((k) => `"${k}"`).join(",");
    const res = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=in.(${encodeURIComponent(inList)})&select=profile_key,data,updated_at`, { headers: sbHeaders(), cache: "no-store" });
    const rows = res.ok ? await res.json() : [];
    const byKey = new Map(rows.map((r: any) => [r.profile_key, r.data]));
    const days = keys.map((k) => ({ date: k.replace("analytics_daily_", ""), ...(byKey.get(k) || { visits: 0, visitors: [], dwell: {}, features: {}, devices: {}, deviceModels: {}, recentSessions: [], sources: {} }) }));
    return NextResponse.json({ days });
}

export async function POST(req: NextRequest) {
    if (!SB_URL || !SB_KEY) return NextResponse.json({ ok: false }, { status: 200 });
    try {
        const body = await req.json();
        const key = vnDateKey(0);
        const getRes = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${key}&select=data`, { headers: sbHeaders(), cache: "no-store" });
        const existing = getRes.ok ? (await getRes.json())?.[0]?.data : null;
        const cur = existing || { visits: 0, visitors: [], dwell: {}, features: {}, devices: {}, deviceModels: {}, recentSessions: [], sources: {} };
        cur.deviceModels = cur.deviceModels || {};
        cur.recentSessions = cur.recentSessions || [];

        if (body.newVisit) {
            cur.visits = (cur.visits || 0) + 1;
            if (body.vid && !cur.visitors.includes(body.vid)) cur.visitors = [...cur.visitors.slice(-500), body.vid];
            if (body.meta?.device) cur.devices[body.meta.device] = (cur.devices[body.meta.device] || 0) + 1;
            if (body.meta?.deviceLabel) cur.deviceModels[body.meta.deviceLabel] = (cur.deviceModels[body.meta.deviceLabel] || 0) + 1;
            if (body.meta?.source) cur.sources[body.meta.source] = (cur.sources[body.meta.source] || 0) + 1;
            cur.recentSessions = [{ time: vnNow().toISOString().slice(11, 16), device: body.meta?.deviceLabel || body.meta?.device || "Không rõ", screen: body.meta?.screen || "", source: body.meta?.source || "Trực tiếp", returning: Boolean(body.meta?.isReturning) }, ...cur.recentSessions].slice(0, 30);
        }
        for (const [sec, secVal] of Object.entries(body.dwell || {})) cur.dwell[sec] = (cur.dwell[sec] || 0) + Number(secVal || 0);
        for (const [feat, cnt] of Object.entries(body.features || {})) cur.features[feat] = (cur.features[feat] || 0) + Number(cnt || 0);

        const now = new Date().toISOString();
        const patch = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${key}`, { method: "PATCH", headers: sbHeaders("return=representation"), body: JSON.stringify({ data: cur, updated_at: now }) });
        const patched = patch.ok ? await patch.json() : [];
        if (!Array.isArray(patched) || patched.length === 0) {
            const ownerId = await resolveOwnerUserId();
            await fetch(`${SB_URL}/rest/v1/tuvi_profiles`, { method: "POST", headers: sbHeaders("return=minimal"), body: JSON.stringify({ profile_key: key, user_id: ownerId, data: cur, updated_at: now }) });
        }
        return NextResponse.json({ ok: true });
    } catch { return NextResponse.json({ ok: false }); }
}
