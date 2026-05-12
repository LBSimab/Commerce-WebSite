import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";

export default async function AdminDashboard({ params }) {
  const { locale } = await params;
  const isRTL = locale === "fa";

  await dbConnect();

  const [productCount, orderCount, userCount, orders] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  // Calculate total revenue
  const revenue = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;

  const stats = [
    { label: isRTL ? "محصولات" : "Products", value: productCount, icon: "📦" },
    { label: isRTL ? "سفارشات" : "Orders", value: orderCount, icon: "📋" },
    { label: isRTL ? "کاربران" : "Users", value: userCount, icon: "👥" },
    {
      label: isRTL ? "درآمد" : "Revenue",
      value: `${totalRevenue.toLocaleString()} T`,
      icon: "💰",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">
        {isRTL ? "داشبورد" : "Dashboard"}
      </h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {stat.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
          {isRTL ? "سفارشات اخیر" : "Recent Orders"}
        </h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isRTL ? "هنوز سفارشی ثبت نشده." : "No orders yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">
                    {isRTL ? "شماره سفارش" : "Order ID"}
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">
                    {isRTL ? "مشتری" : "Customer"}
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">
                    {isRTL ? "مبلغ" : "Amount"}
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">
                    {isRTL ? "وضعیت" : "Status"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-50 font-mono">
                      #{order._id.toString().slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-50">
                      {order.shippingAddress?.fullName || "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-50">
                      {order.total.toLocaleString()} T
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
