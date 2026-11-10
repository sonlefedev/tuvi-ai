// lib/ai/stream-client.ts
function extractTag(raw: string, tag: string, next: string[]): string {
    const s = raw.indexOf(tag);
    if (s === -1) return "";
    const after = raw.slice(s + tag.length);
    const ends = next.map((t) => after.indexOf(t)).filter((i) => i !== -1);
    return (ends.length > 0 ? after.slice(0, Math.min(...ends)) : after).trim();
}

export async function streamAiEndpoint(url: string, payload: any, onStep: (step: string) => void, onChunk?: (partialText: string) => void): Promise<any> {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Lỗi kết nối máy chủ AI");
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "", finalData: any = null, lastChunk = "", lastRaw = "";

    const handleLine = (line: string) => {
        if (!line.trim()) return;
        const evt = JSON.parse(line);
        if (evt.type === "step") onStep(evt.text);
        else if (evt.type === "chunk") { lastChunk = evt.text || lastChunk; lastRaw = evt.raw || lastRaw; onChunk?.(evt.text); }
        else if (evt.type === "done") finalData = evt.data;
        else if (evt.type === "error") throw new Error(evt.error);
    };

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) handleLine(line);
    }
    if (buffer.trim()) handleLine(buffer);
    if (!finalData && lastRaw.includes("[P1]")) {
        return { reading: { chinhTinhBanCung: extractTag(lastRaw, "[P1]", ["[P2]"]), phuTinhTuongTac: extractTag(lastRaw, "[P2]", ["[P3]"]), tamHopXungChieu: extractTag(lastRaw, "[P3]", ["[P4]"]), nhiHopGiapPhiHoa: extractTag(lastRaw, "[P4]", ["[P5]"]), ducKetLoiKhuyen: extractTag(lastRaw, "[P5]", ["[MEM]"]) }, memoryNote: "" };
    }
    if (!finalData && lastRaw.includes("[FB]")) {
        return { fb: extractTag(lastRaw, "[FB]", ["[ZALO]", "[TIKTOK]", "[BLOG]", "[POSTER]"]), zalo: extractTag(lastRaw, "[ZALO]", ["[TIKTOK]", "[BLOG]", "[POSTER]"]), tiktok: extractTag(lastRaw, "[TIKTOK]", ["[BLOG]", "[POSTER]"]), blog: extractTag(lastRaw, "[BLOG]", ["[POSTER]"]), posterLines: [] };
    }
    if (!finalData && lastRaw.length >= 600) {
        const cleanRaw = lastRaw.split("[MEM]")[0].trim();
        return { content: cleanRaw, reply: cleanRaw, answer: cleanRaw, memoryNote: "" };
    }
    if (!finalData && lastChunk.length >= 250) return { reply: lastChunk, answer: lastChunk };
    if (!finalData) throw new Error("Máy chủ AI đang bận, vui lòng bấm thử lại!");
    return finalData;
}
