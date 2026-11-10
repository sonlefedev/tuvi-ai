// app/api/daily-seo-feed/route.ts
import { NextResponse } from "next/server";
import { getCanChiNam, getCanChiNgay } from "@/lib/tuvi/can-chi";
import { DAILY_CARDS } from "@/lib/intro-data";

export async function GET() {
    const site = "https://sonlexinchao-tuvi.netlify.app";
    const items = [0, 1, 2, 3, 4].map((offset) => {
        const d = new Date(Date.now() + 7 * 3600 * 1000 - offset * 86400 * 1000);
        const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
        const ccDay = getCanChiNgay(y, m, day);
        const ccYear = getCanChiNam(y);
        const card = DAILY_CARDS[(y + m + day) % DAILY_CARDS.length];
        const dateStr = `${String(day).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
        return `<item><title>Tử Vi Hôm Nay ${dateStr} (Ngày ${ccDay} • Năm ${ccYear}) — Cát Tinh ${card.star}</title><link>${site}/?utm_source=rss&amp;date=${y}-${m}-${day}</link><guid>${site}/daily-${y}-${m}-${day}</guid><pubDate>${d.toUTCString()}</pubDate><description>${card.msg} Màu cát tường: ${card.color}. Giờ hoàng đạo: ${card.hour}. Lập lá số Tử Vi Đẩu Số AI miễn phí tại ${site}.</description></item>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Tử Vi Đẩu Số AI — Dự Báo Vận Trình &amp; Cát Tinh Hằng Ngày</title><link>${site}</link><description>Lập lá số Tử Vi chuẩn cổ điển &amp; Đại Cẩm Nang Cuộc Đời 8 chương miễn phí</description><language>vi-vn</language>${items}</channel></rss>`;
    return new NextResponse(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
