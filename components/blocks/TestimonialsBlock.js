export default function TestimonialsBlock({ reviews, locale, data }) {
  const isRTL = locale === "fa";
  const title =
    isRTL && data.titleFa
      ? data.titleFa
      : data.titleEn || (isRTL ? "نظرات مشتریان" : "Customer Reviews");
  const count = data.count || 5;
  const displayReviews = reviews.slice(0, count);

  if (!displayReviews || displayReviews.length === 0) return null;

  return (
    <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-12 text-center">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {review.reviewerName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm">
                    {review.reviewerName}
                  </p>
                  <div className="flex text-yellow-400 text-xs">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s}>{s <= review.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">
                {review.comment}
              </p>
              {review.isVerifiedPurchase && (
                <span className="inline-block mt-3 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  ✓ {isRTL ? "خریدار" : "Verified"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
