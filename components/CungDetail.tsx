import { CungItem } from "@/lib/types";
import { Shield } from "lucide-react";

interface Props {
    cung: CungItem;
    tongQuan: { diem_manh: string; thach_thuc: string; loi_khuyen: string };
    namXem: number;
}

export default function CungDetail({ cung, tongQuan, namXem }: Props) {
    return (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
                <h4 className="font-bold text-base text-purple-300 border-b border-slate-800 pb-2 flex justify-between">
                    <span>Cung {cung.ten_cung} ({cung.chi})</span>
                    <span className="text-xs text-slate-400 font-normal">Đại vận {cung.dai_van} tuổi</span>
                </h4>

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
                        {cung.chinh_tinh?.map((s, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                                {s.ten} {s.trang_thai}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs text-emerald-400 font-semibold mb-1">Cát tinh ({cung.phu_tinh_tot?.length}):</p>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {cung.phu_tinh_tot?.map((s, idx) => (
                            <span key={idx} className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{s}</span>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs text-red-400 font-semibold mb-1">Sát & Bại tinh ({cung.phu_tinh_xau?.length}):</p>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {cung.phu_tinh_xau?.map((s, idx) => (
                            <span key={idx} className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">{s}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="md:col-span-2 space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" /> Luận Giải Vận Hạn Năm {namXem}
                </h4>
                <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                    <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/15">
                        <p className="font-bold text-emerald-400 mb-0.5">✨ Điểm sáng cốt cách:</p>
                        <p>{tongQuan.diem_manh}</p>
                    </div>
                    <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/15">
                        <p className="font-bold text-red-400 mb-0.5">⚠️ Biến động & Sao Lưu năm {namXem}:</p>
                        <p>{tongQuan.thach_thuc}</p>
                    </div>
                    <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/15">
                        <p className="font-bold text-purple-400 mb-0.5">💡 Lời khuyên định hướng:</p>
                        <p>{tongQuan.loi_khuyen}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}