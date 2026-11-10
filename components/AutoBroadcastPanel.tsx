// components/AutoBroadcastPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Check, Copy, Loader2, Radio, Save, Send } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-store";

export default function AutoBroadcastPanel() {
    const [cfg, setCfg] = useState<any>({ enabled: true, fbPageId: "", fbPageToken: "", tgBotToken: "", tgChatId: "", discordWebhook: "", universalWebhook: "" });
    const [logs, setLogs] = useState<any[]>([]);
    const [busy, setBusy] = useState(false);
    const [copiedRss, setCopiedRss] = useState(false);

    useEffect(() => {
        const uid = getCurrentUser()?.username || "";
        fetch(`/api/auto-broadcast?uid=${encodeURIComponent(uid)}`, { cache: "no-store" })
            .then((r) => r.json()).then((d) => { if (d.config) setCfg((p: any) => ({ ...p, ...d.config })); if (d.logs) setLogs(d.logs); }).catch(() => { });
    }, []);

    const callApi = async (payload: any) => {
        setBusy(true);
        try {
            const uid = getCurrentUser()?.username || "";
            const r = await fetch("/api/auto-broadcast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid, ...payload }) });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Lỗi");
            if (j.config) setCfg(j.config);
            if (j.logs) setLogs(j.logs);
        } catch (e: any) { alert(e?.message || "Thao tác thất bại"); }
        finally { setBusy(false); }
    };

    const copyRss = async () => {
        try { await navigator.clipboard.writeText("https://sonlexinchao-tuvi.netlify.app/api/daily-seo-feed"); setCopiedRss(true); setTimeout(() => setCopiedRss(false), 2000); } catch { }
    };

    return (
        <div className="space-y-3 text-xs text-slate-200">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap justify-between items-center gap-2">
                <div><div className="font-bold text-emerald-300">Chế độ Web Tự Động Đi Quảng Bá Hằng Ngày (07:30 sáng)</div><div className="text-[11px] text-slate-300">AI tự viết bài Tử Vi theo Can Chi ngày hôm nay & tự đăng lên các kênh bên dưới + Ping Google/Bing SEO.</div></div>
                <label className="flex items-center gap-1.5 font-bold text-emerald-200 cursor-pointer"><input type="checkbox" checked={cfg.enabled !== false} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} /> Bật tự động 24/7</label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input value={cfg.fbPageId || ""} onChange={(e) => setCfg({ ...cfg, fbPageId: e.target.value })} placeholder="Facebook Fanpage ID (tùy chọn)" className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2" />
                <input type="password" value={cfg.fbPageToken || ""} onChange={(e) => setCfg({ ...cfg, fbPageToken: e.target.value })} placeholder="Facebook Page Access Token" className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2" />
                <input type="password" value={cfg.tgBotToken || ""} onChange={(e) => setCfg({ ...cfg, tgBotToken: e.target.value })} placeholder="Telegram Bot Token (tự đăng kênh/nhóm)" className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2" />
                <input value={cfg.tgChatId || ""} onChange={(e) => setCfg({ ...cfg, tgChatId: e.target.value })} placeholder="Telegram Chat ID (VD: @kenhtuviai)" className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2" />
                <input value={cfg.discordWebhook || ""} onChange={(e) => setCfg({ ...cfg, discordWebhook: e.target.value })} placeholder="Discord Webhook URL (tự đăng cộng đồng)" className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2" />
                <input value={cfg.universalWebhook || ""} onChange={(e) => setCfg({ ...cfg, universalWebhook: e.target.value })} placeholder="Webhook Make.com / n8n / Zapier (Threads, X, TikTok...)" className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2" />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <button type="button" disabled={busy} onClick={() => callApi({ action: "save_config", config: cfg })} className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/35 font-bold cursor-pointer"><Save className="w-3.5 h-3.5" /> Lưu cấu hình kênh</button>
                <button type="button" disabled={busy} onClick={() => callApi({ action: "broadcast_now" })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold shadow cursor-pointer">
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {busy ? "Đang tự động phát sóng..." : "Chạy Tự Động Quảng Bá Ngay"}
                </button>
                <button type="button" onClick={copyRss} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-purple-500/15 text-purple-200 border border-purple-500/35 font-semibold cursor-pointer">
                    {copiedRss ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedRss ? "Đã chép link RSS Auto-Post!" : "Chép link RSS (Buffer / IFTTT)"}
                </button>
            </div>

            {logs.length > 0 && (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pt-1">
                    <div className="font-bold text-slate-400 flex items-center gap-1"><Radio className="w-3.5 h-3.5 text-emerald-400" /> Lịch sử web đã tự đi quảng bá ({logs.length} lần gần nhất)</div>
                    {logs.map((l, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                            <div className="flex justify-between text-[10.5px]"><span className="font-bold text-amber-300">{l.topic}</span><span className="font-mono text-slate-400">{l.time}</span></div>
                            <div className="text-[10.5px] text-emerald-300">{l.channels}</div>
                            <p className="text-[11px] text-slate-400 line-clamp-2">{l.excerpt}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
