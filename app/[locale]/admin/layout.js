import { checkAdmin } from "@/lib/adminCheck";
import Link from "next/link";

export default async function AdminLayout({ children, params }) {
  const { locale } = await params;
  const { authorized } = await checkAdmin();
  const isRTL = locale === "fa";

  if (!authorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {isRTL ? "دسترسی غیرمجاز" : "Access Denied"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {isRTL
            ? "شما مجوز دسترسی به این بخش را ندارید."
            : "You do not have permission to access this area."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Admin navbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link
            href={`/${locale}/admin`}
            className="font-bold text-indigo-600 dark:text-indigo-400"
          >
            {isRTL ? "مدیریت" : "Admin"}
          </Link>
          <Link
            href={`/${locale}/admin/products`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isRTL ? "محصولات" : "Products"}
          </Link>
          <Link
            href={`/${locale}/admin/items`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isRTL ? "موجودی" : "Items"}
          </Link>

          <Link
            href={`/${locale}/admin/categories`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isRTL ? "دسته‌بندی‌ها" : "Categories"}
          </Link>
          <Link
            href={`/${locale}/admin/orders`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isRTL ? "سفارشات" : "Orders"}
          </Link>
          <Link
            href={`/${locale}/admin/users`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isRTL ? "کاربران" : "Users"}
          </Link>
          <Link
            href={`/${locale}/admin/reviews`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isRTL ? "نظرات" : "Reviews"}
          </Link>

          <Link
            href={`/${locale}/admin/team`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isRTL ? "اعضای تیم" : "Team"}
          </Link>
          <Link
            href={`/${locale}/admin/content`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isRTL ? "محتوای سایت" : "Content"}
          </Link>
          <Link
            href={`/${locale}/admin/locations`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isRTL ? "موقعیت‌ها" : "Locations"}
          </Link>
          <Link
            href={`/${locale}/admin/tickets`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isRTL ? "تیکت‌ها" : "Tickets"}
          </Link>

          <div className="flex-1" />
          <Link
            href={`/${locale}`}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700"
          >
            {isRTL ? "→ بازگشت به سایت" : "← Back to Site"}
          </Link>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
