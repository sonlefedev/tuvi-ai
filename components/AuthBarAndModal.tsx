// components/AuthBarAndModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import { BookmarkCheck, LogIn, LogOut, User, UserPlus, X } from "lucide-react";
import { getCurrentUser, loginUser, logoutUser, registerUser, SavedChartEntry, UserAccount } from "@/lib/auth-store";

export default function AuthBarAndModal({ onLoadSavedChart }: { onLoadSavedChart: (c: SavedChartEntry) => void }) {
    const [user, setUser] = useState<UserAccount | null>(null);
    const [modalMode, setModalMode] = useState<"login" | "register" | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    useEffect(() => {
        const sync = () => setUser(getCurrentUser());
        sync();
        window.addEventListener("tuvi-auth-changed", sync);
        return () => window.removeEventListener("tuvi-auth-changed", sync);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr("");
        try {
            const acc = modalMode === "register" ? await registerUser(displayName, username, password) : await loginUser(username, password);
            setUser(acc);
            setModalMode(null);
            setPassword("");
        } catch (e: any) {
            setErr(e?.message || "Thao tác thất bại");
        }
    };

    return (
        <>
            <div className="w-full max-w-5xl mx-auto mb-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap justify-between items-center gap-2 text-xs">
                {user ? (
                    <>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black flex items-center justify-center uppercase">{user.displayName[0]}</span>
                            <span className="text-slate-200 font-bold">{user.displayName}</span>
                            <span className="text-[10.5px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Tài khoản cá nhân</span>
                            {user.savedCharts.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 ml-1">
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1"><BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> Đã lưu:</span>
                                    {user.savedCharts.slice(0, 4).map((c) => (
                                        <button key={c.id} type="button" onClick={() => onLoadSavedChart(c)} className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-200 border border-slate-700 text-[11px] cursor-pointer">
                                            {c.hoTen} ({c.nam})
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="button" onClick={logoutUser} className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-[11px] font-semibold cursor-pointer">
                            <LogOut className="w-3.5 h-3.5" /> Đăng xuất (về Khách)
                        </button>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300">Đang dùng <b className="text-amber-300">Chế độ Khách</b> <span className="hidden sm:inline text-slate-400">(Đăng nhập để lưu danh sách lá số & ký ức riêng)</span></span>
                        </div>
                        <div className="flex gap-1.5">
                            <button type="button" onClick={() => { setErr(""); setModalMode("login"); }} className="flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 font-bold text-[11px] cursor-pointer">
                                <LogIn className="w-3.5 h-3.5" /> Đăng nhập
                            </button>
                            <button type="button" onClick={() => { setErr(""); setModalMode("register"); }} className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold text-[11px] cursor-pointer">
                                <UserPlus className="w-3.5 h-3.5" /> Đăng ký
                            </button>
                        </div>
                    </>
                )}
            </div>

            {modalMode && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3.5 text-xs shadow-2xl">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                            <h3 className="font-black text-base text-amber-300">{modalMode === "login" ? "Đăng Nhập Tài Khoản" : "Đăng Ký Tài Khoản Mới"}</h3>
                            <button type="button" onClick={() => setModalMode(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        {modalMode === "register" && (
                            <div><label className="text-slate-400 block mb-1">Tên hiển thị</label><input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="VD: Lê Thanh Sơn" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100" /></div>
                        )}
                        <div><label className="text-slate-400 block mb-1">Tên đăng nhập hoặc Email</label><input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="VD: sonlefedev" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100" /></div>
                        <div><label className="text-slate-400 block mb-1">Mật khẩu</label><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100" /></div>
                        {err && <p className="text-rose-400 font-semibold">{err}</p>}
                        <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold cursor-pointer">{modalMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</button>
                        <div className="text-center text-slate-400">
                            {modalMode === "login" ? <>Chưa có tài khoản? <button type="button" onClick={() => setModalMode("register")} className="text-amber-300 font-bold underline">Đăng ký ngay</button></> : <>Đã có tài khoản? <button type="button" onClick={() => setModalMode("login")} className="text-purple-300 font-bold underline">Đăng nhập</button></>}
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}