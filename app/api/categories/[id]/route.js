/**
 * Single Category API
 *
 * GET    — Get a category
 * PUT    — Update category (admin)
 * DELETE — Delete category (admin)
 */

import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { getCurrentUser } from "@/lib/auth";

// GET — Single category (public)
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const category = await Category.findById(id).lean();

    if (!category) {
      return Response.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: category });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// PUT — Update category (admin only)
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

    const category = await Category.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return Response.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: category });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return Response.json(
        { success: false, message: messages.join(", ") },
        { status: 400 },
      );
    }
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE — Delete category (admin only)
export async function DELETE(request, { params }) {
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

    // Check if any products use this category
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Cannot delete category. ${productCount} products are using it.`,
        },
        { status: 400 },
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return Response.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
