import Link from "next/link";

export default function CTABlock({ data, locale }) {
  const isRTL = locale === "fa";
  const title = isRTL && data.titleFa ? data.titleFa : data.titleEn;
  const subtitle = isRTL && data.subtitleFa ? data.subtitleFa : data.subtitleEn;
  const btnText =
    isRTL && data.buttonTextFa ? data.buttonTextFa : data.buttonTextEn;

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-950 dark:to-purple-950 py-16">
      {data.image && (
        <img
          src={data.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      )}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {title}
        </h2>
        {subtitle && <p className="text-indigo-100 text-lg mb-8">{subtitle}</p>}
        {btnText && data.buttonLink && (
          <Link
            href={data.buttonLink}
            className="inline-flex px-8 py-4 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-gray-100 transition-all shadow-lg"
          >
            {btnText}
          </Link>
        )}
      </div>
    </section>
  );
}
