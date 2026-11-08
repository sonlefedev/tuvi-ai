"use client";

import { useState } from "react";
import InputForm from "@/components/InputForm";
import LaSoBanCo from "@/components/LaSoBanCo";
import CungDetail from "@/components/CungDetail";
import { HoroscopeResult, CungItem } from "@/lib/types";

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
      <InputForm onGenerate={handleGenerate} loading={loading} />

      {result && (
        <div className="w-full max-w-4xl space-y-6 mt-4">
          <LaSoBanCo
            cungList={result.cung_12}
            thienBan={result.thien_ban}
            selectedChi={selectedCung?.chi || ""}
            onSelectCung={setSelectedCung}
          />
          {selectedCung && (
            <CungDetail cung={selectedCung} tongQuan={result.tong_quan} namXem={namXem} />
          )}
        </div>
      )}
    </main>
  );
}