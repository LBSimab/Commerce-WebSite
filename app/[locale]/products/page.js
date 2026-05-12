/**
 * Products Page (Server Component)
 *
 * Fetches products from the API on the server and displays them in a grid.
 * Supports filtering by category via query parameters.
 */

import ProductCard from "@/components/ProductCard";
import { getTranslations } from "next-intl/server";

export default async function ProductsPage({ searchParams, params }) {
  const { locale } = await params;

  // Get translations for this page
  const t = await getTranslations("products");

  // Read category filter from URL query parameter
  // Example: /en/products?category=seat-covers
  const { searchParams: searchParamsData } = { searchParams };
  const category = (await searchParams)?.category || "";

  // Build the API URL with optional category filter
  let apiUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/products`;
  if (category) {
    apiUrl += `?category=${category}`;
  }

  // Fetch products from our API
  let products = [];
  let error = null;

  try {
    const res = await fetch(apiUrl, {
      // Next.js fetch cache configuration
      // Revalidate every 60 seconds — good for semi-dynamic data
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await res.json();
    products = data.data || [];
  } catch (err) {
    error = err.message;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {t("title")}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {products.length} {locale === "fa" ? "محصول" : "products"}{" "}
          {t("found")}
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            {locale === "fa"
              ? "خطا در بارگذاری محصولات"
              : "Error loading products"}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!error && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {locale === "fa" ? "محصولی یافت نشد" : "No products found"}
          </p>
        </div>
      )}

      {/* Product grid */}
      {!error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
