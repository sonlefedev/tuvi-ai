import { Activity, Check, CircleAlert, Cloud } from "lucide-react";
import { DataFlowTraceEvent } from "@/lib/data-flow-trace";

const STATUS_LABEL: Record<DataFlowTraceEvent["status"], string> = {
    active: "ĐANG CHẠY", success: "HOÀN TẤT", error: "LỖI", info: "THÔNG TIN",
};
const STATUS_STYLE: Record<DataFlowTraceEvent["status"], { icon: string; label: string }> = {
    active: { icon: "bg-cyan-400/10 text-cyan-300", label: "text-cyan-300" },
    success: { icon: "bg-emerald-400/10 text-emerald-300", label: "text-emerald-300" },
    error: { icon: "bg-rose-400/10 text-rose-300", label: "text-rose-300" },
    info: { icon: "bg-slate-700/50 text-slate-400", label: "text-slate-400" },
};

function formatTime(timestamp: number): string {
    return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(timestamp);
}

export default function DataFlowEventItem({ event }: { event: DataFlowTraceEvent }) {
    const Icon = event.status === "error" ? CircleAlert : event.status === "success" ? Check : event.stage === "cloud" ? Cloud : Activity;

    return (
        <li className="rounded-xl border border-slate-800/90 bg-slate-900/65 p-3">
            <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 rounded-lg p-1.5 ${STATUS_STYLE[event.status].icon}`}><Icon className="h-3.5 w-3.5" /></div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <p className="text-[11px] font-bold text-slate-100">{event.title}</p>
                        <time className="font-mono text-[9px] text-slate-500">{formatTime(event.timestamp)}</time>
                    </div>
                    <p className="mt-1 break-words text-[10px] leading-relaxed text-slate-400">{event.detail}</p>
                    <div className="mt-2 flex items-center gap-2 text-[9px]">
                        <span className={`font-bold ${STATUS_STYLE[event.status].label}`}>{STATUS_LABEL[event.status]}</span>
                        <span className="font-mono text-slate-600">#{event.flowId.slice(0, 8)}</span>
                    </div>
                    {event.payload && (
                        <details className="mt-2 border-t border-slate-800 pt-2">
                            <summary className="cursor-pointer text-[10px] font-semibold text-cyan-300/90 hover:text-cyan-200">
                                Payload · {event.payload.bytes.toLocaleString("vi-VN")} byte · {event.payload.fields.length} trường
                            </summary>
                            <div className="mt-2 space-y-1.5">
                                {event.payload.fields.length > 0 && <p className="break-all text-[9px] text-slate-500">Keys: {event.payload.fields.join(", ")}</p>}
                                <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/35 p-2 font-mono text-[9px] leading-relaxed text-slate-300">{event.payload.preview}{event.payload.truncated ? "\n… (đã rút gọn)" : ""}</pre>
                            </div>
                        </details>
                    )}
                </div>
            </div>
        </li>
    );
}
