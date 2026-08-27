import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Badge } from "@/components/ui/badge";
import { NavBar } from "@/components/layout/NavBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Credit Risk Control Tower (Demo)",
  description: "기업여신 Decision Intelligence 데모 — 실제 금융 데이터를 사용하지 않는 synthetic 데모입니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-muted/30">
        <header className="border-b bg-background">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-semibold tracking-tight">
                Credit Risk Control Tower
              </Link>
              <NavBar />
            </div>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              DEMO · Synthetic Data
            </Badge>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
