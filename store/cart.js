import { create } from "zustand";

// Helper: sync current cart to database if user is logged in
const syncToDB = async (items) => {
  try {
    const { useAuthStore } = await import("@/store/auth");
    const user = useAuthStore.getState().user;

    // Only sync if user is logged in
    if (!user) return;

    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      }),
    });
  } catch {
    // Silent fail — localStorage still works
  }
};

// Load guest cart from local
// Storage
const loadCartFromStorage = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("sahandcover-cart");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save guest cart to localStorage
const saveCartToStorage = (items) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sahandcover-cart", JSON.stringify(items));
  } catch {}
};

export const useCartStore = create((set, get) => ({
  items: [],
  isSynced: false, // Track if cart has been synced with DB

  // Load cart from localStorage
  loadCart: () => {
    const items = loadCartFromStorage();
    set({ items, isSynced: false });
  },

  // Sync localStorage cart to database (called after login)
  syncToDatabase: async () => {
    try {
      const { items } = get();
      if (items.length === 0) return;

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (res.ok) {
        set({ isSynced: true });
      }
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
        productId: item.product._id || item.product,
        name: item.product.name || "",
        nameFa: item.product.nameFa || "",
        price: item.price,
        mainImage: item.product.mainImage || "",
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
      // No guest items — just load from DB
      await get().loadFromDatabase();
      return;
    }

    try {
      // Load DB cart
      const res = await fetch("/api/cart");
      let dbItems = [];

      if (res.ok) {
        const data = await res.json();
        dbItems = (data.data.items || []).map((item) => ({
          productId: (item.product._id || item.product).toString(),
          name: item.product.name || "",
          nameFa: item.product.nameFa || "",
          price: item.price,
          mainImage: item.product.mainImage || "",

          quantity: item.quantity,
          maxQuantity: item.stockAvailable || 99,
        }));
      }

      // Merge: combine quantities for same product, keep unique items
      const merged = [...dbItems];

      guestItems.forEach((guestItem) => {
        const existingIndex = merged.findIndex(
          (dbItem) => dbItem.productId === guestItem.productId,
        );
        if (existingIndex > -1) {
          // Product exists in both — add quantities
          merged[existingIndex].quantity += guestItem.quantity;
          merged[existingIndex].quantity = Math.min(
            merged[existingIndex].quantity,
            merged[existingIndex].maxQuantity || 99,
          );
        } else {
          // New product — add to merged cart
          merged.push(guestItem);
        }
      });

      set({ items: merged, isSynced: true });
      saveCartToStorage(merged);

      // Sync merged cart to DB
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: merged.map((item) => ({
            product: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });
    } catch {}
  },

  // Add item
  addItem: (product, quantity = 1) => {
    const { items } = get();
    const existingIndex = items.findIndex(
      (item) => item.productId === product._id,
    );

    let updated;
    if (existingIndex > -1) {
      updated = [...items];
      const maxQty = product.stock?.available || 99;
      updated[existingIndex].quantity = Math.min(
        updated[existingIndex].quantity + quantity,
        maxQty,
      );
    } else {
      updated = [
        ...items,
        {
          productId: product._id,
          name: product.name,
          nameFa: product.nameFa || product.name,
          price: product.discountPrice || product.price,
          mainImage: product.mainImage || "",

          quantity,
          maxQuantity: product.stock?.available || 99,
        },
      ];
    }

    set({ items: updated });
    saveCartToStorage(updated);
    syncToDB(updated);
  },

  // Remove item
  removeItem: (productId) => {
    const updated = get().items.filter((item) => item.productId !== productId);
    set({ items: updated });
    saveCartToStorage(updated);
    syncToDB(updated);
  },

  // Update quantity
  updateQuantity: (productId, quantity) => {
    const updated = get().items.map((item) =>
      item.productId === productId
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

  // Clear cart
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

  // Get total items
  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Get total price
  getTotalPrice: () => {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  },
}));
