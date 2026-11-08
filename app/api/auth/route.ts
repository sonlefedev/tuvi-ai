// app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

function sbHeaders(prefer?: string) {
    const isJwt = SB_KEY.startsWith("eyJ");
    return {
        apikey: SB_KEY,
        ...(isJwt ? { Authorization: `Bearer ${SB_KEY}` } : {}),
        "Content-Type": "application/json",
        ...(prefer ? { Prefer: prefer } : {}),
    };
}

export async function POST(req: NextRequest) {
    try {
        if (!SB_URL || !SB_KEY) {
            return NextResponse.json({ error: "Server chưa nhận biến NEXT_PUBLIC_SUPABASE_URL / ANON_KEY" }, { status: 500 });
        }
        const { action, id, displayName, passHash, savedCharts } = await req.json();

        if (action === "register") {
            const check = await fetch(`${SB_URL}/rest/v1/tuvi_users?id=eq.${encodeURIComponent(id)}&select=id`, { headers: sbHeaders(), cache: "no-store" });
            if (!check.ok) return NextResponse.json({ error: `Supabase lỗi (${check.status}): ${await check.text()}` }, { status: 500 });
            const rows = await check.json();
            if (rows.length > 0) return NextResponse.json({ error: "Tên đăng nhập này đã có người dùng" }, { status: 400 });

            const ins = await fetch(`${SB_URL}/rest/v1/tuvi_users`, {
                method: "POST",
                headers: sbHeaders("return=representation"),
                body: JSON.stringify({ id, display_name: displayName, pass_hash: passHash, saved_charts: [] }),
            });
            if (!ins.ok) return NextResponse.json({ error: `Không ghi được Supabase (${ins.status}): ${await ins.text()}` }, { status: 500 });
            const created = (await ins.json())[0];
            return NextResponse.json({ success: true, user: { id: created.id, displayName: created.display_name, username: created.id, passHash: created.pass_hash, savedCharts: [] } });
        }

        if (action === "login") {
            const res = await fetch(`${SB_URL}/rest/v1/tuvi_users?id=eq.${encodeURIComponent(id)}`, { headers: sbHeaders(), cache: "no-store" });
            if (!res.ok) return NextResponse.json({ error: `Supabase lỗi (${res.status}): ${await res.text()}` }, { status: 500 });
            const row = (await res.json())[0];
            if (!row || row.pass_hash !== passHash) return NextResponse.json({ error: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 401 });
            return NextResponse.json({ success: true, user: { id: row.id, displayName: row.display_name, username: row.id, passHash: row.pass_hash, savedCharts: row.saved_charts || [] } });
        }

        if (action === "reset" || action === "sync_charts") {
            const patch: any = { updated_at: new Date().toISOString() };
            if (passHash) patch.pass_hash = passHash;
            if (savedCharts) patch.saved_charts = savedCharts;
            const upd = await fetch(`${SB_URL}/rest/v1/tuvi_users?id=eq.${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: sbHeaders("return=representation"),
                body: JSON.stringify(patch),
            });
            if (!upd.ok) return NextResponse.json({ error: `Lỗi cập nhật (${upd.status}): ${await upd.text()}` }, { status: 500 });
            const row = (await upd.json())[0];
            if (!row) return NextResponse.json({ error: "Không tìm thấy tài khoản trên Cloud" }, { status: 404 });
            return NextResponse.json({ success: true, user: { id: row.id, displayName: row.display_name, username: row.id, passHash: row.pass_hash, savedCharts: row.saved_charts || [] } });
        }

        return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Lỗi kết nối server" }, { status: 500 });
    }
}