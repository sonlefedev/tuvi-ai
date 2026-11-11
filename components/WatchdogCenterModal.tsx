// components/WatchdogCenterModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Copy, Download, Loader2, ShieldAlert, Sparkles, Terminal, Trash2, X } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-store";
import { buildPatchZipBlob } from "@/lib/patch-zip-builder";

export default function WatchdogCenterModal({ onClose }: { onClose: () => void }) {
    const [data, setData] = useState<any>({ checks: [], sysErrors: [], userBugs: [] });
    const [diagnosis, setDiagnosis] = useState("");
    const [busy, setBusy] = useState(false);
    const [copiedCmd, setCopiedCmd] = useState(false);

    const uid = getCurrentUser()?.username || "";
    const load = () => fetch(`/api/watchdog?uid=${encodeURIComponent(uid)}`, { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => { });
    useEffect(() => { load(); }, []);

    const diagnoseAndBuildPatch = async () => {
        setBusy(true);
        try {
            const r = await fetch("/api/watchdog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid, action: "diagnose_patch" }) });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "Lỗi AI");
            setDiagnosis(j.diagnosis || "");
        } catch (e: any) { alert(e?.message || "Lỗi phân tích"); }
        finally { setBusy(false); }
    };

    const downloadUpdateZip = () => {
        const day = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
        const notes = `# BÁO CÁO TỰ TRA LỖI & CẬP NHẬT (${day})\n\n${diagnosis || "Hệ thống vận hành ổn định, tối ưu cấu hình runtime."}\n\n## Lỗi hệ thống ghi nhận:\n${(data.sysErrors || []).map((e: any) => `- [${e.source}] ${e.message} (${e.count}x)`).join("\n") || "- Không có"}\n\n## Góp ý / Báo lỗi từ khách:\n${(data.userBugs || []).map((b: any) => `- ${b.name}: ${b.content}`).join("\n") || "- Không có"}`;
        const zipBlob = buildPatchZipBlob([
            { path: "PATCH_NOTES.md", content: notes },
            { path: "public/build-version.json", content: JSON.stringify({ updatedAt: new Date().toISOString(), status: "healthy", note: diagnosis.slice(0, 240) }, null, 2) },
        ]);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(zipBlob);
        a.download = `tuvi-ai-patch-${day}.zip`;
        a.click();
    };

    const psCmd = `cd D:\\projects\\tuvi-ai; .\\cap-nhat.ps1`;
    const copyCmd = async () => {
        try { await navigator.clipboard.writeText(psCmd); setCopiedCmd(true); setTimeout(() => setCopiedCmd(false), 2500); } catch { }
    };

    const clearSysErrors = async () => {
        await fetch("/api/watchdog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid, action: "clear_errors" }) });
        load();
    };

    const totalIssues = (data.sysErrors?.length || 0) + (data.userBugs?.length || 0);

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-rose-500/35 rounded-2xl p-5 space-y-4 text-xs text-slate-200 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-rose-400" /><div><h3 className="font-black text-base text-amber-300">Trung Tâm Tự Tra Lỗi, Phản Hồi Khách & Đóng Gói Bản Cập Nhật (.ZIP)</h3><p className="text-[11px] text-slate-400">Tự động gom lỗi hệ thống + phản hồi khách hàng trong ngày, đề xuất phương án sửa & xuất sẵn file ZIP cập nhật</p></div></div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(data.checks || []).map((c: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2">
                            {c.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                            <div><div className="font-bold text-slate-100">{c.name}</div><div className="text-[10.5px] text-slate-400">{c.detail}</div></div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center"><span className="font-bold text-rose-300">1. Lỗi hệ thống tự bắt được ({data.sysErrors?.length || 0})</span>{data.sysErrors?.length > 0 && <button type="button" onClick={clearSysErrors} className="text-[10.5px] text-slate-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"><Trash2 className="w-3 h-3" /> Xóa đã xử lý</button>}</div>
                        {(data.sysErrors || []).length === 0 ? <p className="text-emerald-400/90 text-[11px]">✓ Hôm nay chưa phát sinh lỗi kỹ thuật nào.</p> : data.sysErrors.map((e: any) => (
                            <div key={e.id} className="p-2 rounded-lg bg-rose-950/25 border border-rose-500/25 text-[11px]"><div className="font-bold text-rose-200">[{e.source}] {e.message} <span className="text-amber-300">({e.count}x)</span></div><div className="text-[10px] text-slate-400">{e.lastSeen} • {e.device}</div></div>
                        ))}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <span className="font-bold text-amber-300">2. Báo lỗi & Đề xuất từ khách hàng ({data.userBugs?.length || 0})</span>
                        {(data.userBugs || []).length === 0 ? <p className="text-slate-400 text-[11px]">✓ Chưa có phản hồi lỗi nào tồn đọng từ khách.</p> : data.userBugs.map((b: any) => (
                            <div key={b.id} className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/25 text-[11px]"><div className="font-bold text-amber-200">{b.name} ({b.kind === "bug" ? "Báo lỗi" : "Đề xuất"})</div><div className="text-slate-200">{b.content}</div><div className="text-[10px] text-slate-400">{b.createdAt} • {b.device}</div></div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <button type="button" disabled={busy} onClick={diagnoseAndBuildPatch} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold shadow cursor-pointer disabled:opacity-50">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}{busy ? "AI đang phân tích toàn bộ lỗi..." : `AI Chẩn Đoán & Đề Xuất Sửa (${totalIssues} mục)`}</button>
                    <button type="button" onClick={downloadUpdateZip} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/45 font-bold cursor-pointer"><Download className="w-4 h-4" /> Tải File Bản Cập Nhật (.ZIP)</button>
                </div>

                {diagnosis && <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/30 whitespace-pre-line leading-relaxed text-[12px] text-slate-200">{diagnosis}</div>}

                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/35 flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-cyan-400 shrink-0" /><div><div className="font-bold text-cyan-200">Thao tác 1-chạm sau khi tải file .ZIP về máy:</div><code className="text-[11px] text-amber-300 font-mono">{psCmd}</code></div></div>
                    <button type="button" onClick={copyCmd} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-bold cursor-pointer">{copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} {copiedCmd ? "Đã chép lệnh!" : "Sao chép lệnh chạy ngay"}</button>
                </div>
            </div>
        </div>
    );
}
