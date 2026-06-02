"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { dbService, MedicineBatch, UserProfile, OwnershipTransfer } from "../../../services/db";
import { blockchainService } from "../../../services/blockchain";
import { 
  Truck, 
  Layers, 
  ArrowLeftRight, 
  CheckCircle, 
  AlertCircle,
  Building,
  Cpu,
  Send,
  ClipboardCheck
} from "lucide-react";
import { BarcodePreview } from "../../../components/BarcodePreview";

export default function DistributorDashboard() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [pharmacies, setPharmacies] = useState<UserProfile[]>([]);
  const [transfers, setTransfers] = useState<OwnershipTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer state variables
  const [activeTransferBatch, setActiveTransferBatch] = useState<MedicineBatch | null>(null);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState("");
  const [transferNotes, setTransferNotes] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Accept custody states
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    const loadDistributorData = async () => {
      if (!user) return;
      try {
        // Fetch batches assigned to this distributor
        const list = await dbService.getBatchesByRole(user.uid, "Distributor");
        setBatches(list);

        // Fetch registered transfers history
        const userTxs = await dbService.getTransfersForUser(user.uid);
        setTransfers(userTxs);

        // Fetch pharmacies to populate ship destination list
        const users = await dbService.getAllUsers();
        const pharms = users.filter((u) => u.role === "Pharmacy");
        setPharmacies(pharms);
        if (pharms.length > 0) {
          setSelectedPharmacyId(pharms[0].uid);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDistributorData();
  }, [user]);

  const handleAcceptCustody = async (batch: MedicineBatch) => {
    // Find the pending transfer ID for this batch
    const pendingTx = transfers.find(
      (t) => t.batchId.toUpperCase() === batch.batchId.toUpperCase() && t.toUserId === user?.uid && t.status === "Pending"
    );
    if (!pendingTx) return;

    setAcceptingId(batch.batchId);
    try {
      // 1. Confirm blockchain receipt (simulated or real contract call)
      await dbService.respondToTransfer(pendingTx.transferId, true);

      // Refresh list
      const refreshedList = await dbService.getBatchesByRole(user!.uid, "Distributor");
      setBatches(refreshedList);
      
      const refreshedTxs = await dbService.getTransfersForUser(user!.uid);
      setTransfers(refreshedTxs);
      
      alert("Blockchain custody handshake complete. You are now the official custodian.");
    } catch (err) {
      console.error(err);
      alert("Failed to confirm custody signature.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleOpenTransferModal = (batch: MedicineBatch) => {
    setActiveTransferBatch(batch);
    setTransferSuccess(false);
    setTransferNotes("");
  };

  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTransferBatch || !selectedPharmacyId) return;

    setTransferring(true);
    try {
      const pharmUser = pharmacies.find((p) => p.uid === selectedPharmacyId);
      const pharmWallet = pharmUser?.uid === "pharm1" ? "0x9bda7ee72f91bf97aef4a52e8fa3f80c6be4b84b5" : "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      // 1. Sign on-chain transfer to pharmacy
      const blockchainTxHash = await blockchainService.transferOwnership(
        activeTransferBatch.batchId,
        pharmWallet,
        transferNotes
      );

      // 2. Log transfer on Cloud database
      await dbService.initiateTransfer(
        activeTransferBatch.batchId,
        selectedPharmacyId,
        transferNotes,
        blockchainTxHash
      );

      // Refresh dashboard batches list
      const refreshedList = await dbService.getBatchesByRole(user!.uid, "Distributor");
      setBatches(refreshedList);
      
      setTransferSuccess(true);
      setTimeout(() => {
        setActiveTransferBatch(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Blockchain transaction rejected.");
    } finally {
      setTransferring(false);
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

  // Pending items that are in-transit to this distributor, but they haven't accepted ownership yet
  const pendingInbound = batches.filter(
    (b) => b.status === "In Transit" && b.currentOwnerId !== user.uid
  ).length;

  const currentCustodianCount = batches.filter(
    (b) => b.currentOwnerId === user.uid
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white">
          Logistics Distribution Operations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Perform blockchain handshakes, review inbound medicine batches, and dispatch shipments to pharmacies.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-card-border/80 flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">
              Assigned Shipments
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
              Pending Inbound Handshakes
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingInbound}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Truck className="h-6 w-6 animate-pulse" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-card-border/80 flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">
              Current Stock Custodian
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{currentCustodianCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Batches Table List */}
      <div className="glass-card rounded-2xl overflow-hidden border border-card-border">
        <div className="px-6 py-4 border-b border-card-border/50 flex justify-between items-center">
          <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white">Distribution Shipment Ledger</h3>
          <span className="text-[10px] text-slate-400">{batches.length} assignments</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="bg-slate-100/40 dark:bg-slate-900/40 border-b border-card-border/50 text-slate-400 text-xs font-semibold uppercase">
                <th className="px-6 py-3.5">Batch ID</th>
                <th className="px-6 py-3.5">Medicine Name</th>
                <th className="px-6 py-3.5">Current Custodian</th>
                <th className="px-6 py-3.5">Status</th>
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
                          <span>{b.currentOwnerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          isInboundPending
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}>
                          {isInboundPending ? "Inbound Pending" : b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isInboundPending && (
                          <button
                            onClick={() => handleAcceptCustody(b)}
                            disabled={acceptingId === b.batchId}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-white bg-amber-500 hover:bg-amber-600 shadow-sm transition-all font-semibold cursor-pointer animate-pulse"
                          >
                            {acceptingId === b.batchId ? "Signing..." : "Accept Custody"}
                          </button>
                        )}

                        {isCurrentCustodian && b.status !== "In Transit" && (
                          <button
                            onClick={() => handleOpenTransferModal(b)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all font-semibold cursor-pointer"
                          >
                            <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                            Ship to Pharmacy
                          </button>
                        )}

                        {b.status === "In Transit" && b.currentOwnerId === user.uid && (
                          <span className="text-xs text-slate-400 font-semibold italic">
                            Dispatched to Pharmacy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No medicine batches have been assigned or routed to your logistics node.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pharmacy Transfer Modal */}
      {activeTransferBatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card p-6 rounded-2xl border border-card-border shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-left">
            
            <div className="flex justify-between items-center border-b border-card-border/50 pb-3">
              <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center">
                <ArrowLeftRight className="h-4.5 w-4.5 text-blue-500 mr-2" />
                Ship to Pharmacy Hub
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
                <h4 className="font-outfit text-md font-bold text-slate-900 dark:text-white">Shipment Dispatched!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cryptographic transfer transaction logged in block. Pharmacy transit state is active.
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
                    Select Destination Pharmacy *
                  </label>
                  <select
                    required
                    value={selectedPharmacyId}
                    onChange={(e) => setSelectedPharmacyId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-colors"
                  >
                    {pharmacies.length > 0 ? (
                      pharmacies.map((p) => (
                        <option key={p.uid} value={p.uid}>
                          {p.organizationName || p.name} (Pharmacy)
                        </option>
                      ))
                    ) : (
                      <option value="">No registered pharmacies available</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Shipment Criteria / Logistics Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter dispatch Courier info or climate conditions (e.g. Courier: MedExpress Courier, cold ice secure box 14)"
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
                  {transferring ? "Signing Smart Contract..." : "Confirm Dispatch & Sign"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
