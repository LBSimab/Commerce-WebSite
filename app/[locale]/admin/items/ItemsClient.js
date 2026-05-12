"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function ItemsClient({
  initialItems,
  products,
  warehouses,
  locale,
}) {
  const isRTL = locale === "fa";

  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    product: "",
    warehouse: "",
    color: "",
    compatibleCar: "",
    quantity: 0,
    lowStockThreshold: 5,
    location: "",
  });

  // Get selected product details for color/car options
  const selectedProduct = products.find((p) => p._id === form.product);

  const resetForm = () => {
    setForm({
      product: "",
      warehouse: "",
      color: "",
      compatibleCar: "",
      quantity: 0,
      lowStockThreshold: 5,
      location: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({
      product: item.product?._id || "",
      warehouse: item.warehouse?._id || "",
      color: item.color || "",
      compatibleCar: item.compatibleCar || "",
      quantity: item.quantity || 0,
      lowStockThreshold: item.lowStockThreshold || 5,
      location: item.location || "",
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.product || !form.warehouse) {
      setMessage(
        isRTL
          ? "محصول و انبار الزامی است"
          : "Product and warehouse are required",
      );
      return;
    }

    try {
      const url = editingId
        ? `/api/admin/items/${editingId}`
        : "/api/admin/items";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          lowStockThreshold: Number(form.lowStockThreshold),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(
        editingId
          ? isRTL
            ? "بروزرسانی شد"
            : "Updated"
          : isRTL
            ? "ایجاد شد"
            : "Created",
      );
      resetForm();

      // Refresh
      const ref = await fetch("/api/admin/items");
      const refData = await ref.json();
      setItems(refData.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? "مطمئنید؟" : "Sure?")) return;
    try {
      await fetch(`/api/admin/items/${id}`, { method: "DELETE" });
      const ref = await fetch("/api/admin/items");
      const refData = await ref.json();
      setItems(refData.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Calculate available
  const getAvailable = (item) =>
    Math.max(0, (item.quantity || 0) - (item.reservedQuantity || 0));
  const isLowStock = (item) =>
    getAvailable(item) <= (item.lowStockThreshold || 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "موجودی انبار" : "Inventory Items"}
          <span className="ml-2 text-lg text-gray-500 font-normal">
            ({items.length})
          </span>
        </h1>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          variant="primary"
          size="sm"
        >
          {showForm
            ? isRTL
              ? "انصراف"
              : "Cancel"
            : isRTL
              ? "افزودن موجودی"
              : "Add Stock"}
        </Button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes("موفق") ||
            message.includes("Created") ||
            message.includes("Updated")
              ? "bg-green-50 dark:bg-green-900/20 text-green-600"
              : "bg-red-50 dark:bg-red-900/20 text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
            {editingId
              ? isRTL
                ? "ویرایش موجودی"
                : "Edit Stock"
              : isRTL
                ? "موجودی جدید"
                : "New Stock"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product + Warehouse */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "محصول" : "Product"}
                </label>
                <select
                  value={form.product}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      product: e.target.value,
                      color: "",
                      compatibleCar: "",
                    })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <option value="">
                    {isRTL ? "انتخاب کنید..." : "Select..."}
                  </option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {isRTL && p.nameFa ? p.nameFa : p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "انبار" : "Warehouse"}
                </label>
                <select
                  value={form.warehouse}
                  onChange={(e) =>
                    setForm({ ...form, warehouse: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <option value="">
                    {isRTL ? "انتخاب کنید..." : "Select..."}
                  </option>
                  {warehouses.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color + Car — only if product has them */}
            {selectedProduct &&
              (selectedProduct.colors?.length > 0 ||
                selectedProduct.compatibleCars?.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedProduct.colors?.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {isRTL ? "رنگ" : "Color"}
                      </label>
                      <select
                        value={form.color}
                        onChange={(e) =>
                          setForm({ ...form, color: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                      >
                        <option value="">{isRTL ? "همه" : "All"}</option>
                        {selectedProduct.colors.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {selectedProduct.compatibleCars?.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {isRTL ? "خودرو" : "Car"}
                      </label>
                      <select
                        value={form.compatibleCar}
                        onChange={(e) =>
                          setForm({ ...form, compatibleCar: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                      >
                        <option value="">{isRTL ? "همه" : "All"}</option>
                        {selectedProduct.compatibleCars.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

            {/* Quantity + Threshold + Location */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "تعداد" : "Quantity"}
                </label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "حداقل موجودی" : "Low Stock Threshold"}
                </label>
                <input
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lowStockThreshold: parseInt(e.target.value) || 5,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "مکان (اختیاری)" : "Location (optional)"}
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                  placeholder="A1-S3"
                />
              </div>
            </div>

            <Button type="submit" variant="primary">
              {editingId
                ? isRTL
                  ? "ذخیره"
                  : "Save"
                : isRTL
                  ? "ایجاد"
                  : "Create"}
            </Button>
          </form>
        </div>
      )}

      {/* Items table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
                <th className="p-3 text-left">{isRTL ? "محصول" : "Product"}</th>
                <th className="p-3 text-left">
                  {isRTL ? "انبار" : "Warehouse"}
                </th>
                <th className="p-3 text-left">{isRTL ? "رنگ" : "Color"}</th>
                <th className="p-3 text-left">{isRTL ? "خودرو" : "Car"}</th>
                <th className="p-3 text-center">{isRTL ? "موجودی" : "Qty"}</th>
                <th className="p-3 text-center">
                  {isRTL ? "رزرو" : "Reserved"}
                </th>
                <th className="p-3 text-center">
                  {isRTL ? "موجود" : "Available"}
                </th>
                <th className="p-3 text-left">{isRTL ? "مکان" : "Location"}</th>
                <th className="p-3 text-right">
                  {isRTL ? "عملیات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const available = getAvailable(item);
                const low = isLowStock(item);
                return (
                  <tr
                    key={item._id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="p-3 font-medium text-gray-900 dark:text-gray-50">
                      {isRTL && item.product?.nameFa
                        ? item.product.nameFa
                        : item.product?.name || "—"}
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {item.warehouse?.name || "—"}
                    </td>
                    <td className="p-3 text-xs">{item.color || "—"}</td>
                    <td className="p-3 text-xs">{item.compatibleCar || "—"}</td>
                    <td className="p-3 text-center font-medium">
                      {item.quantity || 0}
                    </td>
                    <td className="p-3 text-center text-gray-500">
                      {item.reservedQuantity || 0}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          low
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {available}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-400">
                      {item.location || "—"}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 mr-3 text-xs"
                      >
                        {isRTL ? "ویرایش" : "Edit"}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 text-xs"
                      >
                        {isRTL ? "حذف" : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
