"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { blockchainService } from "../../services/blockchain";
import { 
  Sun, 
  Moon, 
  Wallet, 
  Bell, 
  Network,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export const DashboardHeader: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string>("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    const checkWallet = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            const net = await blockchainService.getConnectedNetwork();
            setNetworkName(net);
          } else {
            // Fallback simulated sandbox network
            const net = await blockchainService.getConnectedNetwork();
            setNetworkName(net);
          }
        } catch {
          // Fallback simulated sandbox network
          const net = await blockchainService.getConnectedNetwork();
          setNetworkName(net);
        }
      } else {
        const net = await blockchainService.getConnectedNetwork();
        setNetworkName(net);
      }
    };
    checkWallet();
  }, []);

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      const address = await blockchainService.connectWallet();
      setWalletAddress(address);
      const net = await blockchainService.getConnectedNetwork();
      setNetworkName(net);
    } catch (err) {
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  if (!user) return null;

  return (
    <header className="h-16 border-b border-card-border/50 glass-card bg-sidebar/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-all duration-200">
      {/* Title & Greeting */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white font-outfit tracking-tight">
          Welcome Back, <span className="text-blue-600 dark:text-blue-400">{user.name}</span>
        </h2>
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          Node: <span className="font-bold text-slate-600 dark:text-slate-300">{user.organizationName}</span>
        </p>
      </div>

      {/* Quick Utilities */}
      <div className="flex items-center space-x-4">
        {/* Network status */}
        <div className="hidden lg:flex items-center space-x-2 text-[10px] font-semibold text-slate-400 border-r border-card-border/50 pr-4">
          <Network className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
          <span>{networkName}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-primary dark:text-slate-400 bg-slate-100 dark:bg-slate-800 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>

        {/* Web3 MetaMask Connector */}
        {walletAddress ? (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-xs font-semibold select-none">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 animate-bounce" />
            <span className="font-mono text-[10px]">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </span>
          </div>
        ) : (
          <button
            onClick={handleConnectWallet}
            disabled={connecting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/15 transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {connecting ? "Connecting Wallet..." : "Link Web3 Wallet"}
          </button>
        )}
      </div>
    </header>
  );
};
