/**
 * Reset Password API
 *
 * POST — Reset password using code sent to email
 */

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, resetCode, newPassword } = body;

    if (!email || !resetCode || !newPassword) {
      return Response.json(
        {
          success: false,
          message: "Email, reset code, and new password are required",
        },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Find user and verify reset code
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetCode,
      resetCodeExpires: { $gt: new Date() },
    });

    if (!user) {
      return Response.json(
        { success: false, message: "Invalid or expired reset code" },
        { status: 400 },
      );
    }

    // Set new password and clear reset code
    user.password = newPassword;
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    return Response.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
