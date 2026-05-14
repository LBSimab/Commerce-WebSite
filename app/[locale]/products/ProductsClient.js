"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";

// Filter sections — defined outside to avoid re-creation on every render
function FilterSections({
  categories,
  allColors,
  allCars,
  currentFilters,
  isRTL,
  openSection,
  toggleSection,
  updateFilter,
  clearFilters,
}) {
  const hasFilters = Object.values(currentFilters).some((v) => v);

  return (
    <div className="space-y-3">
      {/* Category */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
        <button
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 dark:text-gray-50 py-1"
        >
          {isRTL ? "دسته‌بندی" : "Category"}
          <span
            className={`transition-transform ${openSection === "category" ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>
        {openSection === "category" && (
          <div className="mt-2 space-y-1">
            <button
              onClick={() => updateFilter("category", "")}
              className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${!currentFilters.category ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              {isRTL ? "همه" : "All"}
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => updateFilter("category", cat.slug)}
                className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${currentFilters.category === cat.slug ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                {isRTL ? cat.nameFa : cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 dark:text-gray-50 py-1"
        >
          {isRTL ? "محدوده قیمت" : "Price Range"}
          <span
            className={`transition-transform ${openSection === "price" ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>
        {openSection === "price" && (
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              value={currentFilters.minPrice}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
              placeholder={isRTL ? "از" : "Min"}
              className="w-full px-2 py-1.5 rounded-lg border text-xs"
            />
            <input
              type="number"
              value={currentFilters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
              placeholder={isRTL ? "تا" : "Max"}
              className="w-full px-2 py-1.5 rounded-lg border text-xs"
            />
          </div>
        )}
      </div>

      {/* Color */}
      {allColors.length > 0 && (
        <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
          <button
            onClick={() => toggleSection("color")}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 dark:text-gray-50 py-1"
          >
            {isRTL ? "رنگ" : "Color"}
            <span
              className={`transition-transform ${openSection === "color" ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>
          {openSection === "color" && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                onClick={() => updateFilter("color", "")}
                className={`px-2.5 py-1 rounded-lg text-xs ${!currentFilters.color ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700" : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"}`}
              >
                {isRTL ? "همه" : "All"}
              </button>
              {allColors.map((c) => (
                <button
                  key={c}
                  onClick={() => updateFilter("color", c)}
                  className={`px-2.5 py-1 rounded-lg text-xs ${currentFilters.color === c ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700" : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Car */}
      {allCars.length > 0 && (
        <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
          <button
            onClick={() => toggleSection("car")}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 dark:text-gray-50 py-1"
          >
            {isRTL ? "مدل خودرو" : "Car Model"}
            <span
              className={`transition-transform ${openSection === "car" ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>
          {openSection === "car" && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                onClick={() => updateFilter("car", "")}
                className={`px-2.5 py-1 rounded-lg text-xs ${!currentFilters.car ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700" : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"}`}
              >
                {isRTL ? "همه" : "All"}
              </button>
              {allCars.map((c) => (
                <button
                  key={c}
                  onClick={() => updateFilter("car", c)}
                  className={`px-2.5 py-1 rounded-lg text-xs ${currentFilters.car === c ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700" : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-red-500 hover:text-red-600 w-full text-left pt-1"
        >
          {isRTL ? "حذف همه فیلترها" : "Clear All Filters"}
        </button>
      )}
    </div>
  );
}

export default function ProductsClient({
  products,
  categories,
  allColors,
  allCars,
  total,
  page,
  limit,
  locale,
  currentFilters,
}) {
  const isRTL = locale === "fa";
  const router = useRouter();
  const totalPages = Math.ceil(total / limit);

  const [showFilters, setShowFilters] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams();
    Object.entries({ ...currentFilters, [key]: value }).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set("page", "1");
    router.push(`/${locale}/products?${params.toString()}`);
  };

  const clearFilters = () => router.push(`/${locale}/products`);
  const hasFilters = Object.values(currentFilters).some((v) => v);
  const toggleSection = (section) =>
    setOpenSection(openSection === section ? null : section);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6">
        {isRTL ? "محصولات" : "Products"}
        <span className="ml-2 text-lg text-gray-500 font-normal">
          ({total})
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50 mb-4">
              {isRTL ? "فیلترها" : "Filters"}
            </h3>
            <FilterSections
              categories={categories}
              allColors={allColors}
              allCars={allCars}
              currentFilters={currentFilters}
              isRTL={isRTL}
              openSection={openSection}
              toggleSection={toggleSection}
              updateFilter={updateFilter}
              clearFilters={clearFilters}
            />
          </div>
        </div>

        {/* Mobile Filter Button + Drawer */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {isRTL ? "فیلترها" : "Filters"}
            {hasFilters && (
              <span className="w-2 h-2 bg-indigo-600 rounded-full" />
            )}
          </button>

          {/* Mobile Filter Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowFilters(false)}
              />
              <div
                className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                      {isRTL ? "فیلترها" : "Filters"}
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 text-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <FilterSections
                    categories={categories}
                    allColors={allColors}
                    allCars={allCars}
                    currentFilters={currentFilters}
                    isRTL={isRTL}
                    openSection={openSection}
                    toggleSection={toggleSection}
                    updateFilter={updateFilter}
                    clearFilters={clearFilters}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort + Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isRTL ? `${total} محصول` : `${total} products`}
            </p>
            <select
              value={currentFilters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-sm bg-white dark:bg-gray-900"
            >
              <option value="newest">{isRTL ? "جدیدترین" : "Newest"}</option>
              <option value="price-asc">
                {isRTL ? "ارزان‌ترین" : "Price: Low-High"}
              </option>
              <option value="price-desc">
                {isRTL ? "گران‌ترین" : "Price: High-Low"}
              </option>
              <option value="rating">{isRTL ? "امتیاز" : "Rating"}</option>
            </select>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 dark:text-gray-400">
                {isRTL ? "محصولی یافت نشد" : "No products found"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  locale={locale}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateFilter("page", p.toString())}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-900 border text-gray-700 dark:text-gray-300 hover:bg-gray-50"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
