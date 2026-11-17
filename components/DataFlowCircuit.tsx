import React from "react";
import { ArrowRight, BrainCircuit, Cloud, Database, Layers3, Monitor, Package, Server, Sparkles } from "lucide-react";
import { DataFlowStage, DataFlowTraceEvent } from "@/lib/data-flow-trace";

const FLOW_NODES: { stage: DataFlowStage; label: string; icon: typeof Monitor }[] = [
    { stage: "browser", label: "Web", icon: Monitor },
    { stage: "calculation", label: "Lá số", icon: Sparkles },
    { stage: "packaging", label: "Đóng gói", icon: Package },
    { stage: "api", label: "API", icon: Server },
    { stage: "ai", label: "AI / stream", icon: BrainCircuit },
    { stage: "memory", label: "Bộ nhớ", icon: Database },
    { stage: "cloud", label: "Cloud", icon: Cloud },
];

const STAGE_ORDER: Record<DataFlowStage, number> = {
    browser: 0, calculation: 1, packaging: 2, api: 3, ai: 4, memory: 5, cloud: 6,
};

export default function DataFlowCircuit({ latest }: { latest?: DataFlowTraceEvent }) {
    const activeIndex = latest ? STAGE_ORDER[latest.stage] : -1;

    return (
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Đường đi của dữ liệu</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-300"><Layers3 className="h-3 w-3" /> Live trace</span>
            </div>
            <div className="flex items-center justify-between gap-0.5">
                {FLOW_NODES.map((node, index) => {
                    const Icon = node.icon;
                    const isCurrent = activeIndex === index;
                    const isVisited = activeIndex > index;
                    const isError = isCurrent && latest?.status === "error";
                    return (
                        <React.Fragment key={node.stage}>
                            <div className={`data-flow-node flex w-[48px] shrink-0 flex-col items-center gap-1 rounded-lg border px-1 py-2 transition ${isError ? "border-rose-400/70 bg-rose-500/10 text-rose-300" : isCurrent ? "border-cyan-300/70 bg-cyan-400/10 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,.12)]" : isVisited ? "border-emerald-400/35 bg-emerald-400/5 text-emerald-300" : "border-slate-800 bg-slate-900/70 text-slate-500"} ${isCurrent && latest?.status === "active" ? "data-flow-node-active" : ""}`}>
                                <Icon className="h-4 w-4" />
                                <span className="whitespace-nowrap text-[8px] font-bold">{node.label}</span>
                            </div>
                            {index < FLOW_NODES.length - 1 && (
                                <div className={`data-flow-wire relative h-px min-w-1 flex-1 ${isVisited || isCurrent ? "data-flow-wire-on" : ""}`}>
                                    <ArrowRight className="absolute -right-1.5 -top-[7px] h-3.5 w-3.5" />
                                    {isCurrent && latest?.status === "active" && <span className="data-flow-packet" />}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Web → tính toán → đóng gói request → API / AI stream → bộ nhớ cục bộ → Cloud khi đăng nhập.</p>
        </div>
    );
}
