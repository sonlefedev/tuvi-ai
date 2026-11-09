// components/ThienBanCenter.tsx
import React from "react";
import { ThienBanData } from "@/lib/types";

export default function ThienBanCenter({ thienBan }: { thienBan: ThienBanData & { dai_van_hien_tai?: string; tieu_van_cung?: string } }) {
    const tb = thienBan;
    return (
        <div className="w-full h-full flex flex-col justify-between p-3.5 bg-slate-950/95 text-slate-100 border border-amber-500/30 rounded-xl shadow-2xl backdrop-blur-md">
            <div className="text-center border-b border-amber-500/20 pb-1.5">
                <h2 className="text-lg font-bold tracking-wider text-amber-400 uppercase">{tb.ho_ten || "ĐƯƠNG SỐ"}</h2>
                <div className="flex justify-center items-center gap-2 text-xs text-slate-300 mt-0.5">
                    <span className="font-semibold text-amber-200">Năm xem: {tb.nam_xem || tb.nam_xem_han}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">{tb.tuoi_mu} Tuổi (Mụ)</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-300 font-medium">Hạn: {tb.sao_han}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px] py-1 my-auto">
                <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <div className="text-[9.5px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-0.5">Sinh Thần & Bát Tự</div>
                    <div className="flex justify-between"><span className="text-slate-400">Năm sinh:</span><span className="text-slate-200 font-medium">{tb.nam_sinh}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Tháng sinh:</span><span className="text-slate-200">{tb.thang_sinh}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Ngày sinh:</span><span className="text-slate-200">{tb.ngay_sinh}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Giờ sinh:</span><span className="text-slate-200">{tb.gio_sinh}</span></div>
                    <div className="flex justify-between border-t border-slate-800/80 pt-0.5"><span className="text-slate-400">Âm Dương:</span><span className="text-indigo-300 font-semibold">{tb.am_duong}</span></div>
                </div>

                <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <div className="text-[9.5px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-0.5">Bản Mệnh & Cốt Cách</div>
                    <div className="flex justify-between"><span className="text-slate-400">Bản Mệnh:</span><span className="text-emerald-400 font-bold">{tb.ban_menh}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Cục số:</span><span className="text-amber-300 font-medium">{tb.cuc_so || tb.cuc}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Mệnh Cục:</span><span className="text-cyan-300">{tb.menh_cuc}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Thân cư:</span><span className="text-purple-300 font-medium">{tb.than_cu}</span></div>
                    <div className="flex justify-between border-t border-slate-800/80 pt-0.5"><span className="text-slate-400">Mệnh/Thân chủ:</span><span className="text-slate-300">{tb.menh_chu} / {tb.than_chu}</span></div>
                </div>
            </div>

            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 text-[10px] space-y-1 px-3">
                <div className="flex justify-between items-center">
                    <div><span className="text-slate-400">Cung Phi: </span><span className="font-bold text-rose-400">{tb.cung_phi}</span></div>
                    <span className="text-slate-500">•</span>
                    <div><span className="text-slate-400">Lý số: </span><span className="text-amber-300 font-medium">{tb.am_duong_ly}</span></div>
                </div>
                {(tb.dai_van_hien_tai || tb.tieu_van_cung) && (
                    <div className="flex justify-between items-center border-t border-slate-800/80 pt-1">
                        <div><span className="text-slate-400">ĐV hành: </span><span className="font-bold text-cyan-300">{tb.dai_van_hien_tai}</span></div>
                        <span className="text-slate-500">•</span>
                        <div><span className="text-slate-400">Tiểu vận: </span><span className="font-bold text-amber-300">{tb.tieu_van_cung}</span></div>
                    </div>
                )}
            </div>

            <div className="text-center pt-1 border-t border-amber-500/20 text-[9.5px] text-amber-500/80 tracking-wide font-sans">
                Đức năng thắng số — Nhân định thắng thiên
            </div>
        </div>
    );
}
