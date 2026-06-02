"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole, dbService } from "../services/db";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<UserProfile>;
  register: (userData: Omit<UserProfile, "uid" | "createdAt"> & { password?: string }) => Promise<UserProfile>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  isAuthorized: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load current session user on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const currentUser = await dbService.getCurrentSessionUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading session user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const login = async (email: string, password?: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await dbService.loginUser(email, password);
      setUser(profile);
      // Route user to appropriate dashboard based on role
      routeToDashboard(profile.role);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    userData: Omit<UserProfile, "uid" | "createdAt"> & { password?: string }
  ): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await dbService.registerUser(userData);
      setUser(profile);
      routeToDashboard(profile.role);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await dbService.logoutUser();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    await dbService.forgotPassword(email);
  };

  const isAuthorized = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const routeToDashboard = (role: UserRole) => {
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, isAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
