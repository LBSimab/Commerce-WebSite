import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import PaymentGateway from "@/models/PaymentGateway";

export async function GET() {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user || user.role !== "admin")
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    const gateways = await PaymentGateway.find().sort({ order: 1 }).lean();
    return Response.json({
      success: true,
      data: JSON.parse(JSON.stringify(gateways)),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user || user.role !== "admin")
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    const body = await request.json();
    const gateway = await PaymentGateway.create(body);
    return Response.json({ success: true, data: gateway }, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
