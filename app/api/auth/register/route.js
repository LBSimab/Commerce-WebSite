import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken, setTokenCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return Response.json(
        { success: false, message: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return Response.json(
        { success: false, message: "A user with this email already exists" },
        { status: 400 },
      );
    }

    // Create user (password is hashed in the model's pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate token and set cookie
    const token = generateToken(user._id);
    await setTokenCookie(token);

    return Response.json(
      {
        success: true,
        message: "Account created successfully",
        data: user.toSafeObject(),
      },
      { status: 201 },
    );
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
