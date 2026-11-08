// components/CungDetail.tsx
import { CungItem } from "@/lib/types";
import { phanTichCung } from "@/lib/luan-giai-cung";
import { Compass, Sparkles } from "lucide-react";

interface Props {
    cung: CungItem;
    cungList?: CungItem[];
    tongQuan?: { diem_manh: string; thach_thuc: string; loi_khuyen: string };
    namXem: number;
}

export default function CungDetail({ cung, cungList = [], namXem }: Props) {
    const info = phanTichCung(cung, cungList, namXem);

    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
                <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                    <h4 className="font-bold text-base text-purple-300">Cung {cung.ten_cung} ({cung.can_cung || cung.chi})</h4>
                    <span className="text-xs text-amber-300 font-mono">ĐV {cung.dai_van} • {cung.nguyet_han}</span>
                </div>

                {(cung.sao_luu?.length ?? 0) > 0 && (
                    <div>
                        <p className="text-xs text-pink-400 font-semibold mb-1">⭐ Sao Lưu năm {namXem}:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {cung.sao_luu?.map((s, idx) => (
                                <span key={idx} className="text-xs px-2 py-0.5 rounded bg-pink-500/15 text-pink-300 font-bold border border-pink-500/30">{s}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <p className="text-xs text-amber-400 font-semibold mb-1">Chính tinh:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {cung.chinh_tinh?.length > 0 ? cung.chinh_tinh.map((s, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">{s.ten} {s.trang_thai}</span>
                        )) : <span className="text-xs text-slate-400 italic">Vô chính diệu</span>}
                    </div>
                </div>

                <div>
                    <p className="text-xs text-emerald-400 font-semibold mb-1">Cát tinh ({cung.phu_tinh_tot?.length || 0}):</p>
                    <div className="flex flex-wrap gap-1">
                        {cung.phu_tinh_tot?.map((s, idx) => (
                            <span key={idx} className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{s}</span>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs text-red-400 font-semibold mb-1">Sát & Bại tinh ({cung.phu_tinh_xau?.length || 0}):</p>
                    <div className="flex flex-wrap gap-1">
                        {cung.phu_tinh_xau?.map((s, idx) => (
                            <span key={idx} className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">{s}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="md:col-span-2 space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Luận Giải Chi Tiết Cung {cung.ten_cung}
                </h4>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                    <p className="font-bold text-cyan-400 flex items-center gap-1.5"><Compass className="w-3.5 h-3.5" /> Tam Phương Tứ Chính & Phi Hóa:</p>
                    <p><b className="text-slate-200">Tam hợp:</b> {info.tamHopText}</p>
                    <p><b className="text-slate-200">Xung chiếu:</b> {info.xungChieuText}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {info.phiHoaList.map((p, i) => (
                            <span key={i} className={`px-2 py-0.5 rounded border text-[11px] ${p.label === "Hóa Kỵ" ? "bg-rose-950/50 border-rose-500/30 text-rose-300" : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"}`}>
                                {p.label} ({p.star}) → <b>{p.destName}</b>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                    <p className="font-bold text-amber-300 mb-0.5">Cách cục Chính Tinh:</p>
                    <p>{info.cotLoi}</p>
                </div>

                <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                    <p className="font-bold text-purple-300 mb-0.5">Hội tụ Cát – Sát & Vận Hạn {namXem}:</p>
                    <p>{info.tuongTac}</p>
                    <p className="mt-1 text-pink-200">{info.vanHan}</p>
                </div>
            </div>
        </div>
    );
}