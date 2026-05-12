import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken, setTokenCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return Response.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      return Response.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return Response.json(
        { success: false, message: "This account has been deactivated" },
        { status: 403 },
      );
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return Response.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Generate token and set cookie
    const token = generateToken(user._id);
    await setTokenCookie(token);

    return Response.json({
      success: true,
      message: "Logged in successfully",
      data: user.toSafeObject(),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
