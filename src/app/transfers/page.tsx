"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { dbService, OwnershipTransfer } from "../../services/db";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { 
  ArrowLeftRight, 
  Search, 
  Cpu, 
  Building, 
  Calendar, 
  CheckCircle,
  Truck,
  ArrowLeft
} from "lucide-react";

export default function TransfersList() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<OwnershipTransfer[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<OwnershipTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransfers = async () => {
      try {
        let all: OwnershipTransfer[] = [];
        if (user) {
          if (user.role === "Super Admin") {
            all = await dbService.getAllTransfers();
          } else {
            all = await dbService.getTransfersForUser(user.uid);
          }
        }
        setTransfers(all);
        setFiltered(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTransfers();
  }, [user]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(transfers);
      return;
    }
    const clean = search.trim().toLowerCase();
    const matched = transfers.filter(
      (t) =>
        t.batchId.toLowerCase().includes(clean) ||
        t.fromUserName.toLowerCase().includes(clean) ||
        t.toUserName.toLowerCase().includes(clean) ||
        (t.notes && t.notes.toLowerCase().includes(clean))
    );
    setFiltered(matched);
  }, [search, transfers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse";
      case "Accepted":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "Rejected":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  const PageContainer = ({ children }: { children: React.ReactNode }) => {
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
          Custody Transfer Transaction Logs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor chronological custody transfers signed and verified on-chain.
        </p>
      </div>

      {/* Filters */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Batch ID, Sender, Receiver, or Notes..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="glass-card rounded-2xl p-8 space-y-4 animate-pulse">
          <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-card-border overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="bg-slate-100/40 dark:bg-slate-900/40 border-b border-card-border/50 text-slate-400 text-xs font-semibold uppercase">
                  <th className="px-6 py-3.5">Batch ID</th>
                  <th className="px-6 py-3.5">Sender Node</th>
                  <th className="px-6 py-3.5">Recipient Node</th>
                  <th className="px-6 py-3.5">Transfer Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Logistics Notes</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 dark:text-slate-300 divide-y divide-card-border/30">
                {filtered.length > 0 ? (
                  filtered.map((t) => (
                    <tr key={t.transferId} className="hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        <Link href={`/batches/${t.batchId}`} className="text-blue-600 hover:underline">
                          {t.batchId}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center">
                          <Building className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          {t.fromUserName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center">
                          <Building className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          {t.toUserName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium flex items-center mt-3">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        {new Date(t.transferDate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusColor(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate italic text-slate-500">
                        {t.notes || "Standard shipping conditions"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No custody transfers have been registered or logged yet.
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
