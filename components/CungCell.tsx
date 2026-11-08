// components/CungCell.tsx
import React from "react";
import { CungItem } from "@/lib/types";
import { getStarColor } from "@/lib/ngu-hanh";

interface Props {
    cung: CungItem & { phi_hoa?: string; phi_hoa_full?: string; phi_loc?: string; phi_ky?: string };
    status: "idle" | "hovered" | "tam_hop" | "xung_chieu" | "dimmed";
    isSelected: boolean;
    onHover: (chi: string | null) => void;
    onClick: (cung: CungItem) => void;
}

export default function CungCell({ cung, status, isSelected, onHover, onClick }: Props) {
    let state = "border-slate-800 bg-slate-900/90 text-slate-100 hover:border-slate-600";
    if (status === "hovered") state = "border-purple-400 bg-purple-950/95 ring-1 ring-purple-400 shadow-xl";
    else if (status === "tam_hop") state = "border-emerald-400 bg-emerald-950/80 ring-1 ring-emerald-400";
    else if (status === "xung_chieu") state = "border-rose-400 bg-rose-950/80 ring-1 ring-rose-400";
    else if (status === "dimmed") state = "border-slate-900 bg-slate-950/40 opacity-35";

    const isThan = cung.ten_cung?.includes("<THÂN>");
    const tenCungClean = cung.ten_cung?.replace("<THÂN>", "").trim();

    return (
        <div
            onMouseEnter={() => onHover(cung.chi)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(cung)}
            className={`p-1.5 border rounded-xl flex flex-col justify-between h-full overflow-hidden transition-colors duration-150 cursor-pointer select-none ${state} ${isSelected ? "ring-2 ring-amber-400" : ""}`}
        >
            {/* Header: Can Cung - Tên Cung (1 dòng gọn) - Đại Vận & Nguyệt Hạn */}
            <div className="flex justify-between items-start gap-1 border-b border-slate-800/80 pb-1 leading-tight">
                <div className="shrink-0">
                    <div className="font-bold text-[10.5px] text-emerald-400 leading-none">{cung.can_cung || cung.chi}</div>
                    <div className="text-[9px] text-stone-400 font-bold mt-0.5 leading-none">{cung.luu_cung}</div>
                </div>

                <div className="flex flex-col items-center min-w-0 flex-1 text-center">
                    <div className="font-black text-[10px] text-amber-200 uppercase tracking-tight leading-none whitespace-nowrap">
                        {tenCungClean}
                        {isThan && <span className="text-rose-400 font-black ml-0.5">&lt;THÂN&gt;</span>}
                    </div>
                    {cung.badges && cung.badges.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                            {cung.badges.map((b, i) => (
                                <span key={i} className={`text-[8px] px-1 py-0.5 rounded font-black border leading-none ${b === "Tiểu Hạn" ? "bg-amber-950 text-amber-300 border-amber-500/60" :
                                        b.includes("Triệt") ? "bg-rose-950 text-rose-300 border-rose-500/60" :
                                            "bg-purple-950 text-purple-300 border-purple-500/60"
                                    }`}>{b}</span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="text-right shrink-0 font-mono leading-none">
                    <div className="font-bold text-[10.5px] text-slate-300">{cung.dai_van}</div>
                    <div className="text-amber-400 font-bold text-[9.5px] mt-0.5">{cung.nguyet_han}</div>
                </div>
            </div>

            {/* Chính Tinh hoặc Vô Chính Diệu */}
            <div className="text-center my-0.5 min-h-[24px] flex flex-col justify-center">
                {cung.chinh_tinh && cung.chinh_tinh.length > 0 ? (
                    cung.chinh_tinh.map((s, i) => (
                        <div key={i} className={`font-black text-[11px] leading-tight ${getStarColor(s.ten)}`}>
                            ★ {s.ten} <span className="text-[9px] opacity-80 font-medium">{s.trang_thai}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-[10px] text-slate-500 italic">Vô chính diệu</div>
                )}
            </div>

            {/* Cát Tinh & Sát Tinh */}
            <div className="grid grid-cols-2 gap-1 text-[9px] leading-[1.22] flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden my-0.5">
                <div className="space-y-0.5">
                    {cung.phu_tinh_tot?.map((s, i) => (<div key={i} className={`${getStarColor(s)} truncate`}>{s}</div>))}
                </div>
                <div className="text-right space-y-0.5">
                    {cung.phu_tinh_xau?.map((s, i) => (<div key={i} className={`${getStarColor(s)} truncate`}>{s}</div>))}
                </div>
            </div>

            {/* Footer: Cung Đại Vận - Tràng Sinh - Phi Hóa */}
            <div className="flex justify-between items-center text-[9px] text-slate-400 pt-0.5 border-t border-slate-800/80 leading-none" title={cung.phi_hoa_full || ""}>
                <span className="font-bold text-cyan-400">{cung.dv_cung}</span>
                <span className="font-bold text-slate-300">{cung.trang_sinh}</span>
                <span className="text-[8.5px] font-mono flex items-center gap-0.5">
                    <span className="text-emerald-400 font-bold">L:{cung.phi_loc || ""}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-rose-400 font-bold">K:{cung.phi_ky || ""}</span>
                </span>
            </div>
        </div>
    );
}