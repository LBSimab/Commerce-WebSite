import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import PaymentGateway from "@/models/PaymentGateway";

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user || user.role !== "admin")
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    const { id } = await params;
    const body = await request.json();
    const gateway = await PaymentGateway.findByIdAndUpdate(id, body, {
      new: true,
    });
    return Response.json({ success: true, data: gateway });
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
    if (!user || user.role !== "admin")
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    const { id } = await params;
    await PaymentGateway.findByIdAndDelete(id);
    return Response.json({ success: true, message: "Deleted" });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
