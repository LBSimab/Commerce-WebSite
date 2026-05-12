/**
 * Auth Store (Zustand)
 *
 * Manages user authentication state on the client.
 * Tracks current user, login/register/logout actions.
 */

import { create } from "zustand";

export const useAuthStore = create((set) => ({
  // Current user (null when not logged in)
  user: null,

  // Loading state for auth checks
  isLoading: true,

  // Set user after login/register
  setUser: (user) => set({ user, isLoading: false }),

  // Clear user after logout
  clearUser: () => set({ user: null, isLoading: false }),

  // Mark loading as done (used when no user is found)
  setLoadingDone: () => set({ isLoading: false }),

  // Fetch current user from API
  fetchUser: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.data, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  // Login action
  login: async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    set({ user: data.data });

    // Merge guest cart with database cart
    const { useCartStore } = await import("@/store/cart");
    useCartStore.getState().mergeCart();

    return data;
  },
  //register
  register: async (name, email, password) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    set({ user: data.data });

    // Sync guest cart to database (new user has no DB cart)
    const { useCartStore } = await import("@/store/cart");
    useCartStore.getState().syncToDatabase();

    return data;
  },

  // Logout action
  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },
}));
