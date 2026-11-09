// components/BirthHourRectifyPanel.tsx
"use client";
import React, { useState } from "react";
import { CheckCircle2, Clock, Loader2, Sparkles } from "lucide-react";
import { compressLaSoToText } from "@/lib/ai/compress-laso";
import { streamAiEndpoint } from "@/lib/ai/stream-client";

const HOURS = ["Tý (23h-01h)", "Sửu (01h-03h)", "Dần (03h-05h)", "Mão (05h-07h)", "Thìn (07h-09h)", "Tỵ (09h-11h)", "Ngọ (11h-13h)", "Mùi (13h-15h)", "Thân (15h-17h)", "Dậu (17h-19h)", "Tuất (19h-21h)", "Hợi (21h-23h)"];

export default function BirthHourRectifyPanel({ baseForm, onApplyHour }: { baseForm: any; onApplyHour: (hour: string) => void }) {
    const [selectedHours, setSelectedHours] = useState<string[]>(["Tỵ (09h-11h)", "Ngọ (11h-13h)", "Mùi (13h-15h)"]);
    const [clues, setClues] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState("");
    const [reply, setReply] = useState("");

    const toggleHour = (h: string) => {
        setSelectedHours((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : prev.length < 3 ? [...prev, h] : [...prev.slice(1), h]);
    };

    const runRectify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading || selectedHours.length < 2 || !clues.trim()) return;
        setLoading(true); setReply(""); setStep("Đang lập lá số các khung giờ ứng viên...");
        try {
            const candidates = await Promise.all(selectedHours.map(async (h) => {
                const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...baseForm, gio: h }) });
                const j = await r.json();
                return { hour: h, compact: compressLaSoToText(j.data.thien_ban, j.data.cung_12) };
            }));
            const res = await streamAiEndpoint("/api/ai-rectify", { candidates, clues: clues.trim() }, setStep, setReply);
            if (res?.reply) setReply(res.reply);
        } catch (err: any) { alert(err?.message || "Lỗi định giờ sinh"); }
        finally { setLoading(false); }
    };

    return (
        <section id="sec-rectify" className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 space-y-3 text-xs text-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Clock className="w-5 h-5 text-cyan-400" />
                <div>
                    <h3 className="font-bold text-sm text-cyan-300">Định Giờ Sinh Ngược (Khi Chưa Chắc Chắn Giờ Sinh)</h3>
                    <p className="text-[11px] text-slate-400">Chọn 2–3 khung giờ nghi ngờ và nhập đặc điểm thực tế để AI chấm điểm xác suất giờ sinh đúng nhất</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {HOURS.map((h) => (
                    <button key={h} type="button" onClick={() => toggleHour(h)} className={`px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer ${selectedHours.includes(h) ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold" : "bg-slate-950 border-slate-800 text-slate-400"}`}>{h}</button>
                ))}
            </div>
            <form onSubmit={runRectify} className="space-y-2">
                <textarea rows={2} value={clues} onChange={(e) => setClues(e.target.value)} placeholder="Nhập 2–3 dữ kiện thực tế: VD: Nhà có 2 anh em, tính thẳng thắn nóng nảy, năm 2022 đỗ đại học / chuyển nhà..." className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-500" />
                <div className="flex flex-wrap gap-2 items-center">
                    <button type="submit" disabled={loading || selectedHours.length < 2 || !clues.trim()} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold flex items-center gap-1.5 disabled:opacity-45 cursor-pointer">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {loading ? step || "Đang đối chiếu..." : `Chấm Điểm ${selectedHours.length} Giờ Sinh`}
                    </button>
                    {selectedHours.map((h) => (
                        <button key={h} type="button" onClick={() => onApplyHour(h)} className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/30 border border-slate-700 text-emerald-300 text-[11px] flex items-center gap-1 cursor-pointer">
                            <CheckCircle2 className="w-3 h-3" /> Áp dụng {h.split(" ")[0]}
                        </button>
                    ))}
                </div>
            </form>
            {reply && <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/25 leading-relaxed whitespace-pre-line">{reply}</div>}
        </section>
    );
}
