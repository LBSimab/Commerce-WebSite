"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import DataTable from "@/components/DataTable";

const gatewayTypes = [
  { value: "zarinpal", labelEn: "Zarinpal", labelFa: "زرین‌پال" },
  { value: "zibal", labelEn: "Zibal", labelFa: "زیبال" },
  { value: "payir", labelEn: "Pay.ir", labelFa: "پی‌آی‌آر" },
  { value: "nextpay", labelEn: "NextPay", labelFa: "نکست‌پی" },
  { value: "custom", labelEn: "Custom", labelFa: "سفارشی" },
];

export default function PaymentGatewaysClient({ initialGateways, locale }) {
  const isRTL = locale === "fa";
  const [gateways, setGateways] = useState(initialGateways);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    nameFa: "",
    type: "zarinpal",
    merchantId: "",
    apiKey: "",
    sandbox: true,
    callbackUrl: "",
    isActive: true,
    order: 0,
    description: "",
    descriptionFa: "",
  };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (gw) => {
    setForm({
      name: gw.name,
      nameFa: gw.nameFa || "",
      type: gw.type,
      merchantId: gw.merchantId || "",
      apiKey: gw.apiKey || "",
      sandbox: gw.sandbox !== false,
      callbackUrl: gw.callbackUrl || "",
      isActive: gw.isActive !== false,
      order: gw.order || 0,
      description: gw.description || "",
      descriptionFa: gw.descriptionFa || "",
    });
    setEditingId(gw._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const url = editingId
      ? `/api/admin/payment-gateways/${editingId}`
      : "/api/admin/payment-gateways";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    const ref = await fetch("/api/admin/payment-gateways");
    const refD = await ref.json();
    setGateways(refD.data || []);
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? "مطمئنید؟" : "Sure?")) return;
    await fetch(`/api/admin/payment-gateways/${id}`, { method: "DELETE" });
    const ref = await fetch("/api/admin/payment-gateways");
    const refD = await ref.json();
    setGateways(refD.data || []);
  };

  const getTypeLabel = (t) => {
    const found = gatewayTypes.find((g) => g.value === t);
    return found ? (isRTL ? found.labelFa : found.labelEn) : t;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "درگاه‌های پرداخت" : "Payment Gateways"}
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
              ? "افزودن درگاه"
              : "Add Gateway"}
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
                ? "ویرایش درگاه"
                : "Edit Gateway"
              : isRTL
                ? "درگاه جدید"
                : "New Gateway"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نام نمایشی" : "Display Name"}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نام فارسی" : "Name (FA)"}
                </label>
                <input
                  type="text"
                  value={form.nameFa}
                  onChange={(e) => setForm({ ...form, nameFa: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نوع" : "Type"}
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                >
                  {gatewayTypes.map((g) => (
                    <option key={g.value} value={g.value}>
                      {getTypeLabel(g.value)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Merchant ID
                </label>
                <input
                  type="text"
                  value={form.merchantId}
                  onChange={(e) =>
                    setForm({ ...form, merchantId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Callback URL
              </label>
              <input
                type="text"
                value={form.callbackUrl}
                onChange={(e) =>
                  setForm({ ...form, callbackUrl: e.target.value })
                }
                placeholder="https://sahandcover.com/api/payment/verify"
                className="w-full px-3 py-2 rounded-lg border text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.sandbox}
                    onChange={(e) =>
                      setForm({ ...form, sandbox: e.target.checked })
                    }
                  />
                  <span className="text-sm">
                    {isRTL ? "حالت تست" : "Sandbox"}
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "ترتیب" : "Order"}
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: parseInt(e.target.value) || 0 })
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
            key: "name",
            label: isRTL ? "نام" : "Name",
            render: (row) => (
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-50">
                  {isRTL && row.nameFa ? row.nameFa : row.name}
                </p>
                <p className="text-xs text-gray-400">
                  {getTypeLabel(row.type)}
                </p>
              </div>
            ),
          },
          {
            key: "merchantId",
            label: "Merchant ID",
            render: (row) => (
              <span className="text-xs font-mono text-gray-500">
                {row.merchantId ? "••••" + row.merchantId.slice(-4) : "—"}
              </span>
            ),
          },
          {
            key: "sandbox",
            label: isRTL ? "حالت" : "Mode",
            render: (row) => (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.sandbox ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" : "bg-emerald-50 text-emerald-700"}`}
              >
                {row.sandbox
                  ? isRTL
                    ? "تست"
                    : "Sandbox"
                  : isRTL
                    ? "واقعی"
                    : "Live"}
              </span>
            ),
          },
          { key: "order", label: isRTL ? "ترتیب" : "Order", align: "center" },
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
        data={gateways}
        searchPlaceholder={isRTL ? "جستجوی درگاه..." : "Search gateways..."}
        searchFields={["name", "nameFa", "type"]}
        locale={locale}
        onEdit={handleEdit}
        onDelete={(row) => handleDelete(row._id)}
      />
    </div>
  );
}
