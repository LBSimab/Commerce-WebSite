import { getTranslations } from "next-intl/server";
import Link from "next/link";

import WhySahandCover from "@/components/WhySahandCover";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductCarousel from "@/components/ProductCarousel";

// Replace <ProductSlider ... /> with:

export default async function HomePage({ params }) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const isRTL = locale === "fa";

  // Fetch top products for slider
  await dbConnect();
  const topProducts = await Product.find({ isActive: true })
    .populate("category", "name nameFa image")
    .sort({ createdAt: -1 })
    .limit(9)
    .lean();

  return (
    <div>
      {/* 1. PRODUCT SLIDER — Full width, big */}
      <ProductCarousel
        products={JSON.parse(JSON.stringify(topProducts))}
        locale={locale}
      />

      {/* 2. HERO — Smaller, tighter */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-950">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-base md:text-lg text-indigo-100 max-w-xl mx-auto mb-8">
            {t("heroDescription")}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              {t("shopNow")}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center px-6 py-3 rounded-xl border-2 border-white/30 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/50 transition-all"
            >
              {t("learnMore")}
            </Link>
          </div>
        </div>
      </div>

      {/* 3. SHOP BY CATEGORY */}
      <div className="bg-gray-50 dark:bg-gray-950 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 text-center mb-10">
            {t("featuredCategories")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { key: "seatCovers", icon: "🚗", slug: "seat-covers" },
              { key: "steeringWheels", icon: "🎯", slug: "steering-wheels" },
              { key: "floorMats", icon: "🧹", slug: "floor-mats" },
            ].map(({ key, icon, slug }) => (
              <Link
                key={key}
                href={`/${locale}/products?category=${slug}`}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  {t(`categories.${key}`)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {t(`categories.${key}Desc`)}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                  {isRTL ? "مشاهده محصولات" : "View Products"} →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 4. WHY SAHANDCOVER */}
      <WhySahandCover locale={locale} />
    </div>
  );
}
