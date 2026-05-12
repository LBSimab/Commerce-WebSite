/**
 * Products API Route
 *
 * GET  /api/products?category=seat-covers&search=leather&page=1&limit=12
 *      Returns paginated, filtered list of active products with stock info
 * POST /api/products
 *      Creates a new product (admin)
 */

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Item from "@/models/Item";
import { getCurrentUser } from "@/lib/auth";

// GET — List products with filtering, search, pagination, and stock info
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;

    // Build filter
    const filter = { isActive: true };

    if (category) {
      const Category = (await import("@/models/Category")).default;
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("category", "name nameFa slug image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Attach stock summary from default warehouse
    const defaultWarehouseId = process.env.DEFAULT_WAREHOUSE_ID;

    if (defaultWarehouseId) {
      const productIds = products.map((p) => p._id);

      // Get all items for these products in the default warehouse
      const items = await Item.find({
        product: { $in: productIds },
        warehouse: defaultWarehouseId,
      }).lean();

      // Create stock map — sum available quantities per product
      const stockMap = {};
      productIds.forEach((pid) => {
        stockMap[pid.toString()] = { totalAvailable: 0, inStock: false };
      });

      items.forEach((item) => {
        const pidStr = item.product.toString();
        const available = Math.max(
          0,
          item.quantity - (item.reservedQuantity || 0),
        );
        stockMap[pidStr].totalAvailable += available;
      });

      // Attach stock to each product
      products.forEach((product) => {
        const pidStr = product._id.toString();
        const stock = stockMap[pidStr] || { totalAvailable: 0, inStock: false };
        product.stock = {
          totalAvailable: stock.totalAvailable,
          inStock: stock.totalAvailable > 0,
        };
      });
    }

    return Response.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST — Create a new product (admin)
export async function POST(request) {
  try {
    await dbConnect();

    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const body = await request.json();

    if (!body.name || !body.description || !body.price || !body.category) {
      return Response.json(
        {
          success: false,
          message:
            "Missing required fields: name, description, price, category",
        },
        { status: 400 },
      );
    }

    const product = await Product.create(body);

    return Response.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return Response.json(
        { success: false, message: messages.join(", ") },
        { status: 400 },
      );
    }

    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
