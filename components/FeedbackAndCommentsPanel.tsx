// components/FeedbackAndCommentsPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Bug, CheckCircle2, Lightbulb, MessageSquarePlus, Send, ShieldCheck, Star, Trash2 } from "lucide-react";
import { getCurrentUser, isAdminUser } from "@/lib/auth-store";

export default function FeedbackAndCommentsPanel() {
    const [items, setItems] = useState<any[]>([]);
    const [kind, setKind] = useState<"comment" | "suggestion" | "bug">("comment");
    const [rating, setRating] = useState(5);
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        fetch("/api/feedback", { cache: "no-store" }).then((r) => r.json()).then((d) => setItems(d.items || [])).catch(() => { });
        const sync = () => { const u = getCurrentUser(); setAdmin(isAdminUser(u)); if (u && !name) setName(u.displayName); };
        sync();
        window.addEventListener("tuvi-auth-changed", sync);
        return () => window.removeEventListener("tuvi-auth-changed", sync);
    }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || sending) return;
        setSending(true);
        try {
            const ua = navigator.userAgent || "";
            const dev = `${/iPhone|iPad/i.test(ua) ? "iOS" : /Android/i.test(ua) ? "Android" : "PC"} • ${/Zalo/i.test(ua) ? "Zalo" : /Chrome/i.test(ua) ? "Chrome" : /Safari/i.test(ua) ? "Safari" : "Web"} (${window.innerWidth}×${window.innerHeight})`;
            const r = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name || "Khách ghé thăm", kind, rating, content, device: dev }) });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Lỗi");
            setItems(j.items || []); setContent("");
        } catch (err: any) { alert(err?.message || "Không gửi được góp ý"); }
        finally { setSending(false); }
    };

    const adminAct = async (payload: any) => {
        const uid = getCurrentUser()?.username || "";
        const r = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid, ...payload }) });
        const j = await r.json();
        if (j.items) setItems(j.items);
    };

    return (
        <section id="sec-feedback" className="w-full max-w-5xl mx-auto mt-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs text-slate-200 shadow-xl">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2"><MessageSquarePlus className="w-5 h-5 text-emerald-400" /><div><h3 className="font-black text-sm text-emerald-300 uppercase tracking-wide">Góp Ý, Báo Lỗi & Bình Luận Cộng Đồng ({items.length})</h3><p className="text-[11px] text-slate-400">Gặp chỗ nào chưa mượt hoặc muốn thêm tính năng gì, bạn nhắn trực tiếp để Admin cập nhật ngay!</p></div></div>
                <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setRating(n)} className="cursor-pointer"><Star className={`w-4 h-4 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} /></button>)}</div>
            </div>

            <form onSubmit={submit} className="space-y-2.5">
                <div className="flex flex-wrap gap-2">
                    {([["comment", "Bình luận / Đánh giá", MessageSquarePlus], ["suggestion", "Đề xuất tính năng", Lightbulb], ["bug", "Báo lỗi / Chỗ bị kẹt", Bug]] as const).map(([k, lbl, Icon]) => (
                        <button key={k} type="button" onClick={() => setKind(k)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border cursor-pointer ${kind === k ? (k === "bug" ? "bg-rose-500/20 text-rose-200 border-rose-500/45" : k === "suggestion" ? "bg-amber-500/20 text-amber-200 border-amber-500/45" : "bg-emerald-500/20 text-emerald-200 border-emerald-500/45") : "bg-slate-950 text-slate-400 border-slate-800"}`}><Icon className="w-3.5 h-3.5" /> {lbl}</button>
                    ))}
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên của bạn (tùy chọn)" className="flex-1 min-w-[160px] bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input required value={content} onChange={(e) => setContent(e.target.value)} placeholder={kind === "bug" ? "Mô tả chỗ bị lỗi (hệ thống tự kèm thông tin máy để Admin sửa nhanh)..." : "Chia sẻ cảm nhận hoặc tính năng bạn muốn web bổ sung..."} className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100" />
                    <button type="submit" disabled={sending} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"><Send className="w-3.5 h-3.5" /> {sending ? "Đang gửi..." : "Gửi phản hồi"}</button>
                </div>
            </form>

            {items.length > 0 && (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {items.map((it) => (
                        <div key={it.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                            <div className="flex flex-wrap justify-between items-center gap-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-bold text-slate-100">{it.name}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${it.kind === "bug" ? "bg-rose-500/20 text-rose-300" : it.kind === "suggestion" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>{it.kind === "bug" ? "Báo lỗi" : it.kind === "suggestion" ? "Đề xuất" : "Cảm nhận"}</span>
                                    <span className="text-amber-400 text-[10.5px]">{"★".repeat(it.rating || 5)}</span>
                                    {it.resolved && <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Đã cập nhật</span>}
                                    {admin && it.device && <span className="text-[10px] font-mono text-slate-400">[{it.device}]</span>}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500"><span>{it.createdAt}</span>{admin && <><button type="button" onClick={() => adminAct({ action: "admin_toggle", id: it.id })} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 cursor-pointer">Đánh dấu đã sửa</button><button type="button" onClick={() => adminAct({ action: "admin_delete", id: it.id })} className="text-rose-400 hover:text-rose-300 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button></>}</div>
                            </div>
                            <p className="text-slate-200 leading-relaxed">{it.content}</p>
                            {it.adminReply && <div className="p-2 rounded-lg bg-amber-500/10 border-l-2 border-amber-400 text-amber-100 text-[11px] flex items-start gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" /><span><b>Admin (@sonlefedev):</b> {it.adminReply}</span></div>}
                            {admin && <div className="flex gap-1.5 pt-1"><input value={replyDrafts[it.id] ?? it.adminReply ?? ""} onChange={(e) => setReplyDrafts({ ...replyDrafts, [it.id]: e.target.value })} placeholder="Trả lời dưới danh nghĩa Admin..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-200" /><button type="button" onClick={() => adminAct({ action: "admin_reply", id: it.id, reply: replyDrafts[it.id] ?? "", resolved: true })} className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[10.5px] cursor-pointer">Trả lời</button></div>}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
