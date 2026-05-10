import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "BlueRoseMart — Blockchain Piano Marketplace",
  description: "Buy and sell second-hand pianos on Base blockchain with USDC escrow, AI price prediction, and multi-agent assistant.",
  openGraph: {
    title: "BlueRoseMart — Blockchain Piano Marketplace",
    description: "Buy and sell second-hand pianos on Base blockchain with USDC escrow, AI price prediction, and multi-agent assistant.",
    url: "https://piano-dapp.vercel.app",
    siteName: "BlueRoseMart",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueRoseMart — Blockchain Piano Marketplace",
    description: "Buy and sell second-hand pianos on Base blockchain with USDC escrow, AI price prediction, and multi-agent assistant.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <Providers>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
