import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const description = "Who can buy the most wins? Free fantasy game for the 2026-27 NBA season.";

export const metadata: Metadata = {
  metadataBase: new URL("https://nbamoneyball.com"),
  title: "NBA Moneyball",
  description,
  openGraph: {
    title: "NBA Moneyball",
    description,
    url: "/",
    siteName: "NBA Moneyball",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NBA Moneyball",
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
