"use client";

import React, { useEffect, useState } from "react";
import { Activity, Network, Trash2, X } from "lucide-react";
import { DATA_FLOW_EVENT, DataFlowTraceEvent } from "@/lib/data-flow-trace";
import DataFlowCircuit from "./DataFlowCircuit";
import DataFlowEventItem from "./DataFlowEventItem";

export default function DataFlowPanel() {
    const [events, setEvents] = useState<DataFlowTraceEvent[]>([]);
    const [open, setOpen] = useState(false);
    const latest = events[0];

    useEffect(() => {
        const onTrace = (event: Event) => {
            const trace = (event as CustomEvent<DataFlowTraceEvent>).detail;
            setEvents((current) => {
                const activeIndex = trace.status === "active" ? -1 : current.findIndex(
                    (item) => item.flowId === trace.flowId && item.stage === trace.stage && item.status === "active",
                );
                if (activeIndex < 0) return [trace, ...current].slice(0, 40);
                const next = [...current];
                next[activeIndex] = trace;
                return next;
            });
        };
        window.addEventListener(DATA_FLOW_EVENT, onTrace);
        return () => window.removeEventListener(DATA_FLOW_EVENT, onTrace);
    }, []);

    return (
        <>
            <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Đóng sơ đồ luồng dữ liệu" : "Mở sơ đồ luồng dữ liệu"} className={`fixed bottom-32 right-4 z-[60] flex items-center gap-2 rounded-full border border-cyan-300/30 bg-slate-950/95 px-3.5 py-2.5 text-xs font-bold text-cyan-100 shadow-xl shadow-cyan-950/40 backdrop-blur transition hover:border-cyan-300/70 hover:bg-slate-900 ${open ? "hidden" : ""}`}>
                <span className="relative flex h-2.5 w-2.5">
                    {latest?.status === "active" && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-70" />}
                    <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${latest?.status === "error" ? "bg-rose-400" : "bg-cyan-300"}`} />
                </span>
                <Network className="h-4 w-4" />
                <span>Sơ đồ luồng</span>
                {events.length > 0 && <span className="rounded-full bg-cyan-400/15 px-1.5 py-0.5 text-[10px] text-cyan-200">{events.length}</span>}
            </button>

            {open && (
                <section role="dialog" aria-label="Sơ đồ luồng dữ liệu" className="data-flow-panel fixed bottom-32 right-3 z-[60] flex max-h-[78vh] w-[min(94vw,460px)] flex-col overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#070b18]/[.97] text-slate-200 shadow-2xl shadow-black/60 backdrop-blur-xl sm:right-4">
                    <header className="flex items-center justify-between border-b border-slate-800/90 bg-slate-950/80 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 p-2 text-cyan-300"><Activity className="h-4 w-4" /></div>
                            <div><h2 className="text-sm font-black text-white">Sơ đồ luồng dữ liệu</h2><p className="text-[10px] tracking-wide text-slate-400">THEO DÕI CỤC BỘ • KHÔNG GỬI LOG ĐI</p></div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setEvents([])} title="Xóa nhật ký" aria-label="Xóa nhật ký" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>
                            <button type="button" onClick={() => setOpen(false)} title="Đóng" aria-label="Đóng" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"><X className="h-4 w-4" /></button>
                        </div>
                    </header>

                    <div className="space-y-3 overflow-y-auto p-3.5">
                        <DataFlowCircuit latest={latest} />
                        <div className="flex items-center justify-between px-0.5">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Nhật ký hoạt động</h3>
                            <span className="text-[10px] text-slate-500">{events.length} sự kiện gần nhất</span>
                        </div>
                        {events.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 px-4 py-6 text-center">
                                <Network className="mx-auto mb-2 h-6 w-6 text-slate-600" />
                                <p className="text-xs font-semibold text-slate-300">Chưa có luồng nào chạy</p>
                                <p className="mt-1 text-[10px] text-slate-500">Lập lá số hoặc gọi một tính năng AI để xem dữ liệu đi qua các bước.</p>
                            </div>
                        ) : <ol className="space-y-2">{events.map((event) => <DataFlowEventItem key={`${event.flowId}-${event.timestamp}-${event.stage}-${event.title}`} event={event} />)}</ol>}
                    </div>
                    <footer className="border-t border-slate-800 bg-slate-950/70 px-4 py-2 text-[9px] leading-relaxed text-slate-500">Payload chỉ được giữ cục bộ trong phiên này; xóa nhật ký sẽ bỏ các bản xem trước.</footer>
                </section>
            )}
        </>
    );
}
