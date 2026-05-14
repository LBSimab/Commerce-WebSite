import mongoose from "mongoose";

const paymentGatewaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameFa: { type: String, default: "" },
    type: {
      type: String,
      enum: ["zarinpal", "zibal", "payir", "nextpay", "custom"],
      required: true,
    },
    merchantId: { type: String, default: "" },
    apiKey: { type: String, default: "" },
    sandbox: { type: Boolean, default: true },
    callbackUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    descriptionFa: { type: String, default: "" },
  },
  { timestamps: true },
);

const PaymentGateway =
  mongoose.models.PaymentGateway ||
  mongoose.model("PaymentGateway", paymentGatewaySchema);
export default PaymentGateway;
