import dbConnect from "@/lib/mongodb";
import DiscountCode from "@/models/DiscountCode";
import DiscountClient from "./DiscountClient";

export default async function AdminDiscountPage({ params }) {
  const { locale } = await params;
  await dbConnect();
  const codes = await DiscountCode.find().sort({ createdAt: -1 }).lean();
  return (
    <DiscountClient
      initialCodes={JSON.parse(JSON.stringify(codes))}
      locale={locale}
    />
  );
}
