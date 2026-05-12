import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Order from "@/models/Order";

export async function GET(request, { params }) {
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

    const orders = await Order.find({ user: id })
      .sort({ createdAt: -1 })
      .lean();

    const serialized = JSON.parse(JSON.stringify(orders));

    return Response.json({ success: true, data: serialized });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
