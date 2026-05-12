"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function OrdersPage({ params }) {
  const { use } = require("react");
  const { locale } = use(params);
  const router = useRouter();
  const isRTL = locale === "fa";

  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [orders, setOrders] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/login`);
      return;
    }

    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();

        if (res.ok) {
          setOrders(data.data || []);
        } else {
          setError(data.message);
        }
      } catch {
        setError(isRTL ? "خطا در بارگذاری سفارشات" : "Error loading orders");
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrders();
  }, [user, isLoading, router, locale]);

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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-8">
        {isRTL ? "سفارشات من" : "My Orders"}
      </h1>

      {isFetching && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {!isFetching && orders.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
            {isRTL ? "هنوز سفارشی ثبت نکرده‌اید" : "No orders yet"}
          </p>
          <Link href={`/${locale}/products`}>
            <Button variant="primary" size="lg">
              {isRTL ? "شروع خرید" : "Start Shopping"}
            </Button>
          </Link>
        </div>
      )}

      {orders.map((order) => (
        <Link
          key={order._id}
          href={`/${locale}/orders/${order._id}`}
          className="block mb-4 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {isRTL ? "سفارش" : "Order"} #{order._id.slice(-6).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(order.createdAt).toLocaleDateString(
                  isRTL ? "fa-IR" : "en-US",
                )}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                statusColors[order.status] || ""
              }`}
            >
              {statusLabels[order.status] || order.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {order.items.length} {isRTL ? "محصول" : "items"}
            </p>
            <p className="font-bold text-gray-900 dark:text-gray-50">
              {order.total.toLocaleString()} T
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
