/**
 * Verify Reset Code API
 *
 * POST — Check if email + reset code combo is valid
 * Used by the reset password page to validate the link before showing the form
 */

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return Response.json(
        { success: false, message: "Email and code are required" },
        { status: 400 },
      );
    }

    // Find user with valid reset code
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetCode: code,
      resetCodeExpires: { $gt: new Date() },
    });

    if (!user) {
      return Response.json(
        { success: false, message: "Invalid or expired reset code" },
        { status: 400 },
      );
    }

    return Response.json({
      success: true,
      message: "Reset code is valid",
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
