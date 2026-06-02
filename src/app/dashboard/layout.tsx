"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/login");
    }
  }, [user, loading, mounted, router]);

  // Loading skeleton screen
  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 h-12 w-12 border-4 border-blue-600/20 rounded-full"></div>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-outfit animate-pulse">
          Decrypting session credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Dynamic Role Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Dynamic header with MetaMask integration */}
        <DashboardHeader />

        {/* Scrollable Dashboard Context children */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
