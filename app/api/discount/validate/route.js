import dbConnect from "@/lib/mongodb";
import DiscountCode from "@/models/DiscountCode";

export async function POST(request) {
  try {
    await dbConnect();
    const { code, orderAmount } = await request.json();

    if (!code) {
      return Response.json(
        { success: false, message: "Code is required" },
        { status: 400 },
      );
    }

    const discount = await DiscountCode.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });

    if (!discount) {
      return Response.json(
        { success: false, message: "Invalid or expired code" },
        { status: 404 },
      );
    }

    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return Response.json(
        { success: false, message: "Code has reached maximum uses" },
        { status: 400 },
      );
    }

    if (orderAmount < discount.minOrderAmount) {
      return Response.json(
        {
          success: false,
          message: `Minimum order amount is ${discount.minOrderAmount.toLocaleString()} T`,
        },
        { status: 400 },
      );
    }

    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = Math.round((orderAmount * discount.value) / 100);
    } else {
      discountAmount = Math.min(discount.value, orderAmount);
    }

    return Response.json({
      success: true,
      data: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount,
        finalAmount: orderAmount - discountAmount,
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
