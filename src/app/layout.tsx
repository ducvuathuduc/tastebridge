import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin", "vietnamese"], variable: "--font-fraunces", display: "swap", axes: ["opsz"] });

export const metadata: Metadata = {
  title: "TasteBridge — Should your F&B brand enter Vietnam?",
  description: "Multi-agent go/no-go advisor for F&B brands entering Vietnam, powered by Qloo Taste AI. Decide in one click, we run the rest A–Z.",
  openGraph: { title: "TasteBridge", description: "Decide in one click. We run the rest, A to Z.", type: "website" },
};
export const viewport: Viewport = { themeColor: "#111a2c", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <I18nProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 bg-ink-900 text-white px-3 py-2 rounded-lg">Skip to content</a>
          <Nav />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
