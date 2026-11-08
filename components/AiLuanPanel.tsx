// components/AiLuanPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Bot, BrainCircuit, Loader2, Send, Trash2 } from "lucide-react";
import { HoroscopeResult } from "@/lib/types";
import { compressLaSoToText, estimateTokens } from "@/lib/ai/compress-laso";
import { buildChartKey, clearChartMemory, loadChartMemory, saveChartMemory, ChartMemoryState } from "@/lib/ai/tuvi-memory-store";
import { streamAiEndpoint } from "@/lib/ai/stream-client";
import AiProgressLog from "./AiProgressLog";

const QUICK_PROMPTS = [
    "Luận tổng quan cốt cách Mệnh – Thân & định hướng cuộc đời",
    "Phân tích công danh, sự nghiệp & tài lộc năm nay",
    "Luận đường tình duyên, gia đạo & các mối quan hệ",
    "Điểm sáng và rủi ro cần tránh trong vận hạn năm nay",
];

export default function AiLuanPanel({ result }: { result: HoroscopeResult }) {
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [steps, setSteps] = useState<string[]>([]);
    const [streamingText, setStreamingText] = useState("");
    const [store, setStore] = useState<ChartMemoryState | null>(null);

    useEffect(() => {
        const compact = compressLaSoToText(result.thien_ban, result.cung_12);
        const key = buildChartKey(result.thien_ban);
        setStore(loadChartMemory(key, compact));
    }, [result]);

    const askAi = async (q: string) => {
        const cleanQ = q.trim();
        if (!cleanQ || loading || !store) return;
        setLoading(true);
        setQuestion("");
        setStreamingText("");
        setSteps(["Đang chuẩn bị câu hỏi & ngữ cảnh lá số..."]);

        const nextMessages = [...store.messages, { role: "user" as const, text: cleanQ, ts: Date.now() }];
        const optimistic = { ...store, messages: nextMessages };
        setStore(optimistic);

        try {
            const data = await streamAiEndpoint(
                "/api/ai-luan",
                { compactChart: store.compactChart, memoryNotes: store.memoryNotes, question: cleanQ },
                (s) => setSteps((prev) => [...prev, s]),
                (partial) => setStreamingText(partial)
            );

            if (data?.answer) {
                const updated: ChartMemoryState = {
                    ...optimistic,
                    messages: [...nextMessages, { role: "ai", text: data.answer, ts: Date.now() }],
                    memoryNotes: data.memoryNote ? [...store.memoryNotes, data.memoryNote] : store.memoryNotes,
                };
                setStore(updated);
                saveChartMemory(updated);
            }
        } catch (e: any) {
            alert(e?.message || "Không thể gọi AI");
        } finally {
            setStreamingText("");
            setLoading(false);
        }
    };

    if (!store) return null;
    const tokenCount = estimateTokens(store.compactChart);

    return (
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 space-y-4 text-xs text-slate-200">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-400" />
                    <div>
                        <h4 className="font-bold text-sm text-purple-300">Trợ Lý AI Luận Giải & Ký Ức Lá Số</h4>
                        <p className="text-[11px] text-slate-400">Ngữ cảnh nén: <b className="text-emerald-400">~{tokenCount} tokens</b> (đủ 12 cung) • Đã lưu <b className="text-amber-300">{store.memoryNotes.length} ký ức</b></p>
                    </div>
                </div>
                {store.memoryNotes.length > 0 && (
                    <button type="button" onClick={() => { clearChartMemory(store.chartKey); setStore({ ...store, memoryNotes: [], messages: [] }); }} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-[11px] cursor-pointer">
                        <Trash2 className="w-3 h-3" /> Xóa ký ức
                    </button>
                )}
            </div>

            {store.memoryNotes.length > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200/90 space-y-1">
                    <div className="font-bold text-amber-400 flex items-center gap-1"><BrainCircuit className="w-3.5 h-3.5" /> Bối cảnh AI đang ghi nhớ về đương số:</div>
                    {store.memoryNotes.slice(-3).map((m, i) => <div key={i}>• {m}</div>)}
                </div>
            )}

            <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((p, i) => (
                    <button key={i} type="button" disabled={loading} onClick={() => askAi(p)} className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-200 text-[11px] disabled:opacity-50 cursor-pointer">{p}</button>
                ))}
            </div>

            <AiProgressLog steps={steps} active={loading} />

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {store.messages.map((m, i) => (
                    <div key={i} className={`p-3 rounded-xl whitespace-pre-line leading-relaxed ${m.role === "user" ? "bg-slate-800/90 text-amber-200 ml-8 border border-slate-700" : "bg-slate-950/80 text-slate-200 mr-4 border border-purple-500/20"}`}>
                        <b className="block text-[10px] uppercase mb-1 opacity-70">{m.role === "user" ? "Bạn hỏi" : "AI Luận Giải"}</b>
                        {m.text}
                    </div>
                ))}
                {streamingText && (
                    <div className="p-3 rounded-xl whitespace-pre-line leading-relaxed bg-slate-950/80 text-slate-200 mr-4 border border-purple-400/50">
                        <b className="block text-[10px] uppercase mb-1 text-purple-400">AI đang viết trực tiếp...</b>
                        {streamingText}
                    </div>
                )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); askAi(question); }} className="flex gap-2">
                <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Đặt câu hỏi riêng về lá số này..." className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500" />
                <button type="submit" disabled={loading || !question.trim()} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? "Đang luận..." : "Hỏi AI"}
                </button>
            </form>
        </div>
    );
}