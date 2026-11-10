// components/LifeMapBookPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import { BookMarked, Download, Loader2, Maximize2, Minimize2, RefreshCw, Sparkles } from "lucide-react";
import { HoroscopeResult } from "@/lib/types";
import { compressLaSoToText } from "@/lib/ai/compress-laso";
import { buildChartKey, loadChartMemory, saveChartMemory } from "@/lib/ai/tuvi-memory-store";
import { downloadLifeMapBook } from "@/lib/export-lifemap";
import { LIFE_CHAPTERS, ChapterKey, normalizeLifeMap, countLifeMapChars } from "@/lib/ai/lifemap-chapters";
import { streamAiEndpoint } from "@/lib/ai/stream-client";
import { notifyTabStatus } from "@/lib/tab-notify";
import AiProgressLog from "./AiProgressLog";
import FormattedAiText from "./FormattedAiText";
import { isOperationLockedRemotely, setOperationLock } from "@/lib/ai/cloud-profile-sync";

export default function LifeMapBookPanel({ result }: { result: HoroscopeResult }) {
    const [data, setData] = useState<Record<ChapterKey, string> | null>(null);
    const [active, setActive] = useState<ChapterKey>("ch1");
    const [readAll, setReadAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [remoteBusy, setRemoteBusy] = useState(false);
    const [steps, setSteps] = useState<string[]>([]);
    const compactChart = compressLaSoToText(result.thien_ban, result.cung_12);
    const chartKey = buildChartKey(result.thien_ban);
    const cacheId = `${chartKey}_lifemap_v1`;

    useEffect(() => {
        const sync = () => {
            try { setData(normalizeLifeMap(JSON.parse(localStorage.getItem(cacheId) || "null"))); } catch { setData(null); }
            setRemoteBusy(isOperationLockedRemotely(chartKey, "lifemap", loading));
        };
        sync();
        window.addEventListener("tuvi-memory-updated", sync);
        return () => window.removeEventListener("tuvi-memory-updated", sync);
    }, [cacheId, chartKey, loading]);

    const runChapters = async (waves: number[][]) => {
        if (loading || remoteBusy || !compactChart) return;
        setLoading(true); setSteps([`Khởi tạo Đại Cẩm Nang (${waves.flat().length} chương chuyên sâu ~100.000 ký tự)...`]); notifyTabStatus("📚 AI đang biên soạn Đại Cẩm Nang...");
        await setOperationLock(chartKey, "lifemap", true);
        let book: Record<ChapterKey, string> = { ...(data || { ch1: "", ch2: "", ch3: "", ch4: "", ch5: "", ch6: "", ch7: "", ch8: "" }) };
        try {
            for (const wave of waves) {
                const resList = await Promise.all(wave.map((ch) => streamAiEndpoint("/api/ai-lifemap", { compactChart, chapter: ch }, (s) => setSteps((p) => [...p.slice(-6), s]), (c) => setSteps((p) => [...p.slice(0, -1), c]))));
                for (const r of resList) {
                    if (r?.key && r?.content) book = { ...book, [r.key]: r.content };
                    if (r?.memoryNote) { const mem = loadChartMemory(chartKey, compactChart); saveChartMemory({ ...mem, memoryNotes: [...mem.memoryNotes, r.memoryNote] }); }
                }
                setData(book); localStorage.setItem(cacheId, JSON.stringify(book)); window.dispatchEvent(new Event("tuvi-memory-updated"));
            }
            const mem = loadChartMemory(chartKey, compactChart); saveChartMemory(mem);
            notifyTabStatus("🔔 (1) Hoàn thành Đại Cẩm Nang ~100.000 ký tự!");
        } catch (e: any) { alert(e?.message || "Lỗi biên soạn Đại Cẩm Nang"); }
        finally { await setOperationLock(chartKey, "lifemap", false); setLoading(false); }
    };

    const totalChars = countLifeMapChars(data);
    const doneCount = data ? LIFE_CHAPTERS.filter((c) => data[c.key]?.trim().length > 200).length : 0;
    const cur = LIFE_CHAPTERS.find((c) => c.key === active) || LIFE_CHAPTERS[0];
    const disabled = loading || remoteBusy;

    return (
        <section className="bg-gradient-to-br from-slate-900 via-amber-950/15 to-slate-900 border border-amber-500/35 rounded-2xl p-5 space-y-4 text-xs text-slate-200 shadow-2xl">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5"><BookMarked className="w-5 h-5 text-amber-400 shrink-0" /><div><h3 className="font-black text-base text-amber-300 uppercase tracking-wide">Đại Cẩm Nang Cuộc Đời: {result.thien_ban.ho_ten} ({result.thien_ban.nam_sinh})</h3><p className="text-[11px] text-slate-400">8 Chương Chuyên Sâu (~100.000 ký tự): Bản mệnh Ưu/Nhược • Sự nghiệp • Nhân duyên • Sức khỏe • Ứng xử • Điều tránh • 8 Đại vận & Kim chỉ nam</p></div></div>
                <div className="flex flex-wrap gap-2">
                    {data && <button type="button" onClick={() => downloadLifeMapBook(result.thien_ban, data)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold text-xs cursor-pointer"><Download className="w-3.5 h-3.5" /> Tải Sách (.HTML / PDF)</button>}
                    <button type="button" onClick={() => runChapters([[1, 2], [3, 4], [5, 6], [7, 8]])} disabled={disabled} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg disabled:opacity-45 disabled:pointer-events-none cursor-pointer">
                        {disabled ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : data ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {loading ? `Đang viết (${doneCount}/8 chương • ${totalChars.toLocaleString("vi-VN")} chữ)...` : remoteBusy ? "Thiết bị khác đang lập..." : data ? "Viết lại trọn bộ 8 Chương (~100k chữ)" : "Lập Đại Cẩm Nang (8 Chương ~100k chữ)"}
                    </button>
                </div>
            </div>
            <AiProgressLog steps={steps} active={loading} />
            {data ? (
                <div className="space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="text-[11px] px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">Độ dài sách: {totalChars.toLocaleString("vi-VN")} ký tự ({doneCount}/8 chương) • Đã lưu Cloud</span>
                        <button type="button" onClick={() => setReadAll(!readAll)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer">{readAll ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />} {readAll ? "Xem gọn từng chương" : "Mở đọc trọn cuốn sách"}</button>
                    </div>
                    {!readAll ? (
                        <><div className="flex flex-wrap gap-1.5">{LIFE_CHAPTERS.map((c) => <button key={c.key} type="button" onClick={() => setActive(c.key)} className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition cursor-pointer ${active === c.key ? "bg-amber-500/25 text-amber-200 border border-amber-400/60" : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800"}`}>{c.tab} {data[c.key]?.length ? `(${(data[c.key].length / 1000).toFixed(1)}k)` : ""}</button>)}</div>
                        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5"><div className="flex flex-wrap justify-between items-center gap-2"><h4 className="font-bold text-sm text-amber-300">{cur.title} ({(data[cur.key]?.length || 0).toLocaleString("vi-VN")} ký tự)</h4><button type="button" disabled={disabled} onClick={() => runChapters([[cur.num]])} className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold disabled:opacity-40 cursor-pointer">Viết lại riêng chương này</button></div><FormattedAiText text={data[cur.key] || "Chưa có nội dung chương này — bấm 'Viết lại riêng chương này' để bổ sung."} /></div></>
                    ) : (
                        <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">{LIFE_CHAPTERS.map((c) => <div key={c.key} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5"><h4 className="font-bold text-sm text-amber-300">{c.title}</h4><FormattedAiText text={data[c.key] || ""} /></div>)}</div>
                    )}
                </div>
            ) : <div className="p-5 text-center rounded-xl bg-slate-950/60 border border-dashed border-amber-500/30 text-slate-300">Bấm nút <b className="text-amber-300">“Lập Đại Cẩm Nang (8 Chương ~100k chữ)”</b> ở góc trên để AI biên soạn cuốn sách chuyên sâu dài ~100.000 ký tự (8 chương, lưu tiến độ từng đợt lên Cloud & xuất file sách HTML/PDF).</div>}
        </section>
    );
}
