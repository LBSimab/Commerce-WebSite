/**
 * Single Product API Route
 *
 * GET    /api/products/:id   — Get product with variants, stock, reviews
 * PUT    /api/products/:id   — Update product (admin)
 * DELETE /api/products/:id   — Delete product and related data (admin)
 */

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Item from "@/models/Item";
import Review from "@/models/Review";

// GET — Single product with variant info, stock, and reviews
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    const product = await Product.findById(id)
      .populate("category", "name nameFa slug image")
      .lean();

    if (!product) {
      return Response.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    const productDoc = await Product.findById(id);
    const defaultWarehouseId = process.env.DEFAULT_WAREHOUSE_ID;

    // Get available colors and cars from items
    let availableColors = [];
    let availableCars = [];
    let variants = [];

    if (defaultWarehouseId) {
      availableColors = await productDoc.getAvailableColors(defaultWarehouseId);
      availableCars = await productDoc.getAvailableCars(defaultWarehouseId);

      // Build variant list — all combinations with stock
      const items = await Item.find({
        product: id,
        warehouse: defaultWarehouseId,
      }).lean();

      variants = items.map((item) => ({
        color: item.color,
        compatibleCar: item.compatibleCar,
        quantity: item.quantity,
        // Calculate available manually since .lean() doesn't include virtuals
        available: Math.max(0, item.quantity - (item.reservedQuantity || 0)),
        itemId: item._id.toString(),
        location: item.location,
      }));
    }

    // Get approved reviews
    const reviews = await Review.find({
      product: id,
      isApproved: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Get rating summary
    const rating = await productDoc.getAverageRating();

    // Calculate total available stock across all variants
    const totalAvailable = variants.reduce((sum, v) => sum + v.available, 0);
    const inStock = totalAvailable > 0;

    return Response.json({
      success: true,
      data: {
        ...product,
        availableColors,
        availableCars,
        variants,
        rating,
        reviews: JSON.parse(JSON.stringify(reviews)),
        stock: {
          totalAvailable,
          inStock,
        },
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return Response.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 },
      );
    }

    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// PUT — Update a product (admin)
export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return Response.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: product });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return Response.json(
        { success: false, message: messages.join(", ") },
        { status: 400 },
      );
    }

    if (error.name === "CastError") {
      return Response.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 },
      );
    }

    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE — Delete a product and its related data (admin)
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return Response.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // Delete related items and reviews
    await Item.deleteMany({ product: id });
    await Review.deleteMany({ product: id });

    return Response.json({
      success: true,
      message: "Product and related data deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return Response.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 },
      );
    }

    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
