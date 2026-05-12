/**
 * Change Password API
 *
 * POST — Change password (requires current password)
 */

import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/User";

export async function POST(request) {
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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return Response.json(
        {
          success: false,
          message: "Current password and new password are required",
        },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        {
          success: false,
          message: "New password must be at least 6 characters",
        },
        { status: 400 },
      );
    }

    // Get user with password field
    const user = await User.findById(currentUser._id).select("+password");

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return Response.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 },
      );
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    return Response.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
