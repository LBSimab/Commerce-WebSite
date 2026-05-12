/**
 * Orders API
 *
 * GET  — Get current user's orders
 * POST — Place a new order (checkout)
 */

import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Inventory from "@/models/Inventory";
import Product from "@/models/Product";

// GET — Get user's order history
export async function GET() {
  try {
    await dbConnect();

    const user = await getCurrentUser();
    if (!user) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST — Place an order (checkout)
export async function POST(request) {
  try {
    await dbConnect();

    const user = await getCurrentUser();
    if (!user) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { shippingAddress, notes } = body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.province ||
      !shippingAddress.city ||
      !shippingAddress.address
    ) {
      return Response.json(
        { success: false, message: "Shipping address is incomplete" },
        { status: 400 },
      );
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: user._id }).populate(
      "items.product",
    );
    if (!cart || cart.items.length === 0) {
      return Response.json(
        { success: false, message: "Cart is empty" },
        { status: 400 },
      );
    }

    const defaultWarehouseId = process.env.DEFAULT_WAREHOUSE_ID;
    if (!defaultWarehouseId) {
      return Response.json(
        { success: false, message: "Default warehouse not configured" },
        { status: 500 },
      );
    }

    // Validate stock and deduct inventory for each item
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      // Check stock
      const inventory = await Inventory.findOne({
        product: product._id,
        warehouse: defaultWarehouseId,
      });

      const available = inventory
        ? inventory.quantity - (inventory.reservedQuantity || 0)
        : 0;

      if (available < cartItem.quantity) {
        return Response.json(
          {
            success: false,
            message: `Insufficient stock for "${product.name}". Only ${available} available.`,
          },
          { status: 400 },
        );
      }

      // Deduct stock
      inventory.reservedQuantity =
        (inventory.reservedQuantity || 0) + cartItem.quantity;
      await inventory.save();

      // Build order item
      orderItems.push({
        product: product._id,
        name: product.name,
        price: cartItem.price,
        quantity: cartItem.quantity,
      });

      subtotal += cartItem.price * cartItem.quantity;
    }

    // Create order
    const order = await Order.create({
      user: user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost: 0,
      total: subtotal,
      notes: notes || "",
    });

    // Clear user's cart after order is placed
    await Cart.findOneAndDelete({ user: user._id });

    return Response.json(
      {
        success: true,
        message: "Order placed successfully",
        data: order,
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
