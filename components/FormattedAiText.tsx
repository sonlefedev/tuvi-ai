// components/FormattedAiText.tsx
"use client";
import React from "react";

export default function FormattedAiText({ text }: { text: string }) {
    if (!text) return null;
    const clean = text.replace(/\$\\rightarrow\$|\\rightarrow/g, "→").replace(/\$\\leftrightarrow\$|\\leftrightarrow/g, "↔");
    const renderInline = (line: string) =>
        line.split(/(\*\*.*?\*\*)/g).map((p, i) =>
            p.startsWith("**") && p.endsWith("**")
                ? <b key={i} className="text-amber-300 font-bold">{p.slice(2, -2)}</b>
                : <span key={i}>{p}</span>
        );

    return (
        <div className="space-y-1.5 leading-relaxed text-[12.5px] text-slate-200">
            {clean.split("\n").map((raw, idx) => {
                const line = raw.trim();
                if (!line) return <div key={idx} className="h-1" />;
                if (line.startsWith("###")) {
                    return <h4 key={idx} className="font-black text-sm text-pink-300 pt-2 border-b border-slate-800/80 pb-1">{line.replace(/^#+\s*/, "")}</h4>;
                }
                return <p key={idx}>{renderInline(raw)}</p>;
            })}
        </div>
    );
}
