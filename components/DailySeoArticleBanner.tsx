// components/DailySeoArticleBanner.tsx
"use client";
import React, { useEffect, useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";

export default function DailySeoArticleBanner() {
    const [article, setArticle] = useState<{ date: string; title: string; body: string } | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetch("/api/auto-broadcast", { cache: "no-store" })
            .then((r) => r.json()).then((d) => { if (d.latestArticle) setArticle(d.latestArticle); }).catch(() => { });
    }, []);

    if (!article) return null;

    return (
        <section className="w-full max-w-5xl mx-auto mt-6 bg-slate-900/80 border border-amber-500/25 rounded-2xl p-4 text-xs text-slate-300">
            <button type="button" onClick={() => setOpen(!open)} className="w-full flex justify-between items-center gap-2 text-left cursor-pointer">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block">Bản Tin Tử Vi Hằng Ngày (Tự Động Cập Nhật)</span>
                        <h2 className="font-bold text-amber-200 text-xs sm:text-sm">{article.title}</h2>
                    </div>
                </div>
                <span className="text-slate-400 shrink-0">{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
            </button>
            {open && <p className="mt-3 pt-3 border-t border-slate-800 text-[12px] text-slate-300 leading-relaxed whitespace-pre-line">{article.body}</p>}
        </section>
    );
}
