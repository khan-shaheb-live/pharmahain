"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { dbService } from "../../../services/db";
import { blockchainService } from "../../../services/blockchain";
import { Sidebar } from "../../../components/dashboard/Sidebar";
import { DashboardHeader } from "../../../components/dashboard/DashboardHeader";
import { 
  Activity, 
  Layers, 
  ArrowLeft, 
  ShieldCheck, 
  Database, 
  Cpu, 
  QrCode,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2
} from "lucide-react";

export default function CreateBatch() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Form states
  const [medicineName, setMedicineName] = useState("");
  const [batchId, setBatchId] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState<number>(1000);
  const [wholesalePrice, setWholesalePrice] = useState<number>(1.50);
  const [ingredientEntries, setIngredientEntries] = useState<Array<{ name: string; percentage: number }>>([
    { name: "", percentage: 100 }
  ]);
  const [selectedIndications, setSelectedIndications] = useState<string[]>([]);

  const AVAILABLE_INDICATIONS = [
    "Pain Relief",
    "Fever Reduction",
    "Bacterial Infections",
    "High Blood Pressure",
    "Heart Failure",
    "Inflammation",
    "Cough & Cold",
    "Allergy Relief",
    "Diabetes Management",
    "Acid Reflux"
  ];

  const handleAddIngredient = () => {
    setIngredientEntries([...ingredientEntries, { name: "", percentage: 0 }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredientEntries.length > 1) {
      setIngredientEntries(ingredientEntries.filter((_, i) => i !== index));
    }
  };

  const handleIngredientChange = (index: number, field: "name" | "percentage", value: string | number) => {
    const updated = [...ingredientEntries];
    if (field === "name") {
      updated[index].name = value as string;
    } else {
      updated[index].percentage = Number(value);
    }
    setIngredientEntries(updated);
  };

  // Workflow tracking states
  const [activeStep, setActiveStep] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");

  // Role validation guard: Only Manufacturers can formulate batches
  useEffect(() => {
    if (!loading && user && user.role !== "Manufacturer") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName || !batchId || !manufactureDate || !expiryDate || quantity <= 0 || selectedIndications.length === 0) return;

    // Validate ingredients entries
    if (ingredientEntries.some(e => !e.name.trim())) {
      setErrorMsg("Validation Error: All active ingredient names must be filled out.");
      return;
    }
    if (ingredientEntries.some(e => e.percentage <= 0)) {
      setErrorMsg("Validation Error: Ingredient percentage must be greater than 0%.");
      return;
    }
    const totalPercent = ingredientEntries.reduce((sum, e) => sum + e.percentage, 0);
    if (totalPercent > 100) {
      setErrorMsg(`Validation Error: Total percentage of ingredients cannot exceed 100%. (Current total: ${totalPercent}%)`);
      return;
    }

    setErrorMsg("");
    setSubmitting(true);
    setActiveStep(1); // Step 1: Save metadata to Cloud Firestore

    try {
      // 1. Convert dates to standard timestamps for Ethereum smart contract compatibility
      const mfgTimestamp = Math.floor(new Date(manufactureDate).getTime() / 1000);
      const expTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);

      if (expTimestamp <= mfgTimestamp) {
        throw new Error("Validation Error: Expiry date must be after manufacture date.");
      }

      // Check if Batch ID already registered
      const existing = await dbService.getBatch(batchId.trim());
      if (existing) {
        throw new Error(`Validation Error: Batch ID "${batchId}" is already registered in the ledger database.`);
      }

      // Progress bar simulation
      setTimeout(() => setActiveStep(2), 1000); // Step 2: Register on Polygon Blockchain Smart Contract

      // 2. Perform Blockchain EVM Smart Contract register call
      const contractTxHash = await blockchainService.registerMedicineBatch(
        batchId.trim(),
        medicineName.trim(),
        user!.organizationName || user!.name,
        quantity,
        mfgTimestamp,
        expTimestamp
      );
      setTxHash(contractTxHash);

      // Progress bar simulation
      setTimeout(() => setActiveStep(3), 2000); // Step 3: Write metadata & dynamic QR code links

      // 3. Save batch record in Firebase/Local Cloud database
      const indicationsString = selectedIndications.join(", ");
      const ingredientsString = ingredientEntries.map(e => `${e.name.trim()} (${e.percentage}%)`).join(", ");
      const ingredientPercentages = ingredientEntries.map(e => ({ name: e.name.trim(), percentage: e.percentage }));
      
      await dbService.createBatch({
        batchId: batchId.trim(),
        medicineName: medicineName.trim(),
        manufacturerId: user!.uid,
        manufacturerName: user!.organizationName || user!.name,
        manufactureDate,
        expiryDate,
        quantity,
        blockchainHash: contractTxHash,
        ingredients: ingredientsString,
        ingredientPercentages,
        indications: indicationsString,
        wholesalePrice: wholesalePrice
      });

      // Step 4: Verification success
      setTimeout(() => {
        setActiveStep(4);
        setTimeout(() => {
          router.push("/dashboard/manufacturer");
        }, 1500);
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to formulate medicine batch. Blockchain signature rejected.");
      setSubmitting(false);
      setActiveStep(0);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200 w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <DashboardHeader />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-3xl mx-auto">
      {/* Return link */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Return to Portal Overview
      </button>

      <div className="glass-card p-8 rounded-3xl border border-card-border shadow-xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500"></div>

        <div>
          <h1 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white">
            Register Medicine Batch Formulation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill the standard pharmaceutical metadata. Submitting logs batch credentials to the blockchain.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-start space-x-2">
            <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitting ? (
          /* Multi-step pipeline tracker visualizer */
          <div className="py-8 space-y-8">
            <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-white text-center">
              On-Chain Formulating Matrix Execution
            </h3>

            <div className="grid grid-cols-3 gap-4 text-center text-xs relative max-w-lg mx-auto">
              <div className="absolute top-4 left-1/6 right-1/6 h-[2px] bg-slate-200 dark:bg-slate-800 -z-10"></div>
              
              {/* Step 1 */}
              <div className="space-y-2">
                <span className={`h-8.5 w-8.5 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                  activeStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}>
                  <Database className="h-4.5 w-4.5" />
                </span>
                <p className={`font-semibold ${activeStep >= 1 ? "text-slate-800 dark:text-white" : "text-slate-400"}`}>
                  Firestore Cloud Sync
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <span className={`h-8.5 w-8.5 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                  activeStep >= 2 ? "bg-purple-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}>
                  <Cpu className="h-4.5 w-4.5" />
                </span>
                <p className={`font-semibold ${activeStep >= 2 ? "text-slate-800 dark:text-white" : "text-slate-400"}`}>
                  Polygon L2 Minting
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <span className={`h-8.5 w-8.5 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                  activeStep >= 3 ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}>
                  <QrCode className="h-4.5 w-4.5" />
                </span>
                <p className={`font-semibold ${activeStep >= 3 ? "text-slate-800 dark:text-white" : "text-slate-400"}`}>
                  QR Verification
                </p>
              </div>
            </div>

            {activeStep === 4 && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center animate-bounce">
                🎉 Smart Contract registration succeeded! Batch ledger is live.
              </div>
            )}
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Medicine Commercial Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Amoxicillin Trihydrate 500mg"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Unique Batch Number/ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="BAT-77382-PZ"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Manufacturing Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={manufactureDate}
                    onChange={(e) => setManufactureDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Expiry Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Batch Total Quantity (Units) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Initial Wholesale Price ($ / unit) *
                </label>
                <input
                  type="number"
                  required
                  min={0.01}
                  step="0.01"
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors font-semibold"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Active Ingredients & Concentrations *
                </label>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="inline-flex items-center text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Ingredient
                </button>
              </div>

              <div className="space-y-3">
                {ingredientEntries.map((entry, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Paracetamol"
                        value={entry.name}
                        onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    </div>
                    <div className="w-28 relative">
                      <input
                        type="number"
                        required
                        min={1}
                        max={100}
                        placeholder="100"
                        value={entry.percentage || ""}
                        onChange={(e) => handleIngredientChange(index, "percentage", e.target.value)}
                        className="w-full pl-4 pr-7 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-colors font-semibold"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 pointer-events-none font-bold">
                        %
                      </span>
                    </div>
                    {ingredientEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Therapeutic Indications / Uses *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                {AVAILABLE_INDICATIONS.map((ind) => {
                  const checked = selectedIndications.includes(ind);
                  return (
                    <label 
                      key={ind} 
                      className={`flex items-center space-x-2.5 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none ${
                        checked 
                          ? "bg-blue-600/5 border-blue-600/30 text-blue-600 dark:text-blue-400" 
                          : "border-slate-100 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            setSelectedIndications(selectedIndications.filter((x) => x !== ind));
                          } else {
                            setSelectedIndications([...selectedIndications, ind]);
                          }
                        }}
                        className="h-3.5 w-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-800"
                      />
                      <span>{ind}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-4 py-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <ShieldCheck className="mr-2 h-5 w-5" />
              Sign Ledger & Mint Batch
            </button>
          </form>
        )}
      </div>
          </div>
        </main>
      </div>
    </div>
  );
}
