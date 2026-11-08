// lib/use-floating-box.ts
import React, { useRef, useState } from "react";

type ResizeDir = "r" | "l" | "b" | "br";

export function useFloatingBox() {
    const [rect, setRect] = useState({ x: 0, y: 0, w: 460, h: 560 });
    const [expanded, setExpanded] = useState(false);
    const [fontPx, setFontPx] = useState<number>(13);
    const actRef = useRef<{ mode: "drag" | ResizeDir; sx: number; sy: number; orig: typeof rect } | null>(null);

    const startAction = (e: React.PointerEvent, mode: "drag" | ResizeDir) => {
        if (mode === "drag" && (e.target as HTMLElement).closest("button")) return;
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        actRef.current = { mode, sx: e.clientX, sy: e.clientY, orig: { ...rect } };
    };

    const onPointerMove = (e: React.PointerEvent) => {
        const a = actRef.current;
        if (!a) return;
        const dx = e.clientX - a.sx, dy = e.clientY - a.sy;
        const maxW = typeof window !== "undefined" ? window.innerWidth - 24 : 1200;
        const maxH = typeof window !== "undefined" ? window.innerHeight - 24 : 800;

        if (a.mode === "drag") {
            setRect({ ...a.orig, x: a.orig.x + dx, y: a.orig.y + dy });
        } else if (a.mode === "r") {
            setRect({ ...a.orig, w: Math.min(maxW, Math.max(320, a.orig.w + dx)) });
        } else if (a.mode === "l") {
            const nw = Math.min(maxW, Math.max(320, a.orig.w - dx));
            setRect({ ...a.orig, w: nw, x: a.orig.x + (a.orig.w - nw) });
        } else if (a.mode === "b") {
            setRect({ ...a.orig, h: Math.min(maxH, Math.max(340, a.orig.h + dy)) });
        } else if (a.mode === "br") {
            setRect({ ...a.orig, w: Math.min(maxW, Math.max(320, a.orig.w + dx)), h: Math.min(maxH, Math.max(340, a.orig.h + dy)) });
        }
    };

    const endAction = () => { actRef.current = null; };
    const toggleExpand = () => {
        const next = !expanded;
        setExpanded(next);
        setRect(next ? { x: -180, y: -40, w: 820, h: 680 } : { x: 0, y: 0, w: 460, h: 560 });
    };
    const stepFont = (d: number) => setFontPx((f) => Math.min(18, Math.max(11, f + d)));

    return { rect, expanded, fontPx, startAction, onPointerMove, endAction, toggleExpand, stepFont };
}