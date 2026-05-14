import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Item from "@/models/Item";
import { getTranslations } from "next-intl/server";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage({ params, searchParams }) {
  const { locale } = await params;
  const t = await getTranslations("products");
  const sp = await searchParams;

  // Parse query params
  const search = sp.search || "";
  const category = sp.category || "";
  const minPrice = sp.minPrice || "";
  const maxPrice = sp.maxPrice || "";
  const color = sp.color || "";
  const car = sp.car || "";
  const sort = sp.sort || "newest";
  const page = parseInt(sp.page) || 1;
  const limit = 12;

  await dbConnect();

  // Build filter
  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { nameFa: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { descriptionFa: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Color and car filters — filter products that have these in their arrays
  if (color) {
    filter.colors = color;
  }

  if (car) {
    filter.compatibleCars = car;
  }

  // Sort
  let sortOption = {};
  switch (sort) {
    case "price-asc":
      sortOption = { price: 1 };
      break;
    case "price-desc":
      sortOption = { price: -1 };
      break;
    case "rating":
      sortOption = { "rating.average": -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category", "name nameFa slug image")
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Attach stock
  const defaultWarehouseId = process.env.DEFAULT_WAREHOUSE_ID;
  if (defaultWarehouseId) {
    const productIds = products.map((p) => p._id);
    const items = await Item.find({
      product: { $in: productIds },
      warehouse: defaultWarehouseId,
    }).lean();

    const stockMap = {};
    productIds.forEach((pid) => {
      stockMap[pid.toString()] = 0;
    });
    items.forEach((item) => {
      stockMap[item.product.toString()] += Math.max(
        0,
        item.quantity - (item.reservedQuantity || 0),
      );
    });
    products.forEach((p) => {
      const s = stockMap[p._id.toString()] || 0;
      p.stock = { totalAvailable: s, inStock: s > 0 };
    });
  }

  // Fetch categories for filter sidebar
  const categories = await Category.find({ isActive: true })
    .sort({ order: 1 })
    .lean();

  // Get unique colors and cars from products for filter options
  const allColors = [
    ...new Set(products.flatMap((p) => p.colors || [])),
  ].sort();
  const allCars = [
    ...new Set(products.flatMap((p) => p.compatibleCars || [])),
  ].sort();

  return (
    <ProductsClient
      products={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(categories))}
      allColors={allColors}
      allCars={allCars}
      total={total}
      page={page}
      limit={limit}
      locale={locale}
      currentFilters={{
        search,
        category,
        minPrice,
        maxPrice,
        color,
        car,
        sort,
      }}
    />
  );
}
