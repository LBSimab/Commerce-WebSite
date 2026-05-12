"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

const statusOptions = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrdersClient({ initialOrders, locale }) {
  const isRTL = locale === "fa";

  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Status labels
  const getStatusLabel = (status) => {
    const labels = {
      pending: isRTL ? "در انتظار" : "Pending",
      confirmed: isRTL ? "تایید شده" : "Confirmed",
      processing: isRTL ? "در حال پردازش" : "Processing",
      shipped: isRTL ? "ارسال شده" : "Shipped",
      delivered: isRTL ? "تحویل داده شده" : "Delivered",
      cancelled: isRTL ? "لغو شده" : "Cancelled",
    };
    return labels[status] || status;
  };

  // Status colors
  const getStatusColor = (status) => {
    const colors = {
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
    return colors[status] || "";
  };

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );

      setMessage(
        isRTL ? "وضعیت سفارش با موفقیت تغییر کرد" : "Order status updated",
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Toggle order details
  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "سفارشات" : "Orders"}
          <span className="ml-2 text-lg text-gray-500 dark:text-gray-400 font-normal">
            ({orders.length})
          </span>
        </h1>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes("موفقیت") ||
            message.includes("success") ||
            message.includes("updated")
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500 dark:text-gray-400">
            {isRTL ? "هیچ سفارشی ثبت نشده است" : "No orders yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              {/* Order header */}
              <div
                className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => toggleExpand(order._id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-mono text-gray-900 dark:text-gray-50">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString(
                        isRTL ? "fa-IR" : "en-US",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {order.shippingAddress?.fullName || "—"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.shippingAddress?.phone || ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-50">
                    {order.total?.toLocaleString()} T
                  </span>
                  <span className="text-gray-400">
                    {expandedOrder === order._id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Expanded details */}
              {expandedOrder === order._id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/30">
                  {/* Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {isRTL ? "اقلام سفارش" : "Order Items"}
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-900 dark:text-gray-50">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {(item.price * item.quantity).toLocaleString()} T
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 flex justify-between font-bold text-sm">
                      <span>{isRTL ? "مجموع" : "Total"}</span>
                      <span>{order.total?.toLocaleString()} T</span>
                    </div>
                  </div>

                  {/* Shipping address */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? "آدرس ارسال" : "Shipping Address"}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.shippingAddress?.fullName} —{" "}
                      {order.shippingAddress?.phone}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.shippingAddress?.province}،{" "}
                      {order.shippingAddress?.city}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.shippingAddress?.address}
                    </p>
                    {order.shippingAddress?.postalCode && (
                      <p className="text-xs text-gray-400 mt-1">
                        {isRTL ? "کد پستی: " : "Postal Code: "}
                        {order.shippingAddress.postalCode}
                      </p>
                    )}
                  </div>

                  {/* Status update */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {isRTL ? "تغییر وضعیت" : "Update Status"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order._id, status);
                          }}
                          disabled={
                            updatingStatus === order._id ||
                            order.status === status
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            order.status === status
                              ? getStatusColor(status) +
                                " ring-2 ring-offset-1 ring-current"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                          } disabled:opacity-50`}
                        >
                          {getStatusLabel(status)}
                          {updatingStatus === order._id &&
                            order.status !== status &&
                            "..."}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
