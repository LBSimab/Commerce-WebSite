"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useThemeStore } from "@/store/theme";

export default function MobileDrawer({ locale }) {
  const isRTL = locale === "fa";
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  // Close drawer when pathname changes
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (isOpen) setIsOpen(false);
  }

  const pathWithoutLocale = pathname.replace(/^\/(en|fa)/, "") || "/";

  const navLinks = [
    { href: `/${locale}/products`, labelEn: "Products", labelFa: "محصولات" },
    { href: `/${locale}/about`, labelEn: "About", labelFa: "درباره ما" },
    { href: `/${locale}/contact`, labelEn: "Contact", labelFa: "تماس با ما" },
  ];

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={isRTL ? "باز کردن منو" : "Open menu"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay — prevents background scroll by covering the page */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden overflow-hidden"
          onClick={() => setIsOpen(false)}
          // Prevent touch scrolling on the overlay itself
          onTouchMove={(e) => e.preventDefault()}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 z-50 h-full w-72 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto ${
          isRTL
            ? isOpen
              ? "left-0"
              : "-left-full"
            : isOpen
              ? "right-0"
              : "-right-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
            {isRTL ? "منو" : "Menu"}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {isRTL ? link.labelFa : link.labelEn}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 mx-4" />

        {/* Controls */}
        <div className="p-4 space-y-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
            <span>
              {isRTL
                ? theme === "dark"
                  ? "حالت روشن"
                  : "حالت تاریک"
                : theme === "dark"
                  ? "Light Mode"
                  : "Dark Mode"}
            </span>
          </button>

          {/* Language switcher */}
          <Link
            href={`/${locale === "en" ? "fa" : "en"}${pathWithoutLocale}`}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-lg">🌐</span>
            <span>{locale === "en" ? "فارسی" : "English"}</span>
          </Link>
        </div>

        {/* Branding at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            SahandCover
          </p>
        </div>
      </div>
    </>
  );
}
