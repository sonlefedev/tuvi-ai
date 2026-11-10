// components/AiMarketingModal.tsx
"use client";
import React, { useState } from "react";
import { Check, Copy, ImageDown, Loader2, Megaphone, Sparkles, X } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-store";
import { downloadPromoPosterPng } from "@/lib/poster-export";
import { streamAiEndpoint } from "@/lib/ai/stream-client";

const FOCUSES = [
    { id: "auto", label: "Tự động theo xu hướng hôm nay" },
    { id: "Đại Cẩm Nang Bản Đồ Cuộc Đời 8 Chương (~100.000 chữ)", label: "Đại Cẩm Nang 8 Chương (~100k chữ)" },
    { id: "Hợp Lá Số Đôi — Soi Duyên & Cộng Sự", label: "Hợp Lá Số Đôi" },
    { id: "Định Giờ Sinh Ngược Bằng AI", label: "Định Giờ Sinh Ngược" },
    { id: "Gieo Quẻ Đầu Ngày & Lập Lá Số Miễn Phí", label: "Gieo Quẻ & Lập Lá Số Miễn Phí" },
];

export default function AiMarketingModal({ onClose }: { onClose: () => void }) {
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
            const data = await streamAiEndpoint(
                "/api/ai-marketing",
                { uid, focus, trendHint: topFeat ? `Tính năng dùng nhiều nhất hôm nay: ${topFeat}` : "" },
                (s) => setStatusText(s),
                (c) => setStatusText(c)
            );
            setResData(data);
        } catch (e: any) { alert(e?.message || "Lỗi tạo bài quảng cáo"); }
        finally { setLoading(false); setStatusText(""); }
    };

    const copyText = async (txt: string) => {
        try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { }
    };

    const curText = resData?.[tab] || "";

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-amber-500/40 rounded-2xl p-5 space-y-4 text-xs text-slate-200 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-amber-400" /><div><h3 className="font-black text-base text-amber-300">Studio AI Tự Viết Quảng Cáo Chuẩn SEO & Poster</h3><p className="text-[11px] text-slate-400">Tự động soạn nội dung Facebook, Zalo, TikTok, Blog SEO & tải Poster PNG để đăng mạng xã hội</p></div></div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <select value={focus} onChange={(e) => setFocus(e.target.value)} className="flex-1 min-w-[220px] bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-200 font-semibold">
                        {FOCUSES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                    <button type="button" onClick={generate} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow cursor-pointer disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {loading ? "AI đang viết chiến dịch SEO..." : "Tự động tạo chiến dịch SEO"}
                    </button>
                    <button type="button" onClick={() => downloadPromoPosterPng(resData?.posterLines || [])} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/40 font-bold cursor-pointer">
                        <ImageDown className="w-4 h-4" /> Tải Poster Ảnh (.PNG)
                    </button>
                </div>

                {statusText && <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] font-mono">{statusText}</div>}

                {resData ? (
                    <div className="space-y-3">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex flex-wrap gap-1.5">
                                {([["fb", "Facebook / Threads"], ["zalo", "Tin nhắn Zalo"], ["tiktok", "Kịch bản TikTok 35s"], ["blog", "Bài Blog SEO"]] as const).map(([k, lbl]) => (
                                    <button key={k} type="button" onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer ${tab === k ? "bg-amber-500/25 text-amber-200 border border-amber-400/50" : "bg-slate-950 text-slate-400 border border-slate-800"}`}>{lbl}</button>
                                ))}
                            </div>
                            <button type="button" onClick={() => copyText(curText)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 font-bold cursor-pointer">
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? "Đã sao chép!" : "Sao chép bài đăng"}
                            </button>
                        </div>
                        <textarea readOnly value={curText} rows={12} className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed font-sans" />
                    </div>
                ) : (
                    <div className="p-6 text-center rounded-xl bg-slate-950/60 border border-dashed border-amber-500/30 text-slate-400">
                        Bấm <b className="text-amber-300">“Tự động tạo chiến dịch SEO”</b> để AI tự phân tích xu hướng người dùng hôm nay và viết trọn bộ bài đăng Facebook, Zalo, kịch bản TikTok, bài Blog SEO — hoặc bấm <b className="text-emerald-300">“Tải Poster Ảnh (.PNG)”</b> để tải ngay ảnh poster 1080×1350 đăng lên trang cá nhân!
                    </div>
                )}
            </div>
        </div>
    );
}
