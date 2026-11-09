// components/CungReadingTabs.tsx
"use client";
import React, { useState } from "react";
import { CungAiReading } from "@/lib/ai/cung-ai-store";
import { BookOpen, Maximize2, Minimize2 } from "lucide-react";
import FormattedAiText from "./FormattedAiText";

const TABS: { key: keyof CungAiReading; label: string; title: string }[] = [
    { key: "chinhTinhBanCung", label: "1. Chính Tinh", title: "Chính Tinh & Thế Đứng Tại Bản Cung" },
    { key: "phuTinhTuongTac", label: "2. Phụ Tinh", title: "Hệ Thống Phụ Tinh & Phản Ứng Nội Cung" },
    { key: "tamHopXungChieu", label: "3. Tam Hợp • Xung", title: "Tam Phương Tứ Chính & Tuần / Triệt" },
    { key: "nhiHopGiapPhiHoa", label: "4. Nhị Hợp • Giáp • Hóa", title: "Nhị Hợp, Thế Giáp Cung & Phi Cung Tứ Hóa" },
    { key: "ducKetLoiKhuyen", label: "5. Đúc Kết", title: "Định Vị Trọn Đời & Chiến Lược Hành Động" },
];

export default function CungReadingTabs({ reading, cungName }: { reading: CungAiReading; cungName: string }) {
    const [activeTab, setActiveTab] = useState<keyof CungAiReading>("chinhTinhBanCung");
    const [showAll, setShowAll] = useState(false);

    const totalChars = Object.values(reading).reduce((sum, v) => sum + (v?.length || 0), 0);
    const current = TABS.find((t) => t.key === activeTab) || TABS[0];

    return (
        <div className="p-4 bg-gradient-to-b from-purple-950/30 to-slate-950/80 rounded-2xl border border-purple-500/30 space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-amber-300">Luận Giải Chuyên Sâu Cung {cungName}</span>
                    <span className="text-[10.5px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                        {totalChars.toLocaleString("vi-VN")} ký tự • Cache 0 token
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAll(!showAll)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer"
                >
                    {showAll ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                    {showAll ? "Thu gọn dạng Tab" : "Đọc toàn bộ 5 phần"}
                </button>
            </div>

            {!showAll ? (
                <>
                    <div className="flex flex-wrap gap-1.5">
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => setActiveTab(t.key)}
                                className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition cursor-pointer ${activeTab === t.key
                                        ? "bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow"
                                        : "bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/75 border border-slate-800/90 space-y-2">
                        <h6 className="font-bold text-sm text-purple-300">{current.title}</h6>
                        <FormattedAiText text={reading[current.key]} />
                    </div>
                </>
            ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {TABS.map((t) => (
                        <div key={t.key} className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-1.5">
                            <h6 className="font-bold text-xs text-amber-300 uppercase">{t.title}</h6>
                            <FormattedAiText text={reading[t.key]} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}