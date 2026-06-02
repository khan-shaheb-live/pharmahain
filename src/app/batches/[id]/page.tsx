"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { dbService, MedicineBatch, OwnershipTransfer } from "../../../services/db";
import { Navbar } from "../../../components/Navbar";
import { Footer } from "../../../components/Footer";
import { Sidebar } from "../../../components/dashboard/Sidebar";
import { DashboardHeader } from "../../../components/dashboard/DashboardHeader";
import JsBarcode from "jsbarcode";
import { 
  ArrowLeft, 
  Building, 
  Layers, 
  Cpu, 
  Calendar, 
  History, 
  Barcode, 
  Printer, 
  ShieldCheck, 
  ExternalLink 
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BatchDetails({ params }: PageProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [batchId, setBatchId] = useState("");
  const [batch, setBatch] = useState<MedicineBatch | null>(null);
  const [transfers, setTransfers] = useState<OwnershipTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeUrl, setBarcodeUrl] = useState("");

  useEffect(() => {
    if (batch?.barcodeBase64) {
      setBarcodeUrl(batch.barcodeBase64);
    } else if (canvasRef.current && batch?.batchId) {
      try {
        JsBarcode(canvasRef.current, batch.batchId, {
          format: "CODE128",
          width: 1.5,
          height: 60,
          displayValue: true,
          font: "monospace",
          fontSize: 12,
          background: "#ffffff",
          lineColor: "#000000",
          margin: 20,
        });
        setBarcodeUrl(canvasRef.current.toDataURL("image/png"));
      } catch (err) {
        console.error("Barcode generation failed", err);
      }
    }
  }, [batch]);

  // Dynamic param resolution for Next.js 15
  useEffect(() => {
    params.then((res) => {
      setBatchId(res.id);
      loadBatchDetails(res.id);
    });
  }, [params]);

  const handleDownloadBarcode = () => {
    if (barcodeUrl && batch?.batchId) {
      try {
        const link = document.createElement("a");
        link.href = barcodeUrl;
        link.download = `${batch.batchId}_barcode.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Failed to download barcode image", err);
      }
    } else {
      alert("Barcode image not loaded yet. Please try again.");
    }
  };

  const loadBatchDetails = async (id: string) => {
    try {
      const data = await dbService.getBatch(id);
      if (data) {
        setBatch(data);
        
        // Fetch transfer histories
        const allTrans = await dbService.getAllTransfers();
        const histories = allTrans
          .filter((t) => t.batchId.toUpperCase() === id.toUpperCase() && t.status === "Accepted")
          .sort((a, b) => new Date(a.transferDate).getTime() - new Date(b.transferDate).getTime());
        setTransfers(histories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-1">{children}</div>
        <Footer />
      </div>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl col-span-2"></div>
            <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!batch) {
    return (
      <PageContainer>
        <div className="text-center py-16 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="font-outfit text-xl font-bold text-slate-900 dark:text-white">Batch Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The requested batch ID is not registered in the security ledger database.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
          >
            Go Back
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Return Navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Return to Batch Index
      </button>

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core batch characteristics card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-6 rounded-2xl border border-card-border space-y-6">
            <div className="flex justify-between items-start border-b border-card-border/50 pb-4">
              <div>
                <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-blue-600/10 text-primary border border-blue-500/20">
                  Pharma Batch State
                </span>
                <h2 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                  {batch.medicineName}
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono font-bold">{batch.batchId}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">Registrant Manufacturer</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                  <Building className="h-4 w-4 mr-1.5 text-slate-400" />
                  {batch.manufacturerName}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">Quantity Registered</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                  <Layers className="h-4 w-4 mr-1.5 text-slate-400" />
                  {batch.quantity.toLocaleString()} Units
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">Manufacture Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-slate-400" />
                  {batch.manufactureDate}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">Expiry Target</span>
                <span className="font-semibold text-red-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-red-500/50" />
                  {batch.expiryDate}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">Wholesale Price (Paid)</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center">
                  {batch.wholesalePrice ? `$${batch.wholesalePrice.toFixed(2)}` : "N/A"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">B2C Retail Price</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  {batch.retailPrice ? `$${batch.retailPrice.toFixed(2)}` : batch.wholesalePrice ? `$${(batch.wholesalePrice * 1.3).toFixed(2)} (Suggested)` : "N/A"}
                </span>
              </div>
            </div>

            {/* Ingredients & Indications */}
            {(batch.ingredients || batch.indications) && (
              <div className="pt-4 border-t border-card-border/30 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {(batch.ingredients || batch.ingredientPercentages) && (
                  <div className="space-y-2">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block">Active Ingredients & Concentrations</span>
                    {batch.ingredientPercentages && batch.ingredientPercentages.length > 0 ? (
                      <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                        {batch.ingredientPercentages.map((ing, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between font-semibold text-[11px]">
                              <span className="text-slate-700 dark:text-slate-300">{ing.name}</span>
                              <span className="text-blue-500 font-bold">{ing.percentage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${ing.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-semibold bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900">
                        {batch.ingredients}
                      </p>
                    )}
                  </div>
                )}
                {batch.indications && (
                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block">Therapeutic Indications / Uses</span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-semibold bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900">
                      {batch.indications}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-card-border/30 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Polygon Smart Contract Receipt Hash</span>
              <span className="font-mono text-xs text-blue-500 bg-blue-600/5 p-2.5 rounded-lg border border-blue-500/10 block break-all font-semibold select-all">
                {batch.blockchainHash}
              </span>
            </div>
          </div>

          {/* Chronological Audit trail custody list */}
          <div className="glass-card p-6 rounded-2xl border border-card-border space-y-6">
            <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center border-b border-card-border/50 pb-4">
              <History className="h-4 w-4 text-purple-500 mr-2" />
              Custody Handshake Trails
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
              {/* Manufacturer node */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full bg-blue-600 border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center"></span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center leading-normal">
                    Formulated & Cryptographed
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold">
                      Manufacturer
                    </span>
                  </h4>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">{batch.manufacturerName}</p>
                  <p className="text-[10px] text-slate-400">Date: {new Date(batch.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* In transit logistics transfers list */}
              {transfers.map((tx) => (
                <div key={tx.transferId} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full bg-purple-500 border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center"></span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center leading-normal">
                      Custody Transferred
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-purple-500/10 text-purple-500 border border-purple-500/20 font-semibold">
                        Logistics Shipped
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      From: <span className="font-semibold text-slate-800 dark:text-slate-200">{tx.fromUserName}</span> ➔ To: <span className="font-semibold text-slate-800 dark:text-slate-200">{tx.toUserName}</span>
                    </p>
                    {tx.notes && <p className="text-[10px] text-slate-400 italic">“{tx.notes}”</p>}
                    <p className="text-[10px] text-slate-400">Handshake: {new Date(tx.transferDate).toLocaleString()}</p>
                  </div>
                </div>
              ))}

              {/* Current Active Owner */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full bg-emerald-500 border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center pulse-glow-success"></span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center leading-normal">
                    Current Holder Node State
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                      Inventory Holder
                    </span>
                  </h4>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{batch.currentOwnerName}</p>
                  <p className="text-[10px] text-slate-400">Current active location of product custody.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* High Security Packaging label card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-card-border/80 text-center space-y-6 sticky top-20">
            <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center border-b border-card-border/50 pb-4 text-left">
              <Barcode className="h-4.5 w-4.5 text-blue-500 mr-2" />
              Dynamic Packaging Barcode
            </h3>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 inline-block shadow-inner w-full">
              <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center min-h-[120px] w-full mx-auto relative group overflow-hidden">
                <canvas ref={canvasRef} style={{ display: "none" }} />
                {barcodeUrl ? (
                  <img src={barcodeUrl} className="mx-auto max-w-full" alt="Batch Barcode" />
                ) : (
                  <span className="text-[10px] text-slate-400">Generating Barcode...</span>
                )}
                <div className="absolute inset-0 bg-blue-600/5 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] bg-slate-900 text-white p-1.5 rounded font-bold">VERIFY PACKAGE</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              Print this dynamic barcode onto standard medicine boxes. Patients scan this barcode to view smart contract proof-of-authenticity.
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDownloadBarcode}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all cursor-pointer"
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print Label
              </button>
              
              <Link
                href={`/verify?batchId=${batch.batchId}`}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all font-semibold"
              >
                Scan Live
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

// Simple dynamic parameter handler visual helper
interface AlertCircleProps {
  className?: string;
}
function AlertCircle({ className }: AlertCircleProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
