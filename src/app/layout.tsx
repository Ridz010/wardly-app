import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { Toaster } from "@/components/ui/sonner";
import { publicEnv } from "@/env/public";

import "./globals.css";

const googleSans = localFont({
  src: "./fonts/GoogleSans-Variable.woff",
  weight: "400 700",
  style: "normal",
  variable: "--font-google-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: {
    default: "Ward-Ly — Periksa pesan mencurigakan sebelum kamu balas",
    template: "%s · Ward-Ly",
  },
  description:
    "Ward-Ly membantu kamu mengenali pesan penipuan: tempel pesannya, lihat tanda bahayanya, dan tahu langkah aman berikutnya.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Ward-Ly",
  },
};

export const viewport: Viewport = {
  themeColor: "#158ab0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${googleSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-light">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}