import dbConnect from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";
import { getCurrentUser } from "@/lib/auth";

// GET — Public: list active team members
export async function GET() {
  try {
    await dbConnect();

    const members = await TeamMember.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    return Response.json({
      success: true,
      data: JSON.parse(JSON.stringify(members)),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST — Admin: create team member
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
    const member = await TeamMember.create(body);

    return Response.json({ success: true, data: member }, { status: 201 });
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
