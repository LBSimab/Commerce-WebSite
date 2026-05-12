/**
 * WhySahandCover Component
 *
 * Feature grid showing why customers choose SahandCover.
 * 3 columns with icons, titles, and descriptions.
 */

export default function WhySahandCover({ locale }) {
  const isRTL = locale === "fa";

  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      titleEn: "Premium Quality",
      titleFa: "کیفیت عالی",
      descEn:
        "Genuine leather and high-grade materials for lasting durability and comfort.",
      descFa: "چرم طبیعی و مواد درجه یک برای دوام و راحتی طولانی مدت.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      titleEn: "Fast Delivery",
      titleFa: "ارسال سریع",
      descEn: "Orders delivered within 3-5 business days across Iran.",
      descFa: "سفارشات ظرف ۳ تا ۵ روز کاری در سراسر ایران تحویل داده می‌شود.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      titleEn: "Best Price Guarantee",
      titleFa: "ضمانت بهترین قیمت",
      descEn:
        "Factory-direct pricing with no middlemen. Best value for your money.",
      descFa: "قیمت مستقیم از تولیدی بدون واسطه. بهترین ارزش برای پول شما.",
    },
  ];

  return (
    <section className="bg-white dark:bg-gray-900 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
            {isRTL ? "چرا سهندکاور؟" : "Why SahandCover?"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xl mx-auto">
            {isRTL
              ? "ما بهترین کیفیت را با قیمت مناسب به شما ارائه می‌دهیم"
              : "We deliver the best quality at the right price"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group text-center p-8 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 mb-5 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-2">
                {isRTL ? feature.titleFa : feature.titleEn}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {isRTL ? feature.descFa : feature.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
