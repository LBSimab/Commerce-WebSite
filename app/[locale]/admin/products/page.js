import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductsClient from "./ProductsClient";

export default async function AdminProductsPage({ params }) {
  const { locale } = await params;

  await dbConnect();

  const [products, categories] = await Promise.all([
    Product.find()
      .populate("category", "name nameFa")
      .sort({ createdAt: -1 })
      .lean(),
    Category.find({ isActive: true }).sort({ order: 1 }).lean(),
  ]);

  // Serialize for client components
  const serializedProducts = products.map((p) => ({
    ...p,
    _id: p._id.toString(),
    category: p.category
      ? { ...p.category, _id: p.category._id.toString() }
      : null,
  }));

  const serializedCategories = categories.map((c) => ({
    ...c,
    _id: c._id.toString(),
  }));

  return (
    <ProductsClient
      initialProducts={serializedProducts}
      categories={serializedCategories}
      locale={locale}
    />
  );
}
