// app/api/profile-sync/route.ts
import { NextRequest, NextResponse } from "next/server";

const rawA = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const rawB = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
const SB_URL = rawA.startsWith("http") ? rawA : rawB.startsWith("http") ? rawB : "";
const SB_KEY = !rawB.startsWith("http") && rawB ? rawB : !rawA.startsWith("http") ? rawA : "";

function sbHeaders(prefer?: string) {
    const isJwt = SB_KEY.startsWith("eyJ");
    return { apikey: SB_KEY, ...(isJwt ? { Authorization: `Bearer ${SB_KEY}` } : {}), "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) };
}

export async function GET(req: NextRequest) {
    const key = req.nextUrl.searchParams.get("key") || "";
    const userId = req.nextUrl.searchParams.get("userId") || "";
    if (!SB_URL || !SB_KEY || (!key && !userId)) return NextResponse.json({ data: null });
    try {
        const query = key
            ? `profile_key=eq.${encodeURIComponent(key)}&select=data,updated_at`
            : `user_id=eq.${encodeURIComponent(userId)}&order=updated_at.desc&limit=1&select=data,profile_key,updated_at`;
        const res = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?${query}`, { headers: sbHeaders(), cache: "no-store" });
        if (!res.ok) return NextResponse.json({ data: null, error: await res.text() });
        const rows = await res.json();
        return NextResponse.json({ data: rows[0]?.data || null, profileKey: rows[0]?.profile_key || key });
    } catch (e: any) {
        return NextResponse.json({ data: null, error: e?.message || "GET error" });
    }
}

export async function POST(req: NextRequest) {
    if (!SB_URL || !SB_KEY) return NextResponse.json({ ok: false, error: "Thiếu biến môi trường Supabase" }, { status: 500 });
    try {
        const { profileKey, userId, data } = await req.json();
        if (!profileKey || !userId || !data) return NextResponse.json({ ok: false, error: "Thiếu dữ liệu đồng bộ" }, { status: 400 });
        const now = new Date().toISOString();

        const patchRes = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${encodeURIComponent(profileKey)}`, {
            method: "PATCH",
            headers: sbHeaders("return=representation"),
            body: JSON.stringify({ user_id: userId, data, updated_at: now }),
        });
        if (patchRes.ok) {
            const updated = await patchRes.json();
            if (Array.isArray(updated) && updated.length > 0) return NextResponse.json({ ok: true });
        }

        const insRes = await fetch(`${SB_URL}/rest/v1/tuvi_profiles`, {
            method: "POST",
            headers: sbHeaders("return=minimal"),
            body: JSON.stringify({ profile_key: profileKey, user_id: userId, data, updated_at: now }),
        });
        if (!insRes.ok) {
            const errTxt = await insRes.text();
            return NextResponse.json({ ok: false, error: `Supabase (${insRes.status}): ${errTxt}` }, { status: 500 });
        }
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message || "POST error" }, { status: 500 });
    }
}
