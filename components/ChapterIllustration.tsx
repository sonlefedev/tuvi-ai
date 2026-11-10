// components/ChapterIllustration.tsx
"use client";
import React from "react";
import { ThienBanData } from "@/lib/types";
import { ChapterKey } from "@/lib/ai/lifemap-chapters";
import { buildChapterIllustrationSvg } from "@/lib/ai/chapter-svg";

export default function ChapterIllustration({ chapterKey, thienBan }: { chapterKey: ChapterKey; thienBan: ThienBanData }) {
    const { svg, caption } = buildChapterIllustrationSvg(chapterKey, thienBan);
    return (
        <figure className="my-3 rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-950/90 shadow-xl">
            <div className="w-full overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />
            <figcaption className="px-3.5 py-2 text-[11px] text-amber-200/80 bg-slate-900/90 border-t border-slate-800/80 text-center italic">
                {caption}
            </figcaption>
        </figure>
    );
}
