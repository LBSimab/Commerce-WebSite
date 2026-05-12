import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
      // validate: {
      //   validator: async function (productId) {
      //     const Product = mongoose.model("Product");
      //     const product = await Product.findById(productId);
      //     return product !== null && product.isActive === true;
      //   },
      //   message: "Product does not exist or is inactive",
      // },
    },

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Warehouse reference is required"],
      // validate: {
      //   validator: async function (warehouseId) {
      //     const Warehouse = mongoose.model("Warehouse");
      //     const warehouse = await Warehouse.findById(warehouseId);
      //     return warehouse !== null && warehouse.isActive === true;
      //   },
      //   message: "Warehouse does not exist or is inactive",
      // },
    },

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

    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, "Reserved quantity cannot be negative"],
    },

    lowStockThreshold: {
      type: Number,
      required: [true, "Low stock threshold is required"],
      min: [1, "Threshold must be at least 1"],
      default: 5,
    },

    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: [50, "Location code is too long"],
    },
  },
  {
    timestamps: true,
  },
);

// One record per product per warehouse
inventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });

// Quick stock lookups
inventorySchema.index({ product: 1, quantity: 1 });

// Virtual: available quantity (total minus reserved)
inventorySchema.virtual("availableQuantity").get(function () {
  return Math.max(0, this.quantity - this.reservedQuantity);
});

// Virtual: is this item low on stock?
inventorySchema.virtual("isLowStock").get(function () {
  return this.availableQuantity <= this.lowStockThreshold;
});

const Inventory =
  mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);

export default Inventory;
