"use client";

import { create } from "zustand";

interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthStore {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  fetchUser: async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      set({ user: data.customer || null, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    set({ user: data });
    return {};
  },

  register: async ({ email, password, firstName, lastName }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    set({ user: data });
    return {};
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },
}));
