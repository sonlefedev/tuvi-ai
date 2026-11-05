// @ts-nocheck
// components/LaSoBanCo.tsx
"use client";
import React, { useState } from "react";
import CungCell from "./CungCell";
import ThienBanCenter from "./ThienBanCenter";
import { TAM_HOP_MAP, XUNG_CHIEU_MAP } from "@/lib/tuong-tac";

const GRID_POS = [
    "row-start-4 col-start-3", "row-start-4 col-start-2", "row-start-4 col-start-1", "row-start-3 col-start-1",
    "row-start-2 col-start-1", "row-start-1 col-start-1", "row-start-1 col-start-2", "row-start-1 col-start-3",
    "row-start-1 col-start-4", "row-start-2 col-start-4", "row-start-3 col-start-4", "row-start-4 col-start-4"
];

interface Props {
    cungList?: any[];
    thienBan?: any;
    selectedChi?: string;
    onSelectCung?: (cung: any) => void;
    laSo?: any;
}

export default function LaSoBanCo({ cungList, thienBan, selectedChi, onSelectCung, laSo }: Props) {
    const [hoveredChi, setHoveredChi] = useState<string | null>(null);
    const list = cungList || laSo?.cung_12 || laSo?.cung || [];
    const tb = thienBan || laSo?.thien_ban || laSo?.thienBan;

    const getStatus = (chi: string): "idle" | "hovered" | "tam_hop" | "xung_chieu" | "dimmed" => {
        if (!hoveredChi) return "idle";
        if (chi === hoveredChi) return "hovered";
        if (TAM_HOP_MAP[hoveredChi]?.includes(chi)) return "tam_hop";
        if (XUNG_CHIEU_MAP[hoveredChi] === chi) return "xung_chieu";
        return "dimmed";
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-2 bg-slate-950 rounded-2xl shadow-2xl border border-slate-800">
            <div className="grid grid-cols-4 grid-rows-4 gap-1.5 w-full h-[780px]">
                {list.map((cung: any, idx: number) => (
                    <div key={cung.chi || idx} className={`${GRID_POS[idx]} w-full h-full overflow-hidden`}>
                        <CungCell
                            cung={cung}
                            status={getStatus(cung.chi)}
                            isSelected={selectedChi === cung.chi}
                            onHover={setHoveredChi}
                            onClick={(c) => onSelectCung && onSelectCung(c)}
                        />
                    </div>
                ))}

                <div className="row-start-2 row-end-4 col-start-2 col-end-4 w-full h-full p-1 z-10 overflow-hidden">
                    {tb && <ThienBanCenter thienBan={tb} />}
                </div>
            </div>
        </div>
    );
}