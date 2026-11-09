// components/SideQuickNav.tsx
"use client";
import React, { useState } from "react";
import { Compass, ListTree, Menu, X } from "lucide-react";
import { CungItem } from "@/lib/types";
interface Props {
    hasResult: boolean;
    cungList: CungItem[];
    selectedChi: string;
    onSelectCung: (c: CungItem) => void;
}
const SECTIONS = [
    { id: "sec-intro", label: "Giới thiệu & Tác giả" },
    { id: "sec-form", label: "Nhập ngày sinh" },
    { id: "sec-board", label: "Bàn cờ 12 cung", needResult: true },
    { id: "sec-cung", label: "Luận cung chi tiết", needResult: true },
    { id: "sec-timeline", label: "Timeline 12 tháng", needResult: true }, { id: "sec-chart", label: "Biểu đồ AI 4 tầng", needResult: true }, { id: "sec-journal", label: "Nhật ký chiêm nghiệm", needResult: true }, { id: "sec-synastry", label: "Hợp lá số đôi", needResult: true }, { id: "sec-rectify", label: "Định giờ sinh ngược", needResult: true },
];
export default function SideQuickNav({ hasResult, cungList, selectedChi, onSelectCung }: Props) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileTab, setMobileTab] = useState<"sec" | "cung">("cung");
    const jumpTo = (id: string) => {
        setMobileOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const handlePickCung = (c: CungItem) => {
        onSelectCung(c);
        jumpTo("sec-cung");
    };
    const visibleSections = SECTIONS.filter((s) => !s.needResult || hasResult);
    return (
        <>
            <aside className="hidden 2xl:flex fixed left-2 2xl:left-5 top-1/2 -translate-y-1/2 w-40 2xl:w-48 flex-col gap-1.5 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur z-30 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 px-2 pb-1.5 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <ListTree className="w-3.5 h-3.5" /> Mục lục nhanh
                </div>
                {visibleSections.map((s) => (
                    <button key={s.id} type="button" onClick={() => jumpTo(s.id)} className="text-left px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-amber-200 hover:bg-slate-800/90 transition text-[11.5px] truncate cursor-pointer">• {s.label}</button>
                ))}
            </aside>
            {hasResult && cungList.length > 0 && (
                <aside className="hidden 2xl:flex fixed right-2 2xl:right-5 top-1/2 -translate-y-1/2 w-40 2xl:w-48 flex-col gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur z-30 text-xs">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5 px-2 pb-1.5 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                        <Compass className="w-3.5 h-3.5" /> Chọn nhanh cung
                    </div>
                    {cungList.map((c) => {
                        const active = c.chi === selectedChi;
                        const isThan = c.ten_cung?.includes("<THÂN>");
                        return (
                            <button key={c.chi} type="button" onClick={() => handlePickCung(c)} className={`flex justify-between items-center px-2 py-1 rounded-lg text-[11px] transition cursor-pointer ${active ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-400/50" : "text-slate-300 hover:bg-slate-800/80"}`}>
                                <span className="truncate">{c.ten_cung?.replace("<THÂN>", "").trim()}{isThan ? " ★" : ""}</span>
                                <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">{c.chi}</span>
                            </button>
                        );
                    })}
                </aside>
            )}
            {/* Menu nổi đầy đủ 2 Tab (12 Cung & Mục lục) cho Smartphone */}
            <div className="2xl:hidden fixed bottom-16 right-4 z-50">
                {mobileOpen && (
                    <div className="mb-2 p-2.5 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl w-64 text-xs space-y-2 backdrop-blur">
                        {hasResult && (
                            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button type="button" onClick={() => setMobileTab("cung")} className={`py-1 rounded-lg font-bold text-[11px] ${mobileTab === "cung" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400"}`}>12 Cung</button>
                                <button type="button" onClick={() => setMobileTab("sec")} className={`py-1 rounded-lg font-bold text-[11px] ${mobileTab === "sec" ? "bg-amber-500/20 text-amber-300" : "text-slate-400"}`}>Mục lục</button>
                            </div>
                        )}
                        {hasResult && mobileTab === "cung" ? (
                            <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto">
                                {cungList.map((c) => (
                                    <button key={c.chi} type="button" onClick={() => handlePickCung(c)} className={`flex justify-between px-2 py-1.5 rounded-lg text-[11px] ${c.chi === selectedChi ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40" : "bg-slate-950/70 text-slate-300"}`}>
                                        <span className="truncate">{c.ten_cung?.replace("<THÂN>", "").trim()}</span>
                                        <span className="font-mono text-[10px] text-slate-400">{c.chi}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {visibleSections.map((s) => (
                                    <button key={s.id} type="button" onClick={() => jumpTo(s.id)} className="block w-full text-left px-2.5 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800">• {s.label}</button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="ml-auto flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-xs shadow-xl">
                    {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />} Điều hướng
                </button>
            </div>
        </>
    );
}
