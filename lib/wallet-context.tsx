"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CurrentUser {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: string;
}

interface WalletContextType {
  balance: number;
  loading: boolean;
  refreshWallet: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
  isTopUpOpen: boolean;
  setIsTopUpOpen: (open: boolean) => void;
  username: string;
  user: CurrentUser | null;
  isAuthenticated: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(0);
  const [username, setUsername] = useState<string>("");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);

  const refreshWallet = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (data.success && data.user) {
        setBalance(data.user.wallet?.balance ?? 0);
        setUsername(data.user.name || data.user.mobile || "Player");
        setUser({
          id: data.user.id,
          name: data.user.name,
          mobile: data.user.mobile,
          email: data.user.email,
          role: data.user.role,
        });
        setIsAuthenticated(!!data.isAuthenticated);
      } else {
        setBalance(0);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
      setBalance(0);
      setUser(null);
      setIsAuthenticated(false);
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
        user,
        isAuthenticated,
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
