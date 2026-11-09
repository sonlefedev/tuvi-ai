// @ts-nocheck
// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { solarToLunar } from "@/lib/tuvi/am-lich";
import { DIA_CHI, THIEN_CAN, getVitriMenh, getVitriThan, getCucSo, getCanCungBanDau } from "@/lib/tuvi/can-chi";
import { getTuViPos, an14ChinhTinh } from "@/lib/tuvi/chinh-tinh";
import { anDayDuPhuTinh } from "@/lib/tuvi/phu-tinh";
import { tinhSaoLuu, parseHour } from "@/lib/sao-luu";
import { getDacTinh, ganDacTinhPhuTinh } from "@/lib/dac-tinh";
import { anTuHoa } from "@/lib/tu-hoa";
import { getTuanCung, getTrietCung } from "@/lib/boundary";
import { getNapAm, getMenhChu, getThanChu, getCungPhi, getSaoHan, getMenhCucTuongQuan } from "@/lib/nap-am";

const CUNG_NAMES = ["MỆNH", "PHỤ MẪU", "PHÚC ĐỨC", "ĐIỀN TRẠCH", "QUAN LỘC", "NÔ BỘC", "THIÊN DI", "TẬT ÁCH", "TÀI BẠCH", "TỬ TỨC", "PHU THÊ", "HUYNH ĐỆ"];
const PHI_HOA_MAP: Record<string, [string, string, string, string]> = {
  "Giáp": ["Liêm", "Phá", "Vũ", "Dương"], "Ất": ["Cơ", "Lương", "Vi", "Âm"],
  "Bính": ["Đồng", "Cơ", "Xương", "Liêm"], "Đinh": ["Âm", "Đồng", "Cơ", "Cự"],
  "Mậu": ["Tham", "Âm", "Bật", "Cơ"], "Kỷ": ["Vũ", "Tham", "Lương", "Khúc"],
  "Canh": ["Dương", "Vũ", "Âm", "Đồng"], "Tân": ["Cự", "Dương", "Khúc", "Xương"],
  "Nhâm": ["Lương", "Vi", "Phù", "Vũ"], "Quý": ["Phá", "Cự", "Âm", "Tham"]
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const hoTen = body.hoTen || body.name || "Đương số", isNam = (body.gioiTinh || body.gender) === "Nam" || body.gioiTinh === "male";
    const ngayD = Number(body.ngay || body.day) || 1, thangD = Number(body.thang || body.month) || 1, namD = Number(body.nam || body.year) || 2000;
    const nxNum = Number(body.namXem || body.namxem) || 2026, gioChiIdx = Math.floor(parseHour(body.gio || body.gioSinh) / 2) % 12;

    const lunar = solarToLunar(ngayD, thangD, namD);
    const cSIdx = ((lunar.year - 4) % 10 + 10) % 10, chSIdx = ((lunar.year - 4) % 12 + 12) % 12;
    const isDuong = cSIdx % 2 === 0, isDuongNam = (isDuong && isNam) || (!isDuong && !isNam);

    const vtMenh = getVitriMenh(lunar.month, gioChiIdx), vtThan = getVitriThan(lunar.month, gioChiIdx);
    const { cucNum, cucName } = getCucSo(cSIdx, vtMenh);
    const tuViPos = getTuViPos(cucNum, lunar.day);
    const chinhTinhMap = an14ChinhTinh(tuViPos);
    const { tot: phuTot, xau: phuXau, trangSinhRes } = anDayDuPhuTinh(cSIdx, chSIdx, lunar.month, gioChiIdx, cucNum, isDuongNam, lunar.day, vtMenh, vtThan);

    const cIdx = ((nxNum - 4) % 10 + 10) % 10, chIdx = ((nxNum - 4) % 12 + 12) % 12;
    const { canChiNamXem, saoLuuMap, daiVanMap, luuCungMap, dvCungMap, nguyetHanMap, dvCan, tieuHanChi } = tinhSaoLuu(nxNum, lunar.year, isNam, vtMenh, cucNum, lunar.month, gioChiIdx);
    const tuan = getTuanCung(cSIdx, chSIdx, DIA_CHI) || [], triet = getTrietCung(cSIdx, DIA_CHI) || [];
    const lTuan = getTuanCung(cIdx, chIdx, DIA_CHI) || [], lTriet = getTrietCung(cIdx, DIA_CHI) || [];

    const cung12 = DIA_CHI.map((chi, idx) => {
      const tenCungGoc = CUNG_NAMES[(idx - vtMenh + 120) % 12], badges: string[] = [];
      if (tuan.includes(chi)) badges.push("Tuần");
      if (triet.includes(chi)) badges.push("Triệt");
      if (lTuan.includes(chi) && lTriet.includes(chi)) badges.push("L.Tuần - L.Triệt");
      else { if (lTuan.includes(chi)) badges.push("L.Tuần"); if (lTriet.includes(chi)) badges.push("L.Triệt"); }
      if (chi === tieuHanChi) badges.push("Tiểu Hạn");

      const canCung = getCanCungBanDau(cSIdx, idx), canName = canCung.split(".")[0];
      const phiH = PHI_HOA_MAP[canName] || ["", "", "", ""];
      const ct = (chinhTinhMap[chi] || []).map(s => ({ ten: s, trang_thai: getDacTinh(s, chi) }));
      const luu = saoLuuMap[chi] || { tot: [], xau: [] };
      return {
        chi, can_cung: canCung, luu_cung: luuCungMap[chi] || "",
        ten_cung: idx === vtThan ? `${tenCungGoc} <THÂN>` : tenCungGoc,
        nguyet_han: nguyetHanMap[chi] || "", dv_cung: dvCungMap[chi] || "", badges,
        chinh_tinh: ct,
        phu_tinh_tot: [...(phuTot[chi] || []).map(s => ganDacTinhPhuTinh(s, chi)), ...(luu.tot || [])],
        phu_tinh_xau: [...(phuXau[chi] || []).map(s => ganDacTinhPhuTinh(s, chi)), ...(luu.xau || [])],
        sao_luu: [...(luu.tot || []), ...(luu.xau || [])],
        trang_sinh: trangSinhRes[chi] || "", dai_van: daiVanMap[chi] || 0,
        phi_loc: phiH[0], phi_ky: phiH[3],
        phi_hoa_full: `Tứ Hóa cung ${canCung}: Lộc [${phiH[0]}] • Quyền [${phiH[1]}] • Khoa [${phiH[2]}] • Kỵ [${phiH[3]}]`
      };
    });

    anTuHoa(THIEN_CAN[cSIdx], "", cung12);
    anTuHoa(canChiNamXem?.split(" ")[0] || "", "L.", cung12);
    anTuHoa(dvCan || "", "ĐV.", cung12);

    const canChiNam = `${THIEN_CAN[cSIdx]} ${DIA_CHI[chSIdx]}`, banMenh = getNapAm(canChiNam), tuoiMu = nxNum - lunar.year + 1;
    const gioText = String(body.gio || body.gioSinh || "");
    const thienBan = {
      ho_ten: hoTen, gioi_tinh: isNam ? "Nam" : "Nữ", am_duong: isDuong ? (isNam ? "Dương Nam" : "Dương Nữ") : (isNam ? "Âm Nam" : "Âm Nữ"),
      am_duong_ly: isDuongNam ? "Âm Dương thuận lý" : "Âm Dương nghịch lý", nam_sinh: `${canChiNam} (${lunar.year})`, nam_sinh_can_chi: canChiNam,
      thang_sinh: `Tháng ${lunar.month} Âm lịch`, ngay_sinh: `Ngày ${lunar.day} Âm lịch`,
      gio_sinh: gioText.includes("(") ? gioText : `${DIA_CHI[gioChiIdx]} (${gioText || ""})`,
      ban_menh: banMenh, cuc: cucName, cuc_so: cucName, menh_cuc: getMenhCucTuongQuan(banMenh, cucName),
      than_cu: `Thân cư ${CUNG_NAMES[(vtThan - vtMenh + 120) % 12]}`, menh_chu: getMenhChu(DIA_CHI[chSIdx]), than_chu: getThanChu(DIA_CHI[chSIdx]),
      nam_xem_han: nxNum, nam_xem: nxNum, tuoi_mu: tuoiMu, sao_han: getSaoHan(tuoiMu, isNam), cung_phi: getCungPhi(namD, isNam),
      dai_van_hien_tai: (() => { const dv = cung12.find(c => c.dv_cung === "ĐV.MỆNH"); return dv ? `${dv.dai_van}–${Number(dv.dai_van) + 9}t (${dv.can_cung})` : ""; })(),
      tieu_van_cung: (() => { const tv = cung12.find(c => c.chi === tieuHanChi); return tv ? `${tv.can_cung} (${tv.ten_cung.replace("<THÂN>", "").trim()})` : tieuHanChi; })()
    };

    const tongQuan = {
      diem_manh: `Mệnh an tại ${DIA_CHI[vtMenh]}, ${banMenh}, ${cucName}. Đương số có ý chí kiên định, nhiều cát tinh phò trợ.`,
      thach_thuc: `Năm ${nxNum} (${canChiNamXem}) bước vào tuổi ${tuoiMu} (sao ${getSaoHan(tuoiMu, isNam)} chiếu mệnh), chú ý các tháng biến động tài chính.`,
      loi_khuyen: "Nên giữ tâm thế tích cực, cẩn trọng trong các quyết định ký kết đầu tư lớn và chăm lo sức khỏe bản thân."
    };

    const payload = { thien_ban: thienBan, thienBan, cung_12: cung12, cung: cung12, cung12, tong_quan: tongQuan, badges: [] };
    return NextResponse.json({ success: true, status: "success", data: payload, ...payload });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Lỗi tính toán" }, { status: 500 });
  }
}