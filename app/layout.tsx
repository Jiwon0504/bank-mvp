import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { NavBar } from "@/components/layout/NavBar";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getServerLocale } from "@/lib/i18n/getLocale";
import { translations } from "@/lib/i18n/translations";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return locale === "en"
    ? {
        title: "Credit Risk Control Tower (Demo)",
        description:
          "Corporate credit Decision Intelligence demo — uses no real financial data, synthetic only.",
      }
    : {
        title: "Credit Risk Control Tower (Demo)",
        description: "기업여신 Decision Intelligence 데모 — 실제 금융 데이터를 사용하지 않는 synthetic 데모입니다.",
      };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getServerLocale();
  const t = translations[locale];

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-muted/30">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LanguageProvider initialLocale={locale}>
            <header className="border-b bg-background">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                <div className="flex items-center gap-6">
                  <Link href="/" className="text-sm font-semibold tracking-tight">
                    Credit Risk Control Tower
                  </Link>
                  <NavBar />
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-normal text-muted-foreground">
                    {t.nav.demoTag}
                  </Badge>
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">{children}</main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
