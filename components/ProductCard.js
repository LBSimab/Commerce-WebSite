"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProductCard({ product, locale }) {
  const isRTL = locale === "fa";

  const productName = isRTL && product.nameFa ? product.nameFa : product.name;
  const productDesc =
    isRTL && product.descriptionFa
      ? product.descriptionFa
      : product.description;
  const categoryName =
    isRTL && product.category?.nameFa
      ? product.category.nameFa
      : product.category?.name;
  const formattedPrice = product.price?.toLocaleString();
  const formattedDiscount = product.discountPrice?.toLocaleString();
  const hasDiscount = !!product.discountPrice;
  const productLink = `/${locale}/products/${product._id}`;

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);

  const hasColors = product.colors?.length > 0;
  const hasCars = product.compatibleCars?.length > 0;

  const getColorHex = (color) => {
    const map = {
      black: "#1a1a1a",
      white: "#f5f5f5",
      red: "#ef4444",
      blue: "#3b82f6",
      gray: "#9ca3af",
      grey: "#9ca3af",
      beige: "#d4b896",
      brown: "#8b5e3c",
      silver: "#c0c0c0",
      green: "#22c55e",
    };
    return map[color?.toLowerCase()] || "#6366f1";
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <Link href={productLink} className="block p-3 pb-0">
        <div className="overflow-hidden rounded-xl border-2 border-gray-100 dark:border-gray-700 aspect-[4/3] bg-gray-50 dark:bg-gray-800 relative">
          {product.mainImage ? (
            <img
              src={product.mainImage}
              alt={productName}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">
              📦
            </div>
          )}

          {hasDiscount && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500 text-white">
                -
                {Math.round(
                  ((product.price - product.discountPrice) / product.price) *
                    100,
                )}
                %
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-1.5">
        {/* Category */}
        {categoryName && (
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wider">
            {categoryName}
          </p>
        )}

        {/* Name */}
        <Link href={productLink}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm">
            {productName}
          </h3>
        </Link>

        {/* Description */}
        {productDesc && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {productDesc}
          </p>
        )}

        {/* Rating */}
        {product.rating?.count > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex text-amber-400 text-xs">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s}>
                  {s <= Math.round(product.rating.average) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-gray-400">
              ({product.rating.count})
            </span>
          </div>
        )}

        {/* Price */}
        <div>
          {hasDiscount ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {formattedDiscount}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {formattedPrice}
              </span>
              <span className="text-[10px] text-gray-400">T</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
              {formattedPrice}
              <span className="text-[10px] font-normal text-gray-400 ml-0.5">
                T
              </span>
            </span>
          )}
        </div>

        {/* Color Circles */}
        {hasColors && (
          <div>
            <div className="flex flex-wrap gap-1.5">
              {product.colors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(isSelected ? null : color);
                      setSelectedCar(null);
                    }}
                    title={color}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-indigo-600 dark:border-indigo-400 scale-110 ring-2 ring-indigo-200 dark:ring-indigo-800"
                        : "border-gray-300 dark:border-gray-600 hover:scale-105"
                    }`}
                    style={{ backgroundColor: getColorHex(color) }}
                  />
                );
              })}
            </div>
            {selectedColor && (
              <p className="text-[10px] text-gray-500 mt-0.5">
                {selectedColor}
              </p>
            )}
          </div>
        )}

        {/* Car Buttons — show when color selected (if has both) */}
        {hasCars && (
          <div className="flex flex-wrap gap-1">
            {product.compatibleCars.map((car) => {
              const isSelected = selectedCar === car;
              const disabled = hasColors && !selectedColor;
              return (
                <button
                  key={car}
                  onClick={() => setSelectedCar(isSelected ? null : car)}
                  disabled={disabled}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : disabled
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {car}
                </button>
              );
            })}
          </div>
        )}

        {/* View Product link */}
        <Link
          href={productLink}
          className="block text-center text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 pt-1"
        >
          {isRTL ? "مشاهده محصول" : "View Product"} →
        </Link>
      </div>
    </div>
  );
}
