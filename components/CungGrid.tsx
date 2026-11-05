import { CungItem } from "@/lib/types";

interface Props {
    cungList: CungItem[];
    selectedChi: string;
    onSelect: (cung: CungItem) => void;
}

export default function CungGrid({ cungList, selectedChi, onSelect }: Props) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cungList.map((cung) => {
                const isSelected = selectedChi === cung.chi;
                return (
                    <div
                        key={cung.chi}
                        onClick={() => onSelect(cung)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between min-h-[175px] ${isSelected
                                ? "bg-purple-950/40 border-purple-500 shadow-xl shadow-purple-500/20 ring-1 ring-purple-500"
                                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                            }`}
                    >
                        <div className="flex justify-between items-start border-b border-slate-800/80 pb-1 mb-1">
                            <span className="font-bold text-sm text-purple-200">
                                {cung.ten_cung} <span className="text-xs text-slate-400">({cung.chi})</span>
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">{cung.dai_van}t</span>
                        </div>

                        <div className="space-y-0.5">
                            {cung.chinh_tinh?.length > 0 ? (
                                cung.chinh_tinh.map((s, idx) => (
                                    <div key={idx} className="text-xs font-bold text-amber-300 flex justify-between">
                                        <span>★ {s.ten}</span>
                                        <span className="text-[10px] text-slate-400">{s.trang_thai}</span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-[11px] text-slate-600 italic">Vô chính diệu</span>
                            )}
                        </div>

                        <div className="my-1 space-y-0.5 text-[11px]">
                            {cung.phu_tinh_tot?.length > 0 && (
                                <p className="text-emerald-400/90 truncate">{cung.phu_tinh_tot.slice(0, 3).join(", ")}</p>
                            )}
                            {cung.phu_tinh_xau?.length > 0 && (
                                <p className="text-red-400/90 truncate">{cung.phu_tinh_xau.slice(0, 3).join(", ")}</p>
                            )}
                        </div>

                        <div className="pt-1 border-t border-slate-800/60 flex flex-wrap gap-1">
                            {cung.sao_luu?.map((sl, sIdx) => (
                                <span key={sIdx} className="text-[10px] px-1 py-0.2 rounded bg-pink-500/15 text-pink-300 font-bold border border-pink-500/30">
                                    {sl}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}