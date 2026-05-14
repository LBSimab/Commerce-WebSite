"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import DataTable from "@/components/DataTable";

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

  // Filter states
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [filterProduct, setFilterProduct] = useState("");

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

  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
      confirmed:
        "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      processing:
        "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
      shipped:
        "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
      delivered:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
      cancelled: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    };
    return colors[status] || "";
  };

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
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );
      setMessage(isRTL ? "وضعیت تغییر کرد" : "Status updated");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const toggleExpand = (orderId) =>
    setExpandedOrder(expandedOrder === orderId ? null : orderId);

  // Apply admin filters
  const adminFiltered = orders.filter((order) => {
    if (filterStatus && order.status !== filterStatus) return false;

    // Date range
    if (filterDateFrom) {
      const orderDate = new Date(order.createdAt);
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (orderDate < fromDate) return false;
    }
    if (filterDateTo) {
      const orderDate = new Date(order.createdAt);
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      if (orderDate > toDate) return false;
    }

    // Price range
    if (filterPriceMin && order.total < Number(filterPriceMin)) return false;
    if (filterPriceMax && order.total > Number(filterPriceMax)) return false;

    // Product search inside order items
    if (filterProduct) {
      const search = filterProduct.toLowerCase();
      const hasProduct = order.items?.some((item) =>
        item.name?.toLowerCase().includes(search),
      );
      if (!hasProduct) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setFilterStatus("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterPriceMin("");
    setFilterPriceMax("");
    setFilterProduct("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "سفارشات" : "Orders"}
        </h1>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${message.includes("موفق") || message.includes("updated") ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-red-50 dark:bg-red-900/20 text-red-600"}`}
        >
          {message}
        </div>
      )}

      {/* Admin Filter Bar */}
      <div className="flex flex-wrap items-end gap-3 mb-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        {/* Status Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "وضعیت" : "Status"}
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          >
            <option value="">{isRTL ? "همه" : "All"}</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {getStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "از تاریخ" : "From Date"}
          </label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "تا تاریخ" : "To Date"}
          </label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          />
        </div>

        {/* Price Min */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "حداقل قیمت" : "Min Price"}
          </label>
          <input
            type="number"
            value={filterPriceMin}
            onChange={(e) => setFilterPriceMin(e.target.value)}
            placeholder="0"
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50 w-28"
          />
        </div>

        {/* Price Max */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "حداکثر قیمت" : "Max Price"}
          </label>
          <input
            type="number"
            value={filterPriceMax}
            onChange={(e) => setFilterPriceMax(e.target.value)}
            placeholder="99999999"
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50 w-28"
          />
        </div>

        {/* Product Search */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "نام محصول" : "Product Name"}
          </label>
          <input
            type="text"
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            placeholder={
              isRTL
                ? "جستجوی محصول در سفارشات..."
                : "Search product in orders..."
            }
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50 w-52"
          />
        </div>

        {/* Clear */}
        {(filterStatus ||
          filterDateFrom ||
          filterDateTo ||
          filterPriceMin ||
          filterPriceMax ||
          filterProduct) && (
          <button
            onClick={clearFilters}
            className="text-xs text-red-500 hover:text-red-600 pb-2"
          >
            {isRTL ? "حذف فیلترها" : "Clear"}
          </button>
        )}
      </div>

      {/* DataTable for basic order info */}
      <DataTable
        columns={[
          {
            key: "orderId",
            label: isRTL ? "شماره" : "Order #",
            sortable: false,
            render: (row) => (
              <span className="font-mono text-xs font-medium text-gray-900 dark:text-gray-50">
                #{row._id.slice(-8).toUpperCase()}
              </span>
            ),
          },
          {
            key: "customer",
            label: isRTL ? "مشتری" : "Customer",
            render: (row) => (
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {row.shippingAddress?.fullName || "—"}
                </p>
                <p className="text-xs text-gray-400">
                  {row.shippingAddress?.phone || ""}
                </p>
              </div>
            ),
          },
          {
            key: "date",
            label: isRTL ? "تاریخ" : "Date",
            render: (row) => (
              <span className="text-xs text-gray-500">
                {new Date(row.createdAt).toLocaleDateString(
                  isRTL ? "fa-IR" : "en-US",
                )}
              </span>
            ),
          },
          {
            key: "items",
            label: isRTL ? "اقلام" : "Items",
            align: "center",
            render: (row) => (
              <span className="text-sm">{row.items?.length || 0}</span>
            ),
          },
          {
            key: "total",
            label: isRTL ? "مبلغ" : "Total",
            render: (row) => (
              <span className="font-bold text-sm text-gray-900 dark:text-gray-50">
                {row.total?.toLocaleString()} T
              </span>
            ),
          },
          {
            key: "status",
            label: isRTL ? "وضعیت" : "Status",
            render: (row) => (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}
              >
                {getStatusLabel(row.status)}
              </span>
            ),
          },
        ]}
        data={adminFiltered}
        searchPlaceholder={
          isRTL
            ? "جستجوی مشتری یا شماره سفارش..."
            : "Search customer or order ID..."
        }
        searchFields={[
          "shippingAddress.fullName",
          "shippingAddress.phone",
          "_id",
        ]}
        locale={locale}
        onEdit={(row) => toggleExpand(row._id)}
        emptyMessage={isRTL ? "سفارشی یافت نشد" : "No orders found"}
      />

      {/* Expanded Order Details */}
      {expandedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setExpandedOrder(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const order = orders.find((o) => o._id === expandedOrder);
              if (!order) return null;
              return (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                      {isRTL ? "سفارش" : "Order"} #
                      {order._id.slice(-8).toUpperCase()}
                    </h2>
                    <button
                      onClick={() => setExpandedOrder(null)}
                      className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {isRTL ? "اقلام" : "Items"}
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-800"
                        >
                          <span className="text-gray-900 dark:text-gray-50">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-gray-500">
                            {(item.price * item.quantity).toLocaleString()} T
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span>{isRTL ? "مجموع" : "Total"}</span>
                      <span>{order.total?.toLocaleString()} T</span>
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {isRTL ? "آدرس" : "Address"}
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
                  </div>

                  {/* Status Update */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {isRTL ? "تغییر وضعیت" : "Update Status"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(order._id, status)}
                          disabled={
                            updatingStatus === order._id ||
                            order.status === status
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            order.status === status
                              ? getStatusColor(status) +
                                " ring-2 ring-offset-1 ring-current"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                          } disabled:opacity-50`}
                        >
                          {getStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
