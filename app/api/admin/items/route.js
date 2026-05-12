import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Item from "@/models/Item";

// GET — All items for admin
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

    const items = await Item.find()
      .populate("product", "name nameFa colors compatibleCars")
      .populate("warehouse", "name")
      .sort({ updatedAt: -1 })
      .lean();

    return Response.json({
      success: true,
      data: JSON.parse(JSON.stringify(items)),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST — Create item
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
    const item = await Item.create(body);
    return Response.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return Response.json(
        {
          success: false,
          message: "This item combination already exists in this warehouse",
        },
        { status: 400 },
      );
    }
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
