import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getCurrentUser } from "@/lib/auth";

// GET — User tickets (logged in) or guest ticket by access token
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("token");

    // Guest ticket by access token
    if (accessToken) {
      const ticket = await Ticket.findOne({ accessToken }).lean();
      if (!ticket) {
        return Response.json(
          { success: false, message: "Ticket not found" },
          { status: 404 },
        );
      }
      return Response.json({
        success: true,
        data: JSON.parse(JSON.stringify(ticket)),
      });
    }

    // Logged-in user tickets
    const user = await getCurrentUser();
    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const tickets = await Ticket.find({ user: user._id })
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

// POST — Create ticket (logged in or guest)
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const user = await getCurrentUser();

    if (user) {
      // Logged in — no need for name/email
      const ticket = await Ticket.create({
        user: user._id,
        subject: body.subject,
        message: body.message,
        order: body.order || null,
      });
      return Response.json({ success: true, data: ticket }, { status: 201 });
    }

    // Guest — requires name, email optional
    if (!body.subject || !body.message) {
      return Response.json(
        { success: false, message: "Subject and message required" },
        { status: 400 },
      );
    }

    const ticket = await Ticket.create({
      name: body.name || "",
      email: body.email || "",
      subject: body.subject,
      message: body.message,
    });

    return Response.json(
      {
        success: true,
        data: { _id: ticket._id, accessToken: ticket.accessToken },
        message: "Ticket created. Save your access link.",
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
