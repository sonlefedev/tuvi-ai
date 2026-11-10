// app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
const rawA = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const rawB = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
const SB_URL = rawA.startsWith("http") ? rawA : rawB.startsWith("http") ? rawB : "";
const SB_KEY = !rawB.startsWith("http") && rawB ? rawB : !rawA.startsWith("http") ? rawA : "";
const ADMIN_ID = "sonlefedev";
const geoCache = new Map<string, string>();
const sbHeaders = (prefer?: string) => ({ apikey: SB_KEY, ...(SB_KEY.startsWith("eyJ") ? { Authorization: `Bearer ${SB_KEY}` } : {}), "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) });
const vnNow = () => new Date(Date.now() + 7 * 3600 * 1000);
const vnDateKey = (offset = 0) => `analytics_daily_${new Date(vnNow().getTime() - offset * 86400 * 1000).toISOString().slice(0, 10)}`;
async function extractGeo(req: NextRequest): Promise<{ location: string; ipMasked: string }> {
    const rawIp = (req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
    const parts = rawIp.split(".");
    const ipMasked = parts.length === 4 ? `${parts[0]}.${parts[1]}.xxx.${parts[3]}` : rawIp ? rawIp.slice(0, 10) + "…" : "Ẩn IP";
    try {
        const nfGeo = req.headers.get("x-nf-geo");
        if (nfGeo) {
            const g = JSON.parse(Buffer.from(nfGeo, "base64").toString("utf8"));
            const loc = [g?.city, g?.subdivision?.name, g?.country?.name].filter(Boolean).join(", ");
            if (loc) return { location: loc, ipMasked };
        }
    } catch { }
    if (rawIp && !/^(127\.|10\.|192\.168\.|::1)/.test(rawIp)) {
        if (geoCache.has(rawIp)) return { location: geoCache.get(rawIp)!, ipMasked };
        try {
            const r = await fetch(`http://ip-api.com/json/${encodeURIComponent(rawIp)}?fields=status,city,regionName,country,isp&lang=vi`, { signal: AbortSignal.timeout(1500) });
            const j = await r.json();
            if (j?.status === "success") {
                const loc = [j.city, j.regionName, j.country, j.isp ? `(${j.isp})` : ""].filter(Boolean).join(", ");
                geoCache.set(rawIp, loc);
                return { location: loc, ipMasked };
            }
        } catch { }
    }
    const country = req.headers.get("x-country") || req.headers.get("cf-ipcountry") || "";
    return { location: country || "Việt Nam (Múi giờ +7)", ipMasked };
}
async function upsertBucket(key: string, data: any) {
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
    const uid = (req.nextUrl.searchParams.get("uid") || "").trim().toLowerCase();
    if (uid !== ADMIN_ID) return NextResponse.json({ days: [], liveVisitors: [], error: "Unauthorized" }, { status: 403 });
    if (!SB_URL || !SB_KEY) return NextResponse.json({ days: [], liveVisitors: [] });
    const keys = [0, 1, 2, 3, 4, 5, 6].map((i) => vnDateKey(i));
    const inList = [...keys, "analytics_live_presence"].map((k) => `"${k}"`).join(",");
    const res = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=in.(${encodeURIComponent(inList)})&select=profile_key,data`, { headers: sbHeaders(), cache: "no-store" });
    const rows = res.ok ? await res.json() : [];
    const byKey = new Map(rows.map((r: any) => [r.profile_key, r.data]));
    const days = keys.map((k) => ({ date: k.replace("analytics_daily_", ""), ...(byKey.get(k) || { visits: 0, visitors: [], dwell: {}, features: {}, devices: {}, deviceModels: {}, recentSessions: [], sources: {} }) }));
    const liveRaw = (byKey.get("analytics_live_presence") as any)?.sessions || {};
    const liveVisitors = Object.values(liveRaw).filter((v: any) => Date.now() - Number(v.lastSeen || 0) < 25000).sort((a: any, b: any) => Number(b.lastSeen) - Number(a.lastSeen));
    return NextResponse.json({ days, liveVisitors });
}
export async function POST(req: NextRequest) {
    if (!SB_URL || !SB_KEY) return NextResponse.json({ ok: false });
    try {
        const body = await req.json();
        const geo = await extractGeo(req);
        if (body.sid) {
            const lRes = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.analytics_live_presence&select=data`, { headers: sbHeaders(), cache: "no-store" });
            const liveDoc = (lRes.ok ? (await lRes.json())?.[0]?.data : null) || { sessions: {} };
            const pruned: Record<string, any> = {};
            for (const [k, v] of Object.entries(liveDoc.sessions || {})) if (Date.now() - Number((v as any)?.lastSeen || 0) < 25000) pruned[k] = v;
            pruned[body.sid] = { sid: body.sid, vid: body.vid, ...(body.meta || {}), ...(body.live || {}), location: geo.location, ipMasked: geo.ipMasked, lastSeen: Date.now() };
            await upsertBucket("analytics_live_presence", { sessions: pruned });
        }
        if (body.newVisit || Object.keys(body.dwell || {}).length || Object.keys(body.features || {}).length) {
            const key = vnDateKey(0);
            const gRes = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${key}&select=data`, { headers: sbHeaders(), cache: "no-store" });
            const cur = (gRes.ok ? (await gRes.json())?.[0]?.data : null) || { visits: 0, visitors: [], dwell: {}, features: {}, devices: {}, deviceModels: {}, recentSessions: [], sources: {} };
            cur.deviceModels = cur.deviceModels || {}; cur.recentSessions = cur.recentSessions || [];
            if (body.newVisit) {
                cur.visits = (cur.visits || 0) + 1;
                if (body.vid && !cur.visitors.includes(body.vid)) cur.visitors = [...cur.visitors.slice(-500), body.vid];
                if (body.meta?.device) cur.devices[body.meta.device] = (cur.devices[body.meta.device] || 0) + 1;
                if (body.meta?.deviceLabel) cur.deviceModels[body.meta.deviceLabel] = (cur.deviceModels[body.meta.deviceLabel] || 0) + 1;
                if (body.meta?.source) cur.sources[body.meta.source] = (cur.sources[body.meta.source] || 0) + 1;
                cur.recentSessions = [{ time: vnNow().toISOString().slice(11, 16), device: body.meta?.deviceLabel || "Không rõ", screen: body.meta?.screen || "", location: geo.location, source: body.meta?.source || "Trực tiếp", returning: Boolean(body.meta?.isReturning) }, ...cur.recentSessions].slice(0, 30);
            }
            for (const [sec, v] of Object.entries(body.dwell || {})) cur.dwell[sec] = (cur.dwell[sec] || 0) + Number(v || 0);
            for (const [f, c] of Object.entries(body.features || {})) cur.features[f] = (cur.features[f] || 0) + Number(c || 0);
            await upsertBucket(key, cur);
        }
        return NextResponse.json({ ok: true });
    } catch { return NextResponse.json({ ok: false }); }
}
