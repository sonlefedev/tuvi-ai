// lib/types.ts
export interface Star {
    ten: string;
    trang_thai?: string;
    dacTinh?: string;
}

export interface CungItem {
    chi: string;
    can_cung: string;
    luu_cung: string;
    ten_cung: string;
    nguyet_han?: string;
    dv_cung?: string;
    phi_hoa?: string;
    badges?: string[];
    chinh_tinh: Star[];
    phu_tinh_tot: string[];
    phu_tinh_xau: string[];
    sao_luu?: string[];
    trang_sinh?: string;
    dai_van?: number | string;
}

export interface ThienBanData {
    ho_ten: string;
    gioi_tinh: string;
    am_duong: string;
    am_duong_ly?: string;
    nam_sinh: string;
    nam_sinh_can_chi?: string;
    thang_sinh: string;
    ngay_sinh: string;
    gio_sinh: string;
    ban_menh: string;
    cuc: string;
    cuc_so?: string;
    menh_cuc?: string;
    than_cu: string;
    menh_chu: string;
    than_chu: string;
    nam_xem_han: number | string;
    nam_xem?: number | string;
    tuoi_mu?: number | string;
    sao_han?: string;
    cung_phi?: string;
}

export interface HoroscopeResult {
    thien_ban: ThienBanData;
    cung_12: CungItem[];
    tong_quan: { diem_manh: string; thach_thuc: string; loi_khuyen: string };
    badges?: any[];
}