/**
 * Order Model
 *
 * Stores completed orders after checkout.
 * Each order item includes variant info (color, car) and references the Item for stock deduction.
 */

import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    // Reference to the Item (for stock deduction)
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    // Reference to the Product (for display)
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    // Variant fields
    color: {
      type: String,
      default: null,
    },
    compatibleCar: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    // Shipping address
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      province: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      postalCode: { type: String, default: "" },
    },

    // Pricing
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },

    // Status flow
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    // Optional notes
    notes: {
      type: String,
      default: "",
    },

    discountCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: null },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentReference: { type: String, default: null },
  },
  {
    timestamps: true,
  },
);

// Index for querying user orders
orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
