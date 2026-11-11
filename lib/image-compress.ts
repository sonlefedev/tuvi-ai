// lib/image-compress.ts
export function compressImageToDataUrl(file: File | Blob, maxWidth = 1024): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Không đọc được file ảnh"));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error("Ảnh không hợp lệ"));
            img.onload = () => {
                const scale = Math.min(1, maxWidth / (img.width || maxWidth));
                const w = Math.round((img.width || maxWidth) * scale);
                const h = Math.round((img.height || maxWidth) * scale);
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d");
                if (!ctx) return resolve(String(reader.result || ""));
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL("image/jpeg", 0.78));
            };
            img.src = String(reader.result || "");
        };
        reader.readAsDataURL(file);
    });
}
