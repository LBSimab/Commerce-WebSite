import Link from "next/link";

export default function HeroBlock({ data, locale }) {
  const isRTL = locale === "fa";
  const title = isRTL && data.titleFa ? data.titleFa : data.titleEn;
  const subtitle = isRTL && data.subtitleFa ? data.subtitleFa : data.subtitleEn;
  const btnText =
    isRTL && data.buttonTextFa ? data.buttonTextFa : data.buttonTextEn;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-950">
      <div className="absolute inset-0 bg-black/20" />
      {data.image && (
        <img
          src={data.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            {subtitle}
          </p>
        )}
        {btnText && data.buttonLink && (
          <Link
            href={data.buttonLink}
            className="inline-flex items-center px-8 py-4 rounded-xl bg-white text-indigo-700 font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            {btnText}
          </Link>
        )}
      </div>
    </section>
  );
}
