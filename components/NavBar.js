"use client";
import UserMenu from "./UserMenu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useThemeStore } from "@/store/theme";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
export default function Navbar({ locale }) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const pathname = usePathname();
  const t = useTranslations("home");

  const pathWithoutLocale = pathname.replace(/^\/(en|fa)/, "") || "/";

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          {t("title")}
        </Link>

        {/* // Navigation Links - between Logo and controls */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href={`/${locale}/products`}
            className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {locale === "fa" ? "محصولات" : "Products"}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {locale === "fa" ? "درباره ما" : "About"}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {locale === "fa" ? "تماس با ما" : "Contact"}
          </Link>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <Link
            href={`/${locale === "en" ? "fa" : "en"}${pathWithoutLocale}`}
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {locale === "en" ? "فارسی" : "English"}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Cart icon */}
          <Link
            href={`/${locale}/cart`}
            className="relative text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            🛒
            {/* Cart count badge */}
            <CartCount />
          </Link>
          <UserMenu locale={locale} />
          <AdminButton locale={locale} />
        </div>
      </div>
    </nav>
  );
  // Cart badge showing item count
  function CartCount() {
    // Subscribe to items array directly so it updates on every change
    const totalItems = useCartStore((state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
    );

    if (totalItems === 0) return null;

    return (
      <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
        {totalItems > 9 ? "9+" : totalItems}
      </span>
    );
  }
}
// Admin dashboard button — only visible to admins
function AdminButton({ locale }) {
  const user = useAuthStore((state) => state.user);

  if (!user || user.role !== "admin") return null;

  return (
    <Link
      href={`/${locale}/admin`}
      className="text-sm px-3 py-2 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
    >
      {locale === "fa" ? "مدیریت" : "Admin"}
    </Link>
  );
}
