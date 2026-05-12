/**
 * AuthProvider Component
 *
 * Checks if user is logged in when the app first loads.
 * Calls /api/auth/me to validate the cookie and get user data.
 */

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function AuthProvider({ children }) {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}
