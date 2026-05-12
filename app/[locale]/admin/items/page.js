import dbConnect from "@/lib/mongodb";
import Item from "@/models/Item";
import Product from "@/models/Product";
import Warehouse from "@/models/Warehouse";
import ItemsClient from "./ItemsClient";

export default async function AdminItemsPage({ params }) {
  const { locale } = await params;
  await dbConnect();

  const [items, products, warehouses] = await Promise.all([
    Item.find()
      .populate("product", "name nameFa colors compatibleCars")
      .populate("warehouse", "name")
      .sort({ updatedAt: -1 })
      .lean(),
    Product.find({ isActive: true })
      .select("name nameFa colors compatibleCars")
      .lean(),
    Warehouse.find({ isActive: true })
      .populate("location", "name nameFa")
      .lean(),
  ]);

  return (
    <ItemsClient
      initialItems={JSON.parse(JSON.stringify(items))}
      products={JSON.parse(JSON.stringify(products))}
      warehouses={JSON.parse(JSON.stringify(warehouses))}
      locale={locale}
    />
  );
}
