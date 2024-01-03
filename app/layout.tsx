"use client";
import type { Metadata } from "next";
import "../styles/globals.css";
import localFont from "next/font/local";
import { SWRConfig } from "@/lib/swr-config";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

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
      <body dir="rtl" className={iransansFont.className}>
        <SWRConfig>{children}</SWRConfig>
        <Sonner
          theme={theme as ToasterProps["theme"]}
          className="toaster group"
          toastOptions={{
            classNames: {
              toast:
                "group rtl toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
              description: "group-[.toast]:text-muted-foreground",
              actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
              cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            },
          }}
        />
      </body>
    </html>
  );
}
