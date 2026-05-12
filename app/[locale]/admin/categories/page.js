import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import CategoriesClient from "./CategoriesClient";

export default async function AdminCategoriesPage({ params }) {
  const { locale } = await params;

  await dbConnect();
  const categories = await Category.find().sort({ order: 1 }).lean();

  // Convert _id to string for client components
  const serialized = categories.map((cat) => ({
    ...cat,
    _id: cat._id.toString(),
  }));

  return <CategoriesClient initialCategories={serialized} locale={locale} />;
}
