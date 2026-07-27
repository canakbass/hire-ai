import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "HireAI — AI Destekli İşe Alım Platformu",
  description: "CV ön eleme, otonom sesli mülakat ve akıllı kısa liste ile yeni nesil İK ve işe alım otomasyonu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased selection:bg-indigo-500 selection:text-white`}
    >
      <body className="min-h-full flex flex-col bg-[#090b10] text-[#f3f4f6]">{children}</body>
    </html>
  );
}
