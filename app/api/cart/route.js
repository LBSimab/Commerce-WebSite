/**
 * Cart API
 *
 * GET    — Get the current user's cart with variant details
 * POST   — Sync cart (merge/replace items for logged-in user)
 * DELETE — Clear cart
 */

import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Cart from "@/models/Cart";

// GET — Get user's cart with populated product and variant data
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

    let cart = await Cart.findOne({ user: user._id })
      .populate("items.product", "name nameFa price discountPrice mainImage")
      .lean();

    if (!cart) {
      return Response.json({ success: true, data: { items: [] } });
    }

    // Fetch stock for each item from default warehouse
    const defaultWarehouseId = process.env.DEFAULT_WAREHOUSE_ID;
    if (defaultWarehouseId && cart.items.length > 0) {
      const Item = (await import("@/models/Item")).default;

      for (const cartItem of cart.items) {
        const item = await Item.findById(cartItem.itemId).lean();
        if (item) {
          cartItem.stockAvailable = Math.max(
            0,
            item.quantity - (item.reservedQuantity || 0),
          );
        } else {
          cartItem.stockAvailable = 0;
        }
      }
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

// POST — Sync cart
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
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return Response.json(
        { success: false, message: "Items array is required" },
        { status: 400 },
      );
    }

    // Transform items for cart storage
    const cartItems = items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      color: item.color || null,
      compatibleCar: item.compatibleCar || null,
      itemId: item.itemId || null,
    }));

    const cart = await Cart.findOneAndUpdate(
      { user: user._id },
      { items: cartItems },
      { new: true, upsert: true, runValidators: true },
    );

    return Response.json({ success: true, data: cart });
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

    return Response.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
