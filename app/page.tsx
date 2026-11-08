"use client";

import { useState } from "react";
import AppIntroCard from "@/components/AppIntroCard";
import InputForm from "@/components/InputForm";
import LaSoBanCo from "@/components/LaSoBanCo";
import CungDetail from "@/components/CungDetail";
import TuviChartsPanel from "@/components/TuviChartsPanel";
import AiLuanPanel from "@/components/AiLuanPanel";
import SideQuickNav from "@/components/SideQuickNav";
import { HoroscopeResult, CungItem } from "@/lib/types";
import { setBaseTabTitle } from "@/lib/tab-notify";
import LifeMapBookPanel from "@/components/LifeMapBookPanel";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HoroscopeResult | null>(null);
  const [selectedCung, setSelectedCung] = useState<CungItem | null>(null);
  const [namXem, setNamXem] = useState(2026);

  const handleGenerate = async (formData: any) => {
    setLoading(true);
    setNamXem(formData.namXem);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <SideQuickNav hasResult={Boolean(result)} cungList={result?.cung_12 || []} selectedChi={selectedCung?.chi || ""} onSelectCung={setSelectedCung} />

      <div id="sec-intro" className="w-full"><AppIntroCard hasResult={Boolean(result)} /></div>
      <div id="sec-form" className="w-full"><InputForm onGenerate={handleGenerate} loading={loading} /></div>

      {result && (
        <div className="w-full max-w-5xl space-y-6 mt-4">
          <div id="sec-board">
            <LaSoBanCo cungList={result.cung_12} thienBan={result.thien_ban} selectedChi={selectedCung?.chi || ""} onSelectCung={setSelectedCung} />
          </div>
          <div id="sec-lifemap"><LifeMapBookPanel result={result} /></div>
          {selectedCung && (
            <div id="sec-cung">
              <CungDetail cung={selectedCung} cungList={result.cung_12} thienBan={result.thien_ban} tongQuan={result.tong_quan} namXem={namXem} />
            </div>
          )}
          <div id="sec-chart"><TuviChartsPanel result={result} /></div>
          <AiLuanPanel result={result} />
        </div>
      )}
    </main>
  );
}