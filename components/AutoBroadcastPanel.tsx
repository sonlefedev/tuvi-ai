// components/AutoBroadcastPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle2, Globe, Loader2, Radio, Share2, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-store";

export default function AutoBroadcastPanel() {
    const [logs, setLogs] = useState<any[]>([]);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        fetch("/api/auto-broadcast", { cache: "no-store" })
            .then((r) => r.json()).then((d) => { if (d.logs) setLogs(d.logs); }).catch(() => { });
    }, []);

    const runNow = async () => {
        setBusy(true);
        try {
            const uid = getCurrentUser()?.username || "";
            const r = await fetch("/api/auto-broadcast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid, action: "broadcast_now" }) });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Lỗi");
            if (j.logs) setLogs(j.logs);
        } catch (e: any) { alert(e?.message || "Thao tác thất bại"); }
        finally { setBusy(false); }
    };

    return (
        <div className="space-y-3 text-xs text-slate-200">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/35 space-y-2">
                <div className="flex items-center gap-2 font-black text-emerald-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Web Đang Tự Động Quảng Bá 24/7 (Bạn không cần cài đặt hay dán link gì cả!)</span>
                </div>
                <p className="text-[11.5px] text-slate-300 leading-relaxed">
                    Hệ thống tự động vận hành 3 cơ chế kéo khách tự nhiên mỗi ngày mà không cần bạn thao tác:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1"><div className="font-bold text-amber-300 flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> 1. Tự viết bài SEO 07:30 sáng</div><p className="text-slate-400">Mỗi sáng AI tự viết bài Tử Vi ngày Can Chi mới lên trang chủ & tự ping Google/Bing lập chỉ mục.</p></div>
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1"><div className="font-bold text-cyan-300 flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> 2. Khách tự rủ bạn bè qua Zalo/FB</div><p className="text-slate-400">Người dùng có nút mời người ấy Hợp Lá Số & chia sẻ Quẻ Ngày 1 chạm gửi trực tiếp qua Zalo/Facebook.</p></div>
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1"><div className="font-bold text-purple-300 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> 3. Ảnh Story & Lá số gắn thương hiệu</div><p className="text-slate-400">Mỗi ảnh lá số 4K & ảnh Story 9:16 khách tải về đều in sẵn địa chỉ web để lan truyền tự nhiên.</p></div>
                </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-[11px] text-slate-400">Lịch chạy tự động tiếp theo: <b className="text-emerald-300">07:30 sáng hằng ngày</b></span>
                <button type="button" disabled={busy} onClick={runNow} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold shadow cursor-pointer disabled:opacity-50">
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {busy ? "AI đang tự viết & đẩy SEO..." : "Chạy thêm 1 bài SEO ngay bây giờ"}
                </button>
            </div>

            {logs.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1">
                    <div className="font-bold text-slate-400 flex items-center gap-1"><Radio className="w-3.5 h-3.5 text-emerald-400" /> Nhật ký bài viết web đã tự động xuất bản ({logs.length})</div>
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
