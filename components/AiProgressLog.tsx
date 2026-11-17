// components/AiProgressLog.tsx
"use client";
import { Loader2 } from "lucide-react";

export default function AiProgressLog({ steps, active }: { steps: string[]; active: boolean }) {
    const currentStep = steps[steps.length - 1];
    if (!active || !currentStep) return null;

    return (
        <div role="status" aria-live="polite" aria-atomic="true" className="flex min-h-9 items-center gap-2 rounded-xl border border-purple-500/40 bg-slate-950/90 px-3 py-2 text-[11px] text-amber-200 shadow-inner">
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-purple-400" />
            <span className="min-w-0 flex-1 truncate font-semibold" title={currentStep}>{currentStep}</span>
        </div>
    );
}