"use client";

import { useState } from "react";
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

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Shipping form
  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
  });

  // Discount
  const [discountCode, setDiscountCode] = useState("");
  const [discountData, setDiscountData] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("");
  const [gateways, setGateways] = useState([]);

  // Fetch gateways once on render
  const [gatewaysFetched, setGatewaysFetched] = useState(false);
  if (!gatewaysFetched) {
    setGatewaysFetched(true);
    fetch("/api/payment-gateways")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setGateways(d.data);
      })
      .catch(() => {});
  }

  // Redirect if not logged in
  if (!isLoading && !user) {
    router.push(`/${locale}/login`);
    return null;
  }

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

  if (!user) return null;

  if (items.length === 0 && !success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {isRTL ? "سبد خرید خالی است" : "Cart is empty"}
        </h1>
        <Link href={`/${locale}/products`}>
          <Button variant="primary" size="lg">
            {isRTL ? "مشاهده محصولات" : "Browse Products"}
          </Button>
        </Link>
      </div>
    );
  }

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

  const subtotal = getTotalPrice();
  const discountAmount = discountData?.discountAmount || 0;
  const total = subtotal - discountAmount;

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);
    setDiscountError("");
    setDiscountData(null);
    try {
      const res = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, orderAmount: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDiscountData(data.data);
    } catch (err) {
      setDiscountError(err.message);
    } finally {
      setApplyingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setDiscountCode("");
    setDiscountData(null);
    setDiscountError("");
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
          discountCode: discountData?.code || null,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrderId(data.data._id);
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-8">
        {isRTL ? "تسویه حساب" : "Checkout"}
      </h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              }`}
            >
              {s}
            </div>
            <span className="text-xs text-gray-500 hidden sm:inline">
              {s === 1
                ? isRTL
                  ? "آدرس"
                  : "Address"
                : s === 2
                  ? isRTL
                    ? "پرداخت"
                    : "Payment"
                  : isRTL
                    ? "تایید"
                    : "Confirm"}
            </span>
            {s < 3 && (
              <div
                className={`w-8 h-0.5 transition-all ${step > s ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"}`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                {isRTL ? "آدرس ارسال" : "Shipping Address"}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? "نام کامل" : "Full Name"}
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? "تلفن" : "Phone"}
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-sm focus:ring-2 focus:ring-indigo-500"
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
                      value={form.province}
                      onChange={(e) =>
                        setForm({ ...form, province: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? "شهر" : "City"}
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? "آدرس" : "Address"}
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isRTL ? "کد پستی (اختیاری)" : "Postal Code (optional)"}
                  </label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) =>
                      setForm({ ...form, postalCode: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <Button
                onClick={() => setStep(2)}
                variant="primary"
                size="lg"
                className="w-full mt-6"
              >
                {isRTL ? "ادامه" : "Continue"}
              </Button>
            </div>
          )}

          {/* Step 2: Payment Method + Discount */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Discount Code */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                  {isRTL ? "کد تخفیف" : "Discount Code"}
                </h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder={
                      isRTL
                        ? "کد تخفیف خود را وارد کنید..."
                        : "Enter discount code..."
                    }
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                  />
                  {discountData ? (
                    <button
                      onClick={removeDiscount}
                      className="px-4 py-3 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                    >
                      ✕
                    </button>
                  ) : (
                    <button
                      onClick={applyDiscount}
                      disabled={applyingDiscount || !discountCode.trim()}
                      className="px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {applyingDiscount ? "..." : isRTL ? "اعمال" : "Apply"}
                    </button>
                  )}
                </div>
                {discountError && (
                  <p className="text-xs text-red-500 mt-2">{discountError}</p>
                )}
                {discountData && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                    {isRTL ? "تخفیف اعمال شد:" : "Discount applied:"}{" "}
                    {discountData.discountAmount.toLocaleString()} T (
                    {discountData.type === "percentage"
                      ? `${discountData.value}%`
                      : `${discountData.value.toLocaleString()} T`}
                    )
                  </p>
                )}
              </div>

              {/* Payment Methods */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                  {isRTL ? "روش پرداخت" : "Payment Method"}
                </h2>
                {gateways.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    {isRTL
                      ? "درگاه پرداختی فعال نیست"
                      : "No payment gateways available"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {gateways.map((gw) => (
                      <label
                        key={gw._id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === gw.type
                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={gw.type}
                          checked={paymentMethod === gw.type}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-50">
                            {isRTL && gw.nameFa ? gw.nameFa : gw.name}
                          </p>
                          {(isRTL && gw.descriptionFa
                            ? gw.descriptionFa
                            : gw.description) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {isRTL ? gw.descriptionFa : gw.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline">
                  {isRTL ? "بازگشت" : "Back"}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  variant="primary"
                  disabled={!paymentMethod}
                  className="flex-1"
                >
                  {isRTL ? "ادامه" : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm & Pay */}
          {step === 3 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                {isRTL ? "تایید نهایی" : "Confirm Order"}
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {isRTL ? "نام:" : "Name:"}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-50">
                    {form.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {isRTL ? "تلفن:" : "Phone:"}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-50">
                    {form.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {isRTL ? "آدرس:" : "Address:"}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-50 text-right max-w-[200px]">
                    {form.province}, {form.city}, {form.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {isRTL ? "پرداخت:" : "Payment:"}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-50">
                    {gateways.find((g) => g.type === paymentMethod)?.name ||
                      paymentMethod}
                  </span>
                </div>
                {discountData && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      {isRTL ? "کد تخفیف:" : "Discount:"}
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {discountData.code} (-
                      {discountData.discountAmount.toLocaleString()} T)
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span>{isRTL ? "مبلغ نهایی:" : "Final Amount:"}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {total.toLocaleString()} T
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => setStep(2)} variant="outline">
                  {isRTL ? "بازگشت" : "Back"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting
                    ? isRTL
                      ? "در حال ثبت سفارش..."
                      : "Placing Order..."
                    : `${isRTL ? "پرداخت" : "Pay"} ${total.toLocaleString()} T`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
              {isRTL ? "خلاصه سفارش" : "Order Summary"}
            </h2>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="truncate flex-1 text-gray-900 dark:text-gray-50">
                    {isRTL && item.nameFa ? item.nameFa : item.name}
                    <span className="text-gray-400 ml-1">
                      × {item.quantity}
                    </span>
                    {item.color && (
                      <span className="text-xs text-gray-500 block">
                        {item.color}
                        {item.compatibleCar ? ` / ${item.compatibleCar}` : ""}
                      </span>
                    )}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 ml-2">
                    {(item.price * item.quantity).toLocaleString()} T
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>{isRTL ? "جمع سبد خرید" : "Subtotal"}</span>
                <span>{subtotal.toLocaleString()} T</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>{isRTL ? "تخفیف" : "Discount"}</span>
                  <span>-{discountAmount.toLocaleString()} T</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>{isRTL ? "حمل و نقل" : "Shipping"}</span>
                <span>{isRTL ? "رایگان" : "Free"}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-gray-50 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>{isRTL ? "مجموع" : "Total"}</span>
                <span>{total.toLocaleString()} T</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
