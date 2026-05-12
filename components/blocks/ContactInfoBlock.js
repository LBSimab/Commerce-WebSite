export default function ContactInfoBlock({ locations, locale }) {
  const isRTL = locale === "fa";
  if (!locations || locations.length === 0) return null;

  return (
    <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-12 text-center">
          {isRTL ? "اطلاعات تماس" : "Contact Information"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div
              key={loc._id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">
                {loc.type === "store"
                  ? "🏪"
                  : loc.type === "office"
                    ? "🏢"
                    : "🏭"}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-3">
                {isRTL && loc.nameFa ? loc.nameFa : loc.name}
              </h3>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                {loc.phone && <p>📞 {loc.phone}</p>}
                {loc.phone2 && <p>📞 {loc.phone2}</p>}
                {loc.email && <p>📧 {loc.email}</p>}
                {loc.workingHoursFa && isRTL ? (
                  <p>🕐 {loc.workingHoursFa}</p>
                ) : loc.workingHours ? (
                  <p>🕐 {loc.workingHours}</p>
                ) : null}
                {loc.addressFa && isRTL ? (
                  <p>📍 {loc.addressFa}</p>
                ) : loc.address ? (
                  <p>📍 {loc.address}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
