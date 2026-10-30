import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet-context";
import { LanguageProvider } from "@/lib/language-context";
import { Navbar } from "@/components/Navbar";
import { TopUpModal } from "@/components/TopUpModal";

export const metadata: Metadata = {
  title: "Pulse Game Room | Quick games and clear credits",
  description: "Eight quick games in one place. Browse the game room, check your credit balance, and track manual bKash payment review.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0c1714] text-[#f1f5ec] antialiased">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <LanguageProvider>
          <WalletProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main id="main-content" className="flex-1 pb-20 sm:pb-0">{children}</main>
              <TopUpModal />
            </div>
          </WalletProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
