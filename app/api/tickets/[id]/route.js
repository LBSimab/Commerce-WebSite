import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getCurrentUser } from "@/lib/auth";

// GET — Single ticket (owner or admin)
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const ticket = await Ticket.findById(id)
      .populate("user", "name email")
      .lean();
    if (!ticket) {
      return Response.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      data: JSON.parse(JSON.stringify(ticket)),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST — Add reply (user or admin)
export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const user = await getCurrentUser();

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return Response.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    // Admin reply
    if (user && user.role === "admin") {
      ticket.replies.push({
        sender: "admin",
        message: body.message,
        senderName: "Admin",
      });
      ticket.status = "replied";
      await ticket.save();
      return Response.json({ success: true, data: ticket });
    }

    // Ticket owner reply
    if (user && ticket.user?.toString() === user._id.toString()) {
      ticket.replies.push({
        sender: "user",
        message: body.message,
        user: user._id,
        senderName: user.name,
      });
      ticket.status = "open";
      await ticket.save();
      return Response.json({ success: true, data: ticket });
    }

    // Guest reply (with access token)
    const accessToken = body.accessToken;
    if (accessToken && ticket.accessToken === accessToken) {
      ticket.replies.push({
        sender: "user",
        message: body.message,
        senderName: ticket.name || "Guest",
      });
      ticket.status = "open";
      await ticket.save();
      return Response.json({ success: true, data: ticket });
    }

    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 403 },
    );
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// PUT — Close ticket (admin or owner)
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = await getCurrentUser();

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return Response.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    // Admin can always close
    if (user && user.role === "admin") {
      ticket.status = "closed";
      await ticket.save();
      return Response.json({ success: true, data: ticket });
    }

    // Owner can close
    if (user && ticket.user?.toString() === user._id.toString()) {
      ticket.status = "closed";
      await ticket.save();
      return Response.json({ success: true, data: ticket });
    }

    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 403 },
    );
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
