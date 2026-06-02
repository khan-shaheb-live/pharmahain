"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { dbService, MedicineBatch } from "../services/db";
import { BarcodePreview } from "../components/BarcodePreview";
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
  ArrowRight,
  ChevronRight,
  Building
} from "lucide-react";

export default function Home() {
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [filtered, setFiltered] = useState<MedicineBatch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndications, setSelectedIndications] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const FILTER_INDICATIONS = [
    "Pain Relief",
    "Fever Reduction",
    "Acid Reflux",
    "Bacterial Infections",
    "Allergy Relief",
    "Cough & Cold",
    "Diabetes Management",
    "High Blood Pressure",
    "Heart Failure",
    "Inflammation"
  ];

  const FILTER_INGREDIENTS = [
    "Paracetamol",
    "Omeprazole",
    "Esomeprazole",
    "Pantoprazole",
    "Cefixime",
    "Azithromycin",
    "Cetirizine",
    "Fexofenadine",
    "Metformin",
    "Losartan",
    "Aspirin",
    "Montelukast",
    "Calcium Carbonate",
    "Pregabalin"
  ];

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const all = await dbService.getAllBatches();
        setBatches(all);
        setFiltered(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBatches();
  }, []);

  useEffect(() => {
    let list = batches;
    if (searchQuery.trim()) {
      const clean = searchQuery.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.batchId.toLowerCase().includes(clean) ||
          b.medicineName.toLowerCase().includes(clean) ||
          b.manufacturerName.toLowerCase().includes(clean) ||
          (b.ingredients && b.ingredients.toLowerCase().includes(clean)) ||
          (b.indications && b.indications.toLowerCase().includes(clean))
      );
    }
    if (selectedIndications.length > 0) {
      list = list.filter((b) => {
        if (!b.indications) return false;
        const bInds = b.indications.split(", ").map(x => x.toLowerCase());
        return selectedIndications.some(sel => bInds.includes(sel.toLowerCase()));
      });
    }
    if (selectedIngredients.length > 0) {
      list = list.filter((b) => {
        if (!b.ingredients) return false;
        const bIngs = b.ingredients.split(", ").map(x => x.toLowerCase());
        return selectedIngredients.some(sel => 
          bIngs.some(ing => ing.includes(sel.toLowerCase()) || sel.toLowerCase().includes(ing))
        );
      });
    }
    setFiltered(list);
  }, [searchQuery, selectedIndications, selectedIngredients, batches]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-500/10";
      case "In Transit":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "Delivered":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

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

      {/* Interactive Medicine Search Section */}
      <section className="max-w-7xl mx-auto px-4 pb-20 w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Search Decentralized Medicine Registries
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Direct real-time access to the blockchain-verified medicine provenance catalogue.
          </p>
        </div>

        {/* Filter & Card Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          {/* Left Sidebar Filter Column */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-card-border shadow-md space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-card-border/50">
                <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-blue-500" />
                  Filter Search
                </h3>
                {(selectedIndications.length > 0 || selectedIngredients.length > 0 || searchQuery.trim()) && (
                  <button
                    onClick={() => {
                      setSelectedIndications([]);
                      setSelectedIngredients([]);
                      setSearchQuery("");
                    }}
                    className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Text Search Input inside sidebar */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Keywords</span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, use..."
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Indications Checkboxes */}
              <div className="space-y-3 pt-4 border-t border-card-border/30">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diseases / Indications</span>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {FILTER_INDICATIONS.map((ind) => {
                    const checked = selectedIndications.includes(ind);
                    return (
                      <label key={ind} className="flex items-center space-x-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setSelectedIndications(selectedIndications.filter((x) => x !== ind));
                            } else {
                              setSelectedIndications([...selectedIndications, ind]);
                            }
                          }}
                          className="h-3.5 w-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-800"
                        />
                        <span>{ind}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Ingredients Checkboxes */}
              <div className="space-y-3 pt-4 border-t border-card-border/30">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Ingredients</span>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {FILTER_INGREDIENTS.map((ing) => {
                    const checked = selectedIngredients.includes(ing);
                    return (
                      <label key={ing} className="flex items-center space-x-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setSelectedIngredients(selectedIngredients.filter((x) => x !== ing));
                            } else {
                              setSelectedIngredients([...selectedIngredients, ing]);
                            }
                          }}
                          className="h-3.5 w-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-800"
                        />
                        <span>{ing}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Medicine Cards Grid Column */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((b) => (
                  <div 
                    key={b.batchId} 
                    className="glass-card rounded-2xl border border-card-border overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col justify-between"
                  >
                    {/* Top status & barcode */}
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusColor(b.status)}`}>
                          {b.status}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          {b.batchId}
                        </span>
                      </div>

                      {/* Title and Manufacturer */}
                      <div>
                        <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                          {b.medicineName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                          <Building2 className="h-3.5 w-3.5 mr-1 text-slate-400" />
                          {b.manufacturerName}
                        </p>
                      </div>

                      {/* Barcode representation */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-center items-center">
                        <BarcodePreview value={b.batchId} />
                      </div>

                      {/* Ingredients */}
                      {b.ingredients && (
                        <div className="space-y-1 text-xs">
                          <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[9px]">Ingredients</span>
                          <p className="text-slate-700 dark:text-slate-300 font-semibold truncate">
                            {b.ingredients}
                          </p>
                        </div>
                      )}

                      {/* Indications / Uses */}
                      {b.indications && (
                        <div className="space-y-1 text-xs">
                          <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[9px]">Indications / Uses</span>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {b.indications.split(", ").slice(0, 3).map((ind) => (
                              <span key={ind} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/50">
                                {ind}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer tracking button */}
                    <div className="bg-slate-50/50 dark:bg-slate-900/10 px-5 py-4 border-t border-card-border/50 flex justify-between items-center text-xs">
                      <div>
                        <p className="text-slate-400 text-[10px]">Registry Quantity</p>
                        <p className="font-extrabold text-slate-800 dark:text-slate-200">{b.quantity.toLocaleString()} units</p>
                      </div>
                      <Link
                        href={`/batches/${b.batchId}`}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/10"
                      >
                        Trace Path
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-white dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  No registered medicines found matching current filters.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try clearing sidebar criteria or searching for general active ingredients.
                </p>
              </div>
            )}
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
