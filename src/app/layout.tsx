import type { Metadata } from "next";
import { Geist, Geist_Mono, Fragment_Mono } from "next/font/google";
import "./globals.css";
import SiteCursor from "@/components/SiteCursor";
import AppleStyleDock from "@/components/AppleStyleDock";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fragment-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Progency",
  description: "Progency — Creative Production & Tech Work",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fragmentMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <SiteCursor />
        <AppleStyleDock />
      </body>
    </html>
  );
}
