import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import DiscountCode from "@/models/DiscountCode";

export async function GET() {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }
    const codes = await DiscountCode.find().sort({ createdAt: -1 }).lean();
    return Response.json({
      success: true,
      data: JSON.parse(JSON.stringify(codes)),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }
    const body = await request.json();
    const code = await DiscountCode.create(body);
    return Response.json({ success: true, data: code }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return Response.json(
        { success: false, message: "Code already exists" },
        { status: 400 },
      );
    }
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
