/**
 * Product Model
 *
 * Stores product information. Colors and compatibleCars define possible
 * variants. Actual stock is stored in the Item model.
 */

import mongoose from "mongoose";

// Ensure Category and Item models are registered before Product validators run
import "./Category.js";
import "./Item.js";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [200, "Product name cannot exceed 200 characters"],
      index: true,
    },

    nameFa: {
      type: String,
      default: "",
      maxlength: [200, "Persian name is too long"],
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    descriptionFa: {
      type: String,
      default: "",
      maxlength: [2000, "Persian description is too long"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
      max: [100000000, "Price seems too high"],
    },

    discountPrice: {
      type: Number,
      default: null,
      validate: {
        validator: function (value) {
          if (value === null) return true;
          return value < this.price;
        },
        message: "Discount price must be less than regular price",
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
      validate: {
        validator: async function (categoryId) {
          const Category = mongoose.model("Category");
          const category = await Category.findById(categoryId);
          return category !== null && category.isActive === true;
        },
        message: "Category does not exist or is inactive",
      },
    },

    images: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "Maximum 10 images allowed",
      },
      default: [],
    },

    mainImage: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Array of possible colors (e.g., ["Black", "White", "Gray"])
    colors: {
      type: [String],
      default: [],
    },

    // Array of compatible car models (e.g., ["Pride", "Samand", "206"])
    compatibleCars: {
      type: [String],
      default: [],
    },

    material: {
      type: String,
      default: "",
      maxlength: [100, "Material name is too long"],
    },
  },
  {
    timestamps: true,
  },
);

// Auto-generate slug
productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
});

// Get available colors from Items (for product detail page)
productSchema.methods.getAvailableColors = async function (warehouseId) {
  const Item = mongoose.model("Item");
  const items = await Item.find({
    product: this._id,
    warehouse: warehouseId,
    quantity: { $gt: 0 },
    color: { $ne: null },
  })
    .select("color")
    .lean();

  return [...new Set(items.map((i) => i.color))];
};

// Get available cars for a specific color
productSchema.methods.getAvailableCars = async function (warehouseId, color) {
  const Item = mongoose.model("Item");
  const filter = {
    product: this._id,
    warehouse: warehouseId,
    quantity: { $gt: 0 },
  };
  if (color) filter.color = color;

  const items = await Item.find(filter).select("compatibleCar").lean();

  return [...new Set(items.map((i) => i.compatibleCar).filter(Boolean))];
};

// Get stock for a specific variant
productSchema.methods.getVariantStock = async function (
  warehouseId,
  color,
  compatibleCar,
) {
  const Item = mongoose.model("Item");
  const filter = {
    product: this._id,
    warehouse: warehouseId,
  };
  if (color) filter.color = color;
  if (compatibleCar) filter.compatibleCar = compatibleCar;

  const item = await Item.findOne(filter);
  if (!item) return { quantity: 0, available: 0 };

  return {
    quantity: item.quantity,
    reservedQuantity: item.reservedQuantity,
    available: item.availableQuantity,
    itemId: item._id,
  };
};

// Get average rating
productSchema.methods.getAverageRating = async function () {
  const Review = mongoose.model("Review");
  const result = await Review.aggregate([
    { $match: { product: this._id } },
    { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (result.length === 0) return { average: 0, count: 0 };
  return {
    average: Math.round(result[0].average * 10) / 10,
    count: result[0].count,
  };
};

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
