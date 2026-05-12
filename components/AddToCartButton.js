"use client";

import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";

export default function AddToCartButton({ product, locale, variant = "card" }) {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const items = useCartStore((state) => state.items);

  // Check if this product is already in the cart
  const cartItem = items.find((item) => item.productId === product._id);
  const isInCart = !!cartItem;

  // Stock info — fallback to cartItem.maxQuantity if product has no stock field
  const inStock = product.stock?.available > 0;

  // Out of stock and not already in cart
  if (!inStock && !isInCart) {
    return (
      <Button
        variant="secondary"
        size={variant === "detail" ? "lg" : "sm"}
        className="w-full"
        disabled
      >
        {locale === "fa" ? "ناموجود" : "Out of Stock"}
      </Button>
    );
  }

  // Already in cart — show quantity controls
  if (isInCart) {
    return (
      <div
        className={`flex items-center gap-2 ${variant === "detail" ? "w-full" : "w-full"}`}
      >
        {/* Minus button */}
        <button
          onClick={() => {
            if (cartItem.quantity <= 1) {
              removeItem(product._id);
            } else {
              updateQuantity(product._id, cartItem.quantity - 1);
            }
          }}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          −
        </button>

        {/* Quantity display */}
        <span className="flex-1 text-center text-sm font-medium text-gray-900 dark:text-gray-50 min-w-[40px]">
          {cartItem.quantity}
        </span>

        {/* Plus button */}
        <button
          onClick={() => addItem(product, 1)}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          +
        </button>
      </div>
    );
  }

  // Available — show Add to Cart button
  return (
    <Button
      variant="primary"
      size={variant === "detail" ? "lg" : "sm"}
      className="w-full"
      onClick={() => addItem(product, 1)}
    >
      {locale === "fa" ? "افزودن به سبد خرید" : "Add to Cart"}
    </Button>
  );
}
