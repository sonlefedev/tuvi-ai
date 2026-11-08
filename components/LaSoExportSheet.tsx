// @ts-nocheck
// components/LaSoExportSheet.tsx
import React from "react";
import { getStarColor } from "@/lib/ngu-hanh";
import { DeviceExportSpec } from "@/lib/export-image";

const MOBILE_POS = [
    "row-start-5 col-start-2", "row-start-5 col-start-1", "row-start-4 col-start-1", "row-start-3 col-start-1",
    "row-start-2 col-start-1", "row-start-1 col-start-1", "row-start-1 col-start-2", "row-start-1 col-start-3",
    "row-start-2 col-start-3", "row-start-3 col-start-3", "row-start-4 col-start-3", "row-start-5 col-start-3"
];
const DESKTOP_POS = [
    "row-start-4 col-start-3", "row-start-4 col-start-2", "row-start-4 col-start-1", "row-start-3 col-start-1",
    "row-start-2 col-start-1", "row-start-1 col-start-1", "row-start-1 col-start-2", "row-start-1 col-start-3",
    "row-start-1 col-start-4", "row-start-2 col-start-4", "row-start-3 col-start-4", "row-start-4 col-start-4"
];

export default function LaSoExportSheet({ exportRef, list, tb, spec }: { exportRef: any; list: any[]; tb: any; spec: DeviceExportSpec }) {
    const isMobile = spec.device === "mobile";
    const posList = isMobile ? MOBILE_POS : DESKTOP_POS;

    return (
        <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden">
            <div
                ref={exportRef}
                style={{ width: spec.width, height: spec.height }}
                className={`p-3 bg-slate-950 text-slate-100 grid gap-2 ${isMobile ? "grid-cols-3 grid-rows-5" : "grid-cols-4 grid-rows-4"}`}
            >
                {list.map((c, idx) => (
                    <div key={c.chi || idx} className={`${posList[idx]} p-2 border border-slate-800 bg-slate-900/95 rounded-2xl flex flex-col justify-between overflow-hidden`}>
                        <div className="flex justify-between items-start border-b border-slate-800 pb-1">
                            <div>
                                <div className="font-bold text-[12px] text-emerald-400 leading-none">{c.can_cung || c.chi}</div>
                                <div className="text-[10px] text-stone-400 font-bold mt-0.5 leading-none">{c.luu_cung}</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-black text-[12px] text-amber-200 uppercase leading-none">
                                    {c.ten_cung?.replace("<THÂN>", "")}
                                    {c.ten_cung?.includes("<THÂN>") && <span className="text-rose-400 ml-0.5">&lt;THÂN&gt;</span>}
                                </span>
                                {c.badges?.length > 0 && (
                                    <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                                        {c.badges.map((b: string, i: number) => (
                                            <span key={i} className={`text-[9px] px-1 py-0.5 rounded font-black border leading-none ${b === "Tiểu Hạn" ? "bg-amber-950 text-amber-300 border-amber-500/60" : b.includes("Triệt") ? "bg-rose-950 text-rose-300 border-rose-500/60" : "bg-purple-950 text-purple-300 border-purple-500/60"}`}>{b}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="text-right font-mono leading-none">
                                <div className="font-bold text-[11.5px] text-slate-200">{c.dai_van}</div>
                                <div className="text-amber-400 font-bold text-[10.5px] mt-0.5">{c.nguyet_han}</div>
                            </div>
                        </div>

                        <div className="text-center my-0.5 min-h-[24px] flex flex-col justify-center">
                            {c.chinh_tinh?.length > 0 ? c.chinh_tinh.map((s: any, i: number) => (
                                <div key={i} className={`font-black text-[12.5px] leading-tight ${getStarColor(s.ten)}`}>★ {s.ten} <span className="text-[10.5px] opacity-85 font-semibold">{s.trang_thai}</span></div>
                            )) : <div className="text-[11px] text-slate-500 italic">Vô chính diệu</div>}
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[10.5px] leading-[1.3] flex-1 overflow-hidden">
                            <div className="space-y-0.5">{c.phu_tinh_tot?.map((s: string, i: number) => <div key={i} className={getStarColor(s)}>{s}</div>)}</div>
                            <div className="text-right space-y-0.5">{c.phu_tinh_xau?.map((s: string, i: number) => <div key={i} className={getStarColor(s)}>{s}</div>)}</div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-800 leading-none">
                            <span className="font-bold text-cyan-400">{c.dv_cung}</span>
                            <span className="font-bold text-slate-300">{c.trang_sinh}</span>
                            <span className="font-mono"><b className="text-emerald-400">L:{c.phi_loc}</b> • <b className="text-rose-400">K:{c.phi_ky}</b></span>
                        </div>
                    </div>
                ))}

                {tb && (
                    <div className={`${isMobile ? "row-start-2 row-end-5 col-start-2 col-end-3" : "row-start-2 row-end-4 col-start-2 col-end-4"} p-4 bg-slate-950 border border-amber-500/40 rounded-2xl flex flex-col justify-between`}>
                        <div className="text-center border-b border-amber-500/25 pb-2">
                            <div className="text-[10px] uppercase tracking-widest text-amber-500/80">Lá Số Tử Vi Đẩu Số</div>
                            <h2 className="text-xl font-black text-amber-400 uppercase mt-0.5">{tb.ho_ten}</h2>
                            <div className="text-xs text-amber-200 font-bold mt-1">Năm xem: {tb.nam_xem || tb.nam_xem_han} • {tb.tuoi_mu} Tuổi • Hạn: <span className="text-emerald-300">{tb.sao_han}</span></div>
                        </div>

                        <div className={`grid gap-2 text-xs ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
                            <div className="space-y-1.5 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                                <div className="text-[10.5px] font-bold text-amber-400 uppercase border-b border-slate-800 pb-0.5">Sinh Thần & Bát Tự</div>
                                <div className="flex justify-between"><span className="text-slate-400">Năm sinh:</span><b>{tb.nam_sinh}</b></div>
                                <div className="flex justify-between"><span className="text-slate-400">Tháng / Ngày:</span><span>{tb.thang_sinh} • {tb.ngay_sinh}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Giờ sinh:</span><span>{tb.gio_sinh}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Âm Dương:</span><b className="text-indigo-300">{tb.am_duong}</b></div>
                            </div>
                            <div className="space-y-1.5 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                                <div className="text-[10.5px] font-bold text-amber-400 uppercase border-b border-slate-800 pb-0.5">Bản Mệnh & Cốt Cách</div>
                                <div className="flex justify-between"><span className="text-slate-400">Bản Mệnh:</span><b className="text-emerald-400">{tb.ban_menh}</b></div>
                                <div className="flex justify-between"><span className="text-slate-400">Cục số:</span><b className="text-amber-300">{tb.cuc_so || tb.cuc}</b></div>
                                <div className="flex justify-between"><span className="text-slate-400">Thân cư:</span><b className="text-purple-300">{tb.than_cu}</b></div>
                                <div className="flex justify-between"><span className="text-slate-400">Chủ tinh:</span><span>{tb.menh_chu} / {tb.than_chu}</span></div>
                            </div>
                        </div>

                        <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-xs flex justify-around">
                            <span>Cung Phi: <b className="text-rose-400">{tb.cung_phi}</b></span>
                            <span>•</span>
                            <span className="text-amber-300 font-medium">{tb.am_duong_ly}</span>
                        </div>
                        <div className="text-center pt-1.5 border-t border-amber-500/25 text-[10.5px] text-amber-500/80">Đức năng thắng số — Nhân định thắng thiên</div>
                    </div>
                )}
            </div>
        </div>
    );
}