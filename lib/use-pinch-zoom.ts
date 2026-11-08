// lib/use-pinch-zoom.ts
import React, { useRef, useState } from "react";

export function usePinchZoom(initial = 1) {
    const [scale, setScale] = useState(initial);
    const pinchRef = useRef<{ dist: number; startScale: number } | null>(null);

    const getDist = (t: React.TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            pinchRef.current = { dist: getDist(e.touches), startScale: scale };
        }
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && pinchRef.current) {
            e.preventDefault();
            const ratio = getDist(e.touches) / Math.max(1, pinchRef.current.dist);
            const next = Math.min(1.8, Math.max(0.4, Number((pinchRef.current.startScale * ratio).toFixed(2))));
            setScale(next);
        }
    };

    const onTouchEnd = () => { pinchRef.current = null; };
    const stepScale = (d: number) => setScale((s) => Math.min(1.8, Math.max(0.4, Number((s + d).toFixed(2)))));
    const fitMobile = () => {
        const w = typeof window !== "undefined" ? window.innerWidth - 36 : 360;
        setScale(Math.min(1, Math.max(0.4, Number((w / 920).toFixed(2)))));
    };

    return { scale, setScale, stepScale, fitMobile, onTouchStart, onTouchMove, onTouchEnd };
}