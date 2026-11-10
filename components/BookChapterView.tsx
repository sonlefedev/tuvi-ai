// components/BookChapterView.tsx
"use client";
import React, { useEffect, useState } from "react";
import { CheckSquare, Clock, Compass, Quote, ShieldAlert, Sparkles, Square } from "lucide-react";
import { ThienBanData } from "@/lib/types";
import { ChapterKey, LIFE_CHAPTERS } from "@/lib/ai/lifemap-chapters";
import ChapterIllustration from "./ChapterIllustration";

function renderInlineBold(text: string) {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
            ? <strong key={i} className="text-amber-200 font-semibold">{part.slice(2, -2)}</strong>
            : <React.Fragment key={i}>{part}</React.Fragment>
    );
}

export default function BookChapterView({ chapterKey, text, thienBan, chartKey, onRegen, disabled }: { chapterKey: ChapterKey; text: string; thienBan: ThienBanData; chartKey: string; onRegen?: () => void; disabled?: boolean }) {
    const meta = LIFE_CHAPTERS.find((c) => c.key === chapterKey) || LIFE_CHAPTERS[0];
    const [checked, setChecked] = useState<boolean[]>([false, false, false]);
    const checkKey = `${chartKey}_chk_${chapterKey}`;

    useEffect(() => {
        try { const s = JSON.parse(localStorage.getItem(checkKey) || "null"); if (Array.isArray(s)) setChecked(s); else setChecked([false, false, false]); } catch { }
    }, [checkKey]);

    const toggleCheck = (idx: number) => {
        const next = checked.map((v, i) => (i === idx ? !v : v));
        setChecked(next);
        try { localStorage.setItem(checkKey, JSON.stringify(next)); } catch { }
    };

    const blocks = (text || "").split(/\n+/).map((b) => b.trim()).filter(Boolean);
    const headings = blocks.filter((b) => /^###\s+/.test(b)).map((b) => b.replace(/^###\s+/, ""));
    const readMins = Math.max(1, Math.round((text?.length || 0) / 1450));
    let firstParaDone = false;

    return (
        <article className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-3.5 shadow-inner">
            <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                    <h4 className="font-black text-base text-amber-300 leading-snug">{meta.title}</h4>
                    <p className="text-[11.5px] italic text-amber-100/75 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" /> “{meta.motto}”</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-cyan-300 font-mono"><Clock className="w-3 h-3" /> ~{readMins} phút đọc • {(text?.length || 0).toLocaleString("vi-VN")} chữ</span>
                    {onRegen && <button type="button" disabled={disabled} onClick={onRegen} className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-[11px] font-bold disabled:opacity-40 cursor-pointer">Viết lại chương này</button>}
                </div>
            </div>

            <ChapterIllustration chapterKey={chapterKey} thienBan={thienBan} />

            {headings.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10.5px] font-bold uppercase text-slate-400 mr-1">Mục trong chương:</span>
                    {headings.map((h, i) => <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] truncate max-w-[240px]">{h}</span>)}
                </div>
            )}

            <div className="space-y-3 text-[13.5px] leading-relaxed text-slate-200">
                {blocks.map((b, idx) => {
                    if (/^###\s+/.test(b)) return <h5 key={idx} className="pt-2 text-sm font-extrabold text-cyan-300 border-b border-slate-800/80 pb-1">{b.replace(/^###\s+/, "")}</h5>;
                    if (b.startsWith(">")) return <blockquote key={idx} className="p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-400 text-amber-100 italic flex gap-2 items-start"><Quote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /><span>{renderInlineBold(b.replace(/^>\s*/, ""))}</span></blockquote>;
                    if (/^(Hành động|Giải pháp|Bước \d)/i.test(b)) return <div key={idx} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-100 flex gap-2 items-start"><Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /><div>{renderInlineBold(b)}</div></div>;
                    if (/^(Lưu ý tránh|Cảnh báo|Tuyệt đối tránh)/i.test(b)) return <div key={idx} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-100 flex gap-2 items-start"><ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /><div>{renderInlineBold(b)}</div></div>;
                    const isFirst = !firstParaDone && b.length > 60;
                    if (isFirst) firstParaDone = true;
                    return <p key={idx} className={isFirst ? "first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-amber-300 first-letter:mr-1.5 first-letter:float-left" : ""}>{renderInlineBold(b)}</p>;
                })}
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-cyan-500/10 border border-amber-500/25 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Bảng Thực Hành Nhanh Chương {meta.num} (Tích chọn để lưu tiến độ)</div>
                {meta.checks.map((item, i) => (
                    <button key={i} type="button" onClick={() => toggleCheck(i)} className="w-full text-left flex items-center gap-2 text-xs text-slate-200 hover:text-amber-200 cursor-pointer">
                        {checked[i] ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-500 shrink-0" />}
                        <span className={checked[i] ? "line-through text-slate-400" : ""}>{item}</span>
                    </button>
                ))}
            </div>
        </article>
    );
}
