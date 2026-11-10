// components/LifeMapBookPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import { BookMarked, Download, Loader2, Maximize2, Minimize2, RefreshCw, Sparkles } from "lucide-react";
import { HoroscopeResult } from "@/lib/types";
import { compressLaSoToText } from "@/lib/ai/compress-laso";
import { buildChartKey, loadChartMemory, saveChartMemory } from "@/lib/ai/tuvi-memory-store";
import { downloadLifeMapBook, LifeMapData } from "@/lib/export-lifemap";
import { streamAiEndpoint } from "@/lib/ai/stream-client";
import { notifyTabStatus } from "@/lib/tab-notify";
import AiProgressLog from "./AiProgressLog";
import FormattedAiText from "./FormattedAiText";
import { isOperationLockedRemotely, setOperationLock } from "@/lib/ai/cloud-profile-sync";

const CHAPTERS: { key: keyof LifeMapData; tab: string; title: string }[] = [
    { key: "c1CotCach", tab: "I. Cốt Cách", title: "Chương I. Cốt Cách Bản Mệnh & Định Vị Con Người" },
    { key: "c2SuNghiep", tab: "II. Sự Nghiệp • Tài", title: "Chương II. Con Đường Công Danh, Sự Nghiệp & Tài Lộc" },
    { key: "c3TinhDuyen", tab: "III. Tình Duyên • Gia Đạo", title: "Chương III. Tình Duyên, Hôn Nhân, Gia Đạo & Nhân Duyên" },
    { key: "c4SucKhoe", tab: "IV. Sức Khỏe • Bình An", title: "Chương IV. Sức Khỏe Thể Chất & Nuôi Dưỡng Bình An Nội Tâm" },
    { key: "c5NenTranh", tab: "V. Điều Nên Tránh", title: "Chương V. Những Điều Nên Tránh Làm Để Tâm Được An Nhiên" },
    { key: "c6KimChiNam", tab: "VI. Kim Chỉ Nam", title: "Chương VI. Kim Chỉ Nam Hành Động Để Thành Công, Êm Ấm & Đủ Đầy" },
];

