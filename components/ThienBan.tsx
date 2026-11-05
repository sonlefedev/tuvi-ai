import { ThienBanData } from "@/lib/types";

export default function ThienBan({ data }: { data: ThienBanData }) {
    return (
        <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div>
                <p className="text-[11px] text-slate-400">Đương số</p>
                <p className="font-bold text-base text-purple-300">{data.ho_ten}</p>
                <p className="text-xs text-slate-400">{data.gioi_tinh} - {data.am_duong}</p>
            </div>
            <div>
                <p className="text-[11px] text-slate-400">Năm sinh</p>
                <p className="font-bold text-base text-amber-300">{data.nam_sinh_can_chi}</p>
                <p className="text-xs text-slate-400">{data.ban_menh}</p>
            </div>
            <div>
                <p className="text-[11px] text-slate-400">Cục & Thân</p>
                <p className="font-bold text-base text-emerald-300">{data.cuc}</p>
                <p className="text-xs text-slate-400">{data.than_cu}</p>
            </div>
            <div>
                <p className="text-[11px] text-pink-400 font-semibold">Năm xem hạn</p>
                <p className="font-bold text-base text-pink-300">{data.nam_xem_han}</p>
                <p className="text-[11px] text-slate-400">Đã an 9 Sao Lưu</p>
            </div>
            <div className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Chính</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Cát</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Sát</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" />Lưu</span>
            </div>
        </div>
    );
}