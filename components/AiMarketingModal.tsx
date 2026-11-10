// components/AiMarketingModal.tsx
"use client";
import React, { useState } from "react";
import { Check, Copy, ImageDown, Loader2, Megaphone, Sparkles, X } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-store";
import { downloadPromoPosterPng } from "@/lib/poster-export";
import { streamAiEndpoint } from "@/lib/ai/stream-client";
import AutoBroadcastPanel from "./AutoBroadcastPanel";

const FOCUSES = [
    { id: "auto", label: "Tự động theo xu hướng hôm nay" },
    { id: "Đại Cẩm Nang Bản Đồ Cuộc Đời 8 Chương (~100.000 chữ)", label: "Đại Cẩm Nang 8 Chương (~100k chữ)" },
    { id: "Hợp Lá Số Đôi — Soi Duyên & Cộng Sự", label: "Hợp Lá Số Đôi" },
    { id: "Định Giờ Sinh Ngược Bằng AI", label: "Định Giờ Sinh Ngược" },
    { id: "Gieo Quẻ Đầu Ngày & Lập Lá Số Miễn Phí", label: "Gieo Quẻ & Lập Lá Số Miễn Phí" },
];

export default function AiMarketingModal({ onClose }: { onClose: () => void }) {
    const [mode, setMode] = useState<"auto" | "studio">("auto");
    const [focus, setFocus] = useState("auto");
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [resData, setResData] = useState<any>(null);
    const [tab, setTab] = useState<"fb" | "zalo" | "tiktok" | "blog">("fb");
    const [copied, setCopied] = useState(false);

    const generate = async () => {
        setLoading(true);
        setStatusText("Đang phân tích xu hướng người dùng hôm nay...");
        try {
            const uid = getCurrentUser()?.username || "";
            const st = await fetch(`/api/analytics?uid=${encodeURIComponent(uid)}`).then((r) => r.json()).catch(() => ({}));
            const topFeat = Object.entries(st?.days?.[0]?.features || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "";
            const data = await streamAiEndpoint("/api/ai-marketing", { uid, focus, trendHint: topFeat ? `Tính năng dùng nhiều nhất hôm nay: ${topFeat}` : "" }, setStatusText, setStatusText);
            setResData(data);
        } catch (e: any) { alert(e?.message || "Lỗi tạo bài quảng cáo"); }
        finally { setLoading(false); setStatusText(""); }
    };

    const copyText = async (txt: string) => {
        try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-amber-500/40 rounded-2xl p-5 space-y-4 text-xs text-slate-200 shadow-2xl">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-amber-400" /><div><h3 className="font-black text-base text-amber-300">Trung Tâm Tự Động Quảng Bá & SEO Đa Nền Tảng</h3><p className="text-[11px] text-slate-400">Web tự chạy chiến dịch đăng bài mỗi ngày lên MXH + Công cụ tạo nội dung & Poster thủ công</p></div></div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button type="button" onClick={() => setMode("auto")} className={`py-2 rounded-lg font-bold cursor-pointer ${mode === "auto" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-slate-400"}`}>1. Web Tự Động Phát Sóng MXH (24/7)</button>
                    <button type="button" onClick={() => setMode("studio")} className={`py-2 rounded-lg font-bold cursor-pointer ${mode === "studio" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400"}`}>2. Viết Bài & Tải Poster Thủ Công</button>
                </div>

                {mode === "auto" ? <AutoBroadcastPanel /> : (
                    <>
                        <div className="flex flex-wrap gap-2 items-center">
                            <select value={focus} onChange={(e) => setFocus(e.target.value)} className="flex-1 min-w-[220px] bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-200 font-semibold">{FOCUSES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select>
                            <button type="button" onClick={generate} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow cursor-pointer disabled:opacity-50">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}{loading ? "Đang viết..." : "Tạo chiến dịch SEO"}</button>
                            <button type="button" onClick={() => downloadPromoPosterPng(resData?.posterLines || [])} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-bold cursor-pointer"><ImageDown className="w-4 h-4" /> Tải Poster (.PNG)</button>
                        </div>
                        {statusText && <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] font-mono">{statusText}</div>}
                        {resData && (
                            <div className="space-y-3">
                                <div className="flex flex-wrap justify-between items-center gap-2">
                                    <div className="flex flex-wrap gap-1.5">{([["fb", "Facebook / Threads"], ["zalo", "Zalo"], ["tiktok", "TikTok 35s"], ["blog", "Blog SEO"]] as const).map(([k, lbl]) => <button key={k} type="button" onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer ${tab === k ? "bg-amber-500/25 text-amber-200 border border-amber-400/50" : "bg-slate-950 text-slate-400 border border-slate-800"}`}>{lbl}</button>)}</div>
                                    <button type="button" onClick={() => copyText(resData?.[tab] || "")} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-bold cursor-pointer">{copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Đã chép!" : "Sao chép"}</button>
                                </div>
                                <textarea readOnly value={resData?.[tab] || ""} rows={10} className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
