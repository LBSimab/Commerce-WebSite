"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useThemeStore } from "@/store/theme";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useTranslations } from "next-intl";
import MobileDrawer from "./MobileDrawer";
import UserMenu from "./UserMenu";

export default function Navbar({ locale }) {
  const pathname = usePathname();
  const t = useTranslations("home");

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  const pathWithoutLocale = pathname.replace(/^\/(en|fa)/, "") || "/";

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo + Desktop nav links */}
        <div className="flex items-center gap-8">
          <Link
            href={`/${locale}`}
            className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex-shrink-0"
          >
            {t("title")}
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href={`/${locale}/products`}
              className={`text-sm font-medium transition-colors ${
                pathname.includes("/products")
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              {locale === "fa" ? "محصولات" : "Products"}
            </Link>
            <Link
              href={`/${locale}/about`}
              className={`text-sm font-medium transition-colors ${
                pathname.includes("/about")
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              {locale === "fa" ? "درباره ما" : "About"}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className={`text-sm font-medium transition-colors ${
                pathname.includes("/contact")
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              {locale === "fa" ? "تماس با ما" : "Contact"}
            </Link>
          </div>
        </div>

        {/* Right: Language, Theme, Cart, User, Mobile drawer */}
        <div className="flex items-center gap-2">
          {/* Language switcher — Desktop only, pill button */}
          <Link
            href={`/${locale === "en" ? "fa" : "en"}${pathWithoutLocale}`}
            className="hidden md:inline-flex text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {locale === "en" ? "فارسی" : "English"}
          </Link>

          {/* Theme toggle — Desktop only, pill button */}
          <button
            onClick={toggleTheme}
            className="hidden md:inline-flex text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Cart icon */}
          <Link
            href={`/${locale}/cart`}
            className="relative p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {/* User menu */}
          <UserMenu locale={locale} />

          {/* Admin button */}
          <AdminButton locale={locale} />

          {/* Mobile drawer */}
          <MobileDrawer locale={locale} />
        </div>
      </div>
    </nav>
  );
}

function AdminButton({ locale }) {
  const user = useAuthStore((state) => state.user);
  if (!user || user.role !== "admin") return null;

  return (
    <Link
      href={`/${locale}/admin`}
      className="hidden md:inline-flex text-sm px-3 py-2 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
    >
      {locale === "fa" ? "مدیریت" : "Admin"}
    </Link>
  );
}
