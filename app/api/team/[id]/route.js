import dbConnect from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";
import { getCurrentUser } from "@/lib/auth";

// GET — Public: single team member
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const member = await TeamMember.findById(id).lean();
    if (!member) {
      return Response.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      data: JSON.parse(JSON.stringify(member)),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// PUT — Admin: update
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

    const member = await TeamMember.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!member) {
      return Response.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: member });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE — Admin
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
    await TeamMember.findByIdAndDelete(id);

    return Response.json({ success: true, message: "Deleted" });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
