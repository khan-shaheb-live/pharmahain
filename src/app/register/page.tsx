"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { 
  Activity, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Building, 
  ShieldAlert, 
  BadgeCheck 
} from "lucide-react";
import { UserRole } from "../../services/db";

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orgName, setOrgName] = useState("");
  const [role, setRole] = useState<UserRole>("Manufacturer");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Error: Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Error: Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        phone,
        organizationName: orgName || name,
        role,
        password
      });
      
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create partner account.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col tech-grid bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />

      <section className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg glass-card p-8 rounded-2xl border border-card-border shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 text-primary mb-3">
              <Activity className="h-6 w-6 text-emerald-500" />
            </div>
            <h2 className="font-outfit text-2xl font-bold text-slate-900 dark:text-white">Register Partner Node</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Connect your pharmaceutical organization to the blockchain tracking matrix.
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
              <BadgeCheck className="h-4.5 w-4.5 flex-shrink-0" />
              <span>Partner registered successfully! Spinning up dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Connor"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@pfizer.com"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 0199"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Organization Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Pfizer Biotech Inc."
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Supply Chain Node Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
              >
                <option value="Manufacturer">Manufacturer (Create & Mint Medicine Batches)</option>
                <option value="Distributor">Distributor (Log Logistics & Ship Batches)</option>
                <option value="Pharmacy">Pharmacy Hub (Verify & Deliver to Patients)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full inline-flex items-center justify-center px-4 py-3.5 text-sm font-semibold rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering Node..." : "Join PharmaChain Network"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-xs text-slate-500">
              Already have a node?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-semibold">
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
