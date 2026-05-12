import dbConnect from "@/lib/mongodb";
import Location from "@/models/Location";
import { getCurrentUser } from "@/lib/auth";

// GET — Public
export async function GET() {
  try {
    await dbConnect();
    const locations = await Location.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    return Response.json({
      success: true,
      data: JSON.parse(JSON.stringify(locations)),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST — Admin
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
    const location = await Location.create(body);
    return Response.json({ success: true, data: location }, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
