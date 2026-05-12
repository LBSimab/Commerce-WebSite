import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Review from "@/models/Review";

// PUT — Approve/update review
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

    const review = await Review.findByIdAndUpdate(id, body, { new: true });

    if (!review) {
      return Response.json(
        { success: false, message: "Review not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: review });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE — Delete review
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

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return Response.json(
        { success: false, message: "Review not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, message: "Review deleted" });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
