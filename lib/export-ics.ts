// lib/export-ics.ts
import { CungItem, ThienBanData } from "./types";

export function downloadMonthlyIcs(tb: ThienBanData, cungList: CungItem[], namXem: number) {
    const year = Number(namXem) || 2026;
    const events: string[] = [];
    for (let m = 1; m <= 12; m++) {
        const c = cungList.find((x) => x.nguyet_han === `T ${m}`);
        if (!c) continue;
        const mm = String(m).padStart(2, "0");
        const ct = c.chinh_tinh?.map((s) => `${s.ten}${s.trang_thai}`).join(", ") || "Vô chính diệu";
        const sl = [...(c.phu_tinh_tot || []), ...(c.phu_tinh_xau || [])].filter((s) => /^(L\.|ĐV\.)/.test(s)).join(", ");
        const desc = `Cung ${c.ten_cung.replace("<THÂN>", "[THÂN]")} (${c.can_cung}) | ${c.luu_cung} | ${c.dv_cung}\nChính tinh: ${ct}\nSao lưu: ${sl || "Không"}`;
        events.push(
            "BEGIN:VEVENT",
            `UID:tuvi-${year}-m${m}-${Date.now()}@tuvi-ai`,
            `DTSTAMP:${year}0101T000000Z`,
            `DTSTART;VALUE=DATE:${year}${mm}01`,
            `SUMMARY:Tử Vi Tháng ${m}/${year} (${c.ten_cung.replace("<THÂN>", "").trim()} - ${c.luu_cung})`,
            `DESCRIPTION:${desc.replace(/\n/g, "\\n")}`,
            "END:VEVENT"
        );
    }
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TuVi AI//VanHan//VI", ...events, "END:VCALENDAR"].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lich-van-han-${year}.ics`;
    a.click();
}
