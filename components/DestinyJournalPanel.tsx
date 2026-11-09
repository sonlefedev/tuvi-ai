// components/DestinyJournalPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import { ThienBanData } from "@/lib/types";
import { buildChartKey } from "@/lib/ai/tuvi-memory-store";
import { pushProfileToCloud } from "@/lib/ai/cloud-profile-sync";

export interface JournalNote { id: string; tag: string; text: string; ts: number; }
const TAGS = ["Sự nghiệp", "Tài chính", "Tình duyên", "Sức khỏe", "Chiêm nghiệm"];

export default function DestinyJournalPanel({ thienBan }: { thienBan: ThienBanData }) {
    const [notes, setNotes] = useState<JournalNote[]>([]);
    const [tag, setTag] = useState("Chiêm nghiệm");
    const [text, setText] = useState("");
    const chartKey = buildChartKey(thienBan);
    const jKey = `${chartKey}_journal_v1`;

    useEffect(() => {
        const sync = () => { try { setNotes(JSON.parse(localStorage.getItem(jKey) || "[]")); } catch { setNotes([]); } };
        sync();
        window.addEventListener("tuvi-memory-updated", sync);
        return () => window.removeEventListener("tuvi-memory-updated", sync);
    }, [jKey]);

    const saveNotes = async (next: JournalNote[]) => {
        setNotes(next);
        localStorage.setItem(jKey, JSON.stringify(next.slice(0, 30)));
        window.dispatchEvent(new Event("tuvi-memory-updated"));
        await pushProfileToCloud(chartKey);
    };

    const addNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        await saveNotes([{ id: String(Date.now()), tag, text: text.trim(), ts: Date.now() }, ...notes]);
        setText("");
    };

    return (
        <section id="sec-journal" className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 space-y-3 text-xs text-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <NotebookPen className="w-5 h-5 text-emerald-400" />
                <div>
                    <h3 className="font-bold text-sm text-emerald-300">Nhật Ký Chiêm Nghiệm & Sự Kiện Thực Tế (Đồng Bộ Cloud)</h3>
                    <p className="text-[11px] text-slate-400">Ghi lại biến cố thực tế đã ứng nghiệm — Trợ lý AI sẽ tự tham chiếu nhật ký này khi bạn hỏi đáp</p>
                </div>
            </div>
            <form onSubmit={addNote} className="flex flex-col sm:flex-row gap-2">
                <select value={tag} onChange={(e) => setTag(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-emerald-300 font-semibold">
                    {TAGS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="VD: Tháng 8/2026 chuyển sang vị trí mới thuận lợi, đúng như cung Quan Lộc..." className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500" />
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 cursor-pointer">
                    <Plus className="w-4 h-4" /> Lưu ghi chú
                </button>
            </form>
            {notes.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {notes.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-slate-950/75 border border-slate-800 flex justify-between items-start gap-2">
                            <div><span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold text-[10.5px] mr-2">{n.tag}</span><span>{n.text}</span></div>
                            <button type="button" onClick={() => saveNotes(notes.filter((x) => x.id !== n.id))} className="text-slate-500 hover:text-rose-400 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
