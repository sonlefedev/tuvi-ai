// components/AnalyticsDashboardModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import { BarChart3, Clock, Download, Flame, RefreshCw, Smartphone, Users, X } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-store";

const SECTION_NAMES: Record<string, string> = {
    "sec-intro": "Giới thiệu & Gieo quẻ ngày", "sec-form": "Nhập ngày sinh & An sao", "sec-board": "Bàn cờ 12 cung & Tra cứu sao",
    "sec-timeline": "Timeline 12 tháng & Lịch .ICS", "sec-lifemap": "Đại Cẩm Nang 8 chương (~100k)", "sec-cung": "Luận cung chi tiết 5 phần",
    "sec-chart": "Biểu đồ AI 4 tầng", "sec-journal": "Nhật ký chiêm nghiệm", "sec-synastry": "Hợp lá số đôi",
    "sec-rectify": "Định giờ sinh ngược", "sec-chat": "Cửa sổ Chat Trợ lý AI",
};

const fmtDur = (sec: number) => (sec < 60 ? `${Math.round(sec)}s` : `${Math.floor(sec / 60)}p ${Math.round(sec % 60)}s`);

export default function AnalyticsDashboardModal({ onClose }: { onClose: () => void }) {
    const [days, setDays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try { const uid = getCurrentUser()?.username || ""; const r = await fetch(`/api/analytics?uid=${encodeURIComponent(uid)}`, { cache: "no-store" }); const j = await r.json(); setDays(j.days || []); } catch { }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const today = days[0] || { visits: 0, visitors: [], dwell: {}, features: {}, devices: {}, deviceModels: {}, recentSessions: [], sources: {} };
    const totalDwellToday = Object.values(today.dwell || {}).reduce((s: number, v: any) => s + Number(v || 0), 0);
    const avgSessionSec = today.visits > 0 ? Math.round(totalDwellToday / today.visits) : 0;
    const dwellRank = Object.entries(today.dwell || {}).map(([k, v]) => [SECTION_NAMES[k] || k, Number(v || 0)] as [string, number]).sort((a, b) => b[1] - a[1]);
    const featRank = Object.entries(today.features || {}).map(([k, v]) => [k, Number(v || 0)] as [string, number]).sort((a, b) => b[1] - a[1]);
    const modelRank = Object.entries(today.deviceModels || {}).map(([k, v]) => [k, Number(v || 0)] as [string, number]).sort((a, b) => b[1] - a[1]);
    const maxVisit7d = Math.max(1, ...days.map((d) => Number(d.visits || 0)));

    const exportCsv = () => {
        const rows = [["Ngay", "LuotGheTham", "KhachDuyNhat", "TongThoiGianGiay"], ...days.map((d) => [d.date, d.visits || 0, (d.visitors || []).length, Object.values(d.dwell || {}).reduce((s: number, v: any) => s + Number(v || 0), 0)])];
        const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\uFEFF" + rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8" })); a.download = `thong-ke-tuvi-${today.date || "today"}.csv`; a.click();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 text-xs text-slate-200 shadow-2xl">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-cyan-400" /><div><h3 className="font-black text-base text-amber-300">Đo Lường Lượt Ghé Thăm & Hành Vi Người Dùng</h3><p className="text-[11px] text-slate-400">Chế độ Quản trị viên (@sonlefedev) • Đồng bộ Supabase Cloud</p></div></div>
                    <div className="flex gap-2">
                        <button type="button" onClick={exportCsv} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 font-bold cursor-pointer"><Download className="w-3.5 h-3.5" /> CSV</button>
                        <button type="button" onClick={load} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"><RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Làm mới</button>
                        <button type="button" onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800"><div className="text-[11px] text-slate-400 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-amber-400" /> Lượt ghé hôm nay</div><div className="text-xl font-black text-amber-300 mt-1">{today.visits || 0}</div></div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800"><div className="text-[11px] text-slate-400 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-cyan-400" /> Khách duy nhất</div><div className="text-xl font-black text-cyan-300 mt-1">{(today.visitors || []).length}</div></div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800"><div className="text-[11px] text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-400" /> Nán lại TB / phiên</div><div className="text-xl font-black text-emerald-300 mt-1">{fmtDur(avgSessionSec)}</div></div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800"><div className="text-[11px] text-slate-400 flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-purple-400" /> Thiết bị & Nguồn</div><div className="text-[11px] font-bold text-purple-200 mt-1.5">{Object.entries(today.devices || {}).map(([k, v]) => `${k}: ${v}`).join(" • ") || "Chưa có"}</div><div className="text-[10px] text-slate-400 truncate">{Object.entries(today.sources || {}).map(([k, v]) => `${k} (${v})`).join(", ")}</div></div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2.5">
                    <div className="flex flex-wrap justify-between items-center gap-2"><span className="font-bold text-purple-300 flex items-center gap-1.5"><Smartphone className="w-4 h-4" /> Chi tiết dòng thiết bị & Nhật ký phiên truy cập hôm nay</span>{modelRank.length > 0 && <div className="flex flex-wrap gap-1.5">{modelRank.map(([m, c]) => <span key={m} className="px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 text-[11px] font-semibold">{m}: <b>{c}</b></span>)}</div>}</div>
                    {(today.recentSessions || []).length === 0 ? <p className="text-slate-500">Chưa có phiên mới kể từ khi bật ghi chi tiết thiết bị — hãy làm mới trang hoặc mở từ điện thoại để xem dòng máy hiển thị tại đây.</p> : (
                        <div className="max-h-36 overflow-y-auto divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-900/60">
                            {(today.recentSessions || []).map((s: any, i: number) => (
                                <div key={i} className="px-3 py-1.5 flex flex-wrap justify-between items-center gap-2 text-[11px]">
                                    <div className="flex items-center gap-2"><span className="font-mono text-amber-300">{s.time}</span><span className="font-bold text-slate-100">{s.device}</span>{s.screen && <span className="text-slate-400 font-mono">({s.screen})</span>}</div>
                                    <div className="flex items-center gap-1.5"><span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">{s.source}</span><span className={`px-2 py-0.5 rounded ${s.returning ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"}`}>{s.returning ? "Quay lại" : "Khách mới"}</span></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2">
                    <div className="font-bold text-slate-300">Xu hướng lượt ghé thăm 7 ngày gần nhất</div>
                    <div className="grid grid-cols-7 gap-2 items-end h-20 pt-2">
                        {[...days].reverse().map((d) => <div key={d.date} className="flex flex-col items-center gap-1"><span className="text-[10px] font-mono text-amber-300">{d.visits || 0}</span><div style={{ height: `${Math.max(8, Math.round(((d.visits || 0) / maxVisit7d) * 58))}px` }} className="w-full max-w-[34px] rounded-t-lg bg-gradient-to-t from-purple-600 to-cyan-400" /><span className="text-[10px] text-slate-400 font-mono">{(d.date || "").slice(5)}</span></div>)}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2"><div className="font-bold text-cyan-300 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Nán lại ở đâu lâu nhất (Hôm nay)</div>{dwellRank.length === 0 ? <p className="text-slate-500">Chưa có dữ liệu.</p> : dwellRank.map(([label, sec]) => <div key={label} className="space-y-1"><div className="flex justify-between text-[11px]"><span>{label}</span><span className="font-mono text-cyan-300">{fmtDur(sec)}</span></div><div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div style={{ width: `${Math.min(100, Math.round((sec / (dwellRank[0][1] || 1)) * 100))}%` }} className="h-full bg-cyan-400" /></div></div>)}</div>
                    <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2"><div className="font-bold text-amber-300 flex items-center gap-1.5"><Flame className="w-4 h-4" /> Phần nào được dùng nhiều nhất (Hôm nay)</div>{featRank.length === 0 ? <p className="text-slate-500">Chưa có dữ liệu.</p> : featRank.map(([label, cnt]) => <div key={label} className="space-y-1"><div className="flex justify-between text-[11px]"><span>{label}</span><span className="font-mono text-amber-300">{cnt} lượt</span></div><div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div style={{ width: `${Math.min(100, Math.round((cnt / (featRank[0][1] || 1)) * 100))}%` }} className="h-full bg-amber-400" /></div></div>)}</div>
                </div>
            </div>
        </div>
    );
}
