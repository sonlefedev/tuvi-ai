// components/CungDetail.tsx
"use client";
import React, { useEffect, useState } from "react";
import { CungItem, ThienBanData } from "@/lib/types";
import { DIA_CHI } from "@/lib/tuvi/can-chi";
import { phanTichCung } from "@/lib/luan-giai-cung";
import { compressCungCoDinh, compressLaSoToText } from "@/lib/ai/compress-laso";
import { buildChartKey } from "@/lib/ai/tuvi-memory-store";
import { CungAiReading, getCachedCungAi, saveCachedCungAi } from "@/lib/ai/cung-ai-store";
import { isPalaceLockedRemotely, pullProfileFromCloud, setPalaceBusyLock } from "@/lib/ai/cloud-profile-sync";
import { streamAiEndpoint } from "@/lib/ai/stream-client";
import { notifyTabStatus } from "@/lib/tab-notify";
import AiProgressLog from "./AiProgressLog";
import CungReadingTabs from "./CungReadingTabs";
import { Compass, Loader2, RefreshCw, Sparkles } from "lucide-react";

interface Props { cung: CungItem; cungList?: CungItem[]; thienBan?: ThienBanData; tongQuan?: any; namXem: number; }

export default function CungDetail({ cung, cungList = [], thienBan, namXem }: Props) {
    const info = phanTichCung(cung, cungList, namXem);
    const [aiReading, setAiReading] = useState<CungAiReading | null>(null);
    const [loading, setLoading] = useState(false);
    const [remoteBusy, setRemoteBusy] = useState(false);
    const [steps, setSteps] = useState<string[]>([]);

    const idx = DIA_CHI.indexOf(cung.chi);
    const nameAt = (i: number) => { const c = cungList[(i + 120) % 12]; return c ? `${c.ten_cung.replace("<THÂN>", "").trim()} (${c.chi})` : ""; };
    const nhiHopText = idx >= 0 ? nameAt(1 - idx) : "";
    const giapText = idx >= 0 ? `${nameAt(idx - 1)} & ${nameAt(idx + 1)}` : "";

    const chartKey = thienBan ? buildChartKey(thienBan) : "";
    const fixedContext = thienBan ? compressCungCoDinh(thienBan, cungList, cung.chi) : "";

    useEffect(() => {
        const syncLocal = () => {
            setAiReading(chartKey ? getCachedCungAi(chartKey, cung.chi) : null);
            setRemoteBusy(isPalaceLockedRemotely(chartKey, cung.chi, loading));
        };
        syncLocal();
        setSteps([]);
        if (chartKey) pullProfileFromCloud(chartKey);

        const pollId = setInterval(() => { if (chartKey && !document.hidden) pullProfileFromCloud(chartKey); }, 3000);
        window.addEventListener("tuvi-memory-updated", syncLocal);
        return () => { clearInterval(pollId); window.removeEventListener("tuvi-memory-updated", syncLocal); };
    }, [chartKey, cung.chi, loading]);

    const handleAiRead = async () => {
        if (loading || remoteBusy || !fixedContext || !thienBan) return;
        setLoading(true);
        setSteps(["Lọc sao cố định lục diện của cung " + cung.ten_cung + "..."]);
        notifyTabStatus(`⏳ AI đang luận cung ${cung.ten_cung}...`);
        setPalaceBusyLock(chartKey, cung.chi, true);
        try {
            const data = await streamAiEndpoint("/api/ai-cung", { fixedContext, cungName: cung.ten_cung, cungChi: cung.can_cung || cung.chi }, (s) => setSteps((p) => [...p, s]), (c) => setSteps((p) => [...p.slice(0, -1), c]));
            if (data?.reading) {
                setAiReading(data.reading);
                saveCachedCungAi(chartKey, cung.chi, compressLaSoToText(thienBan, cungList), data.reading, data.memoryNote);
                notifyTabStatus(`🔔 (1) Đã luận xong cung ${cung.ten_cung}!`);
            }
        } catch (e: any) {
            notifyTabStatus("⚠️ Lỗi luận cung AI", 3000);
            alert(e?.message || "Không thể gọi AI luận cung");
        } finally {
            setLoading(false);
            await setPalaceBusyLock(chartKey, cung.chi, false);
        }
    };

    const disabled = loading || remoteBusy || !fixedContext;

    return (
        <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                <div>
                    <h4 className="font-black text-lg text-amber-300 uppercase">Cung {cung.ten_cung} ({cung.can_cung || cung.chi})</h4>
                    <p className="text-[11px] text-slate-400">Tràng Sinh: <b className="text-slate-200">{cung.trang_sinh}</b> • Đại vận: <b className="text-cyan-300">{cung.dai_van} tuổi ({cung.dv_cung})</b> • Lưu niên {namXem}: <b className="text-pink-300">{cung.luu_cung} ({cung.nguyet_han})</b></p>
                </div>
                <button type="button" onClick={handleAiRead} disabled={disabled} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer">
                    {loading || remoteBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : aiReading ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {loading ? "AI đang luận sâu..." : remoteBusy ? "Thiết bị khác đang luận..." : aiReading ? "AI Luận lại (~4.500 chữ)" : "AI Luận Chuyên Sâu (~4.500 chữ)"}
                </button>
            </div>

            <AiProgressLog steps={steps} active={loading} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div><p className="font-bold text-amber-400 mb-1.5">Chính tinh & Sao Lưu {namXem}:</p><div className="flex flex-wrap gap-1.5">{cung.chinh_tinh?.length > 0 ? cung.chinh_tinh.map((s, i) => <span key={i} className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">★ {s.ten} {s.trang_thai}</span>) : <span className="italic text-slate-500">Vô chính diệu</span>}{cung.sao_luu?.map((s, i) => <span key={i} className="px-2 py-0.5 rounded bg-pink-500/15 text-pink-300 font-bold border border-pink-500/30">{s}</span>)}</div></div>
                <div><p className="font-bold text-emerald-400 mb-1.5">Cát tinh ({cung.phu_tinh_tot?.length || 0}):</p><div className="flex flex-wrap gap-1">{cung.phu_tinh_tot?.map((s, i) => <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{s}</span>)}</div></div>
                <div><p className="font-bold text-red-400 mb-1.5">Sát & Bại tinh ({cung.phu_tinh_xau?.length || 0}):</p><div className="flex flex-wrap gap-1">{cung.phu_tinh_xau?.map((s, i) => <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">{s}</span>)}</div></div>
            </div>

            <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 space-y-1.5">
                <h5 className="font-bold text-xs text-cyan-400 flex items-center gap-1.5"><Compass className="w-3.5 h-3.5" /> Lục Diện Cố Định & Phi Cung Tứ Hóa</h5>
                <p><b className="text-slate-100">Tam hợp:</b> {info.tamHopText} • <b className="text-slate-100">Xung:</b> {info.xungChieuText}</p>
                <p><b className="text-slate-100">Nhị hợp:</b> {nhiHopText} • <b className="text-slate-100">Giáp cung:</b> {giapText}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">{info.phiHoaList.map((p, i) => <span key={i} className={`px-2 py-0.5 rounded border text-[11px] ${p.label === "Hóa Kỵ" ? "bg-rose-950/50 border-rose-500/30 text-rose-300" : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"}`}>{p.label} ({p.star}) → <b>{p.destName}</b></span>)}</div>
            </div>

            {aiReading ? <CungReadingTabs reading={aiReading} cungName={cung.ten_cung} /> : (
                <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-1.5 text-slate-300">
                    <p className="font-bold text-amber-300">Tóm tắt nhanh (bấm nút "AI Luận Chuyên Sâu (~4.500 chữ)" ở góc trên để xem phân tích 5 phần):</p>
                    {info.yNghiaSao.map((l, i) => <p key={i}>{l}</p>)}
                </div>
            )}
        </div>
    );
}