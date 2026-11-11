import type { MetadataRoute } from "next";
import { STAR_STATIC_LIST } from "./tra-cuu-sao/slugs";

export default function sitemap(): MetadataRoute.Sitemap {
    const base = "https://sonlexinchao-tuvi.netlify.app";
    const now = new Date();

    const mainRoutes: MetadataRoute.Sitemap = [
        { url: base, lastModified: now, changeFrequency: "daily", priority: 1.0 },
        { url: `${base}/api/daily-seo-feed`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ];

    const starRoutes: MetadataRoute.Sitemap = STAR_STATIC_LIST.map((star) => ({
        url: `${base}/tra-cuu-sao/${star.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
    }));

    return [...mainRoutes, ...starRoutes];
}