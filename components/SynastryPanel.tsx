// components/SynastryPanel.tsx
"use client";
import React, { useState } from "react";
import { HeartHandshake, Loader2, Sparkles } from "lucide-react";
import { HoroscopeResult } from "@/lib/types";
import { compressLaSoToText } from "@/lib/ai/compress-laso";
import { getCurrentUser } from "@/lib/auth-store";
import { streamAiEndpoint } from "@/lib/ai/stream-client";

const HOURS = ["Tý (23h-01h)", "Sửu (01h-03h)", "Dần (03h-05h)", "Mão (05h-07h)", "Thìn (07h-09h)", "Tỵ (09h-11h)", "Ngọ (11h-13h)", "Mùi (13h-15h)", "Thân (15h-17h)", "Dậu (17h-19h)", "Tuất (19h-21h)", "Hợi (21h-23h)"];

export default function SynastryPanel({ resultA }: { resultA: HoroscopeResult }) {
    const [relation, setRelation] = useState("Vợ chồng / Tình duyên");
    const [nameB, setNameB] = useState("");
    const [genderB, setGenderB] = useState("Nữ");
    const [dayB, setDayB] = useState("15");
    const [monthB, setMonthB] = useState("6");
    const [yearB, setYearB] = useState("2005");
    const [hourB, setHourB] = useState("Ngọ (11h-13h)");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState("");
    const [output, setOutput] = useState("");

    const saved = getCurrentUser()?.savedCharts || [];
    const pickSaved = (c: any) => { setNameB(c.hoTen); setGenderB(c.gioiTinh); setDayB(String(c.ngay)); setMonthB(String(c.thang)); setYearB(String(c.nam)); setHourB(c.gio); };

    const compare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true); setOutput(""); setStep("Đang lập lá số người thứ 2...");
        try {
            const genRes = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hoTen: nameB.trim() || "Người B", gioiTinh: genderB, ngay: Number(dayB), thang: Number(monthB), nam: Number(yearB), gio: hourB, namXem: resultA.thien_ban.nam_xem || 2026 }) });
            const genData = await genRes.json();
            if (!genData.success) throw new Error(genData.error || "Lỗi lập lá số B");
            const chartA = compressLaSoToText(resultA.thien_ban, resultA.cung_12);
            const chartB = compressLaSoToText(genData.data.thien_ban, genData.data.cung_12);
            const res = await streamAiEndpoint("/api/ai-synastry", { chartA, chartB, relation }, setStep, setOutput);
            if (res?.reply) setOutput(res.reply);
        } catch (err: any) { alert(err?.message || "Lỗi đối chiếu"); }
        finally { setLoading(false); }
    };

    return (
        <section id="sec-synastry" className="bg-slate-900/90 border border-pink-500/30 rounded-2xl p-5 space-y-3.5 text-xs text-slate-200">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-pink-400" /><div><h3 className="font-bold text-sm text-pink-300">Hợp Lá Số Đôi — Soi Duyên & Cộng Sự</h3><p className="text-[11px] text-slate-400">Đối chiếu lá số hiện tại với người thương, vợ/chồng hoặc đối tác làm ăn</p></div></div>
                <select value={relation} onChange={(e) => setRelation(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-pink-200 font-semibold">
                    <option>Vợ chồng / Tình duyên</option><option>Đối tác kinh doanh / Cộng sự</option><option>Cha mẹ – Con cái / Gia đạo</option>
                </select>
            </div>
            {saved.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center text-[11px]"><span className="text-slate-400">Chọn nhanh từ tài khoản:</span>{saved.map((c) => <button key={c.id} type="button" onClick={() => pickSaved(c)} className="px-2 py-0.5 rounded bg-slate-800 hover:bg-pink-500/20 text-pink-200 border border-slate-700 cursor-pointer">{c.hoTen} ({c.nam})</button>)}</div>
            )}
            <form onSubmit={compare} className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <input value={nameB} onChange={(e) => setNameB(e.target.value)} placeholder="Họ tên người B..." className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2" />
                <select value={genderB} onChange={(e) => setGenderB(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2"><option>Nữ</option><option>Nam</option></select>
                <input type="number" min={1} max={31} value={dayB} onChange={(e) => setDayB(e.target.value)} placeholder="Ngày" className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2" />
                <input type="number" min={1} max={12} value={monthB} onChange={(e) => setMonthB(e.target.value)} placeholder="Tháng" className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2" />
                <input type="number" min={1900} max={2100} value={yearB} onChange={(e) => setYearB(e.target.value)} placeholder="Năm" className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2" />
                <select value={hourB} onChange={(e) => setHourB(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2">{HOURS.map((h) => <option key={h}>{h}</option>)}</select>
                <button type="submit" disabled={loading} className="col-span-2 md:col-span-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {loading ? step || "Đang phân tích tương hợp..." : "Đối Chiếu Hợp Lá Số Đôi"}
                </button>
            </form>
            {output && <div className="p-4 rounded-xl bg-slate-950/80 border border-pink-500/25 leading-relaxed whitespace-pre-line">{output}</div>}
        </section>
    );
}
