// components/DailyFortuneWidget.tsx
"use client";
import React, { useState } from "react";
import { Check, Dices, ImageDown, MessageSquarePlus, Share2, Sparkles } from "lucide-react";
import { DAILY_CARDS } from "@/lib/intro-data";
import { downloadDailyFortuneStory } from "@/lib/story-card-export";
import { trackFeature } from "@/lib/analytics-client";

export default function DailyFortuneWidget({ onAskAi }: { onAskAi?: (q: string) => void }) {
    const [idx, setIdx] = useState<number | null>(null);
    const [shaking, setShaking] = useState(false);
    const [copied, setCopied] = useState(false);

    const drawCard = () => {
        if (shaking) return;
        setShaking(true);
        setTimeout(() => {
            let next = Math.floor(Math.random() * DAILY_CARDS.length);
            if (next === idx) next = (next + 1) % DAILY_CARDS.length;
            setIdx(next);
            setShaking(false);
        }, 550);
    };

    const card = idx !== null ? DAILY_CARDS[idx] : null;
    const shareCard = async () => {
        if (!card) return;
        trackFeature("Chia sẻ quẻ ngày lên MXH");
        const txt = `✨ Quẻ Tinh Tú hôm nay của tôi: "${card.star}" — ${card.msg} (Màu hợp: ${card.color}, Giờ đẹp: ${card.hour}). Gieo quẻ & lập lá số Tử Vi miễn phí tại: https://sonlexinchao-tuvi.netlify.app/?ref=daily_card`;
        try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { }
    };

    return (
        <div className="w-full max-w-5xl mx-auto mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-amber-950/50 border border-amber-500/30 shadow-lg text-xs text-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 ${shaking ? "animate-shake-card" : "animate-float-soft"}`}><Sparkles className="w-4 h-4" /></div>
                    <div>
                        <div className="font-bold text-amber-300 flex items-center gap-1.5"><span>Gieo Quẻ Tinh Tú Hôm Nay</span><span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30">Thư giãn & Chiêm nghiệm</span></div>
                        <p className="text-[11px] text-slate-300">{card ? `Quẻ vừa rút: ${card.star} — ${card.msg}` : "Thử rút một thẻ cát tinh ngẫu nhiên để xem gợi ý năng lượng, màu sắc & giờ đẹp hôm nay!"}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    {card && onAskAi && <button type="button" onClick={() => onAskAi(`Hôm nay tôi rút được quẻ "${card.star}" (${card.msg}). Hãy liên hệ với lá số của tôi để gợi ý cách ứng dụng tốt nhất hôm nay!`)} className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 font-semibold flex items-center gap-1 cursor-pointer"><MessageSquarePlus className="w-3.5 h-3.5" /> Luận theo lá số</button>}
                    {card && <button type="button" onClick={() => { trackFeature("Tải Story Quẻ 9:16"); downloadDailyFortuneStory(card); }} className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-semibold flex items-center gap-1 cursor-pointer"><ImageDown className="w-3.5 h-3.5" /> Tải Story 9:16</button>}
                    {card && <button type="button" onClick={shareCard} className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-semibold flex items-center gap-1 cursor-pointer">{copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />} {copied ? "Đã chép!" : "Chia sẻ"}</button>}
                    <button type="button" onClick={drawCard} disabled={shaking} className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black flex items-center gap-1.5 shadow cursor-pointer">
                        <Dices className={`w-3.5 h-3.5 ${shaking ? "animate-spin" : ""}`} />
                        {shaking ? "Đang xóc quẻ..." : card ? "Gieo lại" : "Gieo Quẻ Ngay"}
                    </button>
                </div>
            </div>
            {card && !shaking && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[11px]">
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800"><span className="text-slate-400">Màu cát tường:</span> <b className="text-emerald-300">{card.color}</b></div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800"><span className="text-slate-400">Giờ hoàng đạo:</span> <b className="text-amber-300">{card.hour}</b></div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800"><span className="text-slate-400">Con số may mắn:</span> <b className="text-cyan-300 font-mono">{card.num}</b></div>
                </div>
            )}
        </div>
    );
}
