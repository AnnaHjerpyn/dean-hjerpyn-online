import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dean Hjerpyn | Portfolio",
  description: "Landscape architecture portfolio by Dean Hjerpyn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={instrumentSans.variable}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
