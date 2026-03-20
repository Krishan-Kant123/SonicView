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
  title: "SonicView",
  description: "Listen to your favorite songs with SonicView",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23a855f7'/><stop offset='100%25' stop-color='%234f46e5'/></linearGradient></defs><rect width='24' height='24' rx='6' fill='url(%23g)'/><g transform='scale(0.7) translate(5,5)' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 18V5l12-2v13'/><circle cx='6' cy='18' r='3'/><circle cx='18' cy='16' r='3'/></g></svg>",
    apple: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23a855f7'/><stop offset='100%25' stop-color='%234f46e5'/></linearGradient></defs><rect width='24' height='24' rx='6' fill='url(%23g)'/><g transform='scale(0.7) translate(5,5)' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 18V5l12-2v13'/><circle cx='6' cy='18' r='3'/><circle cx='18' cy='16' r='3'/></g></svg>"
  }
};

import { HeadlessYouTubePlayer } from "@/components/Player/HeadlessYouTubePlayer";
import { MobileBottomSheet } from "@/components/Player/MobileBottomSheet";
import { Toaster } from "sonner";

import { Header } from "@/components/Layout/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster theme="dark" position="bottom-right" className="mb-24" />
        <Header />
        {children}
        <HeadlessYouTubePlayer />
        <MobileBottomSheet />
      </body>
    </html>
  );
}
