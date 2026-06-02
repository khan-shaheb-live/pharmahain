"use client";

import React from "react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { ShieldCheck, HeartPulse, Scale, Award } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-blue-600" />,
      title: "Immutable Security",
      desc: "Our platform ensures medicine status logs can never be manipulated, modified, or retroactively falsified by malicious players."
    },
    {
      icon: <HeartPulse className="h-6 w-6 text-emerald-500" />,
      title: "Global Patient Care",
      desc: "We place safety first. Guaranteeing that the tablets, capsules, and vaccines taken by patients are certified and clean."
    },
    {
      icon: <Scale className="h-6 w-6 text-indigo-500" />,
      title: "Regulatory Compliance",
      desc: "Designed hand-in-hand with major pharmaceutical audit frameworks and drug traceability standardizations (like DSCSA)."
    },
    {
      icon: <Award className="h-6 w-6 text-purple-500" />,
      title: "Trust Verification",
      desc: "Providing instant cryptographic receipts for every transfer of custody, ensuring ultimate network partner accountability."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col tech-grid bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-blue-600/5 dark:bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        
        <h1 className="font-outfit text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Securing Healthcare Through{" "}
          <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            Cryptographic Integrity
          </span>
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          PharmaChain was founded with a singular, vital vision: to leverage modern blockchain state machinery to save lives by building a solid shield against counterfeit medicine.
        </p>
      </section>

      {/* Main content grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              The Counterfeit Medicine Crisis
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              According to the World Health Organization (WHO), over 10% of medical products in low- and middle-income nations are either substandard or falsified. This not only robs patients of essential care but leads to hundreds of thousands of preventable deaths yearly.
            </p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Legacy supply chain systems rely on siloed, easily manipulated centralized databases. PharmaChain replaces this broken architecture with a multi-layered trust model. By logging batches on the immutable Polygon ledger, we ensure that every single package in circulation can be audited, tracked, and proven authentic.
            </p>
          </div>
          <div className="glass-card p-8 rounded-2xl border border-card-border/80 space-y-4">
            <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <span className="h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
              PharmaChain Security Metrics
            </h3>
            <div className="space-y-4 pt-2">
              <div className="flex justify-between border-b border-card-border/30 pb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Smart Contract Version</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">v1.0.4 (Active)</span>
              </div>
              <div className="flex justify-between border-b border-card-border/30 pb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Polygon Chain State</span>
                <span className="text-sm font-semibold text-emerald-500">Amoy Testnet (Synced)</span>
              </div>
              <div className="flex justify-between border-b border-card-border/30 pb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Average Block Time</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">2.1 Seconds</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Cryptographic Standard</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">EVM ECDSA Secp256k1</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-slate-100/40 dark:bg-slate-900/20 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Our Foundational Columns
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Four fundamental guidelines directing our engineering teams toward high-reliability healthcare security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform duration-200 space-y-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md inline-block">
                  {val.icon}
                </div>
                <h3 className="font-outfit text-md font-bold text-slate-900 dark:text-white">
                  {val.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
