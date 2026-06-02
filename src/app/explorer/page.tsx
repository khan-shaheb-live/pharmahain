"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { blockchainService, BlockchainTransaction, PHARMA_CHAIN_CONTRACT_ADDRESS } from "../../services/blockchain";
import { 
  Search, 
  Cpu, 
  Layers, 
  Hash, 
  TrendingUp, 
  Database,
  ArrowRight,
  Code2,
  Calendar,
  Zap
} from "lucide-react";

export default function Explorer() {
  const [txs, setTxs] = useState<BlockchainTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTxs, setFilteredTxs] = useState<BlockchainTransaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);

  useEffect(() => {
    const fetchTxs = async () => {
      const all = await blockchainService.getAllTransactions();
      setTxs(all);
      setFilteredTxs(all);
    };
    fetchTxs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredTxs(txs);
      return;
    }
    const cleanQuery = searchQuery.trim().toLowerCase();
    const matches = txs.filter(
      (t) =>
        t.txHash.toLowerCase() === cleanQuery ||
        t.batchId.toLowerCase().includes(cleanQuery) ||
        t.methodName.toLowerCase().includes(cleanQuery) ||
        t.from.toLowerCase() === cleanQuery ||
        t.to.toLowerCase() === cleanQuery
    );
    setFilteredTxs(matches);
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case "registerMedicineBatch":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "transferOwnership":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/20";
      case "verifyMedicine":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
    }
  };

  return (
    <div className="min-h-screen flex flex-col tech-grid bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header Title */}
        <div className="text-center md:text-left mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600/10 text-primary dark:bg-blue-400/10 dark:text-blue-400">
              <Cpu className="h-3 w-3 mr-1 animate-spin" />
              Polygon Amoy Sandbox Ledger Explorer
            </span>
            <h1 className="font-outfit text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              PharmaChain Ledger Analytics
            </h1>
          </div>
          <div className="text-right text-xs text-slate-400 max-w-xs">
            Contract Address: <span className="font-mono text-blue-500 font-semibold break-all">{PHARMA_CHAIN_CONTRACT_ADDRESS}</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Latest Block</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {txs.length > 0 ? txs[0].blockNumber : "4293021"}
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Total Tx Logs</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{txs.length}</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Zap className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Avg Gas Used</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">85,250 Gwei</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Sync Status</p>
              <p className="text-lg font-bold text-emerald-500 mt-0.5 flex items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-glow-success mr-2"></span>
                100% Synced
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-10 max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tx Hash, Batch ID, Method, or Address..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Explorer Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tx Logs Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-card-border/50 flex justify-between items-center">
                <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white">On-Chain Actions</h3>
                <span className="text-xs text-slate-400">{filteredTxs.length} records found</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left">
                  <thead>
                    <tr className="bg-slate-100/40 dark:bg-slate-900/40 border-b border-card-border/50 text-slate-400 text-xs font-semibold uppercase">
                      <th className="px-6 py-3.5">Method</th>
                      <th className="px-6 py-3.5">Tx Hash</th>
                      <th className="px-6 py-3.5">Batch</th>
                      <th className="px-6 py-3.5">Block</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-slate-600 dark:text-slate-300 divide-y divide-card-border/30">
                    {filteredTxs.length > 0 ? (
                      filteredTxs.map((t) => (
                        <tr
                          key={t.txHash}
                          onClick={() => setSelectedTx(t)}
                          className={`cursor-pointer hover:bg-blue-500/5 transition-colors ${
                            selectedTx?.txHash === t.txHash ? "bg-blue-500/5 border-l-4 border-blue-600" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 rounded text-[10px] font-semibold uppercase ${getMethodBadgeClass(t.methodName)}`}>
                              {t.methodName}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-blue-500 font-medium">
                            {t.txHash.substring(0, 14)}...
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">
                            {t.batchId}
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-semibold">
                            {t.blockNumber}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-500">
                          No matching blockchain transactions recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Transaction Receipt Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 glass-card p-6 rounded-2xl border border-card-border space-y-6">
              <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center border-b border-card-border/50 pb-4">
                <Hash className="h-4 w-4 text-blue-500 mr-2" />
                Ledger Transaction Receipt
              </h3>

              {selectedTx ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Transaction Hash</span>
                    <span className="font-mono text-xs text-blue-500 font-bold break-all bg-blue-600/5 p-2 rounded border border-blue-500/10 block">
                      {selectedTx.txHash}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Block Number</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center">
                        <Layers className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
                        {selectedTx.blockNumber}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Gas Burned</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center">
                        <Zap className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
                        {selectedTx.gasUsed}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Method Signature</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center font-mono">
                      <Code2 className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
                      {selectedTx.methodName}()
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">On-Chain Event Emitted</span>
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-card-border/80 rounded-lg text-[10px] font-mono text-slate-500 break-all leading-normal">
                      {selectedTx.eventLogs}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-2 border-t border-card-border/30 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">From</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{selectedTx.from.substring(0, 10)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">To Contract</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{selectedTx.to.substring(0, 10)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Recorded Date</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <Cpu className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal max-w-xs mx-auto">
                    Select a transaction from the table to inspect cryptographic receipts, block logs, and compiled EVM arguments.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
