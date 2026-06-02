"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { dbService } from "../../../services/db";
import { 
  Users, 
  Building2, 
  Layers, 
  Search, 
  Activity, 
  ShieldCheck, 
  UserCheck,
  Calendar,
  AlertTriangle,
  Database
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    setSeeding(true);
    setMessage("");
    try {
      const msg = await dbService.seedDatabase();
      setMessage(msg);
      // Reload admin metrics to show updated counts
      const data = await dbService.getAdminMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error(err);
      setMessage("Error seeding database: " + (err.message || err));
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await dbService.getAdminMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Cards layout metadata
  const statCards = [
    {
      title: "Total Registered Users",
      value: metrics.totalUsers,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      bg: "bg-blue-500/10"
    },
    {
      title: "Active Manufacturers",
      value: metrics.totalManufacturers,
      icon: <Building2 className="h-6 w-6 text-indigo-600" />,
      bg: "bg-indigo-500/10"
    },
    {
      title: "Logistics Partners",
      value: metrics.totalDistributors,
      icon: <Activity className="h-6 w-6 text-purple-600" />,
      bg: "bg-purple-500/10"
    },
    {
      title: "Registered Pharmacies",
      value: metrics.totalPharmacies,
      icon: <UserCheck className="h-6 w-6 text-emerald-600" />,
      bg: "bg-emerald-500/10"
    },
    {
      title: "Secured Medicine Batches",
      value: metrics.totalBatches,
      icon: <Layers className="h-6 w-6 text-pink-600" />,
      bg: "bg-pink-500/10"
    },
    {
      title: "Ledger Verifications",
      value: metrics.totalVerifications,
      icon: <Search className="h-6 w-6 text-cyan-600" />,
      bg: "bg-cyan-500/10"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-card-border/30">
        <div>
          <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white">
            Super Admin Traceability Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review system-wide health analytics and audit blockchain transaction registries.
          </p>
        </div>
        <div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/10 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Database className="h-4 w-4" />
            {seeding ? "Seeding..." : "Seed Firestore Data"}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl">
          {message}
        </div>
      )}

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-card-border/80 flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">
                {card.title}
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {card.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${card.bg} flex items-center justify-center`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* SVG Interactive SSR Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Trends */}
        <div className="glass-card p-6 rounded-2xl border border-card-border space-y-6">
          <div className="flex justify-between items-center border-b border-card-border/50 pb-4">
            <div>
              <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white">Verification Scans</h3>
              <p className="text-[10px] text-slate-400">Weekly patient scans audit results (Genuine vs Fails)</p>
            </div>
            <div className="flex space-x-3 text-[10px] font-bold">
              <span className="flex items-center text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5"></span>
                Genuine
              </span>
              <span className="flex items-center text-red-500">
                <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></span>
                Counterfeit
              </span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-64 flex items-end justify-between px-4 pt-4 border-b border-card-border/50 relative">
            {metrics.verificationTrends.map((trend: any, idx: number) => {
              const total = trend.Genuine + trend.Counterfeit;
              const maxVal = 30; // Scale factor
              const genHeight = (trend.Genuine / maxVal) * 100;
              const fakeHeight = (trend.Counterfeit / maxVal) * 100;

              return (
                <div key={idx} className="flex flex-col items-center w-12 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 scale-0 group-hover:scale-100 bg-slate-900 text-white text-[9px] p-2 rounded shadow-lg pointer-events-none transition-transform z-10 w-24 text-center">
                    G: {trend.Genuine} | C: {trend.Counterfeit}
                  </div>
                  
                  {/* Combined stacked bars */}
                  <div className="w-6 flex flex-col justify-end space-y-0.5 h-44">
                    <div
                      style={{ height: `${genHeight}%` }}
                      className="bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all duration-300"
                    ></div>
                    {trend.Counterfeit > 0 && (
                      <div
                        style={{ height: `${fakeHeight}%` }}
                        className="bg-red-500 hover:bg-red-600 rounded-b transition-all duration-300 animate-pulse"
                      ></div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold mt-2">{trend.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Batch Creation Frequencies */}
        <div className="glass-card p-6 rounded-2xl border border-card-border space-y-6">
          <div className="flex justify-between items-center border-b border-card-border/50 pb-4">
            <div>
              <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white">Batch Formulations</h3>
              <p className="text-[10px] text-slate-400">Weekly manufactured on-chain blocks registered</p>
            </div>
            <span className="flex items-center text-blue-500 text-[10px] font-bold">
              <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
              Minted Batches
            </span>
          </div>

          {/* SVG Line / Bar Chart */}
          <div className="h-64 flex items-end justify-between px-4 pt-4 border-b border-card-border/50 relative">
            {metrics.batchTrends.map((trend: any, idx: number) => {
              const maxVal = 10;
              const pctHeight = (trend.Batches / maxVal) * 100;

              return (
                <div key={idx} className="flex flex-col items-center w-12 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-slate-900 text-white text-[9px] p-2 rounded shadow-lg pointer-events-none transition-transform z-10 w-16 text-center">
                    {trend.Batches} Batches
                  </div>

                  <div className="w-5 bg-blue-600/10 dark:bg-blue-400/5 hover:bg-blue-600/20 rounded-t-lg h-44 flex items-end justify-center transition-colors">
                    <div
                      style={{ height: `${pctHeight || 5}%` }}
                      className="bg-blue-600 dark:bg-blue-500 rounded-t-lg w-full transition-all duration-300"
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold mt-2">{trend.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
