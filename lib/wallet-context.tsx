"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface WalletContextType {
  balance: number;
  loading: boolean;
  refreshWallet: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
  isTopUpOpen: boolean;
  setIsTopUpOpen: (open: boolean) => void;
  username: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(1000.0);
  const [username, setUsername] = useState<string>("player_one");
  const [loading, setLoading] = useState<boolean>(true);
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);

  const refreshWallet = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (data.success && data.user) {
        setBalance(data.user.wallet?.balance ?? 1000.0);
        setUsername(data.user.username);
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBalance = useCallback((newBalance: number) => {
    setBalance(newBalance);
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  return (
    <WalletContext.Provider
      value={{
        balance,
        loading,
        refreshWallet,
        updateBalance,
        isTopUpOpen,
        setIsTopUpOpen,
        username,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
