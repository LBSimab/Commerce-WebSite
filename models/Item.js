/**
 * Item Model
 *
 * Represents physical stock of a product variant in a warehouse.
 * Each item is a unique combination of product + warehouse + color + car.
 *
 * If a product has no colors and fits all cars:
 *   - color is null, compatibleCar is null
 *   - One item per product per warehouse
 *
 * If a product has colors and compatible cars:
 *   - Multiple items per product per warehouse (one per combination)
 */

import mongoose from "mongoose";
import "./Product.js";
const itemSchema = new mongoose.Schema(
  {
    // Which product this item belongs to
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },

    // Which warehouse this item is stored in
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Warehouse is required"],
    },

    // Single color variant (from product.colors array)
    // null if product has no colors
    color: {
      type: String,
      default: null,
      trim: true,
    },

    // Single compatible car variant (from product.compatibleCars array)
    // null if product fits all cars
    compatibleCar: {
      type: String,
      default: null,
      trim: true,
    },

    // Current stock quantity
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },

    // Reserved quantity (items in customers' carts but not yet ordered)
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, "Reserved quantity cannot be negative"],
    },

    // When available quantity drops below this, trigger alert
    lowStockThreshold: {
      type: Number,
      required: [true, "Low stock threshold is required"],
      min: [1, "Threshold must be at least 1"],
      default: 5,
    },

    // Physical location inside the warehouse (shelf, aisle, etc.)
    location: {
      type: String,
      default: null,
      trim: true,
      maxlength: [50, "Location code is too long"],
    },
  },
  {
    timestamps: true,
  },
);

// Unique compound index: one item per product + warehouse + color + car combination
itemSchema.index(
  { product: 1, warehouse: 1, color: 1, compatibleCar: 1 },
  { unique: true },
);

// Virtual: available quantity (total minus reserved)
itemSchema.virtual("availableQuantity").get(function () {
  return Math.max(0, this.quantity - this.reservedQuantity);
});

// Virtual: is this item low on stock?
itemSchema.virtual("isLowStock").get(function () {
  return this.availableQuantity <= this.lowStockThreshold;
});

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default Item;
