"use client";

import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";

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

  const updateFilter = (key, value) => {
    const params = new URLSearchParams();
    Object.entries({ ...currentFilters, [key]: value }).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set("page", "1");
    router.push(`/${locale}/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/${locale}/products`);
  };

  const hasFilters = Object.values(currentFilters).some((v) => v);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6">
        {isRTL ? "محصولات" : "Products"}
        <span className="ml-2 text-lg text-gray-500 font-normal">
          ({total})
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-64 flex-shrink-0 space-y-5">
          {/* Category */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-2">
              {isRTL ? "دسته‌بندی" : "Category"}
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => updateFilter("category", "")}
                className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !currentFilters.category
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {isRTL ? "همه" : "All"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateFilter("category", cat.slug)}
                  className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    currentFilters.category === cat.slug
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {isRTL ? cat.nameFa : cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-2">
              {isRTL ? "محدوده قیمت" : "Price Range"}
            </h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={isRTL ? "از" : "Min"}
                value={currentFilters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
              />
              <input
                type="number"
                placeholder={isRTL ? "تا" : "Max"}
                value={currentFilters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
              />
            </div>
          </div>

          {/* Color Filter */}
          {allColors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-2">
                {isRTL ? "رنگ" : "Color"}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => updateFilter("color", "")}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    !currentFilters.color
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {isRTL ? "همه" : "All"}
                </button>
                {allColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateFilter("color", c)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                      currentFilters.color === c
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Car Filter */}
          {allCars.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-2">
                {isRTL ? "مدل خودرو" : "Car Model"}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => updateFilter("car", "")}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    !currentFilters.car
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {isRTL ? "همه" : "All"}
                </button>
                {allCars.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateFilter("car", c)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                      currentFilters.car === c
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700"
            >
              {isRTL ? "حذف فیلترها" : "Clear Filters"}
            </button>
          )}
        </div>

        {/* Products Grid + Sort + Pagination */}
        <div className="flex-1">
          {/* Sort + Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isRTL ? `${total} محصول یافت شد` : `${total} products found`}
            </p>
            <select
              value={currentFilters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
            >
              <option value="newest">{isRTL ? "جدیدترین" : "Newest"}</option>
              <option value="price-asc">
                {isRTL ? "قیمت: کم به زیاد" : "Price: Low to High"}
              </option>
              <option value="price-desc">
                {isRTL ? "قیمت: زیاد به کم" : "Price: High to Low"}
              </option>
              <option value="rating">{isRTL ? "امتیاز" : "Rating"}</option>
            </select>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12">
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
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === p
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
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
