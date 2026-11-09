// components/StarfieldBg.tsx
"use client";
import React from "react";

const STARS = [
    [6, 12, 2, 0], [14, 38, 1.5, 0.7], [22, 74, 2.5, 1.4], [31, 20, 1.5, 2.1],
    [42, 85, 2, 0.4], [53, 14, 2.5, 1.8], [64, 52, 1.5, 1.1], [72, 88, 2, 2.5],
    [81, 27, 2.5, 0.9], [90, 66, 1.5, 1.6], [11, 91, 2, 2.2], [48, 41, 1.5, 0.3],
    [77, 10, 2, 1.9], [36, 63, 2, 2.7], [88, 44, 1.5, 1.2], [19, 55, 2, 0.5],
];

export default function StarfieldBg() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
            <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
            {STARS.map(([x, y, sz, delay], i) => (
                <span
                    key={i}
                    style={{ left: `${x}%`, top: `${y}%`, width: `${sz}px`, height: `${sz}px`, animationDelay: `${delay}s` }}
                    className="absolute rounded-full bg-amber-200/80 animate-twinkle"
                />
            ))}
        </div>
    );
}
