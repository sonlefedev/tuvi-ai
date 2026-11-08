// components/AppIntroCard.tsx
"use client";
import React, { useEffect, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Code2, Cpu, Info, UserCheck } from "lucide-react";
import { FEATURES, STEPS, TECH_STACK } from "@/lib/intro-data";

export default function AppIntroCard({ hasResult }: { hasResult: boolean }) {
    const [open, setOpen] = useState(true);

    useEffect(() => {
        if (hasResult) setOpen(false);
    }, [hasResult]);

    return (
        <section className="w-full max-w-5xl mx-auto mb-5 bg-slate-900/85 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div onClick={() => setOpen(!open)} className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 flex flex-wrap justify-between items-center gap-2 cursor-pointer select-none border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                    <img src="/avatar.jpg" alt="Lê Thanh Sơn" className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/70 shadow shrink-0" />
                    <div>
                        <h1 className="font-black text-base md:text-lg text-amber-300 tracking-wide">TỬ VI ĐẨU SỐ AI — LẬP LÁ SỐ & LUẬN GIẢI CHUYÊN SÂU</h1>
                        <p className="text-[11px] text-slate-400">Phát triển bởi <b className="text-slate-200">Lê Thanh Sơn</b> (@sonlefedev) • Đồng kiến trúc & tối ưu cùng <b className="text-purple-300">Gemini AI</b></p>
                    </div>
                </div>
                <button type="button" className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs text-amber-200 font-semibold">
                    {open ? <><ChevronUp className="w-3.5 h-3.5" /> Thu gọn giới thiệu</> : <><ChevronDown className="w-3.5 h-3.5" /> Giới thiệu & Hướng dẫn</>}
                </button>
            </div>

            {open && (
                <div className="p-5 space-y-4 text-xs text-slate-300 leading-relaxed">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="p-3 rounded-xl bg-slate-950/65 border border-slate-800">
                                <div className="font-bold text-amber-300 mb-1">✦ {f.title}</div>
                                <p className="text-[11.5px] text-slate-300">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                            <div className="font-bold text-cyan-400 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Cách thao tác nhanh</div>
                            {STEPS.map((s, i) => <p key={i} className="text-[11.5px]"><b className="text-amber-300">Bước {i + 1}:</b> {s}</p>)}
                        </div>
                        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                            <div className="font-bold text-amber-300 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Ghi chú học thuật</div>
                            <p className="text-[11.5px]">• Hệ thống an sao theo chuẩn <b>Nam Phái Việt Nam</b> kết hợp <b>Phi Tinh Tứ Hóa</b>.</p>
                            <p className="text-[11.5px]">• Luận cung cố định chỉ dùng sao bản mệnh; hỏi đáp AI dùng đủ sao lưu niên & đại vận.</p>
                            <p className="text-[11.5px] text-amber-200/90 italic pt-1">“Đức năng thắng số — Nhân định thắng thiên”.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-xl bg-slate-950/65 border border-slate-800 flex items-center gap-3.5">
                            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-emerald-400/70 shadow-lg shrink-0">
                                <img src="/avatar.jpg" alt="Lê Thanh Sơn" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1">
                                <div className="font-bold text-emerald-400 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> Người xây dựng: Lê Thanh Sơn</div>
                                <p className="text-[11.5px]">Người yêu thích nghiên cứu Tử Vi Đẩu Số, tự mày mò học hỏi và ứng dụng công nghệ AI để biến các phép an sao cổ điển thành công cụ trực quan, dễ tra cứu.</p>
                                <div className="flex gap-3 pt-0.5 text-[11px]">
                                    <a href="https://github.com/sonlefedev" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-semibold">GitHub: @sonlefedev ↗</a>
                                    <a href="https://github.com/sonlefedev/tuvi-ai" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline font-semibold">Mã nguồn: tuvi-ai ↗</a>
                                </div>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/25 space-y-1.5">
                            <div className="font-bold text-purple-300 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Công nghệ & Cách tổ chức Code (cùng Gemini AI)</div>
                            <p className="text-[11.5px]">Thiết kế, rà soát thuật toán và tối ưu kiến trúc cùng <b className="text-purple-200">Gemini AI</b> theo quy tắc <b className="text-amber-200">Modular Clean Code (mỗi file ≤ 100 dòng)</b>, tách độc lập lõi tính toán thiên văn, bộ nén token AI và giao diện.</p>
                            <div className="flex flex-wrap gap-1 pt-0.5">
                                {TECH_STACK.map((t, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono flex items-center gap-1"><Code2 className="w-2.5 h-2.5 text-purple-400" />{t}</span>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}