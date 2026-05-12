"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";

export default function ReviewForm({ productId, locale, onReviewSubmitted }) {
  const isRTL = locale === "fa";
  const user = useAuthStore((state) => state.user);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Not logged in
  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {isRTL
            ? "برای ثبت نظر باید وارد حساب کاربری خود شوید."
            : "Please log in to submit a review."}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (rating === 0) {
      setError(
        isRTL ? "لطفاً امتیاز خود را انتخاب کنید" : "Please select a rating",
      );
      return;
    }

    if (comment.trim().length < 5) {
      setError(
        isRTL
          ? "متن نظر باید حداقل ۵ کاراکتر باشد"
          : "Comment must be at least 5 characters",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setMessage(
        isRTL
          ? "نظر شما ثبت شد و پس از تایید نمایش داده می‌شود."
          : "Review submitted. It will appear after approval.",
      );
      setRating(0);
      setTitle("");
      setComment("");
      setShowForm(false);

      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <Button variant="primary" onClick={() => setShowForm(true)}>
          {isRTL ? "نوشتن نظر" : "Write a Review"}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
        {isRTL ? "نظر خود را بنویسید" : "Write Your Review"}
      </h3>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isRTL ? "امتیاز شما" : "Your Rating"}
          </label>
          <div className="flex gap-1 text-3xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-colors"
              >
                <span
                  className={
                    star <= (hoverRating || rating)
                      ? "text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? "عنوان نظر (اختیاری)" : "Review Title (optional)"}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder={
              isRTL ? "خلاصه نظر شما..." : "Summary of your review..."
            }
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? "نظر شما" : "Your Review"}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            minLength={5}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder={
              isRTL
                ? "تجربه خود را با این محصول بنویسید..."
                : "Share your experience with this product..."
            }
          />
          <p className="mt-1 text-xs text-gray-400">
            {isRTL ? "حداقل ۵ کاراکتر" : "Minimum 5 characters"}
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting
              ? isRTL
                ? "در حال ثبت..."
                : "Submitting..."
              : isRTL
                ? "ثبت نظر"
                : "Submit Review"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowForm(false)}
          >
            {isRTL ? "انصراف" : "Cancel"}
          </Button>
        </div>
      </form>
    </div>
  );
}
