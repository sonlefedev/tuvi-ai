// components/AnalyticsTracker.tsx
"use client";
import { useEffect } from "react";
import { startAnalyticsTracking } from "@/lib/analytics-client";
import { startErrorSentinel } from "@/lib/error-sentinel";

export default function AnalyticsTracker() {
    useEffect(() => {
        const stopA = startAnalyticsTracking();
        const stopE = startErrorSentinel();
        return () => { stopA(); stopE(); };
    }, []);
    return null;
}
