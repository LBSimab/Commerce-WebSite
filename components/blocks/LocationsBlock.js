export default function LocationsBlock({ locations, locale }) {
  const isRTL = locale === "fa";
  if (!locations || locations.length === 0) return null;

  const getTypeLabel = (t) => {
    const map = {
      store: isRTL ? "فروشگاه" : "Store",
      office: isRTL ? "دفتر" : "Office",
      warehouse: isRTL ? "انبار" : "Warehouse",
    };
    return map[t] || t;
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-12 text-center">
          {isRTL ? "موقعیت‌های ما" : "Our Locations"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {locations.map((loc) => (
            <div
              key={loc._id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {loc.type === "store"
                    ? "🏪"
                    : loc.type === "office"
                      ? "🏢"
                      : "🏭"}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-50">
                      {isRTL && loc.nameFa ? loc.nameFa : loc.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {getTypeLabel(loc.type)}
                    </span>
                  </div>
                  {loc.addressFa && isRTL ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {loc.addressFa}
                    </p>
                  ) : loc.address ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {loc.address}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {loc.phone && (
                      <span className="text-gray-600 dark:text-gray-300">
                        📞 {loc.phone}
                      </span>
                    )}
                    {loc.workingHoursFa && isRTL ? (
                      <span className="text-gray-600 dark:text-gray-300">
                        🕐 {loc.workingHoursFa}
                      </span>
                    ) : loc.workingHours ? (
                      <span className="text-gray-600 dark:text-gray-300">
                        🕐 {loc.workingHours}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
