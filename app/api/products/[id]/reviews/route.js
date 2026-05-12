/**
 * Product Reviews API (User-facing)
 *
 * GET  — Get approved reviews for a product
 * POST — Submit a review (any logged-in user, needs admin approval)
 *        Verified badge shown if user purchased the product
 */

import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Review from "@/models/Review";
import Order from "@/models/Order";

// GET — Get approved reviews for a product (public)
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const reviews = await Review.find({
      product: id,
      isApproved: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      data: JSON.parse(JSON.stringify(reviews)),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST — Submit a review (any logged-in user, needs admin approval)
export async function POST(request, { params }) {
  try {
    await dbConnect();

    // Must be logged in
    const user = await getCurrentUser();
    if (!user) {
      return Response.json(
        { success: false, message: "Must be logged in to review" },
        { status: 401 },
      );
    }

    const { id: productId } = await params;
    const body = await request.json();
    const { rating, comment, title } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return Response.json(
        { success: false, message: "Rating between 1-5 is required" },
        { status: 400 },
      );
    }

    // Validate comment
    if (!comment || comment.trim().length < 5) {
      return Response.json(
        { success: false, message: "Comment must be at least 5 characters" },
        { status: 400 },
      );
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: user._id,
    });

    if (existingReview) {
      return Response.json(
        { success: false, message: "You have already reviewed this product" },
        { status: 400 },
      );
    }

    // Check if user purchased this product (for verified badge only, not a blocker)
    const hasPurchased = await Order.findOne({
      user: user._id,
      "items.product": productId,
      status: { $in: ["delivered", "shipped"] },
    });

    // Create review — always needs admin approval
    // isVerifiedPurchase flag controls the badge display
    const review = await Review.create({
      product: productId,
      user: user._id,
      reviewerName: user.name,
      rating,
      title: title || "",
      comment: comment.trim(),
      isApproved: false, // Comment needs admin approval
      isVerifiedPurchase: !!hasPurchased, // Badge shows if purchased
    });

    return Response.json(
      {
        success: true,
        message: "Review submitted. It will appear after approval.",
        data: review,
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
