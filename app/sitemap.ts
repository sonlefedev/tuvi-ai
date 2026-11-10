// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const base = "https://sonlexinchao-tuvi.netlify.app";
    return [
        { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
        { url: `${base}/api/daily-seo-feed`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ];
}
