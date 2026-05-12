/**
 * Admin Order API
 *
 * PUT — Update order status (admin only)
 *       Handles inventory deductions/restoration based on status changes
 */

import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Order from "@/models/Order";
import Item from "@/models/Item";

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
    const { status: newStatus } = body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(newStatus)) {
      return Response.json(
        { success: false, message: "Invalid status" },
        { status: 400 },
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return Response.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    const oldStatus = order.status;

    // If cancelling an order that wasn't already cancelled — restore reserved stock
    if (newStatus === "cancelled" && oldStatus !== "cancelled") {
      for (const orderItem of order.items) {
        await Item.findByIdAndUpdate(orderItem.item, {
          $inc: { reservedQuantity: -orderItem.quantity },
        });
      }
    }

    // If delivering an order that wasn't already delivered — deduct actual quantity
    if (newStatus === "delivered" && oldStatus !== "delivered") {
      for (const orderItem of order.items) {
        await Item.findByIdAndUpdate(orderItem.item, {
          $inc: {
            quantity: -orderItem.quantity,
            reservedQuantity: -orderItem.quantity,
          },
        });
      }
    }

    // If moving from cancelled back to another status — re-reserve
    if (oldStatus === "cancelled" && newStatus !== "cancelled") {
      for (const orderItem of order.items) {
        await Item.findByIdAndUpdate(orderItem.item, {
          $inc: { reservedQuantity: orderItem.quantity },
        });
      }
    }

    order.status = newStatus;
    await order.save();

    return Response.json({ success: true, data: order });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
