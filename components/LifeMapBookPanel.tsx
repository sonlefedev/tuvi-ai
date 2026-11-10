// components/LifeMapBookPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import { AlertTriangle, BookMarked, Download, Loader2, Maximize2, Minimize2, RefreshCw, Sparkles } from "lucide-react";
import { HoroscopeResult } from "@/lib/types";
import { compressLaSoToText } from "@/lib/ai/compress-laso";
import { buildChartKey, loadChartMemory, saveChartMemory } from "@/lib/ai/tuvi-memory-store";
import { downloadLifeMapBook } from "@/lib/export-lifemap";
import { LIFE_CHAPTERS, ChapterKey, normalizeLifeMap, countLifeMapChars, isLegacyOnlyCache } from "@/lib/ai/lifemap-chapters";
import { streamAiEndpoint } from "@/lib/ai/stream-client";
import { notifyTabStatus } from "@/lib/tab-notify";
import AiProgressLog from "./AiProgressLog";
import BookChapterView from "./BookChapterView";
import { isOperationLockedRemotely, setOperationLock } from "@/lib/ai/cloud-profile-sync";

export default function LifeMapBookPanel({ result }: { result: HoroscopeResult }) {
    const [data, setData] = useState<Record<ChapterKey, string> | null>(null);
    const [legacyCache, setLegacyCache] = useState(false);
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
            try { const raw = JSON.parse(localStorage.getItem(cacheId) || "null"); setLegacyCache(isLegacyOnlyCache(raw)); setData(normalizeLifeMap(raw)); } catch { setData(null); }
            setRemoteBusy(isOperationLockedRemotely(chartKey, "lifemap", loading));
        };
        sync();
        window.addEventListener("tuvi-memory-updated", sync);
        return () => window.removeEventListener("tuvi-memory-updated", sync);
    }, [cacheId, chartKey, loading]);

    const runChapters = async (targetNums: number[], resetFirst = false) => {
        if (loading || remoteBusy || !compactChart) return;
        setLoading(true); setSteps([`Khởi tạo Đại Cẩm Nang Minh Họa (${targetNums.length} chương chuyên sâu)...`]); notifyTabStatus("📚 AI đang biên soạn Đại Cẩm Nang...");
        await setOperationLock(chartKey, "lifemap", true);
        let book: Record<ChapterKey, string> = resetFirst || !data ? { ch1: "", ch2: "", ch3: "", ch4: "", ch5: "", ch6: "", ch7: "", ch8: "" } : { ...data };
        const writeOne = async (ch: number) => {
            const r = await streamAiEndpoint("/api/ai-lifemap", { compactChart, chapter: ch }, (s) => setSteps((p) => [...p.slice(-5), s]), (c) => setSteps((p) => [...p.slice(0, -1), c]));
            if (r?.key && r?.content) { book = { ...book, [r.key]: r.content }; setData(book); setLegacyCache(false); localStorage.setItem(cacheId, JSON.stringify(book)); window.dispatchEvent(new Event("tuvi-memory-updated")); }
            if (r?.memoryNote) { const mem = loadChartMemory(chartKey, compactChart); saveChartMemory({ ...mem, memoryNotes: [...mem.memoryNotes, r.memoryNote] }); }
        };
        try {
            for (const ch of targetNums) { try { await writeOne(ch); } catch { setSteps((p) => [...p.slice(-5), `Thử lại Chương ${ch}/8...`]); } await new Promise((r) => setTimeout(r, 450)); }
            const stillShort = targetNums.filter((ch) => (book[LIFE_CHAPTERS[ch - 1].key]?.trim().length || 0) < 1200);
            for (const ch of stillShort) { try { await writeOne(ch); } catch { } }
            saveChartMemory(loadChartMemory(chartKey, compactChart));
            notifyTabStatus("🔔 (1) Hoàn thành Đại Cẩm Nang Minh Họa!");
        } catch (e: any) { alert(e?.message || "Lỗi biên soạn Đại Cẩm Nang"); }
        finally { await setOperationLock(chartKey, "lifemap", false); setLoading(false); }
    };

    const totalChars = countLifeMapChars(data);
    const missingNums = LIFE_CHAPTERS.filter((c) => !data || (data[c.key]?.trim().length || 0) < 1200).map((c) => c.num);
    const doneCount = 8 - missingNums.length;
    const cur = LIFE_CHAPTERS.find((c) => c.key === active) || LIFE_CHAPTERS[0];
    const disabled = loading || remoteBusy;

    return (
        <section className="bg-gradient-to-br from-slate-900 via-amber-950/15 to-slate-900 border border-amber-500/35 rounded-2xl p-5 space-y-4 text-xs text-slate-200 shadow-2xl">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5"><BookMarked className="w-5 h-5 text-amber-400 shrink-0" /><div><h3 className="font-black text-base text-amber-300 uppercase tracking-wide">Đại Cẩm Nang Minh Họa: {result.thien_ban.ho_ten} ({result.thien_ban.nam_sinh})</h3><p className="text-[11px] text-slate-400">8 Chương Sách Minh Họa (~100.000 ký tự): Tranh Đồ Hình • Trích Dẫn • Hành Động Thực Chiến & 8 Đại Vận</p></div></div>
                <div className="flex flex-wrap gap-2">
                    {data && <button type="button" onClick={() => downloadLifeMapBook(result.thien_ban, data)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold text-xs cursor-pointer"><Download className="w-3.5 h-3.5" /> Tải Sách Minh Họa (.HTML / PDF)</button>}
                    {data && missingNums.length > 0 && !disabled && <button type="button" onClick={() => runChapters(missingNums, false)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow cursor-pointer"><Sparkles className="w-3.5 h-3.5" /> Viết bổ sung {missingNums.length} chương thiếu</button>}
                    <button type="button" onClick={() => runChapters([1, 2, 3, 4, 5, 6, 7, 8], true)} disabled={disabled} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg disabled:opacity-45 disabled:pointer-events-none cursor-pointer">
                        {disabled ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : data ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {loading ? `Đang viết (${doneCount}/8 chương • ${totalChars.toLocaleString("vi-VN")} chữ)...` : remoteBusy ? "Thiết bị khác đang lập..." : data ? "Viết lại trọn bộ 8 Chương (~100k chữ)" : "Lập Đại Cẩm Nang (8 Chương ~100k chữ)"}
                    </button>
                </div>
            </div>
            {legacyCache && !loading && <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /><span>Bạn đang xem bản lưu cũ (6 chương ngắn). Hãy bấm nút màu cam <b>“Viết lại trọn bộ 8 Chương (~100k chữ)”</b> ở góc trên để AI biên soạn đầy đủ 8 chương minh họa mới nhé!</span></div>}
            <AiProgressLog steps={steps} active={loading} />
            {data ? (
                <div className="space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="text-[11px] px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">Độ dài sách: {totalChars.toLocaleString("vi-VN")} ký tự ({doneCount}/8 chương hoàn chỉnh) • Đã lưu Cloud</span>
                        <button type="button" onClick={() => setReadAll(!readAll)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer">{readAll ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />} {readAll ? "Xem gọn từng chương" : "Mở đọc trọn cuốn sách"}</button>
                    </div>
                    {!readAll ? (
                        <><div className="flex flex-wrap gap-1.5">{LIFE_CHAPTERS.map((c) => <button key={c.key} type="button" onClick={() => setActive(c.key)} className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition cursor-pointer ${active === c.key ? "bg-amber-500/25 text-amber-200 border border-amber-400/60" : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800"}`}>{c.tab} {data[c.key]?.length ? `(${(data[c.key].length / 1000).toFixed(1)}k)` : "(trống)"}</button>)}</div>
                        <BookChapterView chapterKey={cur.key} text={data[cur.key] || ""} thienBan={result.thien_ban} chartKey={chartKey} disabled={disabled} onRegen={() => runChapters([cur.num], false)} /></>
                    ) : (
                        <div className="space-y-4 max-h-[720px] overflow-y-auto pr-1">{LIFE_CHAPTERS.map((c) => <BookChapterView key={c.key} chapterKey={c.key} text={data[c.key] || ""} thienBan={result.thien_ban} chartKey={chartKey} disabled={disabled} onRegen={() => runChapters([c.num], false)} />)}</div>
                    )}
                </div>
            ) : <div className="p-5 text-center rounded-xl bg-slate-950/60 border border-dashed border-amber-500/30 text-slate-300">Bấm nút <b className="text-amber-300">“Lập Đại Cẩm Nang (8 Chương ~100k chữ)”</b> ở góc trên để AI biên soạn cuốn sách minh họa 8 chương kèm đồ hình bản mệnh, trích dẫn triết lý & lộ trình hành động trọn đời.</div>}
        </section>
    );
}
