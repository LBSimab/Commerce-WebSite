"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function OrderDetailPage({ params }) {
  const { use } = require("react");
  const { locale, id } = use(params);
  const router = useRouter();
  const isRTL = locale === "fa";

  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [order, setOrder] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/login`);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();

        if (res.ok) {
          setOrder(data.data);
        } else {
          setError(data.message);
        }
      } catch {
        setError(isRTL ? "خطا در بارگذاری سفارش" : "Error loading order");
      } finally {
        setIsFetching(false);
      }
    };

    if (user) fetchOrder();
  }, [user, isLoading, id]);

  const statusLabels = {
    pending: isRTL ? "در انتظار" : "Pending",
    confirmed: isRTL ? "تایید شده" : "Confirmed",
    processing: isRTL ? "در حال پردازش" : "Processing",
    shipped: isRTL ? "ارسال شده" : "Shipped",
    delivered: isRTL ? "تحویل داده شده" : "Delivered",
    cancelled: isRTL ? "لغو شده" : "Cancelled",
  };

  const statusColors = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    processing:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    shipped:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    delivered:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  if (isLoading || isFetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {isRTL ? "سفارش یافت نشد" : "Order Not Found"}
        </h1>
        <Link href={`/${locale}/orders`}>
          <Button variant="primary">
            {isRTL ? "بازگشت به سفارشات" : "Back to Orders"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href={`/${locale}/orders`}
        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mb-4 inline-block"
      >
        {isRTL ? "← بازگشت به سفارشات" : "← Back to Orders"}
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "سفارش" : "Order"} #{order._id.slice(-6).toUpperCase()}
        </h1>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.status]}`}
        >
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {order.items.map((item, index) => (
            <div
              key={
                item.product?._id?.toString() ||
                item.product?.toString() ||
                index
              }
              className="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                📦
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-50">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  × {item.quantity}
                </p>
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-50">
                {(item.price * item.quantity).toLocaleString()} T
              </p>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="space-y-4">
          {/* Order info */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">
              {isRTL ? "اطلاعات سفارش" : "Order Info"}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isRTL ? "تاریخ" : "Date"}
                </span>
                <span className="text-gray-900 dark:text-gray-50">
                  {new Date(order.createdAt).toLocaleDateString(
                    isRTL ? "fa-IR" : "en-US",
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isRTL ? "تعداد اقلام" : "Items"}
                </span>
                <span className="text-gray-900 dark:text-gray-50">
                  {order.items.length}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-2 flex justify-between font-semibold">
                <span>{isRTL ? "مجموع" : "Total"}</span>
                <span>{order.total.toLocaleString()} T</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">
              {isRTL ? "آدرس ارسال" : "Shipping Address"}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium text-gray-900 dark:text-gray-50">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.phone}</p>
              <p>
                {order.shippingAddress.province}، {order.shippingAddress.city}
              </p>
              <p>{order.shippingAddress.address}</p>
              {order.shippingAddress.postalCode && (
                <p className="text-gray-400 dark:text-gray-500 mt-1">
                  {isRTL ? "کد پستی: " : "Postal Code: "}
                  {order.shippingAddress.postalCode}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
