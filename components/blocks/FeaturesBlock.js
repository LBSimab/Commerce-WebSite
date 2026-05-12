export default function FeaturesBlock({ data, locale }) {
  const isRTL = locale === "fa";
  const title = isRTL && data.titleFa ? data.titleFa : data.titleEn;
  const items = data.items || [];

  return (
    <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-12 text-center">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => {
            const itemTitle =
              isRTL && item.titleFa ? item.titleFa : item.titleEn;
            const itemDesc = isRTL && item.descFa ? item.descFa : item.descEn;
            return (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <div className="text-5xl mb-4">{item.icon || "✨"}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                  {itemTitle}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {itemDesc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
