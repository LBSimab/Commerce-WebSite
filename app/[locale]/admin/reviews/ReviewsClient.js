"use client";

import { useState } from "react";

export default function ReviewsClient({ initialReviews, locale }) {
  const isRTL = locale === "fa";
  const [reviews, setReviews] = useState(initialReviews);
  const [message, setMessage] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRating, setFilterRating] = useState("all");

  const handleApprove = async (reviewId) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, isApproved: true } : r)),
      );
      setMessage(isRTL ? "نظر تایید شد" : "Review approved");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleReject = async (reviewId) => {
    if (!confirm(isRTL ? "حذف این نظر؟" : "Delete this review?")) return;
    try {
      await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setMessage(isRTL ? "نظر حذف شد" : "Review deleted");
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    // Search
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const name = review.reviewerName?.toLowerCase() || "";
      const comment = review.comment?.toLowerCase() || "";
      const title = review.title?.toLowerCase() || "";
      const product = (
        review.product?.name ||
        review.product?.nameFa ||
        ""
      ).toLowerCase();
      if (
        !name.includes(s) &&
        !comment.includes(s) &&
        !title.includes(s) &&
        !product.includes(s)
      )
        return false;
    }

    // Status filter
    if (filterStatus === "approved" && !review.isApproved) return false;
    if (filterStatus === "pending" && review.isApproved) return false;

    // Rating filter
    if (filterRating !== "all" && review.rating !== parseInt(filterRating))
      return false;

    return true;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterRating("all");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "نظرات" : "Reviews"}
          <span className="ml-2 text-lg text-gray-500 font-normal">
            ({filteredReviews.length})
          </span>
        </h1>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${message.includes("موفق") || message.includes("approved") || message.includes("deleted") ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-red-50 dark:bg-red-900/20 text-red-600"}`}
        >
          {message}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-3 mb-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">
            {isRTL ? "جستجو" : "Search"}
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isRTL
                ? "جستجوی نام، محصول، متن..."
                : "Search name, product, text..."
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "وضعیت" : "Status"}
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          >
            <option value="all">{isRTL ? "همه" : "All"}</option>
            <option value="pending">{isRTL ? "در انتظار" : "Pending"}</option>
            <option value="approved">{isRTL ? "تایید شده" : "Approved"}</option>
          </select>
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "امتیاز" : "Rating"}
          </label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          >
            <option value="all">{isRTL ? "همه" : "All"}</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★</option>
            <option value="3">★★★</option>
            <option value="2">★★</option>
            <option value="1">★</option>
          </select>
        </div>

        {/* Clear */}
        {(searchTerm || filterStatus !== "all" || filterRating !== "all") && (
          <button
            onClick={clearFilters}
            className="text-xs text-red-500 hover:text-red-600 pb-2"
          >
            {isRTL ? "حذف فیلترها" : "Clear"}
          </button>
        )}
      </div>

      {/* Review Cards */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-gray-500">
            {isRTL ? "نظری یافت نشد" : "No reviews found"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    {review.reviewerName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-50 text-sm">
                      {review.reviewerName}
                      {review.user?.email && (
                        <span className="text-xs text-gray-400 ml-2">
                          ({review.user.email})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isRTL ? "محصول: " : "Product: "}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {review.product
                          ? isRTL && review.product.nameFa
                            ? review.product.nameFa
                            : review.product.name
                          : "—"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-amber-400 text-sm">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                  {!review.isApproved ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                      {isRTL ? "در انتظار" : "Pending"}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                      {isRTL ? "تایید شده" : "Approved"}
                    </span>
                  )}
                  {review.isVerifiedPurchase && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      {isRTL ? "خرید واقعی" : "Verified"}
                    </span>
                  )}
                </div>
              </div>

              {review.title && (
                <p className="font-medium text-gray-900 dark:text-gray-50 text-sm mb-1">
                  {review.title}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {review.comment}
              </p>

              {(review.pros?.length > 0 || review.cons?.length > 0) && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {review.pros?.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        ✓ {isRTL ? "مزایا" : "Pros"}
                      </span>
                      <ul className="mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
                        {review.pros.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {review.cons?.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-red-600 dark:text-red-400">
                        ✗ {isRTL ? "معایب" : "Cons"}
                      </span>
                      <ul className="mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
                        {review.cons.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString(
                    isRTL ? "fa-IR" : "en-US",
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {!review.isApproved && (
                    <button
                      onClick={() => handleApprove(review._id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 font-medium"
                    >
                      {isRTL ? "تایید" : "Approve"}
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(review._id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 font-medium"
                  >
                    {isRTL ? "حذف" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
