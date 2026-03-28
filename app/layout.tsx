import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "عضويتي - اتحاد بشبابها",
  description: "منصة تسجيل عضوية اتحاد بشبابها",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "عضويتي",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${cairo.variable} antialiased`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
