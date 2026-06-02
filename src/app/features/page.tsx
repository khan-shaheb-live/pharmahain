"use client";

import React from "react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { 
  ShieldCheck, 
  QrCode, 
  Activity, 
  Sliders, 
  Globe, 
  Smartphone,
  Eye,
  FileCheck
} from "lucide-react";

export default function Features() {
  const coreFeatures = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-blue-600" />,
      title: "Solidity Smart Contract Ledger",
      desc: "Implements industry-grade Solidity smart contracts deployed on-chain to handle registration, verification scans, and custody updates permanently."
    },
    {
      icon: <QrCode className="h-6 w-6 text-emerald-500" />,
      title: "Dynamic High-Res QR Generator",
      desc: "Each registered batch generates a specialized dynamic QR verification link instantly, which is saved and ready to print onto standard package boxes."
    },
    {
      icon: <Activity className="h-6 w-6 text-indigo-500" />,
      title: "Real-Time Chain of Custody",
      desc: "Provides a step-by-step custody handshake. In transit and received states are immediately updated, removing dark spots in shipments."
    },
    {
      icon: <Sliders className="h-6 w-6 text-purple-500" />,
      title: "Granular Role-Based Portal",
      desc: "Specific, custom dashboards containing targeted forms and analytics widgets built separately for Manufacturer, Distributor, and Pharmacy partners."
    },
    {
      icon: <Globe className="h-6 w-6 text-pink-500" />,
      title: "Public Authenticity Scan Page",
      desc: "Fully responsive, open verification endpoint allowing patients or custom agents to scan and audit any medicine batch profile in seconds."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-teal-500" />,
      title: "Fully Responsive Mobile Shells",
      desc: "Designed using fluid grids and tailwind dark utilities to function beautifully across all screens, from pharmacy tablet computers to customer cell phones."
    },
    {
      icon: <Eye className="h-6 w-6 text-amber-500" />,
      title: "On-Chain Explorer & Audit",
      desc: "Includes an operational ledger explorer. Assesors can search transactions, verify blocks, inspect contract gas logs, and check events."
    },
    {
      icon: <FileCheck className="h-6 w-6 text-rose-500" />,
      title: "Real-Time Toast Notifications",
      desc: "Instant reactive feedback for wallet signature requests, Firestore writing logs, transfer acceptances, and validation warnings."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col tech-grid bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        
        <h1 className="font-outfit text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          State-of-the-Art Traceability{" "}
          <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            Platform Capabilities
          </span>
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          PharmaChain bridges cloud services and the Polygon blockchain to engineer a bulletproof, user-friendly defensive net against medical fraud.
        </p>
      </section>

      {/* Features Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {coreFeatures.map((feat, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-150 space-y-4">
              <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm inline-block">
                  {feat.icon}
                </div>
                <h3 className="font-outfit text-md font-bold text-slate-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
