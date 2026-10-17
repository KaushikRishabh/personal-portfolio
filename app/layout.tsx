import "./globals.css";
import type { Metadata } from "next";
import { assetPath } from "@/lib/asset-path";
import localFont from "next/font/local";
const inter = localFont({ src: "./fonts/PretendardVariable.woff2", display: "swap", variable: "--font-inter" });
export const metadata: Metadata = {
  icons: { icon: assetPath("/icon.svg") },
  title: "Rishabh Kaushik — Full Stack Engineer",
  description: "Full stack engineering, thoughtful interfaces, and a little orbital mechanics. Explore Rishabh Kaushik’s work, experience, and resume.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={inter.variable}><body>{children}</body></html>;
}
