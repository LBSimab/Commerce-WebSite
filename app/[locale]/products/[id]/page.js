/**
 * Product Detail Page (Server Component)
 *
 * Fetches a single product by ID from the API and displays:
 * - Product images, name, description, price
 * - Color variant selector (if product has colors)
 * - Car model selector (if product has compatible cars)
 * - Stock info for selected variant
 * - Customer reviews with verified purchase badge
 * - Review submission form
 *
 * Variant selection and Add to Cart are handled by a client component.
 */

import { getTranslations } from "next-intl/server";
import ReviewForm from "@/components/ReviewForm";
import ProductVariantClient from "./ProductVariantClient";

export default async function ProductDetailPage({ params }) {
  const { locale, id } = await params;
  const t = await getTranslations("products");

  // Fetch product data from our API on the server
  const apiUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/products/${id}`;

  let product = null;
  let error = null;

  try {
    const res = await fetch(apiUrl, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Product not found");
    }

    const data = await res.json();
    product = data.data;
  } catch (err) {
    error = err.message;
  }

  // Error state — product not found or API error
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {locale === "fa" ? "محصول یافت نشد" : "Product Not Found"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {error ||
            (locale === "fa"
              ? "این محصول وجود ندارد."
              : "The product you are looking for does not exist.")}
        </p>
      </div>
    );
  }

  // Choose locale-aware fields
  const productName =
    locale === "fa" && product.nameFa ? product.nameFa : product.name;
  const productDescription =
    locale === "fa" && product.descriptionFa
      ? product.descriptionFa
      : product.description;
  const categoryName =
    locale === "fa" && product.category?.nameFa
      ? product.category.nameFa
      : product.category?.name;

  const formattedPrice = product.price?.toLocaleString();
  const formattedDiscount = product.discountPrice?.toLocaleString();

  const inStock = product.stock?.inStock;

  // Build breadcrumb items
  const breadcrumbHome = locale === "fa" ? "خانه" : "Home";
  const breadcrumbProducts = locale === "fa" ? "محصولات" : "Products";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb navigation */}
      <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <a
          href={`/${locale}`}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {breadcrumbHome}
        </a>
        <span className="mx-2">/</span>
        <a
          href={`/${locale}/products`}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {breadcrumbProducts}
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-50">{productName}</span>
      </div>

      {/* Product main section — two columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left column — Product image */}
        <div>
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
            {product.mainImage ? (
              <img
                src={product.mainImage}
                alt={productName}
                className="w-full h-full object-cover"
              />
            ) : product.category?.image ? (
              <img
                src={product.category.image}
                alt={categoryName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-7xl">📦</span>
            )}
          </div>

          {/* Additional images — shown as thumbnails if available */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${productName} ${i + 1}`}
                  className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700 flex-shrink-0"
                />
              ))}
            </div>
          )}
        </div>

        {/* Right column — Product info and variant selection */}
        <div>
          {/* Category badge */}
          {categoryName && (
            <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
              {categoryName}
            </span>
          )}

          {/* Product name */}
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-50">
            {productName}
          </h1>

          {/* Rating summary */}
          {product.rating && product.rating.count > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= Math.round(product.rating.average) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {product.rating.average} ({product.rating.count}{" "}
                {locale === "fa" ? "نظر" : "reviews"})
              </span>
            </div>
          )}

          {/* Price section */}
          <div className="mt-6">
            {product.discountPrice ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formattedDiscount} T
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {formattedPrice} T
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                {formattedPrice} T
              </span>
            )}
          </div>

          {/* Global stock status — shown when no variants selected yet */}
          {(!product.availableColors ||
            product.availableColors.length === 0) && (
            <div className="mt-4">
              {inStock ? (
                <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                  {locale === "fa"
                    ? `${product.stock?.totalAvailable || 0} عدد در انبار`
                    : `${product.stock?.totalAvailable || 0} in stock`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                  <span className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full"></span>
                  {locale === "fa" ? "ناموجود" : "Out of stock"}
                </span>
              )}
            </div>
          )}

          {/* Variant selection + Add to Cart — client component */}
          <div className="mt-6">
            <ProductVariantClient product={product} locale={locale} />
          </div>

          {/* Description */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
              {locale === "fa" ? "توضیحات" : "Description"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {productDescription}
            </p>
          </div>

          {/* Product details list */}
          <div className="mt-6 space-y-2 text-sm">
            {product.material && (
              <div className="flex gap-2">
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  {locale === "fa" ? "جنس:" : "Material:"}
                </span>
                <span className="text-gray-900 dark:text-gray-50">
                  {product.material}
                </span>
              </div>
            )}

            {/* Show colors as tags if no variant selector needed */}
            {product.colors &&
              product.colors.length > 0 &&
              (!product.availableColors ||
                product.availableColors.length === 0) && (
                <div className="flex gap-2">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {locale === "fa" ? "رنگ‌ها:" : "Colors:"}
                  </span>
                  <span className="text-gray-900 dark:text-gray-50">
                    {product.colors.join(", ")}
                  </span>
                </div>
              )}

            {/* Show compatible cars as tags if no variant selector needed */}
            {product.compatibleCars &&
              product.compatibleCars.length > 0 &&
              (!product.availableColors ||
                product.availableColors.length === 0) && (
                <div className="flex gap-2">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {locale === "fa" ? "مناسب برای:" : "Compatible with:"}
                  </span>
                  <span className="text-gray-900 dark:text-gray-50">
                    {product.compatibleCars.join(", ")}
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Reviews section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-8">
            {locale === "fa" ? "نظرات کاربران" : "Customer Reviews"}
          </h2>

          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div
                key={review._id}
                className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-900"
              >
                {/* Reviewer header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      {review.reviewerName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-50">
                        {review.reviewerName}
                      </span>
                      {/* Verified Purchase Badge */}
                      {review.isVerifiedPurchase === true && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                          ✓{" "}
                          {locale === "fa"
                            ? "خریدار محصول"
                            : "Verified Purchase"}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString(
                      locale === "fa" ? "fa-IR" : "en-US",
                    )}
                  </span>
                </div>

                {/* Star rating */}
                <div className="flex text-yellow-400 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>{star <= review.rating ? "★" : "☆"}</span>
                  ))}
                </div>

                {/* Review title */}
                {review.title && (
                  <h4 className="font-medium text-gray-900 dark:text-gray-50 mb-1">
                    {review.title}
                  </h4>
                )}

                {/* Review comment */}
                <p className="text-gray-600 dark:text-gray-300">
                  {review.comment}
                </p>

                {/* Pros and Cons — if available */}
                {(review.pros?.length > 0 || review.cons?.length > 0) && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {review.pros && review.pros.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {locale === "fa" ? "مزایا" : "Pros"} ✓
                        </span>
                        <ul className="mt-1 space-y-1">
                          {review.pros.map((pro, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-300"
                            >
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons && review.cons.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          {locale === "fa" ? "معایب" : "Cons"} ✗
                        </span>
                        <ul className="mt-1 space-y-1">
                          {review.cons.map((con, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-300"
                            >
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty reviews state */}
      {(!product.reviews || product.reviews.length === 0) && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-8">
            {locale === "fa" ? "نظرات کاربران" : "Customer Reviews"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {locale === "fa"
              ? "هنوز نظری برای این محصول ثبت نشده است. اولین نفر باشید!"
              : "No reviews yet. Be the first to review this product!"}
          </p>
        </div>
      )}

      {/* Review submission form */}
      <div className="mt-8">
        <ReviewForm productId={id} locale={locale} />
      </div>
    </div>
  );
}
