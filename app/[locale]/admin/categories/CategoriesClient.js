"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import DataTable from "@/components/DataTable";

export default function CategoriesClient({ initialCategories, locale }) {
  const isRTL = locale === "fa";
  const [categories, setCategories] = useState(initialCategories);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    nameFa: "",
    description: "",
    descriptionFa: "",
    image: "",
    order: 0,
    isActive: true,
  });

  const resetForm = () => {
    setForm({
      name: "",
      nameFa: "",
      description: "",
      descriptionFa: "",
      image: "",
      order: 0,
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (cat) => {
    setForm({
      name: cat.name || "",
      nameFa: cat.nameFa || "",
      description: cat.description || "",
      descriptionFa: cat.descriptionFa || "",
      image: cat.image || "",
      order: cat.order || 0,
      isActive: cat.isActive !== false,
    });
    setEditingId(cat._id);
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
    try {
      const url = editingId
        ? `/api/categories/${editingId}`
        : "/api/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
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
      const ref = await fetch("/api/categories");
      const refD = await ref.json();
      setCategories(refD.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? "مطمئنید؟" : "Sure?")) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const ref = await fetch("/api/categories");
      const refD = await ref.json();
      setCategories(refD.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "دسته‌بندی‌ها" : "Categories"}
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
              ? "افزودن"
              : "Add Category"}
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
                ? "ویرایش"
                : "Edit"
              : isRTL
                ? "دسته‌بندی جدید"
                : "New Category"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نام (EN)" : "Name (EN)"}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
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
                  required
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "توضیحات (EN)" : "Description (EN)"}
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "توضیحات (FA)" : "Description (FA)"}
                </label>
                <input
                  type="text"
                  value={form.descriptionFa}
                  onChange={(e) =>
                    setForm({ ...form, descriptionFa: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
                <label className="flex items-center gap-2 mt-4">
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
            key: "image",
            label: isRTL ? "تصویر" : "Image",
            sortable: false,
            render: (row) =>
              row.image ? (
                <img
                  src={row.image}
                  className="h-10 w-10 object-cover rounded-lg"
                />
              ) : (
                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                  —
                </div>
              ),
          },
          {
            key: "name",
            label: isRTL ? "نام" : "Name",
            render: (row) => (
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-50">
                  {isRTL && row.nameFa ? row.nameFa : row.name}
                </p>
                <p className="text-xs text-gray-400">
                  {isRTL ? row.name : row.nameFa}
                </p>
              </div>
            ),
          },
          {
            key: "slug",
            label: isRTL ? "نامک" : "Slug",
            render: (row) => (
              <span className="font-mono text-xs text-gray-500">
                {row.slug}
              </span>
            ),
          },
          { key: "order", label: isRTL ? "ترتیب" : "Order", align: "center" },
          {
            key: "isActive",
            label: isRTL ? "وضعیت" : "Status",
            render: (row) => (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
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
        data={categories}
        searchPlaceholder={
          isRTL ? "جستجوی دسته‌بندی..." : "Search categories..."
        }
        searchFields={["name", "nameFa", "slug"]}
        locale={locale}
        onEdit={handleEdit}
        onDelete={(row) => handleDelete(row._id)}
        emptyMessage={isRTL ? "دسته‌بندی یافت نشد" : "No categories found"}
      />
    </div>
  );
}
