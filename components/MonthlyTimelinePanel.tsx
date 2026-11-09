// components/MonthlyTimelinePanel.tsx
"use client";
import React, { useState } from "react";
import { CalendarDays, Download, MessageSquareText } from "lucide-react";
import { CungItem, ThienBanData } from "@/lib/types";
import { downloadMonthlyIcs } from "@/lib/export-ics";

interface Props { cungList: CungItem[]; thienBan: ThienBanData; namXem: number; onSelectCung: (c: CungItem) => void; onAskAi: (q: string) => void; }

export default function MonthlyTimelinePanel({ cungList, thienBan, namXem, onSelectCung, onAskAi }: Props) {
    const [month, setMonth] = useState(1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
        m,
        cung: cungList.find((c) => c.nguyet_han === `T ${m}`) || cungList[m % 12],
    }));
    const active = months[month - 1]?.cung;
    const isCautious = (c?: CungItem) => [...(c?.phu_tinh_xau || [])].some((s) => /Hóa Kỵ|K Dượng|Đà La|Địa Không|Địa Kiếp|Tang Môn|Bạch Hổ/.test(s));

    return (
        <section id="sec-timeline" className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-3.5 text-xs text-slate-200">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-amber-400" />
                    <div>
                        <h3 className="font-bold text-sm text-amber-300">Timeline Vận Hạn 12 Tháng Năm {namXem} (Đẩu Quân T1–T12)</h3>
                        <p className="text-[11px] text-slate-400">Chạm từng tháng để soi lưu nguyệt, cát/hung tinh và xuất lịch nhắc việc về điện thoại</p>
                    </div>
                </div>
                <button type="button" onClick={() => downloadMonthlyIcs(thienBan, cungList, namXem)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 font-bold text-[11px] cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Xuất Lịch Năm {namXem} (.ICS)
                </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
                {months.map(({ m, cung }) => {
                    const warn = isCautious(cung);
                    return (
                        <button key={m} type="button" onClick={() => { setMonth(m); if (cung) onSelectCung(cung); }} className={`p-2 rounded-xl border text-center transition cursor-pointer ${month === m ? "bg-amber-500/25 border-amber-400 text-amber-200 font-black" : "bg-slate-950/75 border-slate-800 text-slate-300 hover:border-slate-600"}`}>
                            <div className="text-[11px] font-bold">T{m}</div>
                            <div className="text-[9.5px] text-slate-400 truncate">{cung?.chi}</div>
                            <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${warn ? "bg-rose-400" : "bg-emerald-400"}`} />
                        </button>
                    );
                })}
            </div>

            {active && (
                <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 flex flex-col md:flex-row justify-between gap-3">
                    <div className="space-y-1">
                        <div className="font-bold text-sm text-amber-300">Tháng {month} Âm lịch ({namXem}) → Cung {active.ten_cung.replace("<THÂN>", "[THÂN]")} ({active.can_cung}) • {active.luu_cung} • {active.dv_cung}</div>
                        <p className="text-slate-300"><b>Chính tinh:</b> {active.chinh_tinh?.map((s) => `${s.ten}${s.trang_thai}`).join(", ") || "Vô chính diệu"}</p>
                        <p className="text-emerald-300"><b>Cát & Sao lưu tốt:</b> {(active.phu_tinh_tot || []).join(", ") || "Không"}</p>
                        <p className="text-rose-300"><b>Sát tinh & Lưu hung:</b> {(active.phu_tinh_xau || []).join(", ") || "Không"}</p>
                    </div>
                    <button type="button" onClick={() => onAskAi(`Luận chi tiết vận hạn Tháng ${month} Âm lịch năm ${namXem} tại cung ${active.ten_cung.replace("<THÂN>", "").trim()} (${active.can_cung})`)} className="self-start md:self-center shrink-0 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 cursor-pointer">
                        <MessageSquareText className="w-3.5 h-3.5" /> Hỏi AI tháng {month}
                    </button>
                </div>
            )}
        </section>
    );
}
