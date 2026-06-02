"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { 
  Activity, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ShieldCheck, 
  LayoutDashboard, 
  LogOut,
  Layers
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (path: string) => pathname === path;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Features", path: "/features" },
    { name: "Verify Medicine", path: "/verify" },
    { name: "Block Explorer", path: "/explorer" },
    { name: "Contact", path: "/contact" },
  ];

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "Super Admin":
        return "/dashboard/admin";
      case "Manufacturer":
        return "/dashboard/manufacturer";
      case "Distributor":
        return "/dashboard/distributor";
      case "Pharmacy":
        return "/dashboard/pharmacy";
      default:
        return "/";
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-card-border backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-blue-600/10 dark:bg-blue-400/10 text-primary flex items-center justify-center">
                <Activity className="h-6 w-6 animate-pulse text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-outfit text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                PharmaChain
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  isLinkActive(link.path)
                    ? "text-primary bg-blue-600/5 dark:bg-blue-400/5"
                    : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Quick Actions (Theme, Dashboard, Auth) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={getDashboardLink()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all duration-150"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all duration-150"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex items-center md:hidden space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-t border-card-border px-2 pt-2 pb-4 space-y-1 sm:px-3 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isLinkActive(link.path)
                  ? "text-primary bg-blue-600/5 dark:bg-blue-400/5"
                  : "text-slate-600 dark:text-slate-300 hover:text-primary"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 pb-2 border-t border-card-border/50 px-3 flex flex-col space-y-2">
            {user ? (
              <>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 pb-2">
                  Signed in as: <span className="text-primary font-semibold">{user.organizationName || user.name}</span>
                </div>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-white bg-blue-600 text-sm font-medium"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center px-4 py-2 rounded-lg text-white bg-emerald-500 text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
