import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Link from "next/link";

export default async function OrderDetailPage({ params }) {
  const { locale, id } = await params;
  const isRTL = locale === "fa";

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  await dbConnect();

  const order = await Order.findOne({ _id: id, user: user._id })
    .populate("items.product", "name nameFa mainImage")
    .lean();

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {isRTL ? "سفارش یافت نشد" : "Order Not Found"}
        </h1>
        <Link
          href={`/${locale}/orders`}
          className="text-indigo-600 hover:text-indigo-700"
        >
          {isRTL ? "← بازگشت به سفارشات" : "← Back to Orders"}
        </Link>
      </div>
    );
  }

  const serialized = JSON.parse(JSON.stringify(order));

  const statusLabels = {
    pending: isRTL ? "در انتظار" : "Pending",
    confirmed: isRTL ? "تایید شده" : "Confirmed",
    processing: isRTL ? "در حال پردازش" : "Processing",
    shipped: isRTL ? "ارسال شده" : "Shipped",
    delivered: isRTL ? "تحویل داده شده" : "Delivered",
    cancelled: isRTL ? "لغو شده" : "Cancelled",
  };

  const statusColors = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    processing:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    shipped:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    delivered:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href={`/${locale}/orders`}
        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mb-4 inline-block"
      >
        {isRTL ? "← بازگشت به سفارشات" : "← Back to Orders"}
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "سفارش" : "Order"} #{serialized._id.slice(-6).toUpperCase()}
        </h1>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[serialized.status]}`}
        >
          {statusLabels[serialized.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {serialized.items.map((item, i) => {
            const itemName =
              isRTL && item.product?.nameFa ? item.product.nameFa : item.name;
            const hasVariant = item.color || item.compatibleCar;

            return (
              <div
                key={i}
                className="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                  {item.product?.mainImage ? (
                    <img
                      src={item.product.mainImage}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    "📦"
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-50">
                    {itemName}
                  </h3>
                  {/* Variant badges */}
                  {hasVariant && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.color && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                          {item.color}
                        </span>
                      )}
                      {item.compatibleCar && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          🚗 {item.compatibleCar}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-50">
                  {(item.price * item.quantity).toLocaleString()} T
                </p>
              </div>
            );
          })}
        </div>

        {/* Order info + Shipping */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">
              {isRTL ? "اطلاعات سفارش" : "Order Info"}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isRTL ? "تاریخ" : "Date"}
                </span>
                <span className="text-gray-900 dark:text-gray-50">
                  {new Date(serialized.createdAt).toLocaleDateString(
                    isRTL ? "fa-IR" : "en-US",
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isRTL ? "تعداد اقلام" : "Items"}
                </span>
                <span className="text-gray-900 dark:text-gray-50">
                  {serialized.items.length}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>{isRTL ? "مجموع" : "Total"}</span>
                <span>{serialized.total.toLocaleString()} T</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">
              {isRTL ? "آدرس ارسال" : "Shipping Address"}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium text-gray-900 dark:text-gray-50">
                {serialized.shippingAddress.fullName}
              </p>
              <p>{serialized.shippingAddress.phone}</p>
              <p>
                {serialized.shippingAddress.province}،{" "}
                {serialized.shippingAddress.city}
              </p>
              <p>{serialized.shippingAddress.address}</p>
              {serialized.shippingAddress.postalCode && (
                <p className="text-gray-400 mt-1">
                  {isRTL ? "کد پستی: " : "Postal Code: "}
                  {serialized.shippingAddress.postalCode}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
