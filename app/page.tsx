"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import AuthBarAndModal from "@/components/AuthBarAndModal"; import AnalyticsTracker from "@/components/AnalyticsTracker";
import StarfieldBg from "@/components/StarfieldBg"; import AppIntroCard from "@/components/AppIntroCard";
import DailyFortuneWidget from "@/components/DailyFortuneWidget"; import InputForm from "@/components/InputForm";
import LaSoBanCo from "@/components/LaSoBanCo"; import StarLookupModal from "@/components/StarLookupModal";
import MonthlyTimelinePanel from "@/components/MonthlyTimelinePanel";
import LifeMapBookPanel from "@/components/LifeMapBookPanel";
import CungDetail from "@/components/CungDetail";
import TuviChartsPanel from "@/components/TuviChartsPanel";
import DestinyJournalPanel from "@/components/DestinyJournalPanel";
import SynastryPanel from "@/components/SynastryPanel";
import BirthHourRectifyPanel from "@/components/BirthHourRectifyPanel";
import AiLuanPanel from "@/components/AiLuanPanel";
import DataFlowPanel from "@/components/DataFlowPanel";
import SideQuickNav from "@/components/SideQuickNav";
import DailySeoArticleBanner from "@/components/DailySeoArticleBanner";
import SeoKnowledgeSection from "@/components/SeoKnowledgeSection"; import FeedbackAndCommentsPanel from "@/components/FeedbackAndCommentsPanel";
import { HoroscopeResult, CungItem } from "@/lib/types";
import { compressLaSoToText } from "@/lib/ai/compress-laso";
import { getCurrentUser, saveChartToAccount, SavedChartEntry } from "@/lib/auth-store";
import { setBaseTabTitle } from "@/lib/tab-notify";
import { buildChartKey } from "@/lib/ai/tuvi-memory-store";
import { pullProfileFromCloud, pushProfileToCloud } from "@/lib/ai/cloud-profile-sync";
import { createDataFlowId, emitDataFlowTrace, summarizeDataFlowPayload } from "@/lib/data-flow-trace";
export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HoroscopeResult | null>(null);
  const [lastForm, setLastForm] = useState<any>(null);
  const [selectedCung, setSelectedCung] = useState<CungItem | null>(null);
  const [namXem, setNamXem] = useState(2026);
  const [toastCung, setToastCung] = useState("");
  const [inspectedStar, setInspectedStar] = useState<{ name: string; cung: string } | null>(null);
  const [aiQueuedPrompt, setAiQueuedPrompt] = useState("");
  const bootedUidRef = useRef<string | null>(null);
  const compactChart = useMemo(() => result ? compressLaSoToText(result.thien_ban, result.cung_12) : "", [result]);
  const handleGenerate = async (formData: any, isRemoteLoad = false) => {
    const flowId = createDataFlowId();
    emitDataFlowTrace({ flowId, stage: "browser", status: "success", title: isRemoteLoad ? "Nạp lá số đã lưu" : "Nhận dữ liệu từ biểu mẫu", detail: "Chuẩn bị yêu cầu lập lá số.", payload: summarizeDataFlowPayload(formData) });
    setLoading(true); setNamXem(formData.namXem); setLastForm(formData);
    try {
      emitDataFlowTrace({ flowId, stage: "api", status: "active", title: "Gửi yêu cầu lập lá số", detail: "POST /api/generate", payload: summarizeDataFlowPayload(formData) });
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (data.success) {
        emitDataFlowTrace({ flowId, stage: "api", status: "success", title: "API đã phản hồi", detail: `POST /api/generate · HTTP ${res.status}` });
        emitDataFlowTrace({ flowId, stage: "calculation", status: "success", title: "Máy chủ đã an sao", detail: `Nhận kết quả lá số gồm ${data.data?.cung_12?.length || 0} cung và thiên bàn.`, payload: summarizeDataFlowPayload(data.data) });
        const ck = buildChartKey(data.data.thien_ban);
        await pullProfileFromCloud(ck);
        setResult(data.data); setSelectedCung(data.data.cung_12[0]); setBaseTabTitle(data.data.thien_ban?.ho_ten, formData.namXem);
        if (!isRemoteLoad) { await pushProfileToCloud(ck, formData); await saveChartToAccount(formData); }
      } else {
        emitDataFlowTrace({ flowId, stage: "api", status: "error", title: "Lập lá số thất bại", detail: data.error || "Máy chủ không trả được kết quả." });
        alert(data.error || "Lỗi");
      }
    } catch (err: any) {
      emitDataFlowTrace({ flowId, stage: "api", status: "error", title: "Không kết nối được API", detail: err?.message || "Lỗi kết nối." });
      alert("Lỗi kết nối: " + err.message);
    }
    finally { setLoading(false); }
  };
  useEffect(() => {
    const syncInitial = async () => {
      const u = getCurrentUser();
      if (!u) { bootedUidRef.current = null; return; }
      if (bootedUidRef.current === u.id) return;
      bootedUidRef.current = u.id;
      const target = (await pullProfileFromCloud()) || u.savedCharts?.[0];
      if (target) handleGenerate(target, true);
    };
    syncInitial();
    window.addEventListener("tuvi-auth-changed", syncInitial);
    return () => window.removeEventListener("tuvi-auth-changed", syncInitial);
  }, []);
  useEffect(() => {
    if (!result) return;
    const ck = buildChartKey(result.thien_ban);
    const poll = () => { if (!document.hidden && getCurrentUser()) pullProfileFromCloud(ck, false); };
    const id = setInterval(poll, 2000);
    window.addEventListener("focus", poll); document.addEventListener("visibilitychange", poll);
    return () => { clearInterval(id); window.removeEventListener("focus", poll); document.removeEventListener("visibilitychange", poll); };
  }, [result]);
  const handleSelectCung = (c: CungItem) => {
    setSelectedCung(c);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setToastCung(`${c.ten_cung.replace("<THÂN>", "").trim()} (${c.chi})`);
      setTimeout(() => setToastCung(""), 4000);
    }
  };
  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <AnalyticsTracker /><StarfieldBg /><DataFlowPanel />
      {toastCung && <button type="button" onClick={() => { setToastCung(""); document.getElementById("sec-cung")?.scrollIntoView({ behavior: "smooth" }); }} className="md:hidden fixed top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-2xl">Đã chọn cung {toastCung} • Xem luận giải ↓</button>}
      <AuthBarAndModal onLoadSavedChart={(c: SavedChartEntry) => handleGenerate(c)} />
      <SideQuickNav hasResult={Boolean(result)} cungList={result?.cung_12 || []} selectedChi={selectedCung?.chi || ""} onSelectCung={handleSelectCung} />
      <div id="sec-intro" className="relative z-10 w-full"><AppIntroCard hasResult={Boolean(result)} /><DailyFortuneWidget onAskAi={result ? setAiQueuedPrompt : undefined} /></div>
      <div id="sec-form" className="relative z-10 w-full"><InputForm onGenerate={(f) => handleGenerate(f, false)} loading={loading} externalForm={lastForm} /></div>
      {result && (
        <div className="relative z-10 w-full max-w-5xl space-y-6 mt-4">
          <div id="sec-board"><LaSoBanCo cungList={result.cung_12} thienBan={result.thien_ban} selectedChi={selectedCung?.chi || ""} onSelectCung={handleSelectCung} onInspectStar={(name: string, cung: string) => setInspectedStar({ name, cung })} /></div>
          <MonthlyTimelinePanel cungList={result.cung_12} thienBan={result.thien_ban} namXem={namXem} onSelectCung={handleSelectCung} onAskAi={setAiQueuedPrompt} />
          <div id="sec-lifemap"><LifeMapBookPanel result={result} compactChart={compactChart} /></div>
          {selectedCung && <div id="sec-cung"><CungDetail cung={selectedCung} cungList={result.cung_12} thienBan={result.thien_ban} compactChart={compactChart} tongQuan={result.tong_quan} namXem={namXem} /></div>}
          <div id="sec-chart"><TuviChartsPanel result={result} compactChart={compactChart} /></div>
          <DestinyJournalPanel thienBan={result.thien_ban} />
          <SynastryPanel resultA={result} compactChart={compactChart} />
          {lastForm && <BirthHourRectifyPanel baseForm={lastForm} thienBan={result.thien_ban} onApplyHour={(h) => handleGenerate({ ...lastForm, gio: h }, false)} />}
          <div id="sec-chat"><AiLuanPanel result={result} compactChart={compactChart} selectedCung={selectedCung} externalPrompt={aiQueuedPrompt} onConsumedPrompt={() => setAiQueuedPrompt("")} /></div>
        </div>
      )}
      <div className="relative z-10 w-full"><DailySeoArticleBanner /><SeoKnowledgeSection /><FeedbackAndCommentsPanel /></div>
      <StarLookupModal starName={inspectedStar?.name || null} cungContext={inspectedStar?.cung} onClose={() => setInspectedStar(null)} onAskAi={setAiQueuedPrompt} />
    </main>
  );
}
