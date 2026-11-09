// components/AiLuanPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Bot, BrainCircuit, GripHorizontal, Loader2, Maximize2, MessageSquareText, Minimize2, Send, Trash2, X } from "lucide-react";
import { CungItem, HoroscopeResult } from "@/lib/types";
import { compressLaSoToText, estimateTokens } from "@/lib/ai/compress-laso";
import { buildChartKey, buildChatContext, clearChartMemory, loadChartMemory, saveChartMemory, ChartMemoryState } from "@/lib/ai/tuvi-memory-store";
import { streamAiEndpoint } from "@/lib/ai/stream-client";
import { notifyTabStatus } from "@/lib/tab-notify";
import { useFloatingBox } from "@/lib/use-floating-box";
import AiProgressLog from "./AiProgressLog";

const QUICK_PROMPTS = ["Luận cung đang chọn", "Tổng quan Mệnh – Thân", "Sự nghiệp & Tài lộc", "Vận hạn năm nay"];
const renderBold = (t: string) => t.split(/(\*\*.*?\*\*)/g).map((p, i) => p.startsWith("**") && p.endsWith("**") ? <b key={i} className="text-amber-300 font-bold">{p.slice(2, -2)}</b> : <span key={i}>{p}</span>);

export default function AiLuanPanel({ result, selectedCung, externalPrompt, onConsumedPrompt }: { result: HoroscopeResult; selectedCung?: CungItem | null; externalPrompt?: string; onConsumedPrompt?: () => void }) {
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [steps, setSteps] = useState<string[]>([]);
    const [streamingText, setStreamingText] = useState("");
    const [store, setStore] = useState<ChartMemoryState | null>(null);
    const box = useFloatingBox();

    useEffect(() => {
        const compact = compressLaSoToText(result.thien_ban, result.cung_12);
        const key = buildChartKey(result.thien_ban);
        const sync = () => { if (!loading) setStore(loadChartMemory(key, compact)); };
        sync();
        window.addEventListener("tuvi-memory-updated", sync);
        return () => window.removeEventListener("tuvi-memory-updated", sync);
    }, [result, loading]);

    const askAi = async (q: string) => {
        const cleanQ = q.trim();
        if (!cleanQ || loading || !store) return;
        const latest = loadChartMemory(store.chartKey, store.compactChart);
        const activeContext = buildChatContext(latest, selectedCung, cleanQ);
        const recentHistory = latest.messages.slice(-6);
        setLoading(true); setQuestion(""); setStreamingText("");
        setSteps([`Nạp lá số, ${recentHistory.length} lượt thoại & ${latest.memoryNotes.length} ký ức...`]);
        notifyTabStatus("⏳ Trợ lý AI đang trả lời...");
        const nextMessages = [...latest.messages, { role: "user" as const, text: cleanQ, ts: Date.now() }];
        setStore({ ...latest, messages: nextMessages });
        try {
            const data = await streamAiEndpoint("/api/ai-luan", { compactChart: latest.compactChart, memoryNotes: latest.memoryNotes, history: recentHistory, activeContext, question: cleanQ }, (s) => setSteps((p) => [...p, s]), setStreamingText);
            if (data?.answer) {
                const updated: ChartMemoryState = { ...latest, messages: [...nextMessages, { role: "ai", text: data.answer, ts: Date.now() }], memoryNotes: data.memoryNote ? [...latest.memoryNotes, data.memoryNote] : latest.memoryNotes };
                setStore(updated); saveChartMemory(updated); notifyTabStatus("🔔 (1) AI đã trả lời xong!");
            }
        } catch (e: any) { notifyTabStatus("⚠️ Lỗi kết nối AI", 3000); alert(e?.message || "Không thể gọi AI"); }
        finally { setStreamingText(""); setLoading(false); }
    };

    useEffect(() => { if (externalPrompt && store && !loading) { setOpen(true); askAi(externalPrompt); onConsumedPrompt?.(); } }, [externalPrompt, store]);
    if (!store) return null;
    const activeLabel = selectedCung ? `${selectedCung.ten_cung.replace("<THÂN>", "").trim()} • chi ${selectedCung.chi}` : "";

    return (
        <>
            <button type="button" onClick={() => setOpen(!open)} className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-2xl border border-purple-300/30 cursor-pointer">
                {open ? <X className="w-4 h-4" /> : <MessageSquareText className="w-4 h-4" />}
                <span>{open ? "Đóng Chat AI" : "Hỏi Trợ Lý AI"}</span>
                {!open && store.memoryNotes.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">{store.memoryNotes.length}</span>}
            </button>

            {open && (
                <div onPointerMove={box.onPointerMove} onPointerUp={box.endAction} style={{ transform: `translate(${box.rect.x}px, ${box.rect.y}px)`, width: `min(94vw, ${box.rect.w}px)`, height: `min(82vh, ${box.rect.h}px)` }} className="fixed bottom-16 left-3 sm:bottom-20 sm:left-6 z-50 bg-slate-900/95 border border-purple-500/45 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden text-slate-200">
                    <div onPointerDown={(e) => box.startAction(e, "l")} className="absolute left-0 top-2 bottom-2 w-1.5 cursor-ew-resize z-20" />
                    <div onPointerDown={(e) => box.startAction(e, "r")} className="absolute right-0 top-2 bottom-2 w-1.5 cursor-ew-resize z-20" />
                    <div onPointerDown={(e) => box.startAction(e, "b")} className="absolute bottom-0 left-2 right-2 h-1.5 cursor-ns-resize z-20" />
                    <div onPointerDown={(e) => box.startAction(e, "br")} title="Kéo để thay đổi kích thước" className="absolute right-0 bottom-0 w-3.5 h-3.5 cursor-nwse-resize z-30" />
                    <div onPointerDown={(e) => box.startAction(e, "drag")} className="px-3.5 py-2.5 bg-slate-950/95 border-b border-slate-800 flex justify-between items-center cursor-move select-none touch-none">
                        <div className="flex items-center gap-2"><GripHorizontal className="w-4 h-4 text-slate-500 shrink-0" /><Bot className="w-4 h-4 text-purple-400 shrink-0" /><div><div className="font-bold text-xs text-purple-300">Trợ Lý AI Tử Vi & Ký Ức</div><div className="text-[10px] text-slate-400">~{estimateTokens(store.compactChart)} tok • {store.memoryNotes.length} ký ức{activeLabel ? ` • Cung ${activeLabel}` : ""}</div></div></div>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => box.stepFont(-1)} className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold cursor-pointer">A-</button>
                            <button type="button" onClick={() => box.stepFont(1)} className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold cursor-pointer">A+</button>
                            <button type="button" onClick={box.toggleExpand} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer">{box.expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}</button>
                            {store.memoryNotes.length > 0 && <button type="button" title="Xóa lịch sử chat & ký ức AI" onClick={async () => { setStore({ ...store, memoryNotes: [], messages: [] }); await clearChartMemory(store.chartKey); }} className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
                            <button type="button" onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div style={{ fontSize: box.fontPx }} className="p-3.5 space-y-2.5 flex-1 overflow-y-auto leading-relaxed">
                        {store.memoryNotes.length > 0 && <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200/90 space-y-0.5"><div className="font-bold text-amber-400 flex items-center gap-1"><BrainCircuit className="w-3 h-3" /> Ký ức AI đang giữ:</div>{store.memoryNotes.slice(-3).map((m, i) => <div key={i} className="truncate">• {m}</div>)}</div>}
                        <div className="flex flex-wrap gap-1">{QUICK_PROMPTS.map((p, i) => <button key={i} type="button" disabled={loading} onClick={() => askAi(p)} className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-[11px] disabled:opacity-50 cursor-pointer">{p}</button>)}</div>
                        <AiProgressLog steps={steps} active={loading} />
                        {store.messages.map((m, i) => <div key={i} className={`p-3 rounded-xl whitespace-pre-line ${m.role === "user" ? "bg-slate-800 text-amber-200 ml-6 border border-slate-700" : "bg-slate-950 text-slate-200 mr-2 border border-purple-500/25"}`}><b className="block text-[10px] uppercase mb-1 opacity-60">{m.role === "user" ? "Bạn" : "Đại sư AI"}</b>{renderBold(m.text)}</div>)}
                        {streamingText && <div className="p-3 rounded-xl whitespace-pre-line bg-slate-950 text-slate-200 mr-2 border border-purple-400/50"><b className="block text-[10px] uppercase mb-1 text-purple-400">Đang trả lời...</b>{renderBold(streamingText)}</div>}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); askAi(question); }} className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex gap-1.5 text-xs">
                        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={activeLabel ? `Hỏi về cung ${activeLabel} hoặc lá số...` : "Hỏi bất kỳ điều gì về lá số..."} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 placeholder:text-slate-500" />
                        <button type="submit" disabled={loading || !question.trim()} className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1 disabled:opacity-50 cursor-pointer">{loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}</button>
                    </form>
                </div>
            )}
        </>
    );
}
