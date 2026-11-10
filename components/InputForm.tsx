// components/InputForm.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
interface Props {
    onGenerate?: (formData: any) => void;
    onSuccess?: (data: any) => void;
    loading?: boolean;
    externalForm?: any;
}
export default function InputForm({ onGenerate, onSuccess, loading: propLoading, externalForm }: Props) {
    const [hoTen, setHoTen] = useState("");
    const [gioiTinh, setGioiTinh] = useState("Nam");
    const [ngay, setNgay] = useState("4");
    const [thang, setThang] = useState("8");
    const [nam, setNam] = useState("2004");
    const [gio, setGio] = useState("Dậu (17h-19h)");
    const [namXem, setNamXem] = useState("2026");
    const [localLoading, setLocalLoading] = useState(false);
    const loading = propLoading ?? localLoading;
    useEffect(() => {
        if (!externalForm) return;
        if (externalForm.hoTen) setHoTen(externalForm.hoTen);
        if (externalForm.gioiTinh) setGioiTinh(externalForm.gioiTinh);
        if (externalForm.ngay) setNgay(String(externalForm.ngay));
        if (externalForm.thang) setThang(String(externalForm.thang));
        if (externalForm.nam) setNam(String(externalForm.nam));
        if (externalForm.gio) setGio(externalForm.gio);
        if (externalForm.namXem) setNamXem(String(externalForm.namXem));
    }, [externalForm]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        const d = Math.min(31, Math.max(1, Number(ngay) || 1));
        const m = Math.min(12, Math.max(1, Number(thang) || 1));
        const y = Math.min(2100, Math.max(1900, Number(nam) || 2000));
        const nx = Math.max(y, Math.min(2100, Number(namXem) || 2026));
        setNgay(String(d)); setThang(String(m)); setNam(String(y)); setNamXem(String(nx));
        const payload = { hoTen: hoTen.trim() || "Đương số", gioiTinh, ngay: d, thang: m, nam: y, gio, namXem: nx };
        if (onGenerate) { onGenerate(payload); return; }
        setLocalLoading(true);
        try {
            const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Lỗi tạo lá số");
            if (onSuccess) onSuccess(data);
        } catch (err: any) {
            alert("Lỗi kết nối: " + (err?.message || "Không thể tải dữ liệu"));
        } finally {
            setLocalLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto p-4 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                    <label className="text-slate-400 block mb-1">Họ và tên</label>
                    <input placeholder="Nhập họ tên..." className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 placeholder:text-slate-600" value={hoTen} onChange={e => setHoTen(e.target.value)} />
                </div>
                <div>
                    <label className="text-slate-400 block mb-1">Giới tính</label>
                    <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100" value={gioiTinh} onChange={e => setGioiTinh(e.target.value)}>
                        <option>Nam</option><option>Nữ</option>
                    </select>
                </div>
                <div>
                    <label className="text-slate-400 block mb-1">Giờ sinh</label>
                    <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100" value={gio} onChange={e => setGio(e.target.value)}>
                        {["Tý (23h-01h)", "Sửu (01h-03h)", "Dần (03h-05h)", "Mão (05h-07h)", "Thìn (07h-09h)", "Tỵ (09h-11h)", "Ngọ (11h-13h)", "Mùi (13h-15h)", "Thân (15h-17h)", "Dậu (17h-19h)", "Tuất (19h-21h)", "Hợi (21h-23h)"].map(g => <option key={g}>{g}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-slate-400 block mb-1">Năm xem hạn</label>
                    <input type="number" min={1900} max={2100} className="w-full bg-slate-950 border border-rose-500/50 rounded p-2 text-rose-300 font-bold" value={namXem} onChange={e => setNamXem(e.target.value)} />
                </div>
                <div>
                    <label className="text-slate-400 block mb-1">Ngày sinh (DL)</label>
                    <input type="number" min={1} max={31} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100" value={ngay} onChange={e => setNgay(e.target.value)} />
                </div>
                <div>
                    <label className="text-slate-400 block mb-1">Tháng sinh (DL)</label>
                    <input type="number" min={1} max={12} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100" value={thang} onChange={e => setThang(e.target.value)} />
                </div>
                <div>
                    <label className="text-slate-400 block mb-1">Năm sinh (DL)</label>
                    <input type="number" min={1900} max={2100} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100" value={nam} onChange={e => setNam(e.target.value)} />
                </div>
            </div>
            <button type="submit" disabled={loading} aria-busy={loading} className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition duration-200 shadow-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Đang an sao & tính toán..." : "An sao & Tính toán"}
            </button>
        </form>
    );
}
