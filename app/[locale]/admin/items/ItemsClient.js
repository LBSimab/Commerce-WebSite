"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import DataTable from "@/components/DataTable";

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

  // Filter states
  const [filterWarehouse, setFilterWarehouse] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterType, setFilterType] = useState("color");
  const [filterValue, setFilterValue] = useState("");

  const [form, setForm] = useState({
    product: "",
    warehouse: "",
    color: "",
    compatibleCar: "",
    quantity: 0,
    lowStockThreshold: 5,
    location: "",
  });

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
      const ref = await fetch("/api/admin/items");
      const refD = await ref.json();
      setItems(refD.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? "مطمئنید؟" : "Sure?")) return;
    try {
      await fetch(`/api/admin/items/${id}`, { method: "DELETE" });
      const ref = await fetch("/api/admin/items");
      const refD = await ref.json();
      setItems(refD.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const getAvailable = (item) =>
    Math.max(0, (item.quantity || 0) - (item.reservedQuantity || 0));
  const isLowStock = (item) =>
    getAvailable(item) <= (item.lowStockThreshold || 5);

  // Apply admin filters
  const adminFiltered = items.filter((item) => {
    if (filterWarehouse && item.warehouse?._id !== filterWarehouse)
      return false;
    if (filterProduct && item.product?._id !== filterProduct) return false;
    if (filterValue) {
      if (
        filterType === "color" &&
        !item.color?.toLowerCase().includes(filterValue.toLowerCase())
      )
        return false;
      if (
        filterType === "car" &&
        !item.compatibleCar?.toLowerCase().includes(filterValue.toLowerCase())
      )
        return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilterWarehouse("");
    setFilterProduct("");
    setFilterType("color");
    setFilterValue("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "موجودی انبار" : "Inventory Items"}
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
          className={`mb-4 p-3 rounded-lg text-sm ${message.includes("موفق") || message.includes("Created") || message.includes("Updated") ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-red-50 dark:bg-red-900/20 text-red-600"}`}
        >
          {message}
        </div>
      )}

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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">{isRTL ? "انتخاب..." : "Select..."}</option>
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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">{isRTL ? "انتخاب..." : "Select..."}</option>
                  {warehouses.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
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
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "حداقل موجودی" : "Low Stock Alert"}
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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "مکان" : "Location"}
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
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

      {/* Admin Filter Bar */}
      <div className="flex flex-wrap items-end gap-3 mb-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        {/* Warehouse Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "انبار" : "Warehouse"}
          </label>
          <select
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          >
            <option value="">{isRTL ? "همه" : "All"}</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "محصول" : "Product"}
          </label>
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          >
            <option value="">{isRTL ? "همه" : "All"}</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {isRTL && p.nameFa ? p.nameFa : p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Radio buttons + Text input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="itemFilterType"
                checked={filterType === "color"}
                onChange={() => setFilterType("color")}
                className="w-3.5 h-3.5 text-indigo-600"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {isRTL ? "رنگ" : "Color"}
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="itemFilterType"
                checked={filterType === "car"}
                onChange={() => setFilterType("car")}
                className="w-3.5 h-3.5 text-indigo-600"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {isRTL ? "خودرو" : "Car"}
              </span>
            </label>
          </div>
          <input
            type="text"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder={
              filterType === "color"
                ? isRTL
                  ? "نام رنگ..."
                  : "Color name..."
                : isRTL
                  ? "نام خودرو..."
                  : "Car model..."
            }
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50 w-48"
          />
        </div>

        {/* Clear Filters */}
        {(filterWarehouse || filterProduct || filterValue) && (
          <button
            onClick={clearFilters}
            className="text-xs text-red-500 hover:text-red-600 pb-2"
          >
            {isRTL ? "حذف فیلترها" : "Clear"}
          </button>
        )}
      </div>

      <DataTable
        columns={[
          {
            key: "product.name",
            label: isRTL ? "محصول" : "Product",
            render: (row) => (
              <span className="font-medium text-gray-900 dark:text-gray-50 text-sm">
                {isRTL && row.product?.nameFa
                  ? row.product.nameFa
                  : row.product?.name || "—"}
              </span>
            ),
          },
          {
            key: "warehouse.name",
            label: isRTL ? "انبار" : "Warehouse",
            render: (row) => (
              <span className="text-xs text-gray-500">
                {row.warehouse?.name || "—"}
              </span>
            ),
          },
          {
            key: "color",
            label: isRTL ? "رنگ" : "Color",
            render: (row) => (
              <span className="text-xs">{row.color || "—"}</span>
            ),
          },
          {
            key: "compatibleCar",
            label: isRTL ? "خودرو" : "Car",
            render: (row) => (
              <span className="text-xs">{row.compatibleCar || "—"}</span>
            ),
          },
          {
            key: "quantity",
            label: isRTL ? "موجودی" : "Qty",
            align: "center",
            render: (row) => (
              <span className="font-medium text-sm">{row.quantity || 0}</span>
            ),
          },
          {
            key: "reservedQuantity",
            label: isRTL ? "رزرو" : "Reserved",
            align: "center",
            render: (row) => (
              <span className="text-xs text-gray-500">
                {row.reservedQuantity || 0}
              </span>
            ),
          },
          {
            key: "available",
            label: isRTL ? "موجود" : "Available",
            align: "center",
            sortable: false,
            render: (row) => (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${isLowStock(row) ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"}`}
              >
                {getAvailable(row)}
              </span>
            ),
          },
          {
            key: "location",
            label: isRTL ? "مکان" : "Location",
            render: (row) => (
              <span className="text-xs text-gray-400 font-mono">
                {row.location || "—"}
              </span>
            ),
          },
        ]}
        data={adminFiltered}
        searchPlaceholder={
          isRTL ? "جستجوی محصول یا انبار..." : "Search product or warehouse..."
        }
        searchFields={[
          "product.name",
          "product.nameFa",
          "warehouse.name",
          "color",
          "compatibleCar",
          "location",
        ]}
        locale={locale}
        onEdit={handleEdit}
        onDelete={(row) => handleDelete(row._id)}
        emptyMessage={isRTL ? "موجودی یافت نشد" : "No items found"}
      />
    </div>
  );
}
