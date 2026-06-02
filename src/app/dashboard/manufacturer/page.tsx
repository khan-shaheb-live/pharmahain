"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { dbService, MedicineBatch, UserProfile } from "../../../services/db";
import { blockchainService } from "../../../services/blockchain";
import { 
  Layers, 
  PlusCircle, 
  ArrowLeftRight, 
  CheckCircle2, 
  TrendingUp, 
  Cpu, 
  Truck,
  Building,
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
  Send
} from "lucide-react";
import { BarcodePreview } from "../../../components/BarcodePreview";

export default function ManufacturerDashboard() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [distributors, setDistributors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer ownership states
  const [activeTransferBatch, setActiveTransferBatch] = useState<MedicineBatch | null>(null);
  const [selectedDistributorId, setSelectedDistributorId] = useState("");
  const [transferNotes, setTransferNotes] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        // Load manufacturer's batches
        const list = await dbService.getBatchesByRole(user.uid, "Manufacturer");
        setBatches(list);

        // Load active distributors to populate the Transfer selection list
        const users = await dbService.getAllUsers();
        const dists = users.filter((u) => u.role === "Distributor");
        setDistributors(dists);
        if (dists.length > 0) {
          setSelectedDistributorId(dists[0].uid);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  const handleOpenTransferModal = (batch: MedicineBatch) => {
    setActiveTransferBatch(batch);
    setTransferSuccess(false);
    setTransferNotes("");
  };

  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTransferBatch || !selectedDistributorId) return;

    setTransferring(true);
    try {
      // 1. Submit ownership transfer signature on Polygon Blockchain Ledger
      const distUser = distributors.find(d => d.uid === selectedDistributorId);
      const distWallet = distUser?.uid === "dist1" ? "0x5e8fa3f80c6be4b84b655da92bd121f158914b1bda" : "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      
      const blockchainTxHash = await blockchainService.transferOwnership(
        activeTransferBatch.batchId,
        distWallet,
        transferNotes
      );

      // 2. Update Database transfer documents & batch status
      await dbService.initiateTransfer(
        activeTransferBatch.batchId,
        selectedDistributorId,
        transferNotes,
        blockchainTxHash
      );

      // Refresh dashboard batches list
      const refreshedList = await dbService.getBatchesByRole(user!.uid, "Manufacturer");
      setBatches(refreshedList);
      
      setTransferSuccess(true);
      setTimeout(() => {
        setActiveTransferBatch(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Blockchain transaction rejected or failed.");
    } finally {
      setTransferring(false);
    }
  };

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

  if (loading || !user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  const transitCount = batches.filter(b => b.status === "In Transit").length;
  const deliveredCount = batches.filter(b => b.status === "Delivered").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white">
            Manufacturer Operations Deck
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Formulate new medicine batches, issue secure verification QR codes, and ship products on-chain.
          </p>
        </div>
        <Link
          href="/batches/create"
          className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <PlusCircle className="mr-2 h-4.5 w-4.5" />
          Formulate New Batch
        </Link>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-card-border/80 flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">
              Total Batches Registered
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{batches.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-card-border/80 flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">
              Batches In Transit
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{transitCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Truck className="h-6 w-6 animate-bounce" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-card-border/80 flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">
              Delivered Stock
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{deliveredCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Batches Table List */}
      <div className="glass-card rounded-2xl overflow-hidden border border-card-border">
        <div className="px-6 py-4 border-b border-card-border/50 flex justify-between items-center">
          <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white">Active Formulations Ledger</h3>
          <span className="text-[10px] text-slate-400">{batches.length} batches logged</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="bg-slate-100/40 dark:bg-slate-900/40 border-b border-card-border/50 text-slate-400 text-xs font-semibold uppercase">
                <th className="px-6 py-3.5">Batch ID</th>
                <th className="px-6 py-3.5">Medicine Name</th>
                <th className="px-6 py-3.5">Mfg Date</th>
                <th className="px-6 py-3.5">Quantity</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600 dark:text-slate-300 divide-y divide-card-border/30">
              {batches.length > 0 ? (
                batches.map((b) => (
                  <tr key={b.batchId} className="hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white space-y-1">
                      <span className="block">{b.batchId}</span>
                      <BarcodePreview value={b.batchId} />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{b.medicineName}</p>
                        <p className="text-[9px] text-slate-400 flex items-center mt-0.5">
                          <Cpu className="h-3 w-3 mr-1" />
                          Tx: {b.blockchainHash.substring(0, 10)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{b.manufactureDate}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{b.quantity.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <Link
                        href={`/batches/${b.batchId}`}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all"
                      >
                        Detail
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Link>

                      {b.status === "Pending" && (
                        <button
                          onClick={() => handleOpenTransferModal(b)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer font-semibold"
                        >
                          <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                          Ship
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    You have not registered any medicine batches.{" "}
                    <Link href="/batches/create" className="text-blue-600 font-bold hover:underline">
                      Create one now
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custody Transfer Modal */}
      {activeTransferBatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card p-6 rounded-2xl border border-card-border shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-left">
            
            <div className="flex justify-between items-center border-b border-card-border/50 pb-3">
              <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center">
                <ArrowLeftRight className="h-4.5 w-4.5 text-blue-500 mr-2" />
                Initiate Custody Transfer
              </h3>
              <button
                onClick={() => setActiveTransferBatch(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {transferSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6 animate-bounce" />
                </div>
                <h4 className="font-outfit text-md font-bold text-slate-900 dark:text-white">Shipment Signed Successfully!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cryptographic transaction logged in block. Custody is now set to In Transit.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInitiateTransfer} className="space-y-4">
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs space-y-1">
                  <p className="text-slate-400">Medicine Batch Selected</p>
                  <p className="font-bold text-slate-900 dark:text-white">{activeTransferBatch.medicineName}</p>
                  <p className="font-mono text-[10px] text-slate-400">ID: {activeTransferBatch.batchId}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Select Logistics Partner *
                  </label>
                  <select
                    required
                    value={selectedDistributorId}
                    onChange={(e) => setSelectedDistributorId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-colors"
                  >
                    {distributors.length > 0 ? (
                      distributors.map((d) => (
                        <option key={d.uid} value={d.uid}>
                          {d.organizationName || d.name} (Distributor)
                        </option>
                      ))
                    ) : (
                      <option value="">No active logistics partners registered</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Logistics / Transit Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter temperature criteria or logistics conditions (e.g. Keep at 4C temp, shipped via secure logistics box 4)"
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={transferring}
                  className="w-full inline-flex items-center justify-center px-4 py-3.5 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {transferring ? "Signing Smart Contract..." : "Confirm Shipment & Sign"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
