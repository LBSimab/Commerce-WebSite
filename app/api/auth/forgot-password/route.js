/**
 * Forgot Password API
 *
 * POST — Send password reset code to email
 */

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return Response.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists — always return success
      return Response.json({
        success: true,
        message:
          "If an account exists with this email, a reset code has been sent",
      });
    }

    // Generate 6-digit reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();

    // Save reset code with 10-minute expiration
    user.resetCode = resetCode;
    user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email
    await sendPasswordResetEmail(user.email, resetCode);

    return Response.json({
      success: true,
      message:
        "If an account exists with this email, a reset code has been sent",
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
