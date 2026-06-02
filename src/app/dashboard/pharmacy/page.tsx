"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { dbService, MedicineBatch, OwnershipTransfer } from "../../../services/db";
import { 
  Building, 
  Layers, 
  CheckCircle, 
  Truck, 
  Printer, 
  Search, 
  History,
  Barcode,
  AlertCircle
} from "lucide-react";
import { BarcodePreview } from "../../../components/BarcodePreview";

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [transfers, setTransfers] = useState<OwnershipTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // QR Print states
  const [printBatch, setPrintBatch] = useState<MedicineBatch | null>(null);

  useEffect(() => {
    const loadPharmacyData = async () => {
      if (!user) return;
      try {
        const list = await dbService.getBatchesByRole(user.uid, "Pharmacy");
        setBatches(list);

        const userTxs = await dbService.getTransfersForUser(user.uid);
        setTransfers(userTxs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPharmacyData();
  }, [user]);

  const handleConfirmReceipt = async (batch: MedicineBatch) => {
    // Find the pending transfer record to accept
    const pendingTx = transfers.find(
      (t) => t.batchId.toUpperCase() === batch.batchId.toUpperCase() && t.toUserId === user?.uid && t.status === "Pending"
    );
    if (!pendingTx) return;

    setAcceptingId(batch.batchId);
    try {
      // 1. Confirm blockchain receipt (on-chain handshake signature)
      await dbService.respondToTransfer(pendingTx.transferId, true);

      // Refresh data
      const refreshedList = await dbService.getBatchesByRole(user!.uid, "Pharmacy");
      setBatches(refreshedList);
      
      const refreshedTxs = await dbService.getTransfersForUser(user!.uid);
      setTransfers(refreshedTxs);
      
      alert("Pharmacy custody confirmed. Inventory stock updated on-chain!");
    } catch (err) {
      console.error(err);
      alert("Receipt confirmation failed.");
    } finally {
      setAcceptingId(null);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  const inboundPending = batches.filter(
    (b) => b.status === "In Transit" && b.currentOwnerId !== user.uid
  ).length;

  const stockInventoryCount = batches.filter(
    (b) => b.currentOwnerId === user.uid
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white">
          Pharmacy Dispensary Deck
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Verify safe medicine custody transfers, manage dispensary inventories, and print public validation labels.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-card-border/80 flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">
              Dispensary Inventory Stock
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stockInventoryCount} batches</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-card-border/80 flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">
              Inbound Deliveries Pending
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{inboundPending}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Truck className="h-6 w-6 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Batches Table List */}
      <div className="glass-card rounded-2xl overflow-hidden border border-card-border">
        <div className="px-6 py-4 border-b border-card-border/50 flex justify-between items-center">
          <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white">Pharmacy Stock Ledger</h3>
          <span className="text-[10px] text-slate-400">{batches.length} shipments logged</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="bg-slate-100/40 dark:bg-slate-900/40 border-b border-card-border/50 text-slate-400 text-xs font-semibold uppercase">
                <th className="px-6 py-3.5">Batch ID</th>
                <th className="px-6 py-3.5">Medicine Name</th>
                <th className="px-6 py-3.5">Original Manufacturer</th>
                <th className="px-6 py-3.5">Inventory State</th>
                <th className="px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600 dark:text-slate-300 divide-y divide-card-border/30">
              {batches.length > 0 ? (
                batches.map((b) => {
                  const isInboundPending = b.status === "In Transit" && b.currentOwnerId !== user.uid;
                  const isCurrentCustodian = b.currentOwnerId === user.uid;

                  return (
                    <tr key={b.batchId} className="hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white space-y-1">
                        <span className="block">{b.batchId}</span>
                        <BarcodePreview value={b.batchId} />
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">
                        {b.medicineName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span>{b.manufacturerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          isInboundPending
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}>
                          {isInboundPending ? "Inbound Courier" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        {isInboundPending && (
                          <button
                            onClick={() => handleConfirmReceipt(b)}
                            disabled={acceptingId === b.batchId}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-white bg-amber-500 hover:bg-amber-600 shadow-sm transition-all font-semibold cursor-pointer animate-pulse"
                          >
                            {acceptingId === b.batchId ? "Signing..." : "Confirm Receipt"}
                          </button>
                        )}

                        {isCurrentCustodian && (
                          <>
                            <Link
                              href={`/batches/${b.batchId}`}
                              className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all"
                            >
                              <History className="mr-1 h-3.5 w-3.5" />
                              Custody Trace
                            </Link>

                             <button
                              onClick={() => setPrintBatch(b)}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all font-semibold cursor-pointer"
                            >
                              <Printer className="mr-1 h-3.5 w-3.5" />
                              Print Barcode
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No active dispensary inventory batches logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode Label Print Dialog */}
      {printBatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass-card p-6 rounded-2xl border border-card-border shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-center">
            
            <div className="flex justify-between items-center border-b border-card-border/50 pb-3 text-left">
              <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center">
                <Printer className="h-4.5 w-4.5 text-blue-500 mr-2" />
                Dispensary Packaging Label
              </h3>
              <button
                onClick={() => setPrintBatch(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Barcode Visual */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 inline-block shadow-inner w-full">
              <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center min-h-[100px] w-full mx-auto relative group overflow-hidden">
                <BarcodePreview value={printBatch.batchId} width={1.4} height={45} />
                <div className="absolute inset-0 bg-blue-600/5 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] bg-slate-900 text-white p-1.5 rounded font-bold">DISPENSARY LABEL</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">{printBatch.medicineName}</p>
              <p className="font-mono text-[10px] text-blue-500 font-semibold">{printBatch.batchId}</p>
              <p className="text-[9px] text-slate-400">Scan to verify EVM Polygon smart contract authenticity.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all cursor-pointer"
              >
                Print Label
              </button>
              <button
                onClick={() => setPrintBatch(null)}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
