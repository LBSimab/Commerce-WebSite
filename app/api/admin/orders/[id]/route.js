/**
 * Admin Order API
 *
 * PUT — Update order status (admin only)
 */

import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Order from "@/models/Order";

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return Response.json(
        { success: false, message: "Invalid status" },
        { status: 400 },
      );
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return Response.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // If cancelled, restore inventory
    if (status === "cancelled" && order.status !== "cancelled") {
      const defaultWarehouseId = process.env.DEFAULT_WAREHOUSE_ID;
      if (defaultWarehouseId) {
        const Inventory = (await import("@/models/Inventory")).default;
        for (const item of order.items) {
          await Inventory.findOneAndUpdate(
            { product: item.product, warehouse: defaultWarehouseId },
            { $inc: { reservedQuantity: -item.quantity } },
          );
        }
      }
    }

    // If shipping from pending/confirmed, keep reserved counts
    // Final delivered — reduce actual quantity
    if (status === "delivered" && order.status !== "delivered") {
      const defaultWarehouseId = process.env.DEFAULT_WAREHOUSE_ID;
      if (defaultWarehouseId) {
        const Inventory = (await import("@/models/Inventory")).default;
        for (const item of order.items) {
          await Inventory.findOneAndUpdate(
            { product: item.product, warehouse: defaultWarehouseId },
            {
              $inc: {
                quantity: -item.quantity,
                reservedQuantity: -item.quantity,
              },
            },
          );
        }
      }
    }

    return Response.json({ success: true, data: order });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
