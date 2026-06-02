"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { dbService, MedicineBatch, OwnershipTransfer } from "../../services/db";
import { blockchainService } from "../../services/blockchain";
import { 
  Barcode, 
  Camera,
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Layers, 
  User, 
  Cpu, 
  History,
  FileCheck,
  TrendingUp,
  MapPin,
  ArrowDown
} from "lucide-react";
import confetti from "canvas-confetti";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const batchIdParam = searchParams.get("batchId");

  const [batchId, setBatchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [batch, setBatch] = useState<MedicineBatch | null>(null);
  const [onChainData, setOnChainData] = useState<{ isGenuine: boolean; currentOwner: string; scansCount: number } | null>(null);
  const [transfers, setTransfers] = useState<OwnershipTransfer[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    let scanner: any = null;
    if (showScanner) {
      import("html5-qrcode").then(({ Html5QrcodeScanner, Html5QrcodeSupportedFormats }) => {
        scanner = new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 300, height: 120 },
            formatsToSupport: [
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.QR_CODE
            ]
          },
          false
        );

        scanner.render(
          (decodedText: string) => {
            setBatchId(decodedText);
            setShowScanner(false);
            triggerVerification(decodedText);
            scanner.clear().catch((err: any) => console.error("Error clearing scanner", err));
          },
          () => {
            // Ignore ongoing frame decoding failures
          }
        );
      }).catch(err => {
        console.error("Error loading html5-qrcode library", err);
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((err: any) => console.error("Error clearing scanner on unmount", err));
      }
    };
  }, [showScanner]);

  // Handle URL Param scan search
  useEffect(() => {
    if (batchIdParam) {
      setBatchId(batchIdParam);
      triggerVerification(batchIdParam);
    }
  }, [batchIdParam]);

  const triggerVerification = async (targetId: string) => {
    if (!targetId.trim()) return;
    setLoading(true);
    setSearched(true);
    setErrorMsg("");
    setBatch(null);
    setOnChainData(null);
    setTransfers([]);

    try {
      // 1. Fetch details from Firestore (Cloud DB)
      const data = await dbService.getBatch(targetId);
      
      // 2. Fetch cryptographic validation from Polygon (Blockchain Layer)
      const chainVerification = await blockchainService.verifyMedicine(targetId);

      // Log the verification scan event in the database for analytics
      await dbService.logVerification(targetId, data !== null, chainVerification.isGenuine);

      if (data) {
        setBatch(data);
        setOnChainData(chainVerification);
        
        // 3. Load custody history
        const allTransfers = await dbService.getAllTransfers();
        const batchHistory = allTransfers
          .filter((t) => t.batchId.toUpperCase() === targetId.toUpperCase() && t.status === "Accepted")
          .sort((a, b) => new Date(a.transferDate).getTime() - new Date(b.transferDate).getTime());
        setTransfers(batchHistory);

        // 4. Trigger celebration confetti if verified genuine
        if (chainVerification.isGenuine) {
          triggerConfetti();
        }
      } else {
        // Medicine not registered anywhere
        setErrorMsg("Warning: Batch ID not registered on Cloud Database or Blockchain Ledger.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Verification process failed to connect to smart contract layers.");
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/verify?batchId=${encodeURIComponent(batchId.trim())}`);
  };

  const loadDemoCode = (code: string) => {
    setBatchId(code);
    router.push(`/verify?batchId=${encodeURIComponent(code)}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-1">
      {/* Scanner Section */}
      <div className="glass-card p-8 rounded-3xl border border-card-border shadow-xl mb-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500"></div>

        <div className="inline-flex p-4 rounded-2xl bg-blue-600/10 dark:bg-blue-400/10 text-primary mb-4">
          <Barcode className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
        </div>
        
        <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Secure Authenticity Scan Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
          Verify medicines immediately. Input the unique Batch ID or scan the package barcode to query the immutable Polygon ledger.
        </p>

        {/* Input Form */}
        <form onSubmit={handleManualSearch} className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Enter Medicine Batch ID (e.g. BAT-77382-PZ)"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="flex-1 px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 font-mono tracking-wide"
          />
          <button
            type="button"
            onClick={() => setShowScanner(!showScanner)}
            className={`px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all inline-flex justify-center items-center gap-2 cursor-pointer ${
              showScanner 
                ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20" 
                : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
            }`}
          >
            <Camera className="h-4 w-4" />
            {showScanner ? "Close Camera" : "Scan Barcode"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition-colors inline-flex justify-center items-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
          >
            <Search className="h-4 w-4" />
            {loading ? "Querying Network..." : "Verify Ledger"}
          </button>
        </form>

        {/* Camera Scanner Container */}
        {showScanner && (
          <div className="mt-6 max-w-xl mx-auto overflow-hidden rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
            <div id="reader" className="w-full"></div>
            <p className="text-[10px] text-slate-400 mt-2">
              Please grant camera permission and align the barcode within the selector box.
            </p>
          </div>
        )}

        {/* Rapid Test triggers */}
        <div className="mt-6 flex flex-wrap justify-center items-center gap-2.5 text-[10px] font-bold text-slate-400 uppercase">
          <span>Sandbox Codes:</span>
          <button
            onClick={() => loadDemoCode("BAT-77382-PZ")}
            className="py-1 px-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-600/10 dark:hover:bg-blue-400/10 hover:text-primary transition-colors cursor-pointer"
          >
            Amoxicillin (Genuine)
          </button>
          <button
            onClick={() => loadDemoCode("BAT-55421-MD")}
            className="py-1 px-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-600/10 dark:hover:bg-blue-400/10 hover:text-primary transition-colors cursor-pointer"
          >
            Lisinopril (Genuine)
          </button>
          <button
            onClick={() => loadDemoCode("BAT-FAKE-99")}
            className="py-1 px-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-500 transition-colors cursor-pointer"
          >
            Suspicious Code (Counterfeit)
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20 space-y-4">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 font-outfit">
            Establishing secure connection to Polygon Ledger Node...
          </p>
        </div>
      )}

      {/* Results Section */}
      {searched && !loading && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {batch && onChainData?.isGenuine ? (
            /* GENUINE RESULTS */
            <div className="space-y-8">
              {/* Massive Genuine Banner */}
              <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
                <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-500">
                  <ShieldCheck className="h-12 w-12" />
                </div>
                <h2 className="font-outfit text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ✅ Genuine Medicine Registered
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Verification successful. This medicine has been compiled, minted, and authenticated on the immutable blockchain ledger.
                </p>
              </div>

              {/* Detail Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Batch Profile */}
                <div className="glass-card p-6 rounded-2xl border border-card-border space-y-4">
                  <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center border-b border-card-border/50 pb-3">
                    <Layers className="h-4 w-4 text-blue-500 mr-2" />
                    Medicine Batch Profile
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Medicine Name</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{batch.medicineName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Batch Number</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{batch.batchId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quantity Registered</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{batch.quantity.toLocaleString()} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Manufacture Date</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        {batch.manufactureDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expiration Date</span>
                      <span className="font-semibold text-red-500 flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-red-500/60" />
                        {batch.expiryDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Blockchain Proof */}
                <div className="glass-card p-6 rounded-2xl border border-card-border space-y-4">
                  <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center border-b border-card-border/50 pb-3">
                    <Cpu className="h-4 w-4 text-emerald-500 mr-2" />
                    Cryptographic Proof-of-Trust
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Smart Contract Verifier</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">PharmaChain.sol</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verification Ledger</span>
                      <span className="text-emerald-500 font-semibold flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-glow-success mr-1.5"></span>
                        Polygon State Match
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Verification Scans</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                        <TrendingUp className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        {onChainData.scansCount} times
                      </span>
                    </div>
                    <div className="space-y-1 pt-1">
                      <span className="text-slate-400 block mb-1">Minting Transaction Hash</span>
                      <span className="font-mono text-[10px] text-blue-500 bg-blue-600/5 p-2 rounded border border-blue-500/10 block break-all leading-normal font-semibold">
                        {batch.blockchainHash}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custody Chain of Ownership */}
              <div className="glass-card p-8 rounded-2xl border border-card-border space-y-6">
                <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center border-b border-card-border/50 pb-4">
                  <History className="h-4 w-4 text-purple-500 mr-2" />
                  Custodian Audit Trail History
                </h3>

                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-8">
                  {/* Step 1: Manufacturer */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 h-4.5 w-4.5 rounded-full bg-blue-600 border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center"></span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center">
                        Batch Formulated & Cryptographed
                        <span className="ml-2 px-2 py-0.5 rounded text-[8px] bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase font-semibold">
                          Manufacturer
                        </span>
                      </h4>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">{batch.manufacturerName}</p>
                      <p className="text-[10px] text-slate-400">Created: {new Date(batch.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Dynamic Custody Transfers */}
                  {transfers.length > 0 ? (
                    transfers.map((tx, idx) => (
                      <div key={tx.transferId} className="relative">
                        <span className="absolute -left-[31px] top-0.5 h-4.5 w-4.5 rounded-full bg-purple-500 border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center"></span>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center">
                            Custody Transferred
                            <span className="ml-2 px-2 py-0.5 rounded text-[8px] bg-purple-500/10 text-purple-500 border border-purple-500/20 uppercase font-semibold">
                              Logistic Node Handshake
                            </span>
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            From: <span className="font-semibold text-slate-800 dark:text-slate-200">{tx.fromUserName}</span> ➔ To: <span className="font-semibold text-slate-800 dark:text-slate-200">{tx.toUserName}</span>
                          </p>
                          {tx.notes && <p className="text-[10px] text-slate-400 italic">“{tx.notes}”</p>}
                          <p className="text-[10px] text-slate-400">Transferred: {new Date(tx.transferDate).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : null}

                  {/* Current Custodian */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 h-4.5 w-4.5 rounded-full bg-emerald-500 border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center pulse-glow-success"></span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center">
                        Active Verified Holder
                        <span className="ml-2 px-2 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase font-semibold">
                          Current Custody
                        </span>
                      </h4>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">{batch.currentOwnerName}</p>
                      <p className="text-[10px] text-slate-400">Current status is logged as active and ready for safe client consumption.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* COUNTERFEIT WARNING */
            <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center space-y-4 relative overflow-hidden animate-shake">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none"></div>
              <div className="inline-flex p-3 rounded-full bg-red-500/20 text-red-500">
                <ShieldAlert className="h-12 w-12" />
              </div>
              <h2 className="font-outfit text-2xl font-extrabold text-red-600 dark:text-red-400">
                ❌ Potential Counterfeit Product Detected
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                {errorMsg || "CRITICAL ALERT: This Batch ID could not be matched against any registered pharmaceutical logs on the immutable blockchain. Please do not consume this medicine and contact local health regulatory boards immediately."}
              </p>
              <div className="pt-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-500 border border-red-500/30 font-mono">
                  ERROR: CRYPTOGRAPHIC STATE MISMATCH
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Verify() {
  return (
    <div className="min-h-screen flex flex-col tech-grid bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <VerifyContent />
      </Suspense>
      <Footer />
    </div>
  );
}
