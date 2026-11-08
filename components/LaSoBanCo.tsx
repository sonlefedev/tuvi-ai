// @ts-nocheck
// components/LaSoBanCo.tsx
"use client";
import React, { useRef, useState } from "react";
import { Download, Loader2, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import CungCell from "./CungCell";
import ThienBanCenter from "./ThienBanCenter";
import LaSoExportSheet from "./LaSoExportSheet";
import { TAM_HOP_MAP, XUNG_CHIEU_MAP } from "@/lib/tuong-tac";
import { downloadLaSoPng } from "@/lib/export-image";
import { notifyTabStatus } from "@/lib/tab-notify";
import { usePinchZoom } from "@/lib/use-pinch-zoom";

const GRID_POS = [
    "row-start-4 col-start-3", "row-start-4 col-start-2", "row-start-4 col-start-1", "row-start-3 col-start-1",
    "row-start-2 col-start-1", "row-start-1 col-start-1", "row-start-1 col-start-2", "row-start-1 col-start-3",
    "row-start-1 col-start-4", "row-start-2 col-start-4", "row-start-3 col-start-4", "row-start-4 col-start-4"
];

export default function LaSoBanCo({ cungList, thienBan, selectedChi, onSelectCung, laSo }: any) {
    const [hoveredChi, setHoveredChi] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);
    const zoom = usePinchZoom(1);

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

    const sizePx = Math.round(920 * zoom.scale);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-2">
            <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex md:hidden items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px]">
                    <button type="button" onClick={zoom.fitMobile} className="px-2 py-1 rounded-lg bg-slate-800 text-cyan-300 font-bold flex items-center gap-1"><Maximize className="w-3 h-3" /> Vừa ĐT</button>
                    <button type="button" onClick={() => zoom.stepScale(-0.15)} className="p-1 text-slate-300"><ZoomOut className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => zoom.setScale(1)} className="px-1.5 font-mono text-amber-300 font-bold">{Math.round(zoom.scale * 100)}%</button>
                    <button type="button" onClick={() => zoom.stepScale(0.15)} className="p-1 text-slate-300"><ZoomIn className="w-3.5 h-3.5" /></button>
                </div>

                <button type="button" onClick={handleDownload} disabled={exporting} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 border border-amber-500/40 text-xs font-bold transition disabled:opacity-50 cursor-pointer">
                    {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    {exporting ? "Đang xuất ảnh 4K..." : "Tải ảnh lá số (4K HD)"}
                </button>
            </div>

            <div onTouchStart={zoom.onTouchStart} onTouchMove={zoom.onTouchMove} onTouchEnd={zoom.onTouchEnd} className="w-full p-2 bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 overflow-auto touch-pan-x touch-pan-y">
                <div style={{ width: sizePx, height: sizePx }} className="mx-auto relative">
                    <div style={{ width: 920, height: 920, transform: `scale(${zoom.scale})`, transformOrigin: "top left" }} className="grid grid-cols-4 grid-rows-4 gap-1.5 bg-slate-950 p-1">
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
            </div>

            <LaSoExportSheet exportRef={exportRef} list={list} tb={tb} />
        </div>
    );
}