/**
 * Cart Store (Zustand)
 *
 * Manages shopping cart state for guest users.
 * Persists to localStorage so cart survives page refreshes.
 *
 * Each cart item now includes variant info:
 * - itemId: The Item _id from the database (for stock deduction)
 * - color: Selected color (null if product has no colors)
 * - compatibleCar: Selected car model (null if fits all)
 *
 * When user authentication is added later, this becomes the guest cart.
 * On login, guest cart will merge with the user's database cart.
 */

import { create } from "zustand";

// Load cart from localStorage when initializing
const loadCartFromStorage = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("sahandcover-cart");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save cart to localStorage after every change
const saveCartToStorage = (items) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sahandcover-cart", JSON.stringify(items));
  } catch {
    // localStorage might be full or unavailable
  }
};

// Helper: sync current cart to database if user is logged in
const syncToDB = async (items) => {
  try {
    const { useAuthStore } = await import("@/store/auth");
    const user = useAuthStore.getState().user;
    if (!user) return;

    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price,
          color: item.color || null,
          compatibleCar: item.compatibleCar || null,
          itemId: item.itemId || null,
        })),
      }),
    });
  } catch {
    // Silent fail — localStorage still works
  }
};

export const useCartStore = create((set, get) => ({
  // Array of cart items
  items: [],
  isSynced: false,

  // Load cart from localStorage — call once when app mounts
  loadCart: () => {
    const items = loadCartFromStorage();
    set({ items, isSynced: false });
  },

  // Sync localStorage cart to database (called after login)
  syncToDatabase: async () => {
    try {
      const { items } = get();
      if (items.length === 0) return;
      await syncToDB(items);
      set({ isSynced: true });
    } catch {}
  },

  // Load cart from database (called on login to replace localStorage cart)
  loadFromDatabase: async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) return;

      const data = await res.json();
      const dbItems = data.data.items || [];
      if (dbItems.length === 0) return;

      // Convert DB format to cart store format
      const convertedItems = dbItems.map((item) => ({
        productId: (item.product._id || item.product).toString(),
        itemId: item.itemId || null,
        name: item.product.name || "",
        nameFa: item.product.nameFa || "",
        price: item.price,
        mainImage: item.product.mainImage || "",
        color: item.color || null,
        compatibleCar: item.compatibleCar || null,
        quantity: item.quantity,
        maxQuantity: item.stockAvailable || 99,
      }));

      set({ items: convertedItems, isSynced: true });
      saveCartToStorage(convertedItems);
    } catch {}
  },

  // Merge guest cart with DB cart (called on login)
  mergeCart: async () => {
    const { items: guestItems } = get();

    if (guestItems.length === 0) {
      await get().loadFromDatabase();
      return;
    }

    try {
      const res = await fetch("/api/cart");
      let dbItems = [];

      if (res.ok) {
        const data = await res.json();
        dbItems = (data.data.items || []).map((item) => ({
          productId: (item.product._id || item.product).toString(),
          itemId: item.itemId || null,
          name: item.product.name || "",
          nameFa: item.product.nameFa || "",
          price: item.price,
          mainImage: item.product.mainImage || "",
          color: item.color || null,
          compatibleCar: item.compatibleCar || null,
          quantity: item.quantity,
          maxQuantity: item.stockAvailable || 99,
        }));
      }

      // Merge: items with same productId + color + car get quantities combined
      const merged = [...dbItems];

      guestItems.forEach((guestItem) => {
        const existingIndex = merged.findIndex(
          (dbItem) =>
            dbItem.productId === guestItem.productId &&
            dbItem.color === guestItem.color &&
            dbItem.compatibleCar === guestItem.compatibleCar,
        );
        if (existingIndex > -1) {
          merged[existingIndex].quantity += guestItem.quantity;
          merged[existingIndex].quantity = Math.min(
            merged[existingIndex].quantity,
            merged[existingIndex].maxQuantity || 99,
          );
        } else {
          merged.push(guestItem);
        }
      });

      set({ items: merged, isSynced: true });
      saveCartToStorage(merged);

      await syncToDB(merged);
    } catch {}
  },

  // Add item to cart
  // product should include: _id, name, nameFa, price, mainImage, color, compatibleCar, stock.available, itemId
  addItem: (product, quantity = 1) => {
    const { items } = get();
    const color = product.color || null;
    const car = product.compatibleCar || null;

    // Find existing item with same product + color + car
    const existingIndex = items.findIndex(
      (item) =>
        item.productId === product._id &&
        item.color === color &&
        item.compatibleCar === car,
    );

    let updated;

    if (existingIndex > -1) {
      // Already in cart — increase quantity
      updated = [...items];
      const currentQty = updated[existingIndex].quantity;
      const maxQty =
        product.stock?.available || updated[existingIndex].maxQuantity || 99;
      updated[existingIndex].quantity = Math.min(currentQty + quantity, maxQty);
    } else {
      // New item — add to cart
      const newItem = {
        productId: product._id,
        itemId: product.itemId || null,
        name: product.name,
        nameFa: product.nameFa || product.name,
        price: product.price,
        mainImage: product.mainImage || "",
        color: color,
        compatibleCar: car,
        quantity,
        maxQuantity: product.stock?.available || 99,
      };
      updated = [...items, newItem];
    }

    set({ items: updated });
    saveCartToStorage(updated);
    syncToDB(updated);
  },

  // Remove an item from cart
  removeItem: (productId, color = null, compatibleCar = null) => {
    const updated = get().items.filter(
      (item) =>
        !(
          item.productId === productId &&
          item.color === color &&
          item.compatibleCar === compatibleCar
        ),
    );
    set({ items: updated });
    saveCartToStorage(updated);
    syncToDB(updated);
  },

  // Update quantity of an item
  updateQuantity: (productId, quantity, color = null, compatibleCar = null) => {
    const { items } = get();
    const updated = items.map((item) =>
      item.productId === productId &&
      item.color === color &&
      item.compatibleCar === compatibleCar
        ? {
            ...item,
            quantity: Math.min(Math.max(1, quantity), item.maxQuantity),
          }
        : item,
    );
    set({ items: updated });
    saveCartToStorage(updated);
    syncToDB(updated);
  },

  // Clear entire cart
  clearCart: () => {
    set({ items: [] });
    saveCartToStorage([]);

    // Also clear from database if logged in
    const clearFromDB = async () => {
      try {
        const { useAuthStore } = await import("@/store/auth");
        const user = useAuthStore.getState().user;
        if (!user) return;
        await fetch("/api/cart", { method: "DELETE" });
      } catch {}
    };
    clearFromDB();
  },

  // Get total number of items (sum of all quantities)
  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Get total price of all items
  getTotalPrice: () => {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  },
}));
