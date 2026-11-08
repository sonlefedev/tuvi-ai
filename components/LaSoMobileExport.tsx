// @ts-nocheck
// components/LaSoMobileExport.tsx
import React from "react";
import { getStarColor } from "@/lib/ngu-hanh";

const PORTRAIT_POS = [
    "row-start-5 col-start-2", "row-start-5 col-start-1", "row-start-4 col-start-1", "row-start-3 col-start-1",
    "row-start-2 col-start-1", "row-start-1 col-start-1", "row-start-1 col-start-2", "row-start-1 col-start-3",
    "row-start-2 col-start-3", "row-start-3 col-start-3", "row-start-4 col-start-3", "row-start-5 col-start-3"
];

export default function LaSoMobileExport({ exportRef, list, tb }: { exportRef: any; list: any[]; tb: any }) {
    return (
        <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden">
            <div ref={exportRef} className="w-[900px] h-[1850px] p-3 bg-slate-950 text-slate-100 grid grid-cols-3 grid-rows-5 gap-2">
                {list.map((c, idx) => (
                    <div key={c.chi || idx} className={`${PORTRAIT_POS[idx]} p-2.5 border border-slate-800 bg-slate-900/95 rounded-2xl flex flex-col justify-between overflow-hidden`}>
                        <div className="flex justify-between items-start border-b border-slate-800 pb-1">
                            <div>
                                <div className="font-bold text-[13px] text-emerald-400 leading-none">{c.can_cung || c.chi}</div>
                                <div className="text-[10.5px] text-stone-400 font-bold mt-1 leading-none">{c.luu_cung}</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-black text-[13px] text-amber-200 uppercase leading-none">
                                    {c.ten_cung?.replace("<THÂN>", "")}
                                    {c.ten_cung?.includes("<THÂN>") && <span className="text-rose-400 ml-1">&lt;THÂN&gt;</span>}
                                </span>
                                {c.badges?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 justify-center mt-1">
                                        {c.badges.map((b: string, i: number) => (
                                            <span key={i} className={`text-[9.5px] px-1.5 py-0.5 rounded font-black border leading-none ${b === "Tiểu Hạn" ? "bg-amber-950 text-amber-300 border-amber-500/60" : b.includes("Triệt") ? "bg-rose-950 text-rose-300 border-rose-500/60" : "bg-purple-950 text-purple-300 border-purple-500/60"}`}>{b}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="text-right font-mono leading-none">
                                <div className="font-bold text-[12.5px] text-slate-200">{c.dai_van}</div>
                                <div className="text-amber-400 font-bold text-[11px] mt-1">{c.nguyet_han}</div>
                            </div>
                        </div>

                        <div className="text-center my-1 min-h-[28px] flex flex-col justify-center">
                            {c.chinh_tinh?.length > 0 ? c.chinh_tinh.map((s: any, i: number) => (
                                <div key={i} className={`font-black text-[13.5px] leading-tight ${getStarColor(s.ten)}`}>★ {s.ten} <span className="text-[11px] opacity-85 font-semibold">{s.trang_thai}</span></div>
                            )) : <div className="text-[11.5px] text-slate-500 italic">Vô chính diệu</div>}
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px] leading-[1.35] flex-1 overflow-hidden my-0.5">
                            <div className="space-y-0.5">{c.phu_tinh_tot?.map((s: string, i: number) => <div key={i} className={getStarColor(s)}>{s}</div>)}</div>
                            <div className="text-right space-y-0.5">{c.phu_tinh_xau?.map((s: string, i: number) => <div key={i} className={getStarColor(s)}>{s}</div>)}</div>
                        </div>

                        <div className="flex justify-between items-center text-[10.5px] pt-1 border-t border-slate-800 leading-none">
                            <span className="font-bold text-cyan-400">{c.dv_cung}</span>
                            <span className="font-bold text-slate-300">{c.trang_sinh}</span>
                            <span className="font-mono"><b className="text-emerald-400">L:{c.phi_loc}</b> • <b className="text-rose-400">K:{c.phi_ky}</b></span>
                        </div>
                    </div>
                ))}

                {tb && (
                    <div className="row-start-2 row-end-5 col-start-2 col-end-3 p-4 bg-slate-950 border border-amber-500/40 rounded-2xl flex flex-col justify-between">
                        <div className="text-center border-b border-amber-500/25 pb-3">
                            <div className="text-[11px] uppercase tracking-widest text-amber-500/80 mb-1">Lá Số Tử Vi Đẩu Số</div>
                            <h2 className="text-2xl font-black text-amber-400 uppercase tracking-wide">{tb.ho_ten}</h2>
                            <div className="mt-2 flex flex-col gap-1.5 items-center text-xs">
                                <span className="text-amber-200 font-bold">Năm xem: {tb.nam_xem || tb.nam_xem_han} • {tb.tuoi_mu} Tuổi (Mụ)</span>
                                <span className="text-emerald-300 font-semibold bg-emerald-950/50 px-2.5 py-0.5 rounded border border-emerald-500/30">Sao Hạn: {tb.sao_han}</span>
                            </div>
                        </div>

                        <div className="space-y-2.5 bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-xs">
                            <div className="text-[11px] font-bold text-amber-400 uppercase border-b border-slate-800 pb-1">Sinh Thần & Bát Tự</div>
                            <div className="flex justify-between"><span className="text-slate-400">Năm sinh:</span><span className="font-semibold">{tb.nam_sinh}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Tháng sinh:</span><span>{tb.thang_sinh}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Ngày sinh:</span><span>{tb.ngay_sinh}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Giờ sinh:</span><span>{tb.gio_sinh}</span></div>
                            <div className="flex justify-between border-t border-slate-800 pt-1"><span className="text-slate-400">Âm Dương:</span><span className="text-indigo-300 font-bold">{tb.am_duong}</span></div>
                        </div>

                        <div className="space-y-2.5 bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-xs">
                            <div className="text-[11px] font-bold text-amber-400 uppercase border-b border-slate-800 pb-1">Bản Mệnh & Cốt Cách</div>
                            <div className="flex justify-between"><span className="text-slate-400">Bản Mệnh:</span><span className="text-emerald-400 font-bold">{tb.ban_menh}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Cục số:</span><span className="text-amber-300 font-bold">{tb.cuc_so || tb.cuc}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Mệnh Cục:</span><span className="text-cyan-300">{tb.menh_cuc}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Thân cư:</span><span className="text-purple-300 font-bold">{tb.than_cu}</span></div>
                            <div className="flex justify-between border-t border-slate-800 pt-1"><span className="text-slate-400">Chủ tinh:</span><span>{tb.menh_chu} / {tb.than_chu}</span></div>
                        </div>

                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1 text-center">
                            <div><span className="text-slate-400">Cung Phi: </span><b className="text-rose-400">{tb.cung_phi}</b></div>
                            <div className="text-amber-300 font-medium">{tb.am_duong_ly}</div>
                        </div>

                        <div className="text-center pt-2 border-t border-amber-500/25 text-[11px] text-amber-500/80">Đức năng thắng số — Nhân định thắng thiên</div>
                    </div>
                )}
            </div>
        </div>
    );
}