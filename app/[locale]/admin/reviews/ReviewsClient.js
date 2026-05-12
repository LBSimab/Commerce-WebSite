"use client";

import { useState } from "react";

export default function ReviewsClient({ initialReviews, locale }) {
  const isRTL = locale === "fa";
  const [reviews, setReviews] = useState(initialReviews);
  const [message, setMessage] = useState("");

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
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setMessage(isRTL ? "نظر حذف شد" : "Review deleted");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">
        {isRTL ? "نظرات" : "Reviews"}
        <span className="ml-2 text-lg text-gray-500 font-normal">
          ({reviews.length})
        </span>
      </h1>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-50">
                  {review.reviewerName}
                  {review.user && (
                    <span className="text-xs text-gray-400 ml-2">
                      ({review.user.email})
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isRTL ? "محصول: " : "Product: "}
                  {review.product
                    ? isRTL && review.product.nameFa
                      ? review.product.nameFa
                      : review.product.name
                    : "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
                {!review.isApproved && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    {isRTL ? "در انتظار" : "Pending"}
                  </span>
                )}
                {review.isApproved && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {isRTL ? "تایید شده" : "Approved"}
                  </span>
                )}
                {review.isVerifiedPurchase && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {isRTL ? "خرید واقعی" : "Verified"}
                  </span>
                )}
              </div>
            </div>

            {review.title && (
              <p className="font-medium text-gray-900 dark:text-gray-50 mb-1">
                {review.title}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {review.comment}
            </p>

            <div className="flex items-center gap-2">
              {!review.isApproved && (
                <button
                  onClick={() => handleApprove(review._id)}
                  className="text-xs px-3 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200"
                >
                  {isRTL ? "تایید" : "Approve"}
                </button>
              )}
              <button
                onClick={() => handleReject(review._id)}
                className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200"
              >
                {isRTL ? "حذف" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