export default function LifeMapBookPanel({ result }: { result: HoroscopeResult }) {
    const [data, setData] = useState<LifeMapData | null>(null);
    const [active, setActive] = useState<keyof LifeMapData>("c1CotCach");
    const [readAll, setReadAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [remoteBusy, setRemoteBusy] = useState(false);
    const [steps, setSteps] = useState<string[]>([]);
    const compactChart = compressLaSoToText(result.thien_ban, result.cung_12);
    const chartKey = buildChartKey(result.thien_ban);
    const cacheId = `${chartKey}_lifemap_v1`;

    useEffect(() => {
        const sync = () => {
            try { const s = localStorage.getItem(cacheId); setData(s ? JSON.parse(s) : null); } catch { setData(null); }
            setRemoteBusy(isOperationLockedRemotely(chartKey, "lifemap", loading));
        };
        sync();
        window.addEventListener("tuvi-memory-updated", sync);
        return () => window.removeEventListener("tuvi-memory-updated", sync);
    }, [cacheId, chartKey, loading]);

    const generateLifeMap = async () => {
        if (loading || remoteBusy || !compactChart) return;
        setLoading(true); setSteps(["Khởi tạo Bản Đồ Cuộc Đời 6 chương chuyên sâu..."]); notifyTabStatus("📜 AI đang viết Bản Đồ Cuộc Đời...");
        await setOperationLock(chartKey, "lifemap", true);
        try {
            const res = await streamAiEndpoint("/api/ai-lifemap", { compactChart, hoTen: result.thien_ban?.ho_ten }, (s) => setSteps((p) => [...p, s]));
            if (res?.lifeMap) {
                setData(res.lifeMap); localStorage.setItem(cacheId, JSON.stringify(res.lifeMap));
                const mem = loadChartMemory(chartKey, compactChart);
                saveChartMemory({ ...mem, memoryNotes: res.memoryNote ? [...mem.memoryNotes, res.memoryNote] : mem.memoryNotes });
                notifyTabStatus("🔔 (1) Đã hoàn thành Bản Đồ Cuộc Đời!");
            }
        } catch (e: any) { alert(e?.message || "Lỗi lập Bản Đồ Cuộc Đời"); }
        finally { setLoading(false); await setOperationLock(chartKey, "lifemap", false); }
    };

    const totalChars = data ? Object.values(data).reduce((s, v) => s + (v?.length || 0), 0) : 0;
    const cur = CHAPTERS.find((c) => c.key === active) || CHAPTERS[0];
    const disabled = loading || remoteBusy;

    return (
        <section className="bg-gradient-to-br from-slate-900 via-amber-950/15 to-slate-900 border border-amber-500/35 rounded-2xl p-5 space-y-4 text-xs text-slate-200 shadow-2xl">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5"><BookMarked className="w-5 h-5 text-amber-400 shrink-0" /><div><h3 className="font-black text-base text-amber-300 uppercase tracking-wide">Bản Đồ Cuộc Đời: {result.thien_ban.ho_ten} ({result.thien_ban.nam_sinh})</h3><p className="text-[11px] text-slate-400">Luận giải toàn diện Cốt cách • Sự nghiệp • Tình duyên • Sức khỏe • Điều nên tránh & Kim chỉ nam</p></div></div>
                <div className="flex flex-wrap gap-2">
                    {data && <button type="button" onClick={() => downloadLifeMapBook(result.thien_ban, data)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold text-xs cursor-pointer"><Download className="w-3.5 h-3.5" /> Tải Cẩm Nang (.HTML / PDF)</button>}
                    <button type="button" onClick={generateLifeMap} disabled={disabled} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg disabled:opacity-45 disabled:pointer-events-none cursor-pointer">
                        {disabled ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : data ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {loading ? "AI đang biên soạn sách..." : remoteBusy ? "Thiết bị khác đang lập..." : data ? "Viết lại Bản Đồ Cuộc Đời" : "Lập Bản Đồ Cuộc Đời (~7.000 chữ)"}
                    </button>
                </div>
            </div>
            <AiProgressLog steps={steps} active={loading} />
            {data ? (
                <div className="space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="text-[11px] px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">Độ dài: {totalChars.toLocaleString("vi-VN")} ký tự • Đã lưu Cloud</span>
                        <button type="button" onClick={() => setReadAll(!readAll)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer">{readAll ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />} {readAll ? "Xem gọn từng chương" : "Mở đọc trọn 6 chương"}</button>
                    </div>
                    {!readAll ? (
                        <><div className="flex flex-wrap gap-1.5">{CHAPTERS.map((c) => <button key={c.key} type="button" onClick={() => setActive(c.key)} className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition cursor-pointer ${active === c.key ? "bg-amber-500/25 text-amber-200 border border-amber-400/60" : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800"}`}>{c.tab}</button>)}</div>
                        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"><h4 className="font-bold text-sm text-amber-300">{cur.title}</h4><FormattedAiText text={data[cur.key]} /></div></>
                    ) : (
                        <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">{CHAPTERS.map((c) => <div key={c.key} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5"><h4 className="font-bold text-sm text-amber-300">{c.title}</h4><FormattedAiText text={data[c.key]} /></div>)}</div>
                    )}
                </div>
            ) : <div className="p-5 text-center rounded-xl bg-slate-950/60 border border-dashed border-amber-500/30 text-slate-300">Bấm nút <b className="text-amber-300">“Lập Bản Đồ Cuộc Đời (~7.000 chữ)”</b> ở góc trên để AI tổng hợp toàn bộ 12 cung thành cuốn cẩm nang 6 chương chi tiết.</div>}
        </section>
    );
}
