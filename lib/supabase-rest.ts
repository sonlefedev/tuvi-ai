// lib/supabase-rest.ts
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const hasSupabase = () => Boolean(SB_URL && SB_KEY);

function headers(prefer?: string) {
    return {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        "Content-Type": "application/json",
        ...(prefer ? { Prefer: prefer } : {}),
    };
}

export async function sbSelect(table: string, query: string): Promise<any[]> {
    if (!hasSupabase()) return [];
    const res = await fetch(`${SB_URL}/rest/v1/${table}?${query}`, { headers: headers(), cache: "no-store" });
    if (!res.ok) throw new Error(`Lỗi đọc Supabase (${res.status}): ${await res.text()}`);
    return await res.json();
}

export async function sbUpsert(table: string, row: any): Promise<boolean> {
    if (!hasSupabase()) return false;
    const res = await fetch(`${SB_URL}/rest/v1/${table}`, {
        method: "POST",
        headers: headers("resolution=merge-duplicates,return=minimal"),
        body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error(`Lỗi lưu Supabase (${res.status}): ${await res.text()}`);
    return true;
}