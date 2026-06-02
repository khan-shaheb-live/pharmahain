"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { dbService, MedicineBatch, OwnershipTransfer, POSSale } from "../../../services/db";
import { 
  Building, 
  Layers, 
  CheckCircle, 
  Truck, 
  Printer, 
  Search, 
  History,
  Barcode,
  AlertCircle,
  ShoppingCart,
  Receipt,
  User,
  DollarSign,
  Plus,
  Coins
} from "lucide-react";
import { BarcodePreview } from "../../../components/BarcodePreview";

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [transfers, setTransfers] = useState<OwnershipTransfer[]>([]);
  const [sales, setSales] = useState<POSSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Tab state: "inventory" or "pos"
  const [activeTab, setActiveTab] = useState<"inventory" | "pos">("inventory");

  // QR Print states
  const [printBatch, setPrintBatch] = useState<MedicineBatch | null>(null);

  // POS Form states
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [saleQty, setSaleQty] = useState<number>(1);
  const [retailPrice, setRetailPrice] = useState<number>(0.00);
  const [completingSale, setCompletingSale] = useState(false);

  useEffect(() => {
    const loadPharmacyData = async () => {
      if (!user) return;
      try {
        const list = await dbService.getBatchesByRole(user.uid, "Pharmacy");
        setBatches(list);

        const userTxs = await dbService.getTransfersForUser(user.uid);
        setTransfers(userTxs);

        const userSales = await dbService.getSalesForPharmacy(user.uid);
        setSales(userSales);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPharmacyData();
  }, [user]);

  // Pre-fill retail price based on selected batch wholesale price + 30% margin
  useEffect(() => {
    if (selectedBatchId) {
      const selectedBatch = batches.find(b => b.batchId === selectedBatchId);
      if (selectedBatch) {
        const wholesale = selectedBatch.wholesalePrice || 1.50;
        setRetailPrice(Number((wholesale * 1.30).toFixed(2)));
        setSaleQty(1);
      }
    } else {
      setRetailPrice(0.00);
      setSaleQty(1);
    }
  }, [selectedBatchId, batches]);

  const handleConfirmReceipt = async (batch: MedicineBatch) => {
    const pendingTx = transfers.find(
      (t) => t.batchId.toUpperCase() === batch.batchId.toUpperCase() && t.toUserId === user?.uid && t.status === "Pending"
    );
    if (!pendingTx) return;

    setAcceptingId(batch.batchId);
    try {
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

  const handlePOSSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBatchId || !customerName.trim() || saleQty <= 0 || retailPrice <= 0) return;

    const selectedBatch = batches.find(b => b.batchId === selectedBatchId);
    if (!selectedBatch) return;

    if (selectedBatch.quantity < saleQty) {
      alert(`Insufficient stock. Only ${selectedBatch.quantity} units available.`);
      return;
    }

    setCompletingSale(true);
    try {
      await dbService.registerPOSSale({
        batchId: selectedBatchId,
        medicineName: selectedBatch.medicineName,
        pharmacyId: user.uid,
        pharmacyName: user.organizationName || user.name,
        customerName: customerName.trim(),
        quantity: saleQty,
        retailUnitPrice: retailPrice
      });

      // Clear Form
      setCustomerName("");
      setSelectedBatchId("");
      setSaleQty(1);
      setRetailPrice(0.00);

      // Refresh data
      const refreshedList = await dbService.getBatchesByRole(user.uid, "Pharmacy");
      setBatches(refreshedList);

      const refreshedSales = await dbService.getSalesForPharmacy(user.uid);
      setSales(refreshedSales);

      alert("B2C Sale Completed. Customer transaction recorded and stock deducted!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to finalize POS B2C Sale.");
    } finally {
      setCompletingSale(false);
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
    (b) => b.currentOwnerId === user.uid && b.quantity > 0
  ).length;

  const totalUnitsSold = sales.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.totalPrice, 0);

  // Available batches for POS dropdown
  const availablePOSBatches = batches.filter(
    (b) => b.currentOwnerId === user.uid && b.quantity > 0
  );

  const selectedBatchInfo = batches.find(b => b.batchId === selectedBatchId);
  const totalPriceCalculated = (saleQty * retailPrice).toFixed(2);
  const costPriceCalculated = selectedBatchInfo ? (saleQty * (selectedBatchInfo.wholesalePrice || 0)).toFixed(2) : "0.00";
  const profitCalculated = (parseFloat(totalPriceCalculated) - parseFloat(costPriceCalculated)).toFixed(2);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white">
            Pharmacy Dispensary Deck
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verify safe medicine custody transfers, manage dispensary inventories, and process B2C point-of-sale customer billing.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "inventory"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5 mr-2" />
            Inventory Stock
          </button>
          <button
            onClick={() => setActiveTab("pos")}
            className={`flex items-center px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "pos"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-2" />
            B2C POS Terminal
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="glass-card p-6 rounded-2xl border border-card-border/80 flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">
              Total Units Sold B2C
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalUnitsSold.toLocaleString()} units</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <ShoppingCart className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-card-border/80 flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">
              Total POS Revenue
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {activeTab === "inventory" ? (
        /* Inventory Tab View */
        <div className="glass-card rounded-2xl overflow-hidden border border-card-border">
          <div className="px-6 py-4 border-b border-card-border/50 flex justify-between items-center">
            <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white">Pharmacy Stock Ledger</h3>
            <span className="text-[10px] text-slate-400">{batches.length} batches loaded</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="bg-slate-100/40 dark:bg-slate-900/40 border-b border-card-border/50 text-slate-400 text-xs font-semibold uppercase">
                  <th className="px-6 py-3.5">Batch ID</th>
                  <th className="px-6 py-3.5">Medicine Name</th>
                  <th className="px-6 py-3.5">Original Manufacturer</th>
                  <th className="px-6 py-3.5">Quantity Left</th>
                  <th className="px-6 py-3.5">Wholesale Price (Paid)</th>
                  <th className="px-6 py-3.5">B2C Retail Price (Suggested)</th>
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
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">
                          {isInboundPending ? "—" : b.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">
                          {b.wholesalePrice ? `$${b.wholesalePrice.toFixed(2)}` : "—"}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {b.retailPrice ? `$${b.retailPrice.toFixed(2)}` : b.wholesalePrice ? `$${(b.wholesalePrice * 1.3).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isInboundPending
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse"
                              : b.quantity === 0
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}>
                            {isInboundPending ? "Inbound Courier" : b.quantity === 0 ? "Out of Stock" : "In Stock"}
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

                              {b.quantity > 0 && (
                                <button
                                  onClick={() => setPrintBatch(b)}
                                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all font-semibold cursor-pointer"
                                >
                                  <Printer className="mr-1 h-3.5 w-3.5" />
                                  Print Barcode
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500">
                      No active dispensary inventory batches logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* B2C POS Terminal Tab View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sale Form */}
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-card-border flex flex-col space-y-6 h-fit">
            <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center">
              <ShoppingCart className="h-4.5 w-4.5 text-blue-500 mr-2" />
              B2C Point of Sale Terminal
            </h3>

            <form onSubmit={handlePOSSale} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Select Medicine Batch in Stock *
                </label>
                <select
                  required
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-colors font-semibold"
                >
                  <option value="">-- Choose Batch --</option>
                  {availablePOSBatches.map((b) => (
                    <option key={b.batchId} value={b.batchId}>
                      {b.medicineName} ({b.batchId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Customer Name / Patient Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-colors font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Quantity to Sell *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={selectedBatchInfo ? selectedBatchInfo.quantity : 99999}
                    value={saleQty}
                    onChange={(e) => setSaleQty(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-colors font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    B2C Unit Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step="0.01"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-colors font-semibold"
                  />
                </div>
              </div>

              {/* Dynamic Bill Visualizer */}
              {selectedBatchInfo && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 text-[11px] space-y-2">
                  <div className="flex justify-between text-slate-500">
                    <span>Batch Stock Available:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedBatchInfo.quantity} units</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Wholesale Price Paid:</span>
                    <span className="font-bold text-slate-800 dark:text-white">${(selectedBatchInfo.wholesalePrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-1 pt-1.5 flex justify-between text-slate-500">
                    <span>Total Cost:</span>
                    <span className="font-bold text-slate-800 dark:text-white">${costPriceCalculated}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Total Sale Price (B2C):</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${totalPriceCalculated}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-dashed border-slate-200 dark:border-slate-800 pt-1.5">
                    <span className="text-slate-500">Est. Retained Margin:</span>
                    <span className={parseFloat(profitCalculated) >= 0 ? "text-blue-500" : "text-red-500"}>
                      ${profitCalculated}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={completingSale || !selectedBatchId}
                className="w-full inline-flex items-center justify-center px-4 py-3 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {completingSale ? "Registering Sale..." : "Complete B2C POS Sale"}
              </button>
            </form>
          </div>

          {/* Sales History Log */}
          <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden border border-card-border flex flex-col">
            <div className="px-6 py-4 border-b border-card-border/50 flex justify-between items-center">
              <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center">
                <Receipt className="h-4.5 w-4.5 text-blue-500 mr-2" />
                B2C Sales Receipts Registry
              </h3>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-card-border text-slate-500 font-bold px-2 py-0.5 rounded-lg">
                {sales.length} retail invoices
              </span>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="bg-slate-100/40 dark:bg-slate-900/40 border-b border-card-border/50 text-slate-400 text-xs font-semibold uppercase">
                    <th className="px-6 py-3.5">Invoice ID</th>
                    <th className="px-6 py-3.5">Medicine Name</th>
                    <th className="px-6 py-3.5">Customer Name</th>
                    <th className="px-6 py-3.5">Qty Sold</th>
                    <th className="px-6 py-3.5">Retail Price (unit)</th>
                    <th className="px-6 py-3.5">Invoice Total</th>
                    <th className="px-6 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-600 dark:text-slate-300 divide-y divide-card-border/30">
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <tr key={sale.saleId} className="hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                          {sale.saleId}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">
                          {sale.medicineName}
                          <span className="block font-mono text-[9px] text-slate-400">Batch: {sale.batchId}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                          {sale.customerName}
                        </td>
                        <td className="px-6 py-4 font-semibold">{sale.quantity.toLocaleString()} units</td>
                        <td className="px-6 py-4">${sale.retailUnitPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                          ${sale.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(sale.saleDate).toLocaleDateString()} {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        No retail customer invoices recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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
