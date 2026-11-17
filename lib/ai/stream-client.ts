// lib/ai/stream-client.ts
import { createDataFlowId, emitDataFlowTrace, summarizeDataFlowPayload } from "../data-flow-trace";

function extractTag(raw: string, tag: string, next: string[]): string {
    const s = raw.indexOf(tag);
    if (s === -1) return "";
    const after = raw.slice(s + tag.length);
    const ends = next.map((t) => after.indexOf(t)).filter((i) => i !== -1);
    return (ends.length > 0 ? after.slice(0, Math.min(...ends)) : after).trim();
}

export async function streamAiEndpoint(url: string, payload: any, onStep: (step: string) => void, onChunk?: (partialText: string) => void): Promise<any> {
    const flowId = createDataFlowId();
    const payloadSummary = summarizeDataFlowPayload(payload);
    emitDataFlowTrace({ flowId, stage: "packaging", status: "success", title: "Đóng gói dữ liệu gửi AI", detail: `${payloadSummary.bytes.toLocaleString("vi-VN")} byte · ${payloadSummary.fields.length} trường`, payload: payloadSummary });
    emitDataFlowTrace({ flowId, stage: "api", status: "active", title: "Gửi request đến AI endpoint", detail: `POST ${url}` });
    let lastProgressTrace = 0;
    let apiResponded = false;
    const finish = (data: any) => {
        const resultSummary = summarizeDataFlowPayload(data);
        emitDataFlowTrace({ flowId, stage: "ai", status: "success", title: "Nhận phản hồi AI", detail: `${resultSummary.bytes.toLocaleString("vi-VN")} byte · ${resultSummary.fields.join(", ") || "nội dung trả lời"}`, payload: resultSummary });
        return data;
    };

    try {
        const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok || !res.body) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Lỗi kết nối máy chủ AI");
        }
        apiResponded = true;
        emitDataFlowTrace({ flowId, stage: "api", status: "success", title: "AI endpoint đã nhận request", detail: `HTTP ${res.status} · bắt đầu đọc NDJSON stream.` });
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "", finalData: any = null, lastChunk = "", lastRaw = "";

        const handleLine = (line: string) => {
            if (!line.trim()) return;
            const evt = JSON.parse(line);
            if (evt.type === "step") {
                onStep(evt.text);
                emitDataFlowTrace({ flowId, stage: "ai", status: "active", title: "AI đang xử lý", detail: evt.text || "Đang phân tích dữ liệu." });
            } else if (evt.type === "chunk") {
                lastChunk = evt.text || lastChunk;
                lastRaw = evt.raw || lastRaw;
                onChunk?.(evt.text);
                if (Date.now() - lastProgressTrace > 1200) {
                    lastProgressTrace = Date.now();
                    emitDataFlowTrace({ flowId, stage: "ai", status: "active", title: "AI đang stream kết quả", detail: "Đã nhận thêm dữ liệu phản hồi." });
                }
            } else if (evt.type === "done") finalData = evt.data;
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
            return finish({ reading: { chinhTinhBanCung: extractTag(lastRaw, "[P1]", ["[P2]"]), phuTinhTuongTac: extractTag(lastRaw, "[P2]", ["[P3]"]), tamHopXungChieu: extractTag(lastRaw, "[P3]", ["[P4]"]), nhiHopGiapPhiHoa: extractTag(lastRaw, "[P4]", ["[P5]"]), ducKetLoiKhuyen: extractTag(lastRaw, "[P5]", ["[MEM]"]) }, memoryNote: "" });
        }
        if (!finalData && lastRaw.includes("[FB]")) {
            return finish({ fb: extractTag(lastRaw, "[FB]", ["[ZALO]", "[TIKTOK]", "[BLOG]", "[POSTER]"]), zalo: extractTag(lastRaw, "[ZALO]", ["[TIKTOK]", "[BLOG]", "[POSTER]"]), tiktok: extractTag(lastRaw, "[TIKTOK]", ["[BLOG]", "[POSTER]"]), blog: extractTag(lastRaw, "[BLOG]", ["[POSTER]"]), posterLines: [] });
        }
        if (!finalData && lastRaw.length >= 600) {
            const cleanRaw = lastRaw.split("[MEM]")[0].trim();
            return finish({ content: cleanRaw, reply: cleanRaw, answer: cleanRaw, memoryNote: "" });
        }
        if (!finalData && lastChunk.length >= 250) return finish({ reply: lastChunk, answer: lastChunk });
        if (!finalData) throw new Error("Máy chủ AI đang bận, vui lòng bấm thử lại!");
        return finish(finalData);
    } catch (error) {
        if (!apiResponded) emitDataFlowTrace({ flowId, stage: "api", status: "error", title: "AI endpoint không phản hồi", detail: error instanceof Error ? error.message : "Lỗi không xác định." });
        emitDataFlowTrace({ flowId, stage: "ai", status: "error", title: "Luồng AI gặp lỗi", detail: error instanceof Error ? error.message : "Lỗi không xác định." });
        throw error;
    }
}
