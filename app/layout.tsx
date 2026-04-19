import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Curtain } from "@/components/curtain";
import { Cursor } from "@/components/cursor";
import { SmoothScroll } from "@/components/smooth-scroll";
import { HydraTransitionOverlay } from "@/components/hydra/transition-overlay";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Samuel Russell Prajasantosa — QA Engineer",
  description:
    "The career journey of Samuel Russell Prajasantosa — Software QA Team Lead in Berlin. From Jakarta to Malaysia to Germany, building quality into software one test at a time.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      "https://personal-website-nine-sigma-97.vercel.app"
  ),
  openGraph: {
    title: "Samuel Russell Prajasantosa — QA Engineer",
    description:
      "Software QA Team Lead, Berlin. Career journey across Indonesia, Malaysia, and Germany.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground noise"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-surface focus:border focus:rounded-md"
          >
            Skip to content
          </a>
          <Curtain />
          <HydraTransitionOverlay />
          <Cursor />
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
