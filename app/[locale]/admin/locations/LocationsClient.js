"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

const types = ["store", "office", "warehouse"];

export default function LocationsClient({ initialLocations, locale }) {
  const isRTL = locale === "fa";
  const [locations, setLocations] = useState(initialLocations);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const emptyForm = {
    name: "",
    nameFa: "",
    type: "store",
    address: "",
    addressFa: "",
    phone: "",
    phone2: "",
    email: "",
    workingHours: "",
    workingHoursFa: "",
    coordinates: { lat: 0, lng: 0 },
    image: "",
    description: "",
    descriptionFa: "",
    order: 0,
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (loc) => {
    setForm({
      name: loc.name,
      nameFa: loc.nameFa || "",
      type: loc.type || "store",
      address: loc.address || "",
      addressFa: loc.addressFa || "",
      phone: loc.phone || "",
      phone2: loc.phone2 || "",
      email: loc.email || "",
      workingHours: loc.workingHours || "",
      workingHoursFa: loc.workingHoursFa || "",
      coordinates: loc.coordinates || { lat: 0, lng: 0 },
      image: loc.image || "",
      description: loc.description || "",
      descriptionFa: loc.descriptionFa || "",
      order: loc.order || 0,
      isActive: loc.isActive !== false,
    });
    setEditingId(loc._id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm({ ...form, image: data.data.url });
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const url = editingId ? `/api/locations/${editingId}` : "/api/locations";
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
    const ref = await fetch("/api/locations");
    const refD = await ref.json();
    setLocations(refD.data || []);
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? "مطمئنید؟" : "Sure?")) return;
    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    const ref = await fetch("/api/locations");
    const refD = await ref.json();
    setLocations(refD.data || []);
  };

  const getTypeLabel = (t) => {
    const map = {
      store: isRTL ? "فروشگاه" : "Store",
      office: isRTL ? "دفتر" : "Office",
      warehouse: isRTL ? "انبار" : "Warehouse",
    };
    return map[t] || t;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "موقعیت‌ها" : "Locations"}
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
              ? "افزودن موقعیت"
              : "Add Location"}
        </Button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نام (EN)" : "Name (EN)"}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نام (FA)" : "Name (FA)"}
                </label>
                <input
                  type="text"
                  value={form.nameFa}
                  onChange={(e) => setForm({ ...form, nameFa: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نوع" : "Type"}
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {getTypeLabel(t)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "آدرس (EN)" : "Address (EN)"}
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "آدرس (FA)" : "Address (FA)"}
                </label>
                <textarea
                  value={form.addressFa}
                  onChange={(e) =>
                    setForm({ ...form, addressFa: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "تلفن ۱" : "Phone 1"}
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "تلفن ۲" : "Phone 2"}
                </label>
                <input
                  type="text"
                  value={form.phone2}
                  onChange={(e) => setForm({ ...form, phone2: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "ساعات کاری (EN)" : "Working Hours (EN)"}
                </label>
                <input
                  type="text"
                  value={form.workingHours}
                  onChange={(e) =>
                    setForm({ ...form, workingHours: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "ساعات کاری (FA)" : "Working Hours (FA)"}
                </label>
                <input
                  type="text"
                  value={form.workingHoursFa}
                  onChange={(e) =>
                    setForm({ ...form, workingHoursFa: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.coordinates.lat}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      coordinates: {
                        ...form.coordinates,
                        lat: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.coordinates.lng}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      coordinates: {
                        ...form.coordinates,
                        lng: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "توضیحات (EN)" : "Description (EN)"}
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "توضیحات (FA)" : "Description (FA)"}
                </label>
                <textarea
                  value={form.descriptionFa}
                  onChange={(e) =>
                    setForm({ ...form, descriptionFa: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {isRTL ? "تصویر" : "Image"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-sm"
              />
              {form.image && (
                <img
                  src={form.image}
                  className="mt-2 h-16 w-16 object-cover rounded-lg"
                />
              )}
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm mr-2">
                  {isRTL ? "ترتیب" : "Order"}
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-20 px-2 py-1 rounded border"
                />
              </div>
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

      <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
              <th className="p-3">{isRTL ? "نام" : "Name"}</th>
              <th className="p-3">{isRTL ? "نوع" : "Type"}</th>
              <th className="p-3">{isRTL ? "تلفن" : "Phone"}</th>
              <th className="p-3">{isRTL ? "ترتیب" : "Order"}</th>
              <th className="p-3">{isRTL ? "وضعیت" : "Status"}</th>
              <th className="p-3 text-right">{isRTL ? "عملیات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr
                key={loc._id}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="p-3 font-medium">
                  {isRTL && loc.nameFa ? loc.nameFa : loc.name}
                </td>
                <td className="p-3 text-xs">{getTypeLabel(loc.type)}</td>
                <td className="p-3 text-xs">{loc.phone || "—"}</td>
                <td className="p-3">{loc.order}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${loc.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {loc.isActive
                      ? isRTL
                        ? "فعال"
                        : "Active"
                      : isRTL
                        ? "غیرفعال"
                        : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleEdit(loc)}
                    className="text-indigo-600 mr-3"
                  >
                    {isRTL ? "ویرایش" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDelete(loc._id)}
                    className="text-red-600"
                  >
                    {isRTL ? "حذف" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
