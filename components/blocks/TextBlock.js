export default function TextBlock({ data, locale }) {
  const isRTL = locale === "fa";
  const title = isRTL && data.titleFa ? data.titleFa : data.titleEn;
  const body = isRTL && data.bodyFa ? data.bodyFa : data.bodyEn;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {title && (
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6 text-center">
          {title}
        </h2>
      )}
      {body && (
        <div className="prose prose-lg dark:prose-invert mx-auto text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-center">
          {body}
        </div>
      )}
    </section>
  );
}
