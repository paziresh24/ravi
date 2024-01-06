"use client";
import type { Metadata } from "next";
import "../styles/globals.css";
import localFont from "next/font/local";
import { SWRConfig } from "@/lib/swr-config";

import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";

const iransansFont = localFont({
  src: "../public/fonts/IRANSansXV.woff2",
  variable: "--font-iran-sans",
  preload: true,
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { theme = "system" } = useTheme();

  return (
    <html lang="fa-IR">
      <head>
        <meta name="robots" content="noindex" />
      </head>
      <body dir="rtl" className={iransansFont.className}>
        <SWRConfig>{children}</SWRConfig>
        <Toaster />
      </body>
    </html>
  );
}
