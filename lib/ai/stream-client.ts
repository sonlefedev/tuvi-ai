// lib/ai/stream-client.ts
export async function streamAiEndpoint(
    url: string,
    payload: any,
    onStep: (step: string) => void,
    onChunk?: (partialText: string) => void
): Promise<any> {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Lỗi kết nối máy chủ AI");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalData: any = null;

    const handleLine = (line: string) => {
        if (!line.trim()) return;
        const evt = JSON.parse(line);
        if (evt.type === "step") onStep(evt.text);
        else if (evt.type === "chunk" && onChunk) onChunk(evt.text);
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
    if (!finalData) throw new Error("Kết nối AI bị ngắt giữa chừng do mạng chậm hoặc quá tải, vui lòng bấm lại!");
    return finalData;
}
