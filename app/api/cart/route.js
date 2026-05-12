/**
 * Cart API
 *
 * GET    — Get the current user's cart with product details
 * POST   — Sync cart (merge/replace items for logged-in user)
 * DELETE — Clear cart
 */

import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Cart from "@/models/Cart";

// GET — Get user's cart with populated product data
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

    // Find cart and populate product details
    let cart = await Cart.findOne({ user: user._id })
      .populate(
        "items.product",
        "name nameFa price discountPrice mainImage category",
      )
      .lean();

    if (!cart) {
      // No cart yet — return empty
      return Response.json({
        success: true,
        data: { items: [] },
      });
    }

    // Fetch stock for each item from default warehouse
    const defaultWarehouseId = process.env.DEFAULT_WAREHOUSE_ID;
    if (defaultWarehouseId && cart.items.length > 0) {
      const Inventory = (await import("@/models/Inventory")).default;
      const productIds = cart.items.map(
        (item) => item.product._id || item.product,
      );

      const inventoryRecords = await Inventory.find({
        product: { $in: productIds },
        warehouse: defaultWarehouseId,
      }).lean();

      const stockMap = {};
      inventoryRecords.forEach((record) => {
        stockMap[record.product.toString()] = Math.max(
          0,
          record.quantity - (record.reservedQuantity || 0),
        );
      });

      cart.items.forEach((item) => {
        const productId = item.product._id
          ? item.product._id.toString()
          : item.product.toString();
        item.stockAvailable = stockMap[productId] || 0;
      });
    }

    return Response.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST — Sync cart (called on login or after cart changes)
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
    const { items } = body; // Array of { product, quantity, price }

    if (!items || !Array.isArray(items)) {
      return Response.json(
        { success: false, message: "Items array is required" },
        { status: 400 },
      );
    }

    // Upsert cart — create if doesn't exist, update if exists
    const cart = await Cart.findOneAndUpdate(
      { user: user._id },
      { items },
      { new: true, upsert: true, runValidators: true },
    );

    return Response.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE — Clear cart
export async function DELETE() {
  try {
    await dbConnect();

    const user = await getCurrentUser();
    if (!user) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    await Cart.findOneAndDelete({ user: user._id });

    return Response.json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
