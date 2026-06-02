import React from "react";
import Link from "next/link";
import { Activity, ShieldAlert, Cpu, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="glass-card border-t border-card-border/80 bg-slate-50/50 dark:bg-slate-950/20 py-12 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-blue-600/10 dark:bg-blue-400/10 text-primary flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-outfit text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                PharmaChain
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              PharmaChain is a decentralized, smart contract driven ecosystem engineered to secure the pharmaceutical supply chain, track authentic batch records, and eliminate counterfeit medicine globally.
            </p>
            <div className="mt-6 flex items-center space-x-2 text-xs text-emerald-500 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 pulse-glow-success"></span>
              <span>Network Status: Online (Polygon Smart Contract v1.0)</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h3 className="font-outfit text-sm font-semibold tracking-wider text-slate-900 dark:text-white uppercase">
              Application
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/verify" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                  Verify QR Code
                </Link>
              </li>
              <li>
                <Link href="/explorer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                  Block Explorer
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                  Entity Portal Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                  Register Partner
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Info & Help */}
          <div>
            <h3 className="font-outfit text-sm font-semibold tracking-wider text-slate-900 dark:text-white uppercase">
              Technology Stack
            </h3>
            <ul className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 space-y-3">
              <li className="flex items-center space-x-2">
                <Cpu className="h-4.5 w-4.5 text-blue-500" />
                <span>Polygon Amoy EVM L2</span>
              </li>
              <li className="flex items-center space-x-2">
                <ShieldAlert className="h-4.5 w-4.5 text-emerald-500" />
                <span>Firebase Authentication & DB</span>
              </li>
              <li className="flex items-center space-x-2">
                <Activity className="h-4.5 w-4.5 text-purple-500" />
                <span>Next.js 15 App Router</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-8 border-t border-card-border/50 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} PharmaChain Ecosystem. Built as a production-grade Final Year Project.</p>
          <p className="flex items-center mt-4 md:mt-0">
            Securing Global Healthcare with
            <Heart className="h-3.5 w-3.5 text-red-500 mx-1 fill-current" />
            & Blockchain Trust.
          </p>
        </div>
      </div>
    </footer>
  );
};
