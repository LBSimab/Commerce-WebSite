import dbConnect from "@/lib/mongodb";
import PaymentGateway from "@/models/PaymentGateway";

export async function GET() {
  try {
    await dbConnect();
    const gateways = await PaymentGateway.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
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
