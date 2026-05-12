/**
 * Single Order API
 *
 * GET — Get a specific order by ID (must belong to current user)
 */

import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Item from "@/models/Item";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const user = await getCurrentUser();
    if (!user) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const order = await Order.findOne({
      _id: id,
      user: user._id,
    })
      .populate("items.product", "name nameFa mainImage")
      .lean();

    if (!order) {
      return Response.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      data: JSON.parse(JSON.stringify(order)),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
