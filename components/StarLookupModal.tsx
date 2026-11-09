// components/StarLookupModal.tsx
"use client";
import React from "react";
import { BookOpenCheck, MessageSquarePlus, Sparkles, X } from "lucide-react";
import { lookupStarInfo } from "@/lib/luan-giai/star-dict";

interface Props { starName: string | null; cungContext?: string; onClose: () => void; onAskAi: (prompt: string) => void; }

export default function StarLookupModal({ starName, cungContext, onClose, onAskAi }: Props) {
    if (!starName) return null;
    const info = lookupStarInfo(starName);

    return (
        <div onClick={onClose} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-5 space-y-3 text-xs text-slate-200 shadow-2xl">
                <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-2.5">
                    <div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <h4 className="font-black text-base text-amber-300">{info.name}</h4>
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10.5px] text-cyan-300 font-bold">Hành {info.element}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{info.group}{cungContext ? ` • Tại ${cungContext}` : ""}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2 leading-relaxed">
                    <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800">
                        <div className="font-bold text-amber-300 mb-1 flex items-center gap-1"><BookOpenCheck className="w-3.5 h-3.5" /> Ý nghĩa cốt lõi</div>
                        <p>{info.summary}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/25 text-emerald-200/95">
                        <b>Lời khuyên ứng dụng:</b> {info.advice}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => { onAskAi(`Giải thích sâu ý nghĩa sao ${info.name}${cungContext ? ` tại ${cungContext}` : ""} trên lá số của tôi`); onClose(); }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                    <MessageSquarePlus className="w-4 h-4" /> Hỏi Trợ Lý AI về sao {info.name}
                </button>
            </div>
        </div>
    );
}
