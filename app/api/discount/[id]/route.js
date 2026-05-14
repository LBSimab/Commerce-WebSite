import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import DiscountCode from "@/models/DiscountCode";

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }
    const { id } = await params;
    const body = await request.json();
    const code = await DiscountCode.findByIdAndUpdate(id, body, { new: true });
    if (!code)
      return Response.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    return Response.json({ success: true, data: code });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }
    const { id } = await params;
    await DiscountCode.findByIdAndDelete(id);
    return Response.json({ success: true, message: "Deleted" });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
