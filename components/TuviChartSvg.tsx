// components/TuviChartSvg.tsx
"use client";
import React, { useState } from "react";
import { ChartKind, ChartPoint } from "@/lib/ai/chart-store";

export default function TuviChartSvg({ items, kind }: { items: ChartPoint[]; kind: ChartKind }) {
    const [activeIdx, setActiveIdx] = useState<number>(0);
    if (!items || items.length === 0) return null;
    const active = items[activeIdx] || items[0];

    if (kind === "bar") {
        return (
            <div className="space-y-2.5">
                {items.map((it, idx) => {
                    const color = it.score >= 80 ? "bg-emerald-500" : it.score >= 60 ? "bg-amber-400" : "bg-rose-500";
                    return (
                        <div key={idx} onClick={() => setActiveIdx(idx)} className={`p-2 rounded-xl border transition cursor-pointer ${activeIdx === idx ? "bg-slate-900 border-amber-400/60" : "bg-slate-950/60 border-slate-800 hover:border-slate-700"}`}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold text-slate-200">{it.label}</span>
                                <span className="font-mono font-black text-amber-300">{it.score}/100</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(5, it.score))}%` }} />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">{it.note}</p>
                        </div>
                    );
                })}
            </div>
        );
    }

    if (kind === "line") {
        const w = 680, h = 240, padX = 42, padY = 30;
        const pts = items.map((it, i) => {
            const x = padX + (i * (w - padX * 2)) / Math.max(1, items.length - 1);
            const y = h - padY - ((it.score / 100) * (h - padY * 2));
            return { x, y, ...it };
        });
        const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        return (
            <div className="space-y-3">
                <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56 bg-slate-950/80 rounded-xl border border-slate-800">
                    {[25, 50, 75, 100].map((v) => {
                        const y = h - padY - ((v / 100) * (h - padY * 2));
                        return <g key={v}><line x1={padX} y1={y} x2={w - padX} y2={y} stroke="#1e293b" strokeDasharray="4 4" /><text x={8} y={y + 3} fill="#64748b" fontSize="10">{v}</text></g>;
                    })}
                    <path d={pathD} fill="none" stroke="#c084fc" strokeWidth="3" />
                    {pts.map((p, i) => (
                        <g key={i} onClick={() => setActiveIdx(i)} className="cursor-pointer">
                            <circle cx={p.x} cy={p.y} r={activeIdx === i ? 7 : 5} fill={activeIdx === i ? "#fbbf24" : "#38bdf8"} stroke="#020617" strokeWidth="2" />
                            <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="bold">{p.score}</text>
                            <text x={p.x} y={h - 8} textAnchor="middle" fill="#94a3b8" fontSize="9.5">{p.label.slice(0, 8)}</text>
                        </g>
                    ))}
                </svg>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs">
                    <b className="text-amber-300">{active.label} ({active.score}/100):</b> <span className="text-slate-300">{active.note}</span>
                </div>
            </div>
        );
    }

    // Mặc định: Radar Chart (Mạng nhện)
    const cx = 220, cy = 175, maxR = 120, n = items.length;
    const ptAt = (i: number, ratio: number) => {
        const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
        return { x: cx + Math.cos(ang) * maxR * ratio, y: cy + Math.sin(ang) * maxR * ratio };
    };
    const poly = items.map((it, i) => { const p = ptAt(i, it.score / 100); return `${p.x},${p.y}`; }).join(" ");

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <svg viewBox="0 0 440 350" className="w-full max-w-[420px] mx-auto bg-slate-950/70 rounded-xl border border-slate-800">
                {[0.25, 0.5, 0.75, 1].map((r) => (
                    <polygon key={r} points={items.map((_, i) => { const p = ptAt(i, r); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke="#1e293b" />
                ))}
                {items.map((it, i) => {
                    const edge = ptAt(i, 1), lbl = ptAt(i, 1.22);
                    return <g key={i}><line x1={cx} y1={cy} x2={edge.x} y2={edge.y} stroke="#1e293b" /><text x={lbl.x} y={lbl.y} textAnchor="middle" fill="#cbd5e1" fontSize="10.5" fontWeight="bold">{it.label}</text></g>;
                })}
                <polygon points={poly} fill="rgba(168,85,247,0.28)" stroke="#c084fc" strokeWidth="2.5" />
                {items.map((it, i) => {
                    const p = ptAt(i, it.score / 100);
                    return <circle key={i} cx={p.x} cy={p.y} r={activeIdx === i ? 6.5 : 4.5} fill={activeIdx === i ? "#fbbf24" : "#34d399"} className="cursor-pointer" onClick={() => setActiveIdx(i)} />;
                })}
            </svg>
            <div className="space-y-2 max-h-[330px] overflow-y-auto pr-1">
                {items.map((it, i) => (
                    <div key={i} onClick={() => setActiveIdx(i)} className={`p-2.5 rounded-xl border cursor-pointer ${activeIdx === i ? "bg-purple-950/40 border-amber-400/60" : "bg-slate-950/60 border-slate-800"}`}>
                        <div className="flex justify-between font-bold text-xs"><span className="text-slate-100">{it.label}</span><span className="text-amber-300 font-mono">{it.score}/100</span></div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{it.note}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}