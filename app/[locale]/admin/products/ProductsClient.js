"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import DataTable from "@/components/DataTable";

export default function ProductsClient({
  initialProducts,
  categories,
  locale,
}) {
  const isRTL = locale === "fa";
  const [products, setProducts] = useState(initialProducts);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Filter states
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("color");
  const [filterValue, setFilterValue] = useState("");

  const [form, setForm] = useState({
    name: "",
    nameFa: "",
    sku: "",
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

  const resetForm = () => {
    setForm({
      name: "",
      nameFa: "",
      sku: "",
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

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      nameFa: product.nameFa || "",
      sku: product.sku || "",
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

  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm({ ...form, mainImage: data.data.url });
    setIsUploading(false);
  };

  const handleAdditionalImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm({ ...form, images: [...form.images, data.data.url] });
    setIsUploading(false);
  };

  const removeImage = (index) =>
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });

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
        sku: form.sku || null,
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
            ? "محصول ویرایش شد"
            : "Product updated"
          : isRTL
            ? "محصول ایجاد شد"
            : "Product created",
      );
      resetForm();
      const ref = await fetch("/api/products?limit=100");
      const refD = await ref.json();
      setProducts(refD.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? "مطمئنید؟" : "Sure?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      const ref = await fetch("/api/products?limit=100");
      const refD = await ref.json();
      setProducts(refD.data || []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Apply admin filters
  const adminFiltered = products.filter((p) => {
    if (filterCategory && p.category?._id !== filterCategory) return false;
    if (filterValue) {
      if (
        filterType === "color" &&
        !p.colors?.some((c) =>
          c.toLowerCase().includes(filterValue.toLowerCase()),
        )
      )
        return false;
      if (
        filterType === "material" &&
        !p.material?.toLowerCase().includes(filterValue.toLowerCase())
      )
        return false;
      if (
        filterType === "car" &&
        !p.compatibleCars?.some((c) =>
          c.toLowerCase().includes(filterValue.toLowerCase()),
        )
      )
        return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilterCategory("");
    setFilterType("color");
    setFilterValue("");
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
          className={`mb-4 p-3 rounded-lg text-sm ${message.includes("موفق") || message.includes("created") || message.includes("updated") ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-red-50 dark:bg-red-900/20 text-red-600"}`}
        >
          {message}
        </div>
      )}

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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-mono uppercase"
                  placeholder="SEAT-001"
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
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
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
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "قیمت" : "Price"}
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "تخفیف" : "Discount"}
                </label>
                <input
                  type="number"
                  value={form.discountPrice}
                  onChange={(e) =>
                    setForm({ ...form, discountPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "دسته‌بندی" : "Category"}
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">{isRTL ? "انتخاب..." : "Select..."}</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {isRTL ? c.nameFa : c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "جنس" : "Material"}
                </label>
                <input
                  type="text"
                  value={form.material}
                  onChange={(e) =>
                    setForm({ ...form, material: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "رنگ‌ها (کاما جدا)" : "Colors (comma)"}
                </label>
                <input
                  type="text"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "خودروها (کاما جدا)" : "Cars (comma)"}
                </label>
                <input
                  type="text"
                  value={form.compatibleCars}
                  onChange={(e) =>
                    setForm({ ...form, compatibleCars: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "تصویر اصلی" : "Main Image"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  className="w-full text-sm"
                />
                {form.mainImage && (
                  <img
                    src={form.mainImage}
                    className="mt-2 h-16 w-16 object-cover rounded-lg"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "تصاویر بیشتر" : "More Images"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAdditionalImageUpload}
                  className="w-full text-sm"
                />
                {form.images.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative">
                        <img
                          src={img}
                          className="h-12 w-12 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
        {/* Category Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "دسته‌بندی" : "Category"}
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          >
            <option value="">{isRTL ? "همه" : "All"}</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {isRTL ? c.nameFa : c.name}
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
                name="filterType"
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
                name="filterType"
                checked={filterType === "material"}
                onChange={() => setFilterType("material")}
                className="w-3.5 h-3.5 text-indigo-600"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {isRTL ? "جنس" : "Material"}
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="filterType"
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
                : filterType === "material"
                  ? isRTL
                    ? "نام جنس..."
                    : "Material..."
                  : isRTL
                    ? "نام خودرو..."
                    : "Car model..."
            }
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50 w-48"
          />
        </div>

        {/* Clear Filters */}
        {(filterCategory || filterValue) && (
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
            key: "mainImage",
            label: isRTL ? "تصویر" : "Img",
            sortable: false,
            render: (row) =>
              row.mainImage ? (
                <img
                  src={row.mainImage}
                  className="h-10 w-10 object-cover rounded-lg"
                />
              ) : (
                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                  —
                </div>
              ),
          },
          {
            key: "sku",
            label: "SKU",
            render: (row) => (
              <span className="font-mono text-xs text-gray-500">
                {row.sku || "—"}
              </span>
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
            key: "category.name",
            label: isRTL ? "دسته" : "Category",
            render: (row) => (
              <span className="text-xs text-gray-500">
                {row.category
                  ? isRTL
                    ? row.category.nameFa
                    : row.category.name
                  : "—"}
              </span>
            ),
          },
          {
            key: "price",
            label: isRTL ? "قیمت" : "Price",
            render: (row) => (
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {row.price?.toLocaleString()} T
                </span>
                {row.discountPrice && (
                  <span className="text-xs text-red-500 block">
                    {row.discountPrice.toLocaleString()} T
                  </span>
                )}
              </div>
            ),
          },
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
        data={adminFiltered}
        searchPlaceholder={
          isRTL
            ? "جستجوی محصول (نام، SKU)..."
            : "Search products (name, SKU)..."
        }
        searchFields={["name", "nameFa", "sku"]}
        locale={locale}
        onEdit={handleEdit}
        onDelete={(row) => handleDelete(row._id)}
        emptyMessage={isRTL ? "محصولی یافت نشد" : "No products found"}
      />
    </div>
  );
}
