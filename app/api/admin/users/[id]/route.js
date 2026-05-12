import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/User";

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Prevent admin from changing their own role
    if (id === currentUser._id.toString()) {
      return Response.json(
        { success: false, message: "Cannot modify your own account" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const updateData = {};

    if (body.role) updateData.role = body.role;
    if (typeof body.isActive === "boolean") updateData.isActive = body.isActive;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: user.toSafeObject() });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
