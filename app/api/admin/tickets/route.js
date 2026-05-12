import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getCurrentUser } from "@/lib/auth";

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

    const tickets = await Ticket.find()
      .populate("user", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    return Response.json({
      success: true,
      data: JSON.parse(JSON.stringify(tickets)),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
