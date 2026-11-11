import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { STAR_STATIC_LIST } from "../slugs";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return STAR_STATIC_LIST.map((star) => ({
        slug: star.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const star = STAR_STATIC_LIST.find((s) => s.slug === slug);
    if (!star) return {};

    const SITE_URL = "https://sonlexinchao-tuvi.netlify.app";
    return {
        title: `Ý Nghĩa Sao ${star.name} Trong Tử Vi Đẩu Số | Bản Mệnh & 12 Cung`,
        description: `${star.summary} Lời khuyên: ${star.advice}`,
        alternates: {
            canonical: `${SITE_URL}/tra-cuu-sao/${star.slug}`,
        },
        openGraph: {
            title: `Sao ${star.name} — ${star.group} | Tử Vi Đẩu Số AI`,
            description: star.summary,
            url: `${SITE_URL}/tra-cuu-sao/${star.slug}`,
        },
    };
}

export default async function StarDetailPage({ params }: Props) {
    const { slug } = await params;
    const star = STAR_STATIC_LIST.find((s) => s.slug === slug);

    if (!star) {
        notFound();
    }

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: `Sao ${star.name} trong Tử Vi có ý nghĩa gì?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: star.summary,
                },
            },
            {
                "@type": "Question",
                name: `Lời khuyên khi gặp sao ${star.name} tọa thủ tại bản cung?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: star.advice,
                },
            },
        ],
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <Link
                        href="/"
                        className="text-amber-400 hover:text-amber-300 transition text-sm font-medium flex items-center gap-1"
                    >
                        ← Quay lại Lập Lá Số Tử Vi AI
                    </Link>
                </div>

                <article className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6">
                    <header className="border-b border-slate-800/80 pb-6">
                        <span className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                            {star.group}
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-black text-amber-300 mt-4 tracking-tight">
                            Sao {star.name}
                        </h1>
                        <p className="text-sm text-slate-400 mt-2">
                            Ngũ Hành: <span className="text-amber-200 font-medium">{star.element}</span>
                        </p>
                    </header>

                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-200">Luận Điểm Cốt Lõi</h2>
                        <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                            {star.summary}
                        </p>
                    </section>

                    <section className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-5 space-y-2">
                        <h2 className="text-sm uppercase tracking-wide font-bold text-amber-300">
                            Lời Khuyên & Định Hướng
                        </h2>
                        <p className="text-amber-100/90 leading-relaxed text-sm sm:text-base">
                            {star.advice}
                        </p>
                    </section>

                    <footer className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
                            Xem sao {star.name} đóng ở cung nào trên lá số của bạn:
                        </p>
                        <Link
                            href="/"
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20"
                        >
                            Lập Lá Số Ngay
                        </Link>
                    </footer>
                </article>
            </div>
        </main>
    );
}