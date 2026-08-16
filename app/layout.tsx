import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/context/LanguageContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Omnilink — AI 原生商业基础设施 | AI-Native Commerce Infrastructure",
  description: "面向 AI 时代的商家经营中枢 | Merchant Control Center for the AI Era",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        jakarta.variable,
        inter.variable,
        jetbrainsMono.variable
      )}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-[#F4F5F7] text-[#111827]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

