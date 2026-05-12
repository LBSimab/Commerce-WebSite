"use client";

/**
 * ProductCard Component
 *
 * Premium product card with hover effects, gradient overlays,
 * rating stars, price with discount badge, and quick add to cart.
 * Inspired by modern e-commerce card designs.
 */

import Link from "next/link";
import { useCartStore } from "@/store/cart";

export default function ProductCard({ product, locale }) {
  const isRTL = locale === "fa";
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  const productName = isRTL && product.nameFa ? product.nameFa : product.name;
  const categoryName =
    isRTL && product.category?.nameFa
      ? product.category.nameFa
      : product.category?.name;
  const formattedPrice = product.price?.toLocaleString();
  const formattedDiscount = product.discountPrice?.toLocaleString();
  const inStock = product.stock?.inStock !== false;
  const productLink = `/${locale}/products/${product._id}`;
  const hasDiscount = !!product.discountPrice;

  // Calculate discount percentage
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;

  // Check if in cart
  const inCart = items.some((item) => item.productId === product._id);

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      {/* Image Container */}
      <Link
        href={productLink}
        className="block relative overflow-hidden aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700"
      >
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-7xl opacity-40 group-hover:scale-110 transition-transform duration-700">
              {product.category?.image ? (
                <img
                  src={product.category.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                "📦"
              )}
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
          <span className="px-6 py-3 bg-white text-gray-900 rounded-full text-sm font-semibold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            {isRTL ? "مشاهده محصول" : "View Product"}
          </span>
        </div>

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-6 py-3 bg-white dark:bg-gray-900 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300 shadow-2xl">
              {isRTL ? "ناموجود" : "Sold Out"}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {categoryName && (
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            {categoryName}
          </span>
        )}

        {/* Product Name */}
        <Link href={productLink}>
          <h3 className="mt-1.5 font-bold text-gray-900 dark:text-gray-50 line-clamp-2 leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {productName}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating?.count > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-amber-400 text-sm">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={
                    s <= Math.round(product.rating.average)
                      ? "text-amber-400"
                      : "text-gray-200 dark:text-gray-700"
                  }
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              ({product.rating.count})
            </span>
          </div>
        )}

        {/* Price + Add to Cart */}
        <div className="flex items-end justify-between mt-4">
          <div>
            {hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-50">
                  {formattedDiscount}
                  <span className="text-sm font-normal text-gray-400 ml-1">
                    T
                  </span>
                </span>
                <span className="text-sm text-gray-400 line-through -mt-1">
                  {formattedPrice} T
                </span>
              </div>
            ) : (
              <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-50">
                {formattedPrice}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  T
                </span>
              </span>
            )}
          </div>

          {/* Quick Add Button — for products without variants */}
          {inStock &&
            !product.colors?.length &&
            !product.compatibleCars?.length && (
              <button
                onClick={() =>
                  addItem({ ...product, stock: { available: 99 } }, 1)
                }
                className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-lg ${
                  inCart
                    ? "bg-green-500 text-white shadow-green-500/30"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30 hover:scale-110"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {inCart ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  )}
                </svg>
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
