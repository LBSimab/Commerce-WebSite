/**
 * Orders API
 *
 * GET  — Get current user's orders
 * POST — Place a new order with optional discount code and payment method
 */

import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Item from "@/models/Item";

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
      data: JSON.parse(JSON.stringify(orders)),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST — Place an order with optional discount code and payment method
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
    const { shippingAddress, notes, discountCode, paymentMethod } = body;

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

    // Validate stock and deduct from each Item
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      // Find the specific Item for this variant
      const filter = {
        product: cartItem.product._id,
        warehouse: defaultWarehouseId,
      };
      if (cartItem.color) filter.color = cartItem.color;
      if (cartItem.compatibleCar) filter.compatibleCar = cartItem.compatibleCar;

      const item = await Item.findOne(filter);

      if (!item) {
        const productName = cartItem.product.name || "Unknown";
        const variant =
          [cartItem.color, cartItem.compatibleCar]
            .filter(Boolean)
            .join(" / ") || "default";
        return Response.json(
          {
            success: false,
            message: `Item not found: "${productName}" (${variant})`,
          },
          { status: 400 },
        );
      }

      const available = item.quantity - (item.reservedQuantity || 0);

      if (available < cartItem.quantity) {
        const productName = cartItem.product.name || "Unknown";
        const variant =
          [cartItem.color, cartItem.compatibleCar]
            .filter(Boolean)
            .join(" / ") || "default";
        return Response.json(
          {
            success: false,
            message: `Insufficient stock for "${productName}" (${variant}). Only ${available} available.`,
          },
          { status: 400 },
        );
      }

      // Deduct from reserved quantity
      item.reservedQuantity = (item.reservedQuantity || 0) + cartItem.quantity;
      await item.save();

      // Build order item
      orderItems.push({
        item: item._id,
        product: cartItem.product._id,
        name: cartItem.product.name,
        price: cartItem.price,
        quantity: cartItem.quantity,
        color: cartItem.color || null,
        compatibleCar: cartItem.compatibleCar || null,
      });

      subtotal += cartItem.price * cartItem.quantity;
    }

    let total = subtotal;
    let discountAmount = 0;
    let appliedCode = null;

    // Validate discount code if provided
    if (discountCode) {
      const DiscountCode = (await import("@/models/DiscountCode")).default;
      const discount = await DiscountCode.findOne({
        code: discountCode.toUpperCase().trim(),
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      });

      if (!discount) {
        return Response.json(
          { success: false, message: "Invalid or expired discount code" },
          { status: 400 },
        );
      }

      if (discount.maxUses && discount.usedCount >= discount.maxUses) {
        return Response.json(
          { success: false, message: "Discount code has reached maximum uses" },
          { status: 400 },
        );
      }

      if (subtotal < discount.minOrderAmount) {
        return Response.json(
          {
            success: false,
            message: `Minimum order amount for this code is ${discount.minOrderAmount.toLocaleString()} T`,
          },
          { status: 400 },
        );
      }

      // Calculate discount
      if (discount.type === "percentage") {
        discountAmount = Math.round((subtotal * discount.value) / 100);
      } else {
        discountAmount = Math.min(discount.value, subtotal);
      }

      total = subtotal - discountAmount;
      appliedCode = discount.code;

      // Increment usage count
      discount.usedCount = (discount.usedCount || 0) + 1;
      await discount.save();
    }

    // Create the order
    const order = await Order.create({
      user: user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      discountCode: appliedCode,
      discountAmount,
      total,
      paymentMethod: paymentMethod || null,
      paymentStatus: "pending",
      notes: notes || "",
    });

    // Clear user's cart after successful order
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
