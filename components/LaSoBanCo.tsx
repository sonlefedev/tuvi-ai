// @ts-nocheck
// components/LaSoBanCo.tsx
"use client";
import React, { useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import CungCell from "./CungCell";
import ThienBanCenter from "./ThienBanCenter";
import LaSoExportSheet from "./LaSoExportSheet";
import { TAM_HOP_MAP, XUNG_CHIEU_MAP } from "@/lib/tuong-tac";
import { downloadLaSoPng } from "@/lib/export-image";
import { notifyTabStatus } from "@/lib/tab-notify";

const GRID_POS = [
    "row-start-4 col-start-3", "row-start-4 col-start-2", "row-start-4 col-start-1", "row-start-3 col-start-1",
    "row-start-2 col-start-1", "row-start-1 col-start-1", "row-start-1 col-start-2", "row-start-1 col-start-3",
    "row-start-1 col-start-4", "row-start-2 col-start-4", "row-start-3 col-start-4", "row-start-4 col-start-4"
];

export default function LaSoBanCo({ cungList, thienBan, selectedChi, onSelectCung, laSo }: any) {
    const [hoveredChi, setHoveredChi] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    const list = cungList || laSo?.cung_12 || laSo?.cung || [];
    const tb = thienBan || laSo?.thien_ban || laSo?.thienBan;

    const getStatus = (chi: string): "idle" | "hovered" | "tam_hop" | "xung_chieu" | "dimmed" => {
        if (!hoveredChi) return "idle";
        if (chi === hoveredChi) return "hovered";
        if (TAM_HOP_MAP[hoveredChi]?.includes(chi)) return "tam_hop";
        if (XUNG_CHIEU_MAP[hoveredChi] === chi) return "xung_chieu";
        return "dimmed";
    };

    const handleDownload = async () => {
        if (exporting) return;
        setExporting(true);
        notifyTabStatus("🖼️ Đang xuất ảnh lá số 4K...");
        try {
            await downloadLaSoPng(exportRef.current, tb?.ho_ten, tb?.nam_xem || tb?.nam_xem_han);
            notifyTabStatus("✅ Đã tải ảnh lá số!", 3000);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-2">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleDownload}
                    disabled={exporting}
                    aria-busy={exporting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 border border-amber-500/40 text-xs font-bold transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                    {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    {exporting ? "Đang xuất ảnh 4K..." : "Tải ảnh lá số (4K HD)"}
                </button>
            </div>

            <div className="w-full p-2 bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 overflow-x-auto">
                <div className="grid grid-cols-4 grid-rows-4 gap-1.5 min-w-[920px] w-full h-[920px] bg-slate-950 p-1">
                    {list.map((cung: any, idx: number) => (
                        <div key={cung.chi || idx} className={`${GRID_POS[idx]} w-full h-full overflow-hidden`}>
                            <CungCell cung={cung} status={getStatus(cung.chi)} isSelected={selectedChi === cung.chi} onHover={setHoveredChi} onClick={(c) => onSelectCung && onSelectCung(c)} />
                        </div>
                    ))}
                    <div className="row-start-2 row-end-4 col-start-2 col-end-4 w-full h-full p-1 z-10 overflow-hidden">
                        {tb && <ThienBanCenter thienBan={tb} />}
                    </div>
                </div>
            </div>

            <LaSoExportSheet exportRef={exportRef} list={list} tb={tb} />
        </div>
    );
}