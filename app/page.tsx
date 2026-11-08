"use client";

import { useState } from "react";
import AppIntroCard from "@/components/AppIntroCard";
import InputForm from "@/components/InputForm";
import LaSoBanCo from "@/components/LaSoBanCo";
import LifeMapBookPanel from "@/components/LifeMapBookPanel";
import CungDetail from "@/components/CungDetail";
import TuviChartsPanel from "@/components/TuviChartsPanel";
import AiLuanPanel from "@/components/AiLuanPanel";
import SideQuickNav from "@/components/SideQuickNav";
import { HoroscopeResult, CungItem } from "@/lib/types";
import { setBaseTabTitle } from "@/lib/tab-notify";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HoroscopeResult | null>(null);
  const [selectedCung, setSelectedCung] = useState<CungItem | null>(null);
  const [namXem, setNamXem] = useState(2026);
  const [toastCung, setToastCung] = useState<string>("");

  const handleGenerate = async (formData: any) => {
    setLoading(true);
    setNamXem(formData.namXem);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setSelectedCung(data.data.cung_12[0]);
        setBaseTabTitle(data.data.thien_ban?.ho_ten, formData.namXem);
      } else {
        alert(data.error || "Lỗi");
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCung = (c: CungItem) => {
    setSelectedCung(c);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setToastCung(`${c.ten_cung.replace("<THÂN>", "").trim()} (${c.chi})`);
      setTimeout(() => setToastCung(""), 4000);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      {toastCung && (
        <button type="button" onClick={() => { setToastCung(""); document.getElementById("sec-cung")?.scrollIntoView({ behavior: "smooth" }); }} className="md:hidden fixed top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-2xl">
          Đã chọn cung {toastCung} • Xem luận giải ↓
        </button>
      )}

      <SideQuickNav hasResult={Boolean(result)} cungList={result?.cung_12 || []} selectedChi={selectedCung?.chi || ""} onSelectCung={handleSelectCung} />
      <div id="sec-intro" className="w-full"><AppIntroCard hasResult={Boolean(result)} /></div>
      <div id="sec-form" className="w-full"><InputForm onGenerate={handleGenerate} loading={loading} /></div>

      {result && (
        <div className="w-full max-w-5xl space-y-6 mt-4">
          <div id="sec-board"><LaSoBanCo cungList={result.cung_12} thienBan={result.thien_ban} selectedChi={selectedCung?.chi || ""} onSelectCung={handleSelectCung} /></div>
          <div id="sec-lifemap"><LifeMapBookPanel result={result} /></div>
          {selectedCung && <div id="sec-cung"><CungDetail cung={selectedCung} cungList={result.cung_12} thienBan={result.thien_ban} tongQuan={result.tong_quan} namXem={namXem} /></div>}
          <div id="sec-chart"><TuviChartsPanel result={result} /></div>
          <AiLuanPanel result={result} />
        </div>
      )}
    </main>
  );
}