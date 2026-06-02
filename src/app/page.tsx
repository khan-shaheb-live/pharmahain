"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { 
  ShieldCheck, 
  Activity, 
  Search, 
  Cpu, 
  Database, 
  Truck, 
  QrCode, 
  CheckCircle,
  Building2,
  Lock,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const stats = [
    { label: "Secured Batches", value: "3.4M+" },
    { label: "Counterfeits Detected", value: "98.7%" },
    { label: "On-Chain Nodes", value: "1,250+" },
    { label: "Active Pharmacies", value: "24,800+" },
  ];

  const features = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
      title: "Blockchain Decentered Ledger",
      desc: "Every medicine batch is permanently stamped on the Polygon Amoy blockchain. Once registered, data becomes completely immutable."
    },
    {
      icon: <QrCode className="h-6 w-6 text-blue-500" />,
      title: "Instant QR Code Scanning",
      desc: "Automatically generate high-security verification QR codes. Customers scan with their mobile devices to instantly fetch proof-of-authenticity."
    },
    {
      icon: <Truck className="h-6 w-6 text-purple-500" />,
      title: "Real-Time Custody Tracking",
      desc: "Track medicine ownership transfer dynamically from Manufacturers, through Distributors, down to local Pharmacies."
    },
    {
      icon: <Building2 className="h-6 w-6 text-indigo-500" />,
      title: "Role-Based Security",
      desc: "Siloed access dashboards and specialized toolsets tailored specifically for Manufacturers, Distributors, and Pharmacies."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col tech-grid bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 mb-6 hover:scale-105 transition-transform duration-200">
            <Cpu className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            Polygon Blockchain Live Network Integration
          </span>

          <h1 className="font-outfit text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-4xl mx-auto">
            Decentralized Trust for Safe Medicine:{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              PharmaChain Ecosystem
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate counterfeit pharmaceutical products. Verify real-time medicine custody, track batch histories from production lines to the patient, and guarantee global health security.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/verify"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 dark:shadow-blue-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Search className="mr-2 h-5 w-5" />
              Verify Medicine Batch
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Entity Dashboard Portal
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-1">
                <p className="font-outfit text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Workflow Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              End-to-End Trust Ledger Workflow
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed">
              How PharmaChain guarantees absolute integrity at each node of the medical supply chain distribution network.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Steps line connector desktop */}
            <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-600/50 to-emerald-500/50 -translate-y-1/2 -z-10"></div>

            {/* Step 1 */}
            <div className="glass-card p-8 rounded-2xl relative hover:scale-105 transition-all duration-200 text-center flex flex-col items-center">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center border-4 border-slate-50 dark:border-slate-950">
                1
              </span>
              <div className="p-4 rounded-xl bg-blue-500/10 text-blue-500 mb-6 mt-2">
                <Database className="h-8 w-8" />
              </div>
              <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white mb-2">
                Batch Registration
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manufacturers register a medicine batch with details like expiry and quantity. This generates a cryptographic block on-chain and a secure dynamic QR Code.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-8 rounded-2xl relative hover:scale-105 transition-all duration-200 text-center flex flex-col items-center">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center border-4 border-slate-50 dark:border-slate-950">
                2
              </span>
              <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-500 mb-6 mt-2">
                <Truck className="h-8 w-8 animate-bounce" />
              </div>
              <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white mb-2">
                Custody Transfers
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Distributors and Pharmacies log custody acceptance directly on the ledger. Digital handshakes lock transit history and prevent unauthorized batches from slipping in.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-8 rounded-2xl relative hover:scale-105 transition-all duration-200 text-center flex flex-col items-center">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center border-4 border-slate-50 dark:border-slate-950">
                3
              </span>
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500 mb-6 mt-2">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white mb-2">
                Public Verification
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Patients and regulators scan the QR Code on the medicine packaging to fetch the complete on-chain authenticity audit trail and instantly verify that the medicine is 100% genuine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-100/40 dark:bg-slate-900/20 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Enterprise Grade Counterfeit Shield
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed">
              Equipped with elite cryptographic controls and database synchronization to satisfy global medical regulatory standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="glass-card p-8 rounded-2xl flex items-start space-x-6 hover:shadow-lg transition-all duration-150">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
