import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const SITE_URL = "https://sonlexinchao-tuvi.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tử Vi Đẩu Số AI — Lập Lá Số Tử Vi Chuẩn Cổ Điển & Luận Giải Chuyên Sâu",
    template: "%s | Tử Vi Đẩu Số AI",
  },
  description: "Lập lá số Tử Vi Đẩu Số miễn phí chuẩn lịch Âm Dương Hồ Ngọc Đức, an 14 Chính Tinh & 90 Phụ Tinh, viết Đại Cẩm Nang Cuộc Đời 8 chương (~100.000 chữ), Hợp Lá Số Đôi, Định Giờ Sinh Ngược & Hỏi Đáp Trợ Lý AI 24/7.",
  keywords: ["tử vi đẩu số", "lập lá số tử vi", "luận giải tử vi ai", "xem tử vi miễn phí", "bản đồ cuộc đời tử vi", "hợp lá số đôi", "định giờ sinh ngược", "tử vi 2026", "phi tinh tứ hóa", "nam phái tử vi"],
  authors: [{ name: "Lê Thanh Sơn (@sonlefedev)" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: "Tử Vi Đẩu Số AI",
    title: "Tử Vi Đẩu Số AI — Lập Lá Số & Đại Cẩm Nang Cuộc Đời 8 Chương",
    description: "An sao Tử Vi chuẩn xác, luận giải 12 cung chuyên sâu, Đại Cẩm Nang 8 chương minh họa (~100k chữ), Hợp lá số đôi & Trợ lý AI thông minh.",
    images: [{ url: "/og-cover.png", width: 1200, height: 630, type: "image/png", alt: "Tử Vi Đẩu Số AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tử Vi Đẩu Số AI — Lập Lá Số & Luận Giải Chuyên Sâu",
    description: "An sao Tử Vi chuẩn cổ điển kết hợp AI: Đại Cẩm Nang 8 chương, Hợp lá số đôi, Định giờ sinh ngược & Timeline 12 tháng.",
    images: ["/og-cover.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/avatar.jpg" },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tử Vi Đẩu Số AI",
  url: SITE_URL,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "All",
  inLanguage: "vi",
  description: "Ứng dụng lập lá số Tử Vi Đẩu Số chuẩn cổ điển kết hợp trí tuệ nhân tạo AI luận giải chuyên sâu.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        {children}
      </body>
    </html>
  );
}