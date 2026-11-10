// components/AuthBarAndModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import { BarChart3, BookmarkCheck, Cloud, CloudOff, KeyRound, Loader2, LogIn, LogOut, Megaphone, User, UserPlus, X } from "lucide-react";
import { getCurrentUser, isAdminUser, listLocalUsers, loginUser, logoutUser, registerUser, resetUserPassword, SavedChartEntry, UserAccount } from "@/lib/auth-store";
import AnalyticsDashboardModal from "./AnalyticsDashboardModal";
import AiMarketingModal from "./AiMarketingModal";

export default function AuthBarAndModal({ onLoadSavedChart }: { onLoadSavedChart: (c: SavedChartEntry) => void }) {
    const [user, setUser] = useState<UserAccount | null>(null);
    const [localList, setLocalList] = useState<UserAccount[]>([]);
    const [modalMode, setModalMode] = useState<"login" | "register" | "reset" | null>(null);
    const [showStats, setShowStats] = useState(false);
    const [showMarketing, setShowMarketing] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [syncState, setSyncState] = useState<{ status: string; detail: string }>({ status: "synced", detail: "" });

    useEffect(() => {
        const sync = () => { const cur = getCurrentUser(); setUser(cur); if (!isAdminUser(cur)) { setShowStats(false); setShowMarketing(false); } setLocalList(listLocalUsers()); };
        const onSyncEvt = (e: any) => setSyncState(e.detail || { status: "synced", detail: "" });
        sync();
        window.addEventListener("tuvi-auth-changed", sync);
        window.addEventListener("tuvi-sync-status", onSyncEvt);
        return () => { window.removeEventListener("tuvi-auth-changed", sync); window.removeEventListener("tuvi-sync-status", onSyncEvt); };
    }, []);

    const admin = isAdminUser(user);
    useEffect(() => {
        if (!admin) { setOnlineCount(0); return; }
        const ping = () => fetch(`/api/analytics?uid=${encodeURIComponent(user?.username || "")}`, { cache: "no-store" }).then((r) => r.json()).then((d) => setOnlineCount((d.liveVisitors || []).length)).catch(() => { });
        ping();
        const id = setInterval(ping, 12000);
        return () => clearInterval(id);
    }, [admin, user?.username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setErr("");
        try {
            const acc = modalMode === "register" ? await registerUser(displayName, username, password) : modalMode === "reset" ? await resetUserPassword(username, password) : await loginUser(username, password);
            setUser(acc); if (acc.savedCharts?.length > 0) onLoadSavedChart(acc.savedCharts[0]); setModalMode(null); setPassword("");
        } catch (e: any) { setErr(e?.message || "Thao tác thất bại"); }
    };

    return (
        <>
            <div className="w-full max-w-5xl mx-auto mb-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap justify-between items-center gap-2 text-xs">
                {user ? (
                    <>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black flex items-center justify-center uppercase">{user.displayName[0]}</span>
                            <span className="text-slate-200 font-bold">{user.displayName} <span className="text-slate-400 font-mono font-normal">(@{user.username})</span></span>
                            <span title={syncState.detail} className={`text-[10.5px] px-2 py-0.5 rounded border inline-flex items-center gap-1 ${syncState.status === "error" ? "bg-rose-500/15 text-rose-300 border-rose-500/40" : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"}`}>
                                {syncState.status === "syncing" ? <Loader2 className="w-3 h-3 animate-spin" /> : syncState.status === "error" ? <CloudOff className="w-3 h-3" /> : <Cloud className="w-3 h-3" />}
                                {syncState.status === "syncing" ? "Đang lưu Cloud..." : syncState.status === "error" ? "Lỗi Cloud" : "Cloud Realtime"}
                            </span>
                            {user.savedCharts.length > 0 && <div className="flex flex-wrap items-center gap-1 ml-1"><span className="text-[11px] text-slate-400 flex items-center gap-1"><BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> Đã lưu:</span>{user.savedCharts.slice(0, 4).map((c) => <button key={c.id} type="button" onClick={() => onLoadSavedChart(c)} className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-200 border border-slate-700 text-[11px] cursor-pointer">{c.hoTen} ({c.nam})</button>)}</div>}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {admin && <><button type="button" onClick={() => setShowMarketing(true)} className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-[11px] font-bold cursor-pointer"><Megaphone className="w-3.5 h-3.5" /> AI Quảng Cáo</button><button type="button" onClick={() => setShowStats(true)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 text-[11px] font-bold cursor-pointer"><BarChart3 className="w-3.5 h-3.5" /> Thống kê <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/25 text-emerald-300 text-[10px]">● {onlineCount}</span></button></>}
                            <button type="button" onClick={logoutUser} className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-[11px] font-semibold cursor-pointer"><LogOut className="w-3.5 h-3.5" /> Đăng xuất</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /><span className="text-slate-300">Đang dùng <b className="text-amber-300">Chế độ Khách</b> <span className="hidden sm:inline text-slate-400">(Đăng nhập để đồng bộ đa thiết bị)</span></span></div>
                        <div className="flex gap-1.5">
                            <button type="button" onClick={() => { setErr(""); setModalMode("login"); }} className="flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 font-bold text-[11px] cursor-pointer"><LogIn className="w-3.5 h-3.5" /> Đăng nhập</button>
                            <button type="button" onClick={() => { setErr(""); setModalMode("register"); }} className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold text-[11px] cursor-pointer"><UserPlus className="w-3.5 h-3.5" /> Đăng ký</button>
                        </div>
                    </>
                )}
            </div>
            {admin && showStats && <AnalyticsDashboardModal onClose={() => setShowStats(false)} />}
            {admin && showMarketing && <AiMarketingModal onClose={() => setShowMarketing(false)} />}
            {modalMode && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3 text-xs shadow-2xl">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5"><h3 className="font-black text-base text-amber-300">{modalMode === "login" ? "Đăng Nhập" : modalMode === "register" ? "Đăng Ký Tài Khoản" : "Đặt Lại Mật Khẩu"}</h3><button type="button" onClick={() => setModalMode(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button></div>
                        {modalMode !== "register" && localList.length > 0 && <div className="flex flex-wrap gap-1 items-center text-[11px] text-slate-400"><span>Tài khoản trên máy:</span>{localList.map((u) => <button key={u.id} type="button" onClick={() => setUsername(u.username)} className="px-2 py-0.5 rounded bg-slate-800 hover:bg-purple-500/20 text-purple-200 font-mono">@{u.username}</button>)}</div>}
                        {modalMode === "register" && <div><label className="text-slate-400 block mb-1">Tên hiển thị</label><input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="VD: Sơn Lê" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100" /></div>}
                        <div><label className="text-slate-400 block mb-1">Tên đăng nhập</label><input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="VD: sonle" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100" /></div>
                        <div><label className="text-slate-400 block mb-1">{modalMode === "reset" ? "Mật khẩu mới" : "Mật khẩu"}</label><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100" /></div>
                        {err && <p className="text-rose-400 font-semibold">{err}</p>}
                        <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold cursor-pointer">{modalMode === "login" ? "Đăng nhập" : modalMode === "register" ? "Tạo tài khoản" : "Lưu mật khẩu mới"}</button>
                        <div className="flex justify-between text-slate-400 pt-1">{modalMode === "login" ? <><button type="button" onClick={() => { setErr(""); setModalMode("reset"); }} className="text-cyan-300 hover:underline flex items-center gap-1"><KeyRound className="w-3 h-3" /> Quên mật khẩu?</button><button type="button" onClick={() => { setErr(""); setModalMode("register"); }} className="text-amber-300 font-bold underline">Đăng ký mới</button></> : <button type="button" onClick={() => { setErr(""); setModalMode("login"); }} className="text-purple-300 font-bold underline mx-auto">← Quay lại Đăng nhập</button>}</div>
                    </form>
                </div>
            )}
        </>
    );
}
