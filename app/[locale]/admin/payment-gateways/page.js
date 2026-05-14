import dbConnect from "@/lib/mongodb";
import PaymentGateway from "@/models/PaymentGateway";
import PaymentGatewaysClient from "./PaymentGatewaysClient";

export default async function AdminPaymentGatewaysPage({ params }) {
  const { locale } = await params;
  await dbConnect();
  const gateways = await PaymentGateway.find().sort({ order: 1 }).lean();
  return (
    <PaymentGatewaysClient
      initialGateways={JSON.parse(JSON.stringify(gateways))}
      locale={locale}
    />
  );
}
