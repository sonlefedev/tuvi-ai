// components/TuviChartsPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import { BarChart3, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { HoroscopeResult } from "@/lib/types";
import { compressLaSoToText } from "@/lib/ai/compress-laso";
import { buildChartKey } from "@/lib/ai/tuvi-memory-store";
import { ChartKind, getSavedCharts, saveChartSpec, TuviChartSpec } from "@/lib/ai/chart-store";
import { streamAiEndpoint } from "@/lib/ai/stream-client";
import { notifyTabStatus } from "@/lib/tab-notify";
import AiProgressLog from "./AiProgressLog";
import TuviChartSvg from "./TuviChartSvg";

const LAYERS = [
    { id: "codinh", label: "1. Lá Số Cố Định", defaultAspect: "Ngũ trục cuộc sống (Mệnh, Tài, Quan, Thê, Phúc, Di, Điền, Tật)" },
    { id: "daivan", label: "2. Tầng Đại Vận (ĐV)", defaultAspect: "Xu hướng 10 năm Đại vận hiện tại trên các phương diện chính" },
    { id: "luunien", label: "3. Tầng Lưu Niên (L.Thái Tuế)", defaultAspect: "Vận thế năm xem lấy Lưu Thái Tuế làm chuẩn Lưu Mệnh" },
    { id: "tieuhan", label: "4. Tầng Tuổi Tiểu Hạn & ĐV", defaultAspect: "Biến động thực tế theo Tiểu hạn tuổi mụ & 12 Nguyệt hạn" },
];

const ASPECT_PRESETS = ["Sự nghiệp & Thăng tiến", "Tài chính & Đầu tư", "Tình duyên & Gia đạo", "Sức khỏe & Tinh thần", "Biến động 12 tháng T1–T12"];

export default function TuviChartsPanel({ result }: { result: HoroscopeResult }) {
    const [layerId, setLayerId] = useState("codinh");
    const [customAspect, setCustomAspect] = useState("");
    const [activeSpec, setActiveSpec] = useState<TuviChartSpec | null>(null);
    const [chartKind, setChartKind] = useState<ChartKind>("radar");
    const [loading, setLoading] = useState(false);
    const [steps, setSteps] = useState<string[]>([]);

    const compactChart = compressLaSoToText(result.thien_ban, result.cung_12);
    const chartKey = buildChartKey(result.thien_ban);
    const curLayer = LAYERS.find((l) => l.id === layerId) || LAYERS[0];

    useEffect(() => {
        const sync = () => {
            const saved = getSavedCharts(chartKey);
            const found = saved[`${layerId}_default`] || null;
            setActiveSpec(found);
            if (found) setChartKind(found.chartType);
        };
        sync();
        window.addEventListener("tuvi-memory-updated", sync);
        return () => window.removeEventListener("tuvi-memory-updated", sync);
    }, [chartKey, layerId]);

    const generateChart = async (aspectText: string, customKey?: string) => {
        if (loading || !compactChart) return;
        setLoading(true);
        setSteps([`Khởi tạo biểu đồ "${aspectText}" (${curLayer.label})...`]);
        notifyTabStatus("📊 AI đang lập biểu đồ...");
        try {
            const data = await streamAiEndpoint(
                "/api/ai-chart",
                { compactChart, layerId, layerLabel: curLayer.label, aspect: aspectText },
                (s) => setSteps((prev) => [...prev, s]),
                (c) => setSteps((prev) => [...prev.slice(0, -1), c])
            );
            if (data?.spec) {
                const spec: TuviChartSpec = { ...data.spec, id: customKey || `${layerId}_default` };
                setActiveSpec(spec);
                setChartKind(spec.chartType);
                saveChartSpec(chartKey, compactChart, spec, data.memoryNote);
                notifyTabStatus("🔔 (1) Đã lập xong biểu đồ!");
            }
        } catch (e: any) {
            alert(e?.message || "Lỗi lập biểu đồ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 space-y-4 text-xs text-slate-200">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    <div>
                        <h4 className="font-bold text-sm text-cyan-300">Biểu Đồ Đánh Giá AI Đa Tầng & Đa Khía Cạnh</h4>
                        <p className="text-[11px] text-slate-400">4 tầng mặc định (Cố định • Đại vận • Lưu Thái Tuế • Tuổi Tiểu hạn) + Tùy biến vô hạn khía cạnh</p>
                    </div>
                </div>
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(["radar", "bar", "line"] as ChartKind[]).map((k) => (
                        <button key={k} type="button" onClick={() => setChartKind(k)} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase cursor-pointer ${chartKind === k ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400"}`}>
                            {k === "radar" ? "Radar" : k === "bar" ? "Cột" : "Đường"}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4 Tầng Biểu Đồ Mặc Định */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {LAYERS.map((l) => (
                    <button key={l.id} type="button" onClick={() => setLayerId(l.id)} className={`p-2.5 rounded-xl border text-left font-bold text-[11.5px] transition cursor-pointer ${layerId === l.id ? "bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow" : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200"}`}>
                        {l.label}
                    </button>
                ))}
            </div>

            {/* Khía cạnh gợi ý nhanh & Nhập khía cạnh bất kỳ */}
            <div className="flex flex-wrap gap-1.5 items-center">
                {ASPECT_PRESETS.map((a, i) => (
                    <button key={i} type="button" disabled={loading} onClick={() => generateChart(a, `${layerId}_${i}`)} className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-cyan-950/40 border border-slate-700 text-slate-300 text-[11px] disabled:opacity-50 cursor-pointer">+ {a}</button>
                ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (customAspect.trim()) { generateChart(customAspect.trim(), `${layerId}_${Date.now()}`); setCustomAspect(""); } }} className="flex gap-2">
                <input value={customAspect} onChange={(e) => setCustomAspect(e.target.value)} placeholder={`Yêu cầu AI lập biểu đồ khía cạnh bất kỳ trên ${curLayer.label}...`} className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500" />
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : activeSpec ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {customAspect.trim() ? "Vẽ biểu đồ này" : activeSpec ? "Lập lại tầng này" : "Lập biểu đồ tầng này"}
                </button>
            </form>

            <AiProgressLog steps={steps} active={loading} />

            {activeSpec ? (
                <div className="space-y-3 pt-1">
                    <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                        <div className="font-bold text-sm text-cyan-300">{activeSpec.title} <span className="text-[11px] font-normal text-slate-400">({activeSpec.layerLabel})</span></div>
                        <p className="text-slate-300 mt-1">{activeSpec.summary}</p>
                    </div>
                    <TuviChartSvg items={activeSpec.items} kind={chartKind} />
                </div>
            ) : (
                <div className="p-6 text-center rounded-xl bg-slate-950/50 border border-dashed border-slate-800 space-y-2">
                    <p className="text-slate-400">Chưa có biểu đồ cho <b className="text-cyan-300">{curLayer.label}</b>. Bấm nút bên dưới để AI chấm điểm và vẽ ngay:</p>
                    <button type="button" disabled={loading} onClick={() => generateChart(curLayer.defaultAspect)} className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer">
                        <Sparkles className="w-4 h-4" /> Lập Biểu Đồ Mặc Định Cho {curLayer.label}
                    </button>
                </div>
            )}
        </div>
    );
}