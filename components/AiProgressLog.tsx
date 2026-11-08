// components/AiProgressLog.tsx
"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function AiProgressLog({ steps, active }: { steps: string[]; active: boolean }) {
    const [sec, setSec] = useState(0);

    useEffect(() => {
        if (!active) { setSec(0); return; }
        const start = Date.now();
        const id = setInterval(() => setSec(Number(((Date.now() - start) / 1000).toFixed(1))), 100);
        return () => clearInterval(id);
    }, [active]);

    if (!active || steps.length === 0) return null;

    return (
        <div className="p-3 rounded-xl bg-slate-950/90 border border-purple-500/40 text-[11px] space-y-1.5 shadow-inner">
            <div className="flex justify-between items-center text-purple-300 font-bold border-b border-slate-800 pb-1">
                <span>Tiến trình xử lý AI trực tiếp</span>
                <span className="font-mono text-amber-300">{sec.toFixed(1)}s</span>
            </div>
            {steps.map((s, idx) => {
                const isLast = idx === steps.length - 1;
                return (
                    <div key={idx} className={`flex items-center gap-2 ${isLast ? "text-amber-200 font-semibold" : "text-emerald-400/80"}`}>
                        {isLast ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-purple-400" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        <span>{s}</span>
                    </div>
                );
            })}
        </div>
    );
}