/**
 * CartProvider Component
 *
 * Loads the cart from localStorage when the app first mounts.
 * Without this, the cart would start empty on every page refresh.
 */

"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

export default function CartProvider({ children }) {
  const loadCart = useCartStore((state) => state.loadCart);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return <>{children}</>;
}
