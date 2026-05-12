import dbConnect from "@/lib/mongodb";
import SiteContent from "@/models/SiteContent";
import { getCurrentUser } from "@/lib/auth";

// GET — Public: get content for a section
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "about";

    const content = await SiteContent.find({ section, isActive: true })
      .sort({ order: 1 })
      .lean();

    return Response.json({
      success: true,
      data: JSON.parse(JSON.stringify(content)),
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
    const content = await SiteContent.create(body);

    return Response.json({ success: true, data: content }, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
