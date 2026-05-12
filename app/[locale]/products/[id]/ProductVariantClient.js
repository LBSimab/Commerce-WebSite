"use client";

/**
 * ProductVariantClient Component
 *
 * Handles variant selection (color + car model) and Add to Cart.
 * This is a client component because it needs user interaction state.
 *
 * Props:
 * - product: Product object from API (with availableColors, availableCars, variants)
 * - locale: Current locale string
 */

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";

export default function ProductVariantClient({ product, locale }) {
  const isRTL = locale === "fa";

  // Cart store actions
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  // Selected variant state
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Determine if product has variants that need selection
  const hasColors =
    product.availableColors && product.availableColors.length > 0;
  const hasCars = product.availableCars && product.availableCars.length > 0;

  // If no colors and no cars, use default variant (no selection needed)
  // Find the matching variant based on selections
  const selectedVariant = product.variants?.find((v) => {
    if (hasColors && hasCars) {
      return v.color === selectedColor && v.compatibleCar === selectedCar;
    }
    if (hasColors) {
      return v.color === selectedColor;
    }
    if (hasCars) {
      return v.compatibleCar === selectedCar;
    }
    return true; // No variants — return the only item
  });

  const stockAvailable = selectedVariant?.available || 0;
  const inStock = stockAvailable > 0;
  const variantSelected =
    (!hasColors || selectedColor) && (!hasCars || selectedCar);

  // Check if this exact variant is already in cart
  const cartItem = selectedVariant
    ? items.find(
        (item) =>
          item.productId === product._id &&
          item.color === (selectedColor || null) &&
          item.compatibleCar === (selectedCar || null),
      )
    : null;

  const isInCart = !!cartItem;

  // Handle adding to cart
  const handleAddToCart = () => {
    if (!selectedVariant || !variantSelected) return;

    addItem(
      {
        _id: product._id,
        name: product.name,
        nameFa: product.nameFa,
        price: product.discountPrice || product.price,
        mainImage: product.mainImage,
        color: selectedColor,
        compatibleCar: selectedCar,
        stock: { available: selectedVariant.available },
        itemId: selectedVariant.itemId,
      },
      quantity,
    );
  };

  // Build variant label for display
  const getVariantLabel = () => {
    const parts = [];
    if (selectedColor) {
      parts.push(selectedColor);
    }
    if (selectedCar) {
      parts.push(selectedCar);
    }
    return parts.length > 0 ? parts.join(" / ") : null;
  };

  return (
    <div className="space-y-4">
      {/* Color Selector */}
      {hasColors && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isRTL ? "رنگ" : "Color"}:{" "}
            {selectedColor || (isRTL ? "انتخاب کنید" : "Select")}
          </label>
          <div className="flex flex-wrap gap-2">
            {product.availableColors.map((color) => {
              const isSelected = selectedColor === color;
              // Check if this color has any stock
              const hasStock = product.variants?.some(
                (v) => v.color === color && v.available > 0,
              );

              return (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedCar(null); // Reset car when color changes
                    setQuantity(1);
                  }}
                  disabled={!hasStock}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500"
                      : hasStock
                        ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-50 hover:border-indigo-400"
                        : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed line-through"
                  }`}
                >
                  {color}
                  {!hasStock && ` (${isRTL ? "ناموجود" : "N/A"})`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Car Model Selector — only shown after color is selected (if product has both) */}
      {hasCars && (!hasColors || selectedColor) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isRTL ? "مدل خودرو" : "Car Model"}:{" "}
            {selectedCar || (isRTL ? "انتخاب کنید" : "Select")}
          </label>
          <div className="flex flex-wrap gap-2">
            {/* Filter cars that have stock for the selected color */}
            {product.availableCars
              .filter((car) => {
                if (!hasColors || !selectedColor) return true;
                return product.variants?.some(
                  (v) =>
                    v.color === selectedColor &&
                    v.compatibleCar === car &&
                    v.available > 0,
                );
              })
              .map((car) => {
                const isSelected = selectedCar === car;
                // Stock for this specific combination
                const variant = product.variants?.find(
                  (v) => v.color === selectedColor && v.compatibleCar === car,
                );
                const carStock = variant?.available || 0;

                return (
                  <button
                    key={car}
                    onClick={() => {
                      setSelectedCar(car);
                      setQuantity(1);
                    }}
                    disabled={carStock === 0}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500"
                        : carStock > 0
                          ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-50 hover:border-indigo-400"
                          : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed line-through"
                    }`}
                  >
                    {car}
                    {carStock === 0 && ` (${isRTL ? "ناموجود" : "N/A"})`}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Stock display for selected variant */}
      {variantSelected && selectedVariant && (
        <div className="flex items-center gap-3">
          {inStock ? (
            <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
              {isRTL
                ? `${stockAvailable} عدد در انبار`
                : `${stockAvailable} in stock`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
              <span className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full"></span>
              {isRTL ? "ناموجود" : "Out of stock"}
            </span>
          )}
          {selectedVariant.location && (
            <span className="text-xs text-gray-400">
              {isRTL ? "مکان:" : "Location:"} {selectedVariant.location}
            </span>
          )}
        </div>
      )}

      {/* Quantity selector + Add to Cart */}
      {variantSelected && inStock && !isInCart && (
        <div className="flex items-center gap-3">
          {/* Quantity input */}
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setQuantity(Math.min(Math.max(1, val), stockAvailable));
              }}
              className="w-14 text-center py-2 bg-transparent text-gray-900 dark:text-gray-50 border-x border-gray-300 dark:border-gray-600"
              min={1}
              max={stockAvailable}
            />
            <button
              onClick={() =>
                setQuantity(Math.min(quantity + 1, stockAvailable))
              }
              className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              +
            </button>
          </div>

          {/* Add to Cart button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
            className="flex-1"
          >
            {isRTL ? "افزودن به سبد خرید" : "Add to Cart"}
            {getVariantLabel() && (
              <span className="ml-1 opacity-80 text-sm">
                ({getVariantLabel()})
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Already in cart state */}
      {isInCart && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Quantity controls for item in cart */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => {
                  if (cartItem.quantity <= 1) {
                    useCartStore.getState().removeItem(cartItem.productId);
                  } else {
                    useCartStore
                      .getState()
                      .updateQuantity(
                        cartItem.productId,
                        cartItem.quantity - 1,
                      );
                  }
                }}
                className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                −
              </button>
              <span className="w-14 text-center py-2 text-gray-900 dark:text-gray-50 border-x border-gray-300 dark:border-gray-600 text-sm">
                {cartItem.quantity}
              </span>
              <button
                onClick={() =>
                  useCartStore
                    .getState()
                    .updateQuantity(cartItem.productId, cartItem.quantity + 1)
                }
                disabled={cartItem.quantity >= stockAvailable}
                className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                +
              </button>
            </div>
            <Button variant="secondary" size="lg" disabled className="flex-1">
              ✓ {isRTL ? "در سبد خرید" : "In Cart"}
            </Button>
          </div>
          <button
            onClick={() =>
              useCartStore.getState().removeItem(cartItem.productId)
            }
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700"
          >
            {isRTL ? "حذف از سبد خرید" : "Remove from cart"}
          </button>
        </div>
      )}

      {/* Not all options selected yet */}
      {!variantSelected && (
        <Button variant="primary" size="lg" disabled className="w-full">
          {isRTL ? "لطفاً گزینه‌ها را انتخاب کنید" : "Please select options"}
        </Button>
      )}
    </div>
  );
}
