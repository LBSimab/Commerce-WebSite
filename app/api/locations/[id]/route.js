import dbConnect from "@/lib/mongodb";
import Location from "@/models/Location";
import { getCurrentUser } from "@/lib/auth";

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
    const location = await Location.findByIdAndUpdate(id, body, { new: true });
    return Response.json({ success: true, data: location });
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
    await Location.findByIdAndDelete(id);
    return Response.json({ success: true, message: "Deleted" });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
