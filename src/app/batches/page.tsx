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
    setFiltered(list);
  }, [search, statusFilter, batches]);

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

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, Medicine Name, Ingredients, Uses..."
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

      {/* Table Grid */}
      {loading ? (
        <div className="glass-card rounded-2xl p-8 space-y-4 animate-pulse">
          <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-card-border overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="bg-slate-100/40 dark:bg-slate-900/40 border-b border-card-border/50 text-slate-400 text-xs font-semibold uppercase">
                  <th className="px-6 py-3.5">Batch ID</th>
                  <th className="px-6 py-3.5">Medicine Details</th>
                  <th className="px-6 py-3.5">Manufacturer</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5">Current Owner</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 dark:text-slate-300 divide-y divide-card-border/30">
                {filtered.length > 0 ? (
                  filtered.map((b) => (
                    <tr key={b.batchId} className="hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white space-y-1">
                        <span className="block">{b.batchId}</span>
                        <BarcodePreview value={b.batchId} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{b.medicineName}</p>
                          <p className="text-[9px] text-slate-400">Exp Date: {b.expiryDate}</p>
                          {b.ingredients && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="font-semibold text-slate-600 dark:text-slate-300">Active Ingredients:</span> {b.ingredients}
                            </p>
                          )}
                          {b.indications && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="font-semibold text-slate-600 dark:text-slate-300">Uses/Indications:</span> {b.indications}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center">
                          <Building className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          {b.manufacturerName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">{b.quantity.toLocaleString()}</td>
                      <td className="px-6 py-4 truncate max-w-[150px] font-semibold">{b.currentOwnerName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusColor(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/batches/${b.batchId}`}
                          className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all font-semibold"
                        >
                          Trace
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      No medicine batches recorded matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
