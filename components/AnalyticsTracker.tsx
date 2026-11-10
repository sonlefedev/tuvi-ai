// components/AnalyticsTracker.tsx
"use client";
import { useEffect } from "react";
import { startAnalyticsTracking } from "@/lib/analytics-client";

export default function AnalyticsTracker() {
    useEffect(() => startAnalyticsTracking(), []);
    return null;
}
