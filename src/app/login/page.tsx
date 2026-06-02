"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { dbService } from "../../services/db";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { Activity, Lock, Mail, ShieldAlert, Check, Database } from "lucide-react";

export default function Login() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSeedDB = async () => {
    setSeeding(true);
    setErrorMsg("");
    try {
      const msg = await dbService.seedDatabase();
      alert(msg);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to seed Firestore database.");
    } finally {
      setSeeding(false);
    }
  };

  // If already logged in, redirect to home/dashboard
  useEffect(() => {
    if (user) {
      routeToDashboard(user.role);
    }
  }, [user]);

  const routeToDashboard = (role: string) => {
    switch (role) {
      case "Super Admin":
        router.push("/dashboard/admin");
        break;
      case "Manufacturer":
        router.push("/dashboard/manufacturer");
        break;
      case "Distributor":
        router.push("/dashboard/distributor");
        break;
      case "Pharmacy":
        router.push("/dashboard/pharmacy");
        break;
      default:
        router.push("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg("");
    try {
      await login(email, password);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in. Please check your credentials.");
      setLoading(false);
    }
  };

  // Demo accounts autofill helper
  const handleAutofill = (role: string) => {
    switch (role) {
      case "admin":
        setEmail("admin@pharmachain.com");
        setPassword("admin123");
        break;
      case "mfg":
        setEmail("mfg@pharmachain.com");
        setPassword("mfg123");
        break;
      case "dist":
        setEmail("dist@pharmachain.com");
        setPassword("dist123");
        break;
      case "pharm":
        setEmail("pharmacy@pharmachain.com");
        setPassword("pharmacy123");
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col tech-grid bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />

      <section className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-card-border shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-xl bg-blue-600/10 text-primary mb-3">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="font-outfit text-2xl font-bold text-slate-900 dark:text-white">Partner Portal Sign In</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Access the secure pharmaceutical tracking network.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-start space-x-2">
              <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl flex items-center space-x-2">
              <Check className="h-4.5 w-4.5 flex-shrink-0" />
              <span>Authentication approved! Loading session portal...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Corporate Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full inline-flex items-center justify-center px-4 py-3.5 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Approving Sign In..." : "Authenticate Session"}
            </button>
          </form>

          {/* Quick Demo Login autofills */}
          <div className="mt-8 pt-6 border-t border-card-border/50 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Rapid Sandbox Testing Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-semibold">
              <button
                onClick={() => handleAutofill("mfg")}
                className="py-2 px-3 border border-blue-500/20 text-blue-600 bg-blue-500/5 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
              >
                Manufacturer
              </button>
              <button
                onClick={() => handleAutofill("dist")}
                className="py-2 px-3 border border-purple-500/20 text-purple-600 bg-purple-500/5 hover:bg-purple-500/10 rounded-lg transition-colors cursor-pointer"
              >
                Distributor
              </button>
              <button
                onClick={() => handleAutofill("pharm")}
                className="py-2 px-3 border border-emerald-500/20 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
              >
                Pharmacy Hub
              </button>
              <button
                onClick={() => handleAutofill("admin")}
                className="py-2 px-3 border border-pink-500/20 text-pink-600 bg-pink-500/5 hover:bg-pink-500/10 rounded-lg transition-colors cursor-pointer"
              >
                Super Admin
              </button>
            </div>
            
            <div className="pt-3">
              <button
                type="button"
                onClick={handleSeedDB}
                disabled={seeding}
                className="w-full py-2 px-3 border border-emerald-500/20 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Database className="h-3.5 w-3.5 text-emerald-600" />
                {seeding ? "Seeding Database..." : "Seed / Reset Firestore Demo Data"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-xs text-slate-500">
              Need a partner node?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-500 font-semibold">
                Register here
              </Link>
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
