"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  Activity, 
  Layers, 
  PlusCircle, 
  ArrowLeftRight, 
  QrCode, 
  Users, 
  Cpu, 
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isLinkActive = (path: string) => pathname === path;

  // Build role-based navigation links
  const getNavLinks = () => {
    const common = [{ name: "Overview", path: getOverviewPath(user.role), icon: <LayoutDashboard className="h-5 w-5" /> }];

    switch (user.role) {
      case "Super Admin":
        return [
          ...common,
          { name: "Active Partners", path: "/dashboard/admin/users", icon: <Users className="h-5 w-5" /> },
          { name: "All Batches", path: "/batches", icon: <Layers className="h-5 w-5" /> },
          { name: "Blockchain Ledger", path: "/explorer", icon: <Cpu className="h-5 w-5" /> },
          { name: "Public Verify", path: "/verify", icon: <QrCode className="h-5 w-5" /> }
        ];
      case "Manufacturer":
        return [
          ...common,
          { name: "Register Batch", path: "/batches/create", icon: <PlusCircle className="h-5 w-5" /> },
          { name: "My Batches", path: "/batches", icon: <Layers className="h-5 w-5" /> },
          { name: "Custody Transfers", path: "/transfers", icon: <ArrowLeftRight className="h-5 w-5" /> },
          { name: "Ledger Explorer", path: "/explorer", icon: <Cpu className="h-5 w-5" /> }
        ];
      case "Distributor":
        return [
          ...common,
          { name: "Received Batches", path: "/batches", icon: <Layers className="h-5 w-5" /> },
          { name: "Transit Records", path: "/transfers", icon: <ArrowLeftRight className="h-5 w-5" /> },
          { name: "Ledger Explorer", path: "/explorer", icon: <Cpu className="h-5 w-5" /> }
        ];
      case "Pharmacy":
        return [
          ...common,
          { name: "Stock Inventory", path: "/batches", icon: <Layers className="h-5 w-5" /> },
          { name: "Receiving Transfers", path: "/transfers", icon: <ArrowLeftRight className="h-5 w-5" /> },
          { name: "Ledger Explorer", path: "/explorer", icon: <Cpu className="h-5 w-5" /> },
          { name: "Verify Customer", path: "/verify", icon: <QrCode className="h-5 w-5" /> }
        ];
      default:
        return common;
    }
  };

  const getOverviewPath = (role: string) => {
    switch (role) {
      case "Super Admin": return "/dashboard/admin";
      case "Manufacturer": return "/dashboard/manufacturer";
      case "Distributor": return "/dashboard/distributor";
      case "Pharmacy": return "/dashboard/pharmacy";
      default: return "/";
    }
  };

  return (
    <aside className="w-64 glass-card border-r border-card-border bg-sidebar/80 h-screen flex flex-col justify-between sticky top-0 shrink-0 transition-all duration-200">
      <div className="flex flex-col flex-1">
        {/* Sidebar Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-card-border/50">
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-600/10 text-primary">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-outfit font-bold text-md tracking-tight bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              PharmaChain
            </span>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-card-border/50 bg-slate-50/50 dark:bg-slate-900/35">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 dark:bg-blue-400/10 flex items-center justify-center text-primary font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-950 dark:text-slate-100 truncate">
                {user.organizationName || user.name}
              </p>
              <div className="flex items-center mt-0.5 text-[9px] font-semibold text-emerald-500">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {getNavLinks().map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                isLinkActive(link.path)
                  ? "bg-blue-600/10 dark:bg-blue-400/10 text-primary"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-100"
              }`}
            >
              <span className="mr-3 text-slate-400 group-hover:text-primary transition-colors">
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Logout Action Footer */}
      <div className="p-4 border-t border-card-border/50">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut className="mr-2.5 h-4 w-4" />
          Logout Node Session
        </button>
      </div>
    </aside>
  );
};
