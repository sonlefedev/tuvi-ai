// app/api/auth/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const rawA = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const rawB = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
const SB_URL = rawA.startsWith("http") ? rawA : rawB.startsWith("http") ? rawB : "";
const SB_KEY = !rawB.startsWith("http") && rawB ? rawB : !rawA.startsWith("http") ? rawA : "";
const ADMIN_ID = "sonlefedev";
const ADMIN_HASH = crypto.createHash("sha256").update("tuvi_salt_sonfedev2k4@").digest("hex");

function sbHeaders(prefer?: string) {
    const isJwt = SB_KEY.startsWith("eyJ");
    return { apikey: SB_KEY, ...(isJwt ? { Authorization: `Bearer ${SB_KEY}` } : {}), "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) };
}

export async function POST(req: NextRequest) {
    try {
        if (!SB_URL || !SB_KEY) return NextResponse.json({ error: "Server chưa nhận biến NEXT_PUBLIC_SUPABASE_URL / ANON_KEY" }, { status: 500 });
        const { action, id, displayName, passHash, savedCharts } = await req.json();
        const normId = String(id || "").trim().toLowerCase();

        if (action === "register") {
            if (normId === ADMIN_ID) return NextResponse.json({ error: "Tài khoản quản trị đã được đặt trước, hãy dùng Đăng nhập!" }, { status: 400 });
            const check = await fetch(`${SB_URL}/rest/v1/tuvi_users?id=eq.${encodeURIComponent(normId)}&select=id`, { headers: sbHeaders(), cache: "no-store" });
            if (!check.ok) return NextResponse.json({ error: `Supabase lỗi (${check.status})` }, { status: 500 });
            if ((await check.json()).length > 0) return NextResponse.json({ error: "Tên đăng nhập này đã có người dùng" }, { status: 400 });
            const ins = await fetch(`${SB_URL}/rest/v1/tuvi_users`, { method: "POST", headers: sbHeaders("return=representation"), body: JSON.stringify({ id: normId, display_name: displayName, pass_hash: passHash, saved_charts: [] }) });
            if (!ins.ok) return NextResponse.json({ error: `Không ghi được Supabase (${ins.status})` }, { status: 500 });
            const c = (await ins.json())[0];
            return NextResponse.json({ success: true, user: { id: c.id, displayName: c.display_name, username: c.id, passHash: c.pass_hash, savedCharts: [], isAdmin: false } });
        }

        if (action === "login") {
            const res = await fetch(`${SB_URL}/rest/v1/tuvi_users?id=eq.${encodeURIComponent(normId)}`, { headers: sbHeaders(), cache: "no-store" });
            if (!res.ok) return NextResponse.json({ error: `Supabase lỗi (${res.status})` }, { status: 500 });
            let row = (await res.json())[0];
            if (normId === ADMIN_ID && passHash === ADMIN_HASH) {
                if (!row) {
                    const ins = await fetch(`${SB_URL}/rest/v1/tuvi_users`, { method: "POST", headers: sbHeaders("return=representation"), body: JSON.stringify({ id: ADMIN_ID, display_name: "Lê Thanh Sơn (Admin)", pass_hash: ADMIN_HASH, saved_charts: [] }) });
                    row = ins.ok ? (await ins.json())[0] : { id: ADMIN_ID, display_name: "Lê Thanh Sơn (Admin)", pass_hash: ADMIN_HASH, saved_charts: [] };
                } else if (row.pass_hash !== ADMIN_HASH) {
                    await fetch(`${SB_URL}/rest/v1/tuvi_users?id=eq.${ADMIN_ID}`, { method: "PATCH", headers: sbHeaders("return=minimal"), body: JSON.stringify({ pass_hash: ADMIN_HASH }) });
                    row.pass_hash = ADMIN_HASH;
                }
            }
            if (!row || row.pass_hash !== passHash) return NextResponse.json({ error: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 401 });
            return NextResponse.json({ success: true, user: { id: row.id, displayName: row.display_name, username: row.id, passHash: row.pass_hash, savedCharts: row.saved_charts || [], isAdmin: row.id === ADMIN_ID } });
        }

        if (action === "reset" || action === "sync_charts") {
            if (action === "reset" && normId === ADMIN_ID) return NextResponse.json({ error: "Không thể đặt lại mật khẩu tài khoản quản trị từ giao diện công khai" }, { status: 403 });
            const patch: any = { updated_at: new Date().toISOString() };
            if (passHash) patch.pass_hash = passHash;
            if (savedCharts) patch.saved_charts = savedCharts;
            const upd = await fetch(`${SB_URL}/rest/v1/tuvi_users?id=eq.${encodeURIComponent(normId)}`, { method: "PATCH", headers: sbHeaders("return=representation"), body: JSON.stringify(patch) });
            if (!upd.ok) return NextResponse.json({ error: `Lỗi cập nhật (${upd.status})` }, { status: 500 });
            const row = (await upd.json())[0];
            if (!row) return NextResponse.json({ error: "Không tìm thấy tài khoản trên Cloud" }, { status: 404 });
            return NextResponse.json({ success: true, user: { id: row.id, displayName: row.display_name, username: row.id, passHash: row.pass_hash, savedCharts: row.saved_charts || [], isAdmin: row.id === ADMIN_ID } });
        }

        return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
    } catch (err: any) { return NextResponse.json({ error: err?.message || "Lỗi kết nối server" }, { status: 500 }); }
}