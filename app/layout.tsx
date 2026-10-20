import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet-context";
import { LanguageProvider } from "@/lib/language-context";
import { Navbar } from "@/components/Navbar";
import { TopUpModal } from "@/components/TopUpModal";

export const metadata: Metadata = {
  title: "HERMES // ক্রিপ্টোগ্রাফিক গেমিং সিমুলেশন (Bangladesh)",
  description: "Next-generation provably fair e-gaming simulation platform featuring Coin Flip, Dice Over/Under, and Mines with cryptographic deterministic verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark">
      <body className="min-h-screen bg-[#060814] text-[#EDEDF2] antialiased selection:bg-[#0000F2] selection:text-white">
        <LanguageProvider>
          <WalletProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 pb-20 sm:pb-8">{children}</main>
              <TopUpModal />
            </div>
          </WalletProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
