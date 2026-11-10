// components/LiveVisitorsCard.tsx
"use client";
import React from "react";
import { Globe, Monitor, Radio, Smartphone, UserCheck, Wifi } from "lucide-react";

const SEC_LABELS: Record<string, string> = {
    "sec-intro": "Giới thiệu & Gieo quẻ", "sec-form": "Nhập ngày sinh", "sec-board": "Bàn cờ 12 cung",
    "sec-timeline": "Timeline 12 tháng", "sec-lifemap": "Đại Cẩm Nang 8 chương", "sec-cung": "Luận cung chi tiết",
    "sec-chart": "Biểu đồ AI 4 tầng", "sec-journal": "Nhật ký chiêm nghiệm", "sec-synastry": "Hợp lá số đôi",
    "sec-rectify": "Định giờ sinh ngược", "sec-chat": "Chat Trợ lý AI",
};

const fmtSec = (s = 0) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}p ${s % 60}s`);

export default function LiveVisitorsCard({ visitors }: { visitors: any[] }) {
    return (
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/35 via-slate-950/90 to-cyan-950/25 border border-emerald-500/35 space-y-2.5">
            <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" /></span>
                    <span className="font-black text-emerald-300 text-xs uppercase tracking-wide">Khách Đang Online Trực Tiếp: {visitors.length} người</span>
                </div>
                <span className="text-[10.5px] text-slate-400 flex items-center gap-1"><Radio className="w-3 h-3 text-emerald-400" /> Tự cập nhật mỗi 5 giây</span>
            </div>

            {visitors.length === 0 ? (
                <p className="text-slate-400 text-[11px]">Chưa có khách nào đang mở trang trong 25 giây qua.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {visitors.map((v: any) => (
                        <div key={v.sid} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-[11px]">
                            <div className="flex justify-between items-center gap-2">
                                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                                    {v.device === "Mobile" ? <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <Monitor className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                                    {v.deviceLabel || v.device}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.idle ? "bg-slate-800 text-slate-400" : "bg-emerald-500/20 text-emerald-300"}`}>
                                    {v.idle ? "Tab nền" : "Đang xem"} • {fmtSec(v.sessionSec || 0)}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-300">
                                <span className="flex items-center gap-1 text-cyan-200"><Globe className="w-3 h-3 text-cyan-400 shrink-0" /> {v.location || v.tz || "Việt Nam"}</span>
                                {v.ipMasked && <span className="font-mono text-slate-400">IP: {v.ipMasked}</span>}
                            </div>
                            <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400">
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-200">Đang ở: {SEC_LABELS[v.section] || v.section || "Trang chủ"}</span>
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-200 flex items-center gap-1"><UserCheck className="w-2.5 h-2.5" /> {v.userLabel || "Khách"}</span>
                                {v.screen && <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono">{v.screen}</span>}
                                {v.net && <span className="px-1.5 py-0.5 rounded bg-slate-800 flex items-center gap-0.5"><Wifi className="w-2.5 h-2.5" /> {v.net}</span>}
                                {v.hw && <span className="px-1.5 py-0.5 rounded bg-slate-800">{v.hw}</span>}
                                {v.source && <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300">Nguồn: {v.source}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
