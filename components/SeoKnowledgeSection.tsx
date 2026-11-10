// components/SeoKnowledgeSection.tsx
"use client";
import React, { useState } from "react";
import { BookOpenCheck, Check, Copy, Share2 } from "lucide-react";
import { trackFeature } from "@/lib/analytics-client";

const FAQS = [
    { q: "Lập lá số Tử Vi Đẩu Số AI có miễn phí và chuẩn lịch Âm Dương không?", a: "Hoàn toàn miễn phí. Hệ thống sử dụng thuật toán chuyển đổi Âm – Dương lịch chuẩn thiên văn Hồ Ngọc Đức, an đầy đủ 14 Chính Tinh, hơn 90 Phụ Tinh, Tuần/Triệt, Ngũ Hành bản mệnh, Lưu Niên và Tứ Hóa theo cả Nam Phái lẫn Phi Tinh." },
    { q: "Đại Cẩm Nang Bản Đồ Cuộc Đời 8 Chương (~100.000 chữ) gồm những gì?", a: "AI tổng hợp toàn bộ 12 cung và 48 đường Phi Hóa thành cuốn sách minh họa 8 chương: Bản mệnh Ưu/Nhược điểm, Bản đồ Sự nghiệp & Tài lộc, Nhân duyên Gia đạo, Sức khỏe Nội tâm, Cẩm nang ứng xử từng nghịch cảnh, Điều nên tránh, Lộ trình 8 Đại Vận và Kim chỉ nam hành động." },
    { q: "Không nhớ chính xác giờ sinh thì xem Tử Vi bằng cách nào?", a: "Bạn dùng ngay tính năng Định Giờ Sinh Ngược (Rectification) trên trang: chọn 2–3 khung giờ nghi ngờ và nhập vài dấu mốc biến cố quá khứ để AI đối chiếu sao hạn và tìm ra giờ sinh khớp nhất." },
];

export default function SeoKnowledgeSection() {
    const [copied, setCopied] = useState(false);
    const shareUrl = "https://sonlexinchao-tuvi.netlify.app/?ref=viral_share";

    const copyLink = async () => {
        trackFeature("Chia sẻ link mời bạn bè");
        try { await navigator.clipboard.writeText(`Khám phá lá số Tử Vi Đẩu Số AI & Đại Cẩm Nang Cuộc Đời 8 chương miễn phí tại: ${shareUrl}`); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { }
    };

    const shareZaloOrFb = (platform: "fb" | "zalo") => {
        trackFeature(`Chia sẻ mạng xã hội (${platform.toUpperCase()})`);
        if (platform === "fb") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "noopener");
        else copyLink();
    };

    return (
        <section id="sec-seo-faq" className="w-full max-w-5xl mx-auto mt-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs text-slate-300">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <BookOpenCheck className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                        <h2 className="font-black text-sm text-amber-300 uppercase tracking-wide">Cẩm Nang Tử Vi Đẩu Số & Hỏi Đáp Nhanh (Chuẩn SEO)</h2>
                        <p className="text-[11px] text-slate-400">Chia sẻ công cụ hữu ích tới bạn bè & người thân để cùng khám phá bản đồ vận mệnh</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => shareZaloOrFb("fb")} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/35 font-bold cursor-pointer"><Share2 className="w-3.5 h-3.5" /> Chia sẻ Facebook</button>
                    <button type="button" onClick={copyLink} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/35 font-bold cursor-pointer">
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Đã chép link gửi Zalo/FB!" : "Chép link gửi Zalo / Bạn bè"}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FAQS.map((item, i) => (
                    <article key={i} className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800/90 space-y-1.5">
                        <h3 className="font-bold text-slate-100 text-[12px] leading-snug">{item.q}</h3>
                        <p className="text-[11.5px] text-slate-400 leading-relaxed">{item.a}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
