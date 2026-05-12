"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function CheckoutPage({ params }) {
  const { use } = require("react");
  const { locale } = use(params);
  const router = useRouter();
  const isRTL = locale === "fa";

  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Shipping form state
  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, user, router, locale]);

  // Pre-fill name from user profile

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: form,
          notes: "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setOrderId(data.data._id);
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) return null;

  // Empty cart
  if (items.length === 0 && !success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {isRTL ? "سبد خرید خالی است" : "Cart is empty"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {isRTL
            ? "برای ثبت سفارش ابتدا محصولاتی را به سبد خرید اضافه کنید."
            : "Add products to your cart before checking out."}
        </p>
        <Link href={`/${locale}/products`}>
          <Button variant="primary" size="lg">
            {isRTL ? "مشاهده محصولات" : "Browse Products"}
          </Button>
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {isRTL ? "سفارش با موفقیت ثبت شد!" : "Order Placed Successfully!"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {isRTL
            ? "سفارش شما دریافت شد و در حال پردازش است."
            : "Your order has been received and is being processed."}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href={`/${locale}/orders/${orderId}`}>
            <Button variant="primary">
              {isRTL ? "مشاهده سفارش" : "View Order"}
            </Button>
          </Link>
          <Link href={`/${locale}/products`}>
            <Button variant="outline">
              {isRTL ? "ادامه خرید" : "Continue Shopping"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-8">
        {isRTL ? "تسویه حساب" : "Checkout"}
      </h1>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Shipping form */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-6">
              {isRTL ? "آدرس ارسال" : "Shipping Address"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? "نام کامل" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? "تلفن" : "Phone"}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? "استان" : "Province"}
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? "شهر" : "City"}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "آدرس" : "Address"}
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "کد پستی (اختیاری)" : "Postal Code (optional)"}
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isRTL
                    ? "در حال ثبت سفارش..."
                    : "Placing Order..."
                  : `${isRTL ? "ثبت سفارش" : "Place Order"} — ${totalPrice.toLocaleString()} T`}
              </Button>
            </form>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              {isRTL ? "خلاصه سفارش" : "Order Summary"}
            </h2>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-gray-50 truncate">
                      {isRTL && item.nameFa ? item.nameFa : item.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      × {item.quantity}
                    </p>
                  </div>
                  <span className="text-gray-900 dark:text-gray-50 font-medium">
                    {(item.price * item.quantity).toLocaleString()} T
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>{isRTL ? "جمع سبد خرید" : "Subtotal"}</span>
                <span>{totalPrice.toLocaleString()} T</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>{isRTL ? "حمل و نقل" : "Shipping"}</span>
                <span>{isRTL ? "رایگان" : "Free"}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-2 flex justify-between font-bold text-lg text-gray-900 dark:text-gray-50">
                <span>{isRTL ? "مجموع" : "Total"}</span>
                <span>{totalPrice.toLocaleString()} T</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
