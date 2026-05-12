/**
 * Profile API
 *
 * PUT — Update user name and email
 */

import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/User";

export async function PUT(request) {
  try {
    await dbConnect();

    // Verify user is logged in
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { name, email } = body;

    // Check if email is already taken by another user
    if (email && email !== currentUser.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: currentUser._id },
      });
      if (existingUser) {
        return Response.json(
          { success: false, message: "This email is already in use" },
          { status: 400 },
        );
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { name: name || currentUser.name, email: email || currentUser.email },
      { new: true, runValidators: true },
    );

    return Response.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser.toSafeObject(),
    });
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
