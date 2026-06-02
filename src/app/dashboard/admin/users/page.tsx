"use client";

import React, { useState, useEffect } from "react";
import { dbService, UserProfile } from "../../../../services/db";
import { Users, Search, ShieldCheck, Mail, Phone, Building } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const list = await dbService.getAllUsers();
        setUsers(list);
        setFiltered(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
    if (!query.trim()) {
      setFiltered(users);
      return;
    }
    const clean = query.trim().toLowerCase();
    const matched = users.filter(
      (u) =>
        u.name.toLowerCase().includes(clean) ||
        u.email.toLowerCase().includes(clean) ||
        u.organizationName.toLowerCase().includes(clean) ||
        u.role.toLowerCase().includes(clean)
    );
    setFiltered(matched);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Super Admin":
        return "bg-pink-500/10 text-pink-500 border border-pink-500/20";
      case "Manufacturer":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "Distributor":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/20";
      case "Pharmacy":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white">
            Active Supply Chain Partners
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse and audit verified partner node profiles connected to the global network.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by Name, Org, Email, or Role..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-colors"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
      </div>

      {/* Partners List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.length > 0 ? (
            filtered.map((u) => (
              <div key={u.uid} className="glass-card p-6 rounded-2xl border border-card-border space-y-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3.5">
                    <div className="h-11 w-11 rounded-xl bg-blue-600/10 text-primary flex items-center justify-center font-bold font-outfit text-lg">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{u.name}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                        <Building className="h-3.5 w-3.5 mr-1" />
                        {u.organizationName}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase ${getRoleBadge(u.role)}`}>
                    {u.role}
                  </span>
                </div>

                <div className="pt-4 border-t border-card-border/30 grid grid-cols-1 gap-2 text-xs">
                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{u.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{u.phone}</span>
                  </div>
                </div>

                <div className="pt-2 text-[9px] text-slate-400 flex justify-between items-center">
                  <span>Node ID: {u.uid.substring(0, 12)}</span>
                  <span>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-500">
              No registered partners matched your search query.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
