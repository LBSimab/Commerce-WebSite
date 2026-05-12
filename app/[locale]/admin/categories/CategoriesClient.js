"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

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

  const handleEdit = (category) => {
    setForm({
      name: category.name || "",
      nameFa: category.nameFa || "",
      description: category.description || "",
      descriptionFa: category.descriptionFa || "",
      image: category.image || "",
      order: category.order || 0,
      isActive: category.isActive !== false,
    });
    setEditingId(category._id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm({ ...form, image: data.data.url });
      setMessage(
        isRTL ? "تصویر با موفقیت آپلود شد" : "Image uploaded successfully",
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setIsUploading(false);
    }
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
            ? "دسته‌بندی با موفقیت ویرایش شد"
            : "Category updated successfully"
          : isRTL
            ? "دسته‌بندی با موفقیت ایجاد شد"
            : "Category created successfully",
      );
      resetForm();

      const refreshed = await fetch("/api/categories");
      const refreshedData = await refreshed.json();
      setCategories(refreshedData.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        isRTL ? "آیا از حذف این دسته‌بندی مطمئن هستید؟" : "Are you sure?",
      )
    )
      return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(
        isRTL ? "دسته‌بندی با موفقیت حذف شد" : "Category deleted successfully",
      );

      const refreshed = await fetch("/api/categories");
      const refreshedData = await refreshed.json();
      setCategories(refreshedData.data || []);
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
              ? "افزودن دسته‌بندی"
              : "Add Category"}
        </Button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes("success") || message.includes("موفقیت")
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
            {editingId
              ? isRTL
                ? "ویرایش دسته‌بندی"
                : "Edit Category"
              : isRTL
                ? "دسته‌بندی جدید"
                : "New Category"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "نام (انگلیسی)" : "Name (EN)"}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "نام (فارسی)" : "Name (FA)"}
                </label>
                <input
                  type="text"
                  value={form.nameFa}
                  onChange={(e) => setForm({ ...form, nameFa: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "توضیحات (انگلیسی)" : "Description (EN)"}
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "توضیحات (فارسی)" : "Description (FA)"}
                </label>
                <input
                  type="text"
                  value={form.descriptionFa}
                  onChange={(e) =>
                    setForm({ ...form, descriptionFa: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "تصویر دسته‌بندی" : "Category Image"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900 dark:file:text-indigo-300 hover:file:bg-indigo-100"
                />
                {isUploading && (
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL ? "در حال آپلود..." : "Uploading..."}
                  </p>
                )}
                {form.image && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: "" })}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "ترتیب نمایش" : "Order"}
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                />
                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm({ ...form, isActive: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {isRTL ? "فعال" : "Active"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <Button type="submit" variant="primary">
              {editingId
                ? isRTL
                  ? "ذخیره تغییرات"
                  : "Save Changes"
                : isRTL
                  ? "ایجاد دسته‌بندی"
                  : "Create Category"}
            </Button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {isRTL ? "هیچ دسته‌بندی یافت نشد" : "No categories found"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? "تصویر" : "Image"}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? "نام" : "Name"}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? "نامک" : "Slug"}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? "ترتیب" : "Order"}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? "وضعیت" : "Status"}
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? "عملیات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-10 w-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          —
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900 dark:text-gray-50 font-medium">
                        {cat.name}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {cat.nameFa}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-50">
                      {cat.order}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cat.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {cat.isActive
                          ? isRTL
                            ? "فعال"
                            : "Active"
                          : isRTL
                            ? "غیرفعال"
                            : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-left">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                        >
                          {isRTL ? "ویرایش" : "Edit"}
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                        >
                          {isRTL ? "حذف" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
