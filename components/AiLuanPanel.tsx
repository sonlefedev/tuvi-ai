"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, BrainCircuit, Loader2, MessageSquareText, Send, Trash2, X } from "lucide-react";
import { CungItem, HoroscopeResult } from "@/lib/types";
import { estimateTokens } from "@/lib/ai/compress-laso";
import { getCurrentUser } from "@/lib/auth-store";
import { buildChartKey, buildChatContext, clearChartMemory, getChartJournalCount, loadChartMemory, saveChartMemory, ChartMemoryState } from "@/lib/ai/tuvi-memory-store";
import { streamAiEndpoint } from "@/lib/ai/stream-client";
import { notifyTabStatus } from "@/lib/tab-notify";
import AiProgressLog from "./AiProgressLog";
import FormattedAiText from "./FormattedAiText";

const QUICK_PROMPTS = ["Luận cung đang chọn", "Tổng quan Mệnh – Thân", "Sự nghiệp & Tài lộc", "Vận hạn năm nay"];

export default function AiLuanPanel({ result, compactChart, selectedCung, externalPrompt, onConsumedPrompt }: { result: HoroscopeResult; compactChart: string; selectedCung?: CungItem | null; externalPrompt?: string; onConsumedPrompt?: () => void }) {
    const analysisChartContext = useMemo(() => JSON.stringify({ thien_ban: result.thien_ban, cung_12: result.cung_12 }, null, 2), [result]);
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [steps, setSteps] = useState<string[]>([]);
    const [streamingText, setStreamingText] = useState("");
    const [store, setStore] = useState<ChartMemoryState | null>(null);
    const [notice, setNotice] = useState("");
    const [fontPx, setFontPx] = useState(13);
    const [contextOptions, setContextOptions] = useState({ history: true, memory: true, cung: true, journal: false });
    const messagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const key = buildChartKey(result.thien_ban);
        const sync = () => { if (!loading) setStore(loadChartMemory(key, compactChart)); };
        sync();
        window.addEventListener("tuvi-memory-updated", sync);
        return () => window.removeEventListener("tuvi-memory-updated", sync);
    }, [result, compactChart, loading]);

    useEffect(() => {
        if (!open) return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [open]);

    useEffect(() => {
        if (open && messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, [open, store?.messages.length, streamingText]);

    const askAi = useCallback(async (q: string) => {
        const cleanQ = q.trim();
        if (!cleanQ || loading || !store) return;
        const latest = loadChartMemory(store.chartKey, store.compactChart);
        const activeContext = buildChatContext(latest, selectedCung, cleanQ, {
            includeCungContext: contextOptions.cung,
            includeJournal: contextOptions.journal,
        });
        const recentHistory = contextOptions.history ? latest.messages.slice(-6) : [];
        const memoryNotes = contextOptions.memory ? latest.memoryNotes : [];
        setLoading(true);
        setNotice("");
        setQuestion("");
        setStreamingText("");
        setSteps([`Nạp lá số, ${recentHistory.length} tin nhắn & ${memoryNotes.length} ký ức...`]);
        notifyTabStatus("⏳ Trợ lý AI đang trả lời...");
        const nextMessages = [...latest.messages, { role: "user" as const, text: cleanQ, ts: Date.now() }];
        setStore({ ...latest, messages: nextMessages });
        try {
            const data = await streamAiEndpoint("/api/ai-luan", { chartContext: analysisChartContext, memoryNotes, history: recentHistory, activeContext, question: cleanQ }, (s) => setSteps((p) => [...p, s]), setStreamingText);
            if (data?.answer) {
                const updated: ChartMemoryState = { ...latest, messages: [...nextMessages, { role: "ai", text: data.answer, ts: Date.now() }], memoryNotes: data.memoryNote ? [...latest.memoryNotes, data.memoryNote] : latest.memoryNotes };
                setStore(updated);
                if (!saveChartMemory(updated)) setNotice("Câu trả lời đã hiển thị nhưng chưa lưu được trên thiết bị.");
                notifyTabStatus("🔔 (1) AI đã trả lời xong!");
            }
        } catch (error) {
            notifyTabStatus("⚠️ Lỗi kết nối AI", 3000);
            alert(error instanceof Error ? error.message : "Không thể gọi AI");
        } finally {
            setStreamingText("");
            setLoading(false);
        }
    }, [analysisChartContext, contextOptions, loading, selectedCung, store]);

    const clearData = async (target: "messages" | "memoryNotes") => {
        if (!store || loading || clearing) return;
        const hasData = target === "messages" ? store.messages.length > 0 : store.memoryNotes.length > 0;
        if (!hasData) return;
        const label = target === "messages" ? "hội thoại" : "ký ức AI";
        if (!window.confirm(`Xóa ${label} của lá số này? Thao tác này không thể hoàn tác.`)) return;
        setClearing(true);
        setNotice("");
        setStore({ ...store, [target]: [] });
        try {
            const result = await clearChartMemory(store.chartKey, target);
            setStore(loadChartMemory(store.chartKey, compactChart));
            setNotice(result === "synced" ? `Đã xóa ${label} và đồng bộ Cloud.` : result === "local-only" ? `Đã xóa ${label} trên thiết bị. Đăng nhập để đồng bộ đa thiết bị.` : `Đã xóa ${label} trên thiết bị; Cloud chưa xác nhận đồng bộ.`);
        } catch (error) {
            setStore(loadChartMemory(store.chartKey, compactChart));
            setNotice(error instanceof Error ? error.message : `Không xóa được ${label}.`);
        } finally {
            setClearing(false);
        }
    };

    const consumedPromptRef = useRef("");
    useEffect(() => {
        if (!externalPrompt) {
            consumedPromptRef.current = "";
            return;
        }
        if (!store || loading || consumedPromptRef.current === externalPrompt) return;
        consumedPromptRef.current = externalPrompt;
        const timer = window.setTimeout(() => {
            onConsumedPrompt?.();
            setOpen(true);
            void askAi(externalPrompt);
        }, 0);
        return () => window.clearTimeout(timer);
    }, [askAi, externalPrompt, loading, onConsumedPrompt, store]);

    if (!store) return null;
    const activeLabel = selectedCung ? `${selectedCung.ten_cung.replace("<THÂN>", "").trim()} • chi ${selectedCung.chi}` : "";
    const journalCount = getChartJournalCount(store.chartKey);
    const cloudAccount = Boolean(getCurrentUser());
    const latestAiIndex = store.messages.reduce((latest, message, index) => message.role === "ai" ? index : latest, -1);

    return (
        <>
            {!open && (
                <button type="button" onClick={() => setOpen(true)} className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 flex items-center gap-2 rounded-full border border-purple-300/30 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xl hover:from-purple-500 hover:to-pink-500">
                    <MessageSquareText className="h-4 w-4" />
                    <span>Hỏi Trợ Lý AI</span>
                    {store.memoryNotes.length > 0 && <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-slate-950">{store.memoryNotes.length}</span>}
                </button>
            )}

            {open && (
                <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/60 p-1.5 backdrop-blur-[2px] sm:p-4" onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="ai-chat-title" className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-purple-500/45 bg-slate-900 text-slate-200 shadow-2xl sm:my-auto sm:h-[min(88vh,780px)] sm:max-w-[560px] sm:rounded-2xl">
                        <header className="flex items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/95 px-3 py-2.5">
                            <div className="flex min-w-0 items-center gap-2">
                                <Bot className="h-4 w-4 shrink-0 text-purple-400" />
                                <div className="min-w-0">
                                    <h2 id="ai-chat-title" className="truncate text-xs font-bold text-purple-300">Trợ Lý AI Tử Vi</h2>
                                    <div className="truncate text-[10px] text-slate-400">~{estimateTokens(analysisChartContext).toLocaleString("vi-VN")} tok ước tính cho lá số{activeLabel ? ` • ${activeLabel}` : ""}</div>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                                <button type="button" aria-label="Giảm cỡ chữ" onClick={() => setFontPx((font) => Math.max(11, font - 1))} className="rounded bg-slate-800 px-1.5 py-1 text-[10px] font-bold hover:bg-slate-700">A-</button>
                                <button type="button" aria-label="Tăng cỡ chữ" onClick={() => setFontPx((font) => Math.min(18, font + 1))} className="rounded bg-slate-800 px-1.5 py-1 text-[11px] font-bold hover:bg-slate-700">A+</button>
                                {store.messages.length > 0 && <button type="button" aria-label="Xóa hội thoại" title="Xóa hội thoại" disabled={loading || clearing} onClick={() => clearData("messages")} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/60 hover:text-rose-300 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /></button>}
                                {store.memoryNotes.length > 0 && <button type="button" aria-label="Xóa ký ức AI" title="Xóa ký ức AI" disabled={loading || clearing} onClick={() => clearData("memoryNotes")} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/60 hover:text-rose-300 disabled:opacity-40"><BrainCircuit className="h-3.5 w-3.5" /></button>}
                                <button type="button" aria-label="Đóng Chat AI" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-4 w-4" /></button>
                            </div>
                        </header>

                        <div ref={messagesRef} style={{ fontSize: fontPx }} className="flex-1 space-y-2.5 overflow-y-auto p-3.5 leading-relaxed">
                            <details className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-[11px]">
                                <summary className="cursor-pointer font-semibold text-cyan-200">Ngữ cảnh gửi AI · Lá số luôn được gửi</summary>
                                <div className="mt-2 space-y-2 text-slate-300">
                                    <p className="text-[10px] text-slate-400">Bạn có thể chọn thêm dữ liệu. Nhật ký cá nhân mặc định không gửi. Các lựa chọn áp dụng cho câu hỏi tiếp theo.</p>
                                    <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={contextOptions.cung} disabled={loading} onChange={(event) => setContextOptions((options) => ({ ...options, cung: event.target.checked }))} /> Cung đang chọn và phần luận đã lưu</label>
                                    <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={contextOptions.history} disabled={loading} onChange={(event) => setContextOptions((options) => ({ ...options, history: event.target.checked }))} /> 6 tin nhắn gần nhất ({Math.min(store.messages.length, 6)})</label>
                                    <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={contextOptions.memory} disabled={loading} onChange={(event) => setContextOptions((options) => ({ ...options, memory: event.target.checked }))} /> Ký ức AI ({Math.min(store.memoryNotes.length, 6)})</label>
                                    <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={contextOptions.journal} disabled={loading || journalCount === 0} onChange={(event) => setContextOptions((options) => ({ ...options, journal: event.target.checked }))} /> Nhật ký cá nhân ({Math.min(journalCount, 4)})</label>
                                    <details className="rounded-lg bg-slate-900 px-2 py-1.5">
                                        <summary className="cursor-pointer text-cyan-200">Xem dữ liệu lá số được gửi</summary>
                                        <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words text-[9px] text-slate-400">{analysisChartContext}</pre>
                                    </details>
                                    <p className="text-[10px] text-slate-500">Chat và ký ức được lưu trong trình duyệt{cloudAccount ? " và đồng bộ Cloud khi khả dụng" : " ở Chế độ Khách"}. Dữ liệu đã chọn được gửi tới máy chủ ứng dụng và dịch vụ AI để tạo câu trả lời.</p>
                                </div>
                            </details>

                            {notice && <div role="status" aria-live="polite" className="rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-3 py-2 text-[11px] text-cyan-200">{notice}</div>}
                            {store.memoryNotes.length > 0 && <div className="space-y-0.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2 text-[11px] text-amber-200/90"><div className="flex items-center gap-1 font-bold text-amber-400"><BrainCircuit className="h-3 w-3" /> Ký ức AI đang giữ:</div>{store.memoryNotes.slice(-3).map((memory, index) => <div key={index} className="truncate">• {memory}</div>)}</div>}
                            <div className="flex flex-wrap gap-1">{QUICK_PROMPTS.map((prompt) => <button key={prompt} type="button" disabled={loading || clearing} onClick={() => askAi(prompt)} className="cursor-pointer rounded-lg border border-purple-500/30 bg-purple-500/15 px-2 py-1 text-[11px] text-purple-200 hover:bg-purple-500/25 disabled:opacity-50">{prompt}</button>)}</div>
                            <AiProgressLog steps={steps} active={loading} />
                            {store.messages.map((message, index) => {
                                const bubbleClass = `rounded-xl border p-3 whitespace-pre-line ${message.role === "user" ? "ml-6 border-slate-700 bg-slate-800 text-amber-200" : "mr-2 border-purple-500/25 bg-slate-950 text-slate-200"}`;
                                if (message.role === "ai" && index !== latestAiIndex) {
                                    return <details key={`${message.ts}-${index}`} className={bubbleClass}><summary className="cursor-pointer text-[11px] font-semibold text-purple-300">Câu trả lời AI trước · bấm để mở</summary><div className="mt-2"><FormattedAiText text={message.text} /></div></details>;
                                }
                                return <div key={`${message.ts}-${index}`} className={bubbleClass}><b className="mb-1 block text-[10px] uppercase opacity-60">{message.role === "user" ? "Bạn" : "Đại sư AI"}</b><FormattedAiText text={message.text} /></div>;
                            })}
                            {streamingText && <div className="mr-2 whitespace-pre-line rounded-xl border border-purple-400/50 bg-slate-950 p-3 text-slate-200"><b className="mb-1 block text-[10px] uppercase text-purple-400">Đang trả lời...</b><FormattedAiText text={streamingText} /></div>}
                        </div>

                        <form onSubmit={(event) => { event.preventDefault(); askAi(question); }} className="flex gap-1.5 border-t border-slate-800 bg-slate-950/90 p-2.5 text-xs">
                            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={activeLabel ? `Hỏi về cung ${activeLabel} hoặc lá số...` : "Hỏi bất kỳ điều gì về lá số..."} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500" />
                            <button type="submit" disabled={loading || clearing || !question.trim()} className="flex cursor-pointer items-center gap-1 rounded-xl bg-purple-600 px-3.5 py-2 font-bold text-white hover:bg-purple-500 disabled:opacity-50">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}<span className="sr-only">Gửi câu hỏi</span></button>
                        </form>
                    </section>
                </div>
            )}
        </>
    );
}
