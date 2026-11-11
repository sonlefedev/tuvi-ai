// components/WatchdogCenterModal.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Copy, Download, ImagePlus, Loader2, Send, ShieldAlert, Sparkles, Terminal, Trash2, X } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-store";
import { buildPatchZipBlob } from "@/lib/patch-zip-builder";
import { compressImageToDataUrl } from "@/lib/image-compress";

export default function WatchdogCenterModal({ onClose }: { onClose: () => void }) {
    const [data, setData] = useState<any>({ checks: [], sysErrors: [], userBugs: [], chatHistory: [] });
    const [msg, setMsg] = useState("");
    const [imgPreview, setImgPreview] = useState("");
    const [busy, setBusy] = useState(false);
    const [copiedCmd, setCopiedCmd] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const uid = getCurrentUser()?.username || "";
    const load = () => fetch(`/api/watchdog?uid=${encodeURIComponent(uid)}`, { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => { });
    useEffect(() => { load(); }, []);

    const attachFile = async (file?: File | null) => {
        if (!file) return;
        try { setImgPreview(await compressImageToDataUrl(file)); } catch (e: any) { alert(e?.message || "Không tải được ảnh"); }
    };

    const sendChatOrDiagnose = async (customText?: string) => {
        const text = (customText ?? msg).trim() || "Hãy chẩn đoán toàn bộ lỗi hệ thống, phản hồi khách hàng và ảnh đính kèm.";
        if (busy) return;
        setBusy(true);
        const curImg = imgPreview;
        if (!customText) { setMsg(""); setImgPreview(""); }
        try {
            const r = await fetch("/api/watchdog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid, action: "chat_diagnose", message: text, imageDataUrl: curImg }) });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Lỗi chẩn đoán");
            setData((p: any) => ({ ...p, chatHistory: j.chatHistory || p.chatHistory }));
        } catch (e: any) { alert(e?.message || "Lỗi gửi chẩn đoán"); }
        finally { setBusy(false); }
    };

    const downloadUpdateZip = () => {
        const day = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
        const lastAi = [...(data.chatHistory || [])].reverse().find((c: any) => c.role === "ai")?.text || "Hệ thống vận hành ổn định.";
        const notes = `# BÁO CÁO TỰ TRA LỖI & CẬP NHẬT (${day})\n\n${lastAi}\n\n## Lỗi hệ thống:\n${(data.sysErrors || []).map((e: any) => `- [${e.source}] ${e.message} (${e.count}x)`).join("\n") || "- Không có"}\n\n## Phản hồi khách:\n${(data.userBugs || []).map((b: any) => `- ${b.name}: ${b.content}`).join("\n") || "- Không có"}`;
        const zipBlob = buildPatchZipBlob([{ path: "PATCH_NOTES.md", content: notes }, { path: "public/build-version.json", content: JSON.stringify({ updatedAt: new Date().toISOString(), status: "healthy" }, null, 2) }]);
        const a = document.createElement("a"); a.href = URL.createObjectURL(zipBlob); a.download = `tuvi-ai-patch-${day}.zip`; a.click();
    };

    const psCmd = `cd D:\\projects\\tuvi-ai; .\\cap-nhat.ps1`;
    const copyCmd = async () => { try { await navigator.clipboard.writeText(psCmd); setCopiedCmd(true); setTimeout(() => setCopiedCmd(false), 2500); } catch { } };

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
            <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-rose-500/35 rounded-2xl p-5 space-y-3.5 text-xs text-slate-200 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-rose-400" /><div><h3 className="font-black text-base text-amber-300">Trung Tâm Tự Tra Lỗi, Nhắn Tin Kèm Ảnh & Bản Vá (.ZIP)</h3><p className="text-[11px] text-slate-400">Nhắn trực tiếp lỗi đang gặp + gửi ảnh chụp màn hình để AI chẩn đoán & đóng gói bản cập nhật</p></div></div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(data.checks || []).map((c: any, i: number) => <div key={i} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2">{c.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}<div><div className="font-bold text-slate-100">{c.name}</div><div className="text-[10.5px] text-slate-400">{c.detail}</div></div></div>)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 max-h-32 overflow-y-auto"><div className="flex justify-between"><span className="font-bold text-rose-300">Lỗi hệ thống tự bắt ({data.sysErrors?.length || 0})</span>{data.sysErrors?.length > 0 && <button type="button" onClick={async () => { await fetch("/api/watchdog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid, action: "clear_errors" }) }); load(); }} className="text-[10px] text-slate-400 hover:text-rose-300 cursor-pointer">Xóa</button>}</div>{(data.sysErrors || []).length === 0 ? <p className="text-emerald-400/90 text-[11px]">✓ Không có lỗi runtime.</p> : data.sysErrors.map((e: any) => <div key={e.id} className="text-[11px] text-rose-200">• [{e.source}] {e.message} ({e.count}x)</div>)}</div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 max-h-32 overflow-y-auto"><span className="font-bold text-amber-300 block">Phản hồi từ khách ({data.userBugs?.length || 0})</span>{(data.userBugs || []).length === 0 ? <p className="text-slate-400 text-[11px]">✓ Chưa có báo lỗi mới từ khách.</p> : data.userBugs.map((b: any) => <div key={b.id} className="text-[11px] text-amber-100">• <b>{b.name}:</b> {b.content}</div>)}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-purple-500/35 space-y-2.5">
                    <div className="flex flex-wrap justify-between items-center gap-2"><span className="font-bold text-purple-300 flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Nhắn tin báo lỗi & Chẩn đoán hình ảnh trực tiếp với AI</span><div className="flex gap-1.5"><button type="button" disabled={busy} onClick={() => sendChatOrDiagnose("Chẩn đoán tổng hợp toàn bộ lỗi hệ thống và phản hồi khách hàng hiện tại.")} className="px-2.5 py-1 rounded-lg bg-rose-600/25 text-rose-200 border border-rose-500/40 font-bold text-[11px] cursor-pointer">Chẩn đoán tự động</button>{data.chatHistory?.length > 0 && <button type="button" onClick={async () => { const r = await fetch("/api/watchdog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid, action: "clear_chat" }) }).then((x) => x.json()); setData((p: any) => ({ ...p, chatHistory: r.chatHistory || [] })); }} className="text-slate-400 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>}</div></div>
                    <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                        {(data.chatHistory || []).length === 0 && <p className="text-slate-400 text-[11px]">Mô tả lỗi bạn đang gặp bên dưới (có thể bấm nút <b>Đính kèm ảnh</b> hoặc dán ảnh <b>Ctrl+V</b>) để AI soi ảnh và hướng dẫn khắc phục ngay!</p>}
                        {(data.chatHistory || []).map((c: any, i: number) => <div key={i} className={`p-2.5 rounded-xl whitespace-pre-line text-[11.5px] ${c.role === "user" ? "bg-slate-800 text-amber-200 ml-8" : "bg-slate-900 border border-purple-500/25 text-slate-200 mr-4"}`}><div className="text-[10px] opacity-60 mb-0.5">{c.role === "user" ? `Bạn (${c.time})${c.hasImage ? " • Đã gửi kèm ảnh" : ""}` : `Kỹ sư AI (${c.time})`}</div>{c.text}</div>)}
                    </div>
                    {imgPreview && <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-amber-500/40"><img src={imgPreview} alt="preview" className="h-14 rounded object-cover" /><span className="text-[11px] text-amber-200 flex-1">Đã đính kèm ảnh chụp màn hình lỗi</span><button type="button" onClick={() => setImgPreview("")} className="text-rose-400 font-bold px-2">Xóa ảnh</button></div>}
                    <form onSubmit={(e) => { e.preventDefault(); sendChatOrDiagnose(); }} className="flex flex-wrap gap-1.5">
                        <input ref={fileRef} type="file" accept="image/*" onChange={(e) => attachFile(e.target.files?.[0])} className="hidden" />
                        <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/35 font-bold flex items-center gap-1 cursor-pointer"><ImagePlus className="w-4 h-4" /> Đính kèm ảnh</button>
                        <input value={msg} onChange={(e) => setMsg(e.target.value)} onPaste={(e) => { const f = Array.from(e.clipboardData.items).find((it) => it.type.startsWith("image/"))?.getAsFile(); if (f) attachFile(f); }} placeholder="Nhập mô tả lỗi hoặc dán ảnh Ctrl+V tại đây..." className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100" />
                        <button type="submit" disabled={busy} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {busy ? "Đang soi..." : "Gửi báo lỗi"}</button>
                    </form>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
                    <button type="button" onClick={downloadUpdateZip} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/45 font-bold cursor-pointer"><Download className="w-4 h-4" /> Tải File Bản Cập Nhật (.ZIP)</button>
                    <div className="flex items-center gap-2 bg-cyan-950/40 border border-cyan-500/35 px-3 py-1.5 rounded-xl"><Terminal className="w-3.5 h-3.5 text-cyan-400" /><code className="text-[11px] text-amber-300 font-mono">{psCmd}</code><button type="button" onClick={copyCmd} className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-bold cursor-pointer">{copiedCmd ? <Check className="w-3 h-3 inline text-emerald-400" /> : <Copy className="w-3 h-3 inline" />} {copiedCmd ? "Đã chép" : "Chép"}</button></div>
                </div>
            </div>
        </div>
    );
}
