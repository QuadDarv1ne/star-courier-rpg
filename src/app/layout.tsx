import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Star Courier — Космическая RPG",
  description:
    "Интерактивная космическая RPG. Капитан Макс Велл и экипаж звездолёта \"Элея\" доставляют загадочный артефакт через пиратские рубежи. Шесть глав, три ветки способностей, три финала.",
  authors: [{ name: "QuadDarv1ne" }],
  keywords: [
    "Star Courier",
    "космическая RPG",
    "RPG",
    "браузерная игра",
    "интерактивная история",
    "звездолёт",
    "диалоги",
    "пошаговый бой",
  ],
  openGraph: {
    title: "Star Courier — Космическая RPG",
    description:
      "Шесть глав пути через пиратские рубежи. Капитан Макс Велл, ИИ \"Афина\" и экипаж \"Элеи\". Три финала, 19 достижений, процедурный звуковой движок.",
    type: "website",
    locale: "ru_RU",
    siteName: "Star Courier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Star Courier — Космическая RPG",
    description:
      "Капитан Макс Велл и экипаж звездолёта \"Элея\" доставляют загадочный артефакт через пиратские рубежи.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoGame",
              name: "Star Courier",
              description:
                "Космическая RPG. Капитан Макс Велл и экипаж звездолёта \"Элея\" доставляют загадочный артефакт через пиратские рубежи.",
              genre: ["RPG", "Adventure", "Sci-Fi"],
              gamePlatform: "Web Browser",
              applicationCategory: "Game",
              operatingSystem: "Any (Web Browser)",
              inLanguage: "ru",
              author: { "@type": "Person", name: "QuadDarv1ne" },
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
      </body>
    </html>
  );
}
