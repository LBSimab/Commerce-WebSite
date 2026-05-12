import Button from "@/components/ui/Button";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-50 mb-6">
          {t("title")}
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          {t("heroDescription")}
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" size="lg">
            {t("shopNow")}
          </Button>
          <Button variant="outline" size="lg">
            {t("learnMore")}
          </Button>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 text-center mb-12">
          {t("featuredCategories")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { key: "seatCovers", icon: "🚗" },
            { key: "steeringWheels", icon: "🎯" },
            { key: "floorMats", icon: "🧹" },
          ].map(({ key, icon }) => (
            <div
              key={key}
              className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Category icon */}
              <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-5xl">
                {icon}
              </div>
              {/* Category name */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {t(`categories.${key}`)}
              </h3>
              {/* Category description */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t(`categories.${key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
