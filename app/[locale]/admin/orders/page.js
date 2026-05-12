import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import OrdersClient from "./OrdersClient";

export default async function AdminOrdersPage({ params }) {
  const { locale } = await params;

  await dbConnect();

  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  // Deep serialize everything — convert Buffers and ObjectIds to strings
  const serializedOrders = JSON.parse(JSON.stringify(orders));

  return <OrdersClient initialOrders={serializedOrders} locale={locale} />;
}
