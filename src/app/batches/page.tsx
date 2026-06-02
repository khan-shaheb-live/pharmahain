"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { dbService, MedicineBatch } from "../../services/db";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { BarcodePreview } from "../../components/BarcodePreview";
import { 
  Search, 
  Layers, 
  ChevronRight, 
  Cpu, 
  Building,
  Activity,
  ArrowLeft,
  Calendar,
  AlertCircle
} from "lucide-react";

export default function BatchesList() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filtered, setFiltered] = useState<MedicineBatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Sidebar filter states
  const [selectedIndications, setSelectedIndications] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

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
        let all: MedicineBatch[] = [];
        if (user) {
          all = await dbService.getBatchesByRole(user.uid, user.role);
        } else {
          all = await dbService.getAllBatches();
        }
        setBatches(all);
        setFiltered(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBatches();
  }, [user]);

  useEffect(() => {
    let list = batches;
    if (statusFilter !== "All") {
      list = list.filter((b) => b.status === statusFilter);
    }
    if (search.trim()) {
      const clean = search.trim().toLowerCase();
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
  }, [search, statusFilter, selectedIndications, selectedIngredients, batches]);

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

  const PageContainer = ({ children }: { children: React.ReactNode }) => {
    // If logged in, show inside standard dashboard shell, otherwise wrap with Navbar/Footer
    if (user) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200 w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
            <DashboardHeader />
            <main className="flex-1 p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
              {children}
            </main>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col tech-grid bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 w-full flex-1 space-y-8">{children}</div>
        <Footer />
      </div>
    );
  };

  return (
    <PageContainer>
      {/* Header */}
      <div>
        <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white">
          Active Medicine Batches
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review authentic batch registries logged on the decentralized secure chain.
        </p>
      </div>

      {/* Search and Status Select */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, Name, Ingredients, Uses..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors font-semibold"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending Dispatch</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered / In Stock</option>
        </select>
      </div>

      {/* Main Filter Sidebar + Cards Container */}
      {loading ? (
        <div className="glass-card rounded-2xl p-8 space-y-4 animate-pulse">
          <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          {/* Left Sidebar Filter Column */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-card-border shadow-md space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-card-border/50">
                <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-blue-500" />
                  Filter Registry
                </h3>
                {(selectedIndications.length > 0 || selectedIngredients.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedIndications([]);
                      setSelectedIngredients([]);
                    }}
                    className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Indications Checkboxes */}
              <div className="space-y-3">
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
            {filtered.length > 0 ? (
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
                          <Building className="h-3.5 w-3.5 mr-1 text-slate-400" />
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
                  No medicine batches recorded matching current filters.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try clearing sidebar criteria or searching for general active ingredients.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
