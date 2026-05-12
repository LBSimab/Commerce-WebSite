/**
 * Cart Page (Client Component)
 *
 * Displays all items in the shopping cart with:
 * - Product details (name, image placeholder, price)
 * - Quantity controls (+/-)
 * - Remove button
 * - Cart total
 * - Checkout button (placeholder for now)
 */

"use client";

import { useCartStore } from "@/store/cart";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { use } from "react";
export default function CartPage({ params }) {
  // We need locale but this is a client component
  // We'll handle translations manually since we can't use getTranslations here
  const { locale } = use(params) || "en";

  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const totalPrice = getTotalPrice();

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-8">
          {locale === "fa" ? "سبد خرید" : "Shopping Cart"}
        </h1>

        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
            {locale === "fa" ? "سبد خرید شما خالی است" : "Your cart is empty"}
          </p>
          <Link href={`/${locale}/products`}>
            <Button variant="primary" size="lg">
              {locale === "fa" ? "مشاهده محصولات" : "Browse Products"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {locale === "fa" ? "سبد خرید" : "Shopping Cart"}
          <span className="ml-2 text-lg text-gray-500 dark:text-gray-400 font-normal">
            ({items.length} {locale === "fa" ? "محصول" : "items"})
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        >
          {locale === "fa" ? "حذف همه" : "Clear Cart"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900"
            >
              {/* Product image placeholder */}
              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center text-2xl">
                {item.mainImage || "📦"}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/${locale}/products/${item.productId}`}
                  className="text-lg font-semibold text-gray-900 dark:text-gray-50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                >
                  {locale === "fa" && item.nameFa ? item.nameFa : item.name}
                </Link>

                <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-50">
                  {item.price.toLocaleString()} T
                </p>

                {/* Quantity controls */}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (item.quantity <= 1) {
                        removeItem(item.productId);
                      } else {
                        updateQuantity(item.productId, item.quantity - 1);
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-gray-50">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Remove button + line total */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {(item.price * item.quantity).toLocaleString()} T
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              {locale === "fa" ? "خلاصه سفارش" : "Order Summary"}
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>{locale === "fa" ? "تعداد محصولات" : "Items"}</span>
                <span>
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>{locale === "fa" ? "حمل و نقل" : "Shipping"}</span>
                <span>
                  {locale === "fa" ? "محاسبه در ادامه" : "Calculated later"}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between font-bold text-lg text-gray-900 dark:text-gray-50">
                <span>{locale === "fa" ? "مجموع" : "Total"}</span>
                <span>{totalPrice.toLocaleString()} T</span>
              </div>
            </div>
            <Link href={`/${locale}/checkout`}>
              <Button variant="primary" size="lg" className="w-full mt-6">
                {locale === "fa" ? "ثبت سفارش" : "Checkout"}
              </Button>
            </Link>

            <Link
              href={`/${locale}/products`}
              className="block text-center mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              {locale === "fa" ? "← ادامه خرید" : "← Continue Shopping"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
