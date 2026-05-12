"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function ProductsClient({
  initialProducts,
  categories,
  locale,
}) {
  const isRTL = locale === "fa";

  const [products, setProducts] = useState(initialProducts);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    nameFa: "",
    description: "",
    descriptionFa: "",
    price: "",
    discountPrice: "",
    category: "",
    material: "",
    colors: "",
    compatibleCars: "",
    mainImage: "",
    images: [],
    isActive: true,
  });

  // Reset form
  const resetForm = () => {
    setForm({
      name: "",
      nameFa: "",
      description: "",
      descriptionFa: "",
      price: "",
      discountPrice: "",
      category: "",
      material: "",
      colors: "",
      compatibleCars: "",
      mainImage: "",
      images: [],
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Fill form for editing
  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      nameFa: product.nameFa || "",
      description: product.description || "",
      descriptionFa: product.descriptionFa || "",
      price: product.price?.toString() || "",
      discountPrice: product.discountPrice?.toString() || "",
      category: product.category?._id || "",
      material: product.material || "",
      colors: product.colors?.join(", ") || "",
      compatibleCars: product.compatibleCars?.join(", ") || "",
      mainImage: product.mainImage || "",
      images: product.images || [],
      isActive: product.isActive !== false,
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  // Upload main image
  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm({ ...form, mainImage: data.data.url });
      setMessage(isRTL ? "تصویر با موفقیت آپلود شد" : "Image uploaded");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Upload additional images
  const handleAdditionalImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm({ ...form, images: [...form.images, data.data.url] });
      setMessage(isRTL ? "تصویر با موفقیت آپلود شد" : "Image uploaded");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove additional image
  const removeImage = (index) => {
    const updated = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: updated });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.name || !form.price || !form.category) {
      setMessage(
        isRTL
          ? "نام، قیمت و دسته‌بندی الزامی است"
          : "Name, price, and category are required",
      );
      return;
    }

    try {
      const body = {
        name: form.name,
        nameFa: form.nameFa,
        description: form.description,
        descriptionFa: form.descriptionFa,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        category: form.category,
        material: form.material,
        colors: form.colors
          ? form.colors
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : [],
        compatibleCars: form.compatibleCars
          ? form.compatibleCars
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : [],
        mainImage: form.mainImage,
        images: form.images,
        isActive: form.isActive,
      };

      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(
        editingId
          ? isRTL
            ? "محصول با موفقیت ویرایش شد"
            : "Product updated successfully"
          : isRTL
            ? "محصول با موفقیت ایجاد شد"
            : "Product created successfully",
      );
      resetForm();

      // Refetch
      const refreshed = await fetch(`/api/products?limit=100`);
      const refreshedData = await refreshed.json();
      setProducts(refreshedData.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm(isRTL ? "آیا از حذف این محصول مطمئن هستید؟" : "Are you sure?"))
      return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(isRTL ? "محصول با موفقیت حذف شد" : "Product deleted");

      const refreshed = await fetch(`/api/products?limit=100`);
      const refreshedData = await refreshed.json();
      setProducts(refreshedData.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "محصولات" : "Products"}
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
              ? "افزودن محصول"
              : "Add Product"}
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

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
            {editingId
              ? isRTL
                ? "ویرایش محصول"
                : "Edit Product"
              : isRTL
                ? "محصول جدید"
                : "New Product"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
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

            {/* Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "توضیحات (انگلیسی)" : "Description (EN)"}
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "توضیحات (فارسی)" : "Description (FA)"}
                </label>
                <textarea
                  value={form.descriptionFa}
                  onChange={(e) =>
                    setForm({ ...form, descriptionFa: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                />
              </div>
            </div>

            {/* Price + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "قیمت (تومان)" : "Price (Toman)"}
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL
                    ? "قیمت تخفیفی (اختیاری)"
                    : "Discount Price (optional)"}
                </label>
                <input
                  type="number"
                  value={form.discountPrice}
                  onChange={(e) =>
                    setForm({ ...form, discountPrice: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "دسته‌بندی" : "Category"}
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                >
                  <option value="">
                    {isRTL ? "انتخاب کنید..." : "Select..."}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {isRTL ? cat.nameFa : cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Material + Colors + Cars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "جنس" : "Material"}
                </label>
                <input
                  type="text"
                  value={form.material}
                  onChange={(e) =>
                    setForm({ ...form, material: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL
                    ? "رنگ‌ها (با کاما جدا کنید)"
                    : "Colors (comma separated)"}
                </label>
                <input
                  type="text"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  placeholder={isRTL ? "مشکی, قرمز, آبی" : "Black, Red, Blue"}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL
                    ? "خودروهای سازگار (با کاما)"
                    : "Compatible Cars (comma)"}
                </label>
                <input
                  type="text"
                  value={form.compatibleCars}
                  onChange={(e) =>
                    setForm({ ...form, compatibleCars: e.target.value })
                  }
                  placeholder={
                    isRTL ? "پراید, سمند, ۲۰۶" : "Pride, Samand, 206"
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                />
              </div>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "تصویر اصلی" : "Main Image"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900 dark:file:text-indigo-300"
                />
                {form.mainImage && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={form.mainImage}
                      alt=""
                      className="h-20 w-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, mainImage: "" })}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRTL ? "تصاویر بیشتر" : "Additional Images"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAdditionalImageUpload}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900 dark:file:text-indigo-300"
                />
                {form.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative inline-block">
                        <img
                          src={img}
                          alt=""
                          className="h-16 w-16 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isRTL ? "محصول فعال" : "Active Product"}
              </span>
            </label>

            <Button type="submit" variant="primary">
              {editingId
                ? isRTL
                  ? "ذخیره تغییرات"
                  : "Save Changes"
                : isRTL
                  ? "ایجاد محصول"
                  : "Create Product"}
            </Button>
          </form>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {isRTL ? "هیچ محصولی یافت نشد" : "No products found"}
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
                    {isRTL ? "دسته‌بندی" : "Category"}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? "قیمت" : "Price"}
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
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      {product.mainImage ? (
                        <img
                          src={product.mainImage}
                          alt=""
                          className="h-10 w-10 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400">
                          —
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900 dark:text-gray-50 font-medium">
                        {product.name}
                      </p>
                      {product.nameFa && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          {product.nameFa}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                      {product.category
                        ? isRTL
                          ? product.category.nameFa
                          : product.category.name
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-50">
                      {product.price?.toLocaleString()} T
                      {product.discountPrice && (
                        <span className="text-red-500 text-xs block">
                          {product.discountPrice.toLocaleString()} T
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {product.isActive
                          ? isRTL
                            ? "فعال"
                            : "Active"
                          : isRTL
                            ? "غیرفعال"
                            : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-sm font-medium"
                        >
                          {isRTL ? "ویرایش" : "Edit"}
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 text-sm font-medium"
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
