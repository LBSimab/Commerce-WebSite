/**
 * ProductCard Component
 *
 * Displays a single product in a card format.
 * Used in product listing grids and category pages.
 *
 * Props:
 * - product: Product object from the API (with category populated)
 * - locale: Current locale for generating correct links
 */

import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product, locale }) {
  // Format price with commas for readability
  const formattedPrice = product.price.toLocaleString();

  // Generate the product detail link
  const productLink = `/${locale}/products/${product._id}`;

  return (
    <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <Link href={productLink}>
        <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center overflow-hidden">
          {product.mainImage ? (
            <img
              src={product.mainImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : product.category?.image ? (
            <img
              src={product.category.image}
              alt={product.category?.name || ""}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-5xl">📦</span>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category badge */}
        {product.category && (
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            {locale === "fa" ? product.category.nameFa : product.category.name}
          </span>
        )}

        {/* Product name */}
        <Link href={productLink}>
          <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2">
            {locale === "fa" && product.nameFa ? product.nameFa : product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          {product.discountPrice ? (
            // Show discount price with original price crossed out
            <>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                {product.discountPrice.toLocaleString()} T
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formattedPrice} T
              </span>
            </>
          ) : (
            // Regular price
            <span className="text-xl font-bold text-gray-900 dark:text-gray-50">
              {formattedPrice} T
            </span>
          )}
        </div>

        {/* Add to Cart button */}

        <div className="mt-3">
          <AddToCartButton product={product} locale={locale} variant="card" />
        </div>
      </div>
    </div>
  );
}
