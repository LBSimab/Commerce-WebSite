"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import DataTable from "@/components/DataTable";

export default function DiscountClient({ initialCodes, locale }) {
  const isRTL = locale === "fa";
  const [codes, setCodes] = useState(initialCodes);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    code: "",
    type: "percentage",
    value: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (code) => {
    setForm({
      code: code.code,
      type: code.type,
      value: code.value.toString(),
      minOrderAmount: code.minOrderAmount?.toString() || "",
      maxUses: code.maxUses?.toString() || "",
      expiresAt: code.expiresAt ? code.expiresAt.slice(0, 10) : "",
      isActive: code.isActive !== false,
    });
    setEditingId(code._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const url = editingId
      ? `/api/admin/discount/${editingId}`
      : "/api/admin/discount";
    const method = editingId ? "PUT" : "POST";
    const body = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
      isActive: form.isActive,
    };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.message);
    setMessage(
      editingId
        ? isRTL
          ? "ویرایش شد"
          : "Updated"
        : isRTL
          ? "ایجاد شد"
          : "Created",
    );
    resetForm();
    const ref = await fetch("/api/admin/discount");
    const refD = await ref.json();
    setCodes(refD.data || []);
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? "مطمئنید؟" : "Sure?")) return;
    await fetch(`/api/admin/discount/${id}`, { method: "DELETE" });
    const ref = await fetch("/api/admin/discount");
    const refD = await ref.json();
    setCodes(refD.data || []);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "کدهای تخفیف" : "Discount Codes"}
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
              ? "افزودن کد"
              : "Add Code"}
        </Button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-600">
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId
              ? isRTL
                ? "ویرایش کد"
                : "Edit Code"
              : isRTL
                ? "کد جدید"
                : "New Code"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg border text-sm font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نوع" : "Type"}
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                >
                  <option value="percentage">
                    {isRTL ? "درصدی" : "Percentage"}
                  </option>
                  <option value="fixed">
                    {isRTL ? "مبلغ ثابت" : "Fixed Amount"}
                  </option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "مقدار" : "Value"} (
                  {form.type === "percentage" ? "%" : "T"})
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "حداقل سفارش" : "Min Order"}
                </label>
                <input
                  type="number"
                  value={form.minOrderAmount}
                  onChange={(e) =>
                    setForm({ ...form, minOrderAmount: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "حداکثر استفاده" : "Max Uses"}
                </label>
                <input
                  type="number"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm({ ...form, maxUses: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "تاریخ انقضا" : "Expires"}
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                  <span className="text-sm">{isRTL ? "فعال" : "Active"}</span>
                </label>
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

      <DataTable
        columns={[
          {
            key: "code",
            label: "Code",
            render: (row) => (
              <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                {row.code}
              </span>
            ),
          },
          {
            key: "type",
            label: isRTL ? "نوع" : "Type",
            render: (row) => (
              <span className="text-xs">
                {row.type === "percentage"
                  ? isRTL
                    ? "درصدی"
                    : "Percentage"
                  : isRTL
                    ? "ثابت"
                    : "Fixed"}
              </span>
            ),
          },
          {
            key: "value",
            label: isRTL ? "مقدار" : "Value",
            render: (row) => (
              <span className="text-sm font-medium">
                {row.value}
                {row.type === "percentage" ? "%" : " T"}
              </span>
            ),
          },
          {
            key: "usedCount",
            label: isRTL ? "استفاده" : "Used",
            align: "center",
            render: (row) => (
              <span className="text-sm">
                {row.usedCount || 0}
                {row.maxUses ? ` / ${row.maxUses}` : ""}
              </span>
            ),
          },
          {
            key: "expiresAt",
            label: isRTL ? "انقضا" : "Expires",
            render: (row) => (
              <span className="text-xs text-gray-500">
                {row.expiresAt
                  ? new Date(row.expiresAt).toLocaleDateString(
                      isRTL ? "fa-IR" : "en-US",
                    )
                  : "—"}
              </span>
            ),
          },
          {
            key: "isActive",
            label: isRTL ? "وضعیت" : "Status",
            render: (row) => (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
              >
                {row.isActive
                  ? isRTL
                    ? "فعال"
                    : "Active"
                  : isRTL
                    ? "غیرفعال"
                    : "Inactive"}
              </span>
            ),
          },
        ]}
        data={codes}
        searchPlaceholder={isRTL ? "جستجوی کد..." : "Search codes..."}
        searchFields={["code"]}
        locale={locale}
        onEdit={handleEdit}
        onDelete={(row) => handleDelete(row._id)}
      />
    </div>
  );
}
