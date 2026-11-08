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
    if (!SB_URL || !SB_KEY || !key) return NextResponse.json({ data: null });
    try {
        const res = await fetch(`${SB_URL}/rest/v1/tuvi_profiles?profile_key=eq.${encodeURIComponent(key)}&select=data`, { headers: sbHeaders(), cache: "no-store" });
        if (!res.ok) return NextResponse.json({ data: null });
        const rows = await res.json();
        return NextResponse.json({ data: rows[0]?.data || null });
    } catch {
        return NextResponse.json({ data: null });
    }
}

export async function POST(req: NextRequest) {
    if (!SB_URL || !SB_KEY) return NextResponse.json({ ok: false });
    try {
        const { profileKey, userId, data } = await req.json();
        if (!profileKey || !userId || !data) return NextResponse.json({ ok: false });
        const res = await fetch(`${SB_URL}/rest/v1/tuvi_profiles`, {
            method: "POST",
            headers: sbHeaders("resolution=merge-duplicates,return=minimal"),
            body: JSON.stringify({ profile_key: profileKey, user_id: userId, data, updated_at: new Date().toISOString() }),
        });
        return NextResponse.json({ ok: res.ok });
    } catch {
        return NextResponse.json({ ok: false });
    }
}