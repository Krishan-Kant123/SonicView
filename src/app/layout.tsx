import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SonicView",
  description: "Listen to your favorite songs with SonicView",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23A4E6FF'/><stop offset='100%' stop-color='%2300d1ff'/></linearGradient></defs><rect width='24' height='24' rx='6' fill='url(%23g)'/><g transform='scale(0.7) translate(5,5)' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 18V5l12-2v13'/><circle cx='6' cy='18' r='3'/><circle cx='18' cy='16' r='3'/></g></svg>",
    apple: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23A4E6FF'/><stop offset='100%' stop-color='%2300d1ff'/></linearGradient></defs><rect width='24' height='24' rx='6' fill='url(%23g)'/><g transform='scale(0.7) translate(5,5)' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 18V5l12-2v13'/><circle cx='6' cy='18' r='3'/><circle cx='18' cy='16' r='3'/></g></svg>"
  }
};

import { HeadlessYouTubePlayer } from "@/components/Player/HeadlessYouTubePlayer";
import { MobileBottomSheet } from "@/components/Player/MobileBottomSheet";
import { Toaster } from "sonner";
import { TopBar } from "@/components/Layout/TopBar";
import { BottomNav } from "@/components/Layout/BottomNav";
import { ApiKeyModal } from "@/components/Layout/ApiKeyModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased dark`}>
      <body className="min-h-full flex flex-col bg-background text-on-surface">
        <Toaster theme="dark" position="bottom-right" className="mb-24" />
        <TopBar />
        <div className="flex-1">
          {children}
        </div>
        <ApiKeyModal />
        <HeadlessYouTubePlayer />
        {/* MobileBottomSheet sits just above BottomNav */}
        <MobileBottomSheet />
        <BottomNav />
      </body>
    </html>
  );
}
