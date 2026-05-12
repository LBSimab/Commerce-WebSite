/**
 * Warehouse Model
 *
 * Physical storage locations linked to a Location document.
 * Must create a Location (type: warehouse) first before creating a Warehouse.
 */

import mongoose from "mongoose";
import "./Location.js";
const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Warehouse name is required"],
      trim: true,
      minlength: [2, "Warehouse name must be at least 2 characters"],
      maxlength: [100, "Warehouse name cannot exceed 100 characters"],
      unique: true,
    },

    // Reference to a Location document (type must be 'warehouse')
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: [true, "Location is required"],
      validate: {
        validator: async function (locationId) {
          const Location = mongoose.model("Location");
          const loc = await Location.findById(locationId);
          return (
            loc !== null && loc.isActive === true && loc.type === "warehouse"
          );
        },
        message: "Location does not exist, is inactive, or is not a warehouse",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    code: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      maxlength: [10, "Warehouse code is too long"],
    },

    // Maximum total quantity this warehouse can hold across all items
    // null means no limit
    capacity: {
      type: Number,
      default: null,
      min: [0, "Capacity cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
);

// Auto-generate code from name
warehouseSchema.pre("save", function () {
  if (!this.code && this.name) {
    this.code = this.name
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 6)
      .toUpperCase();
  }
});

const Warehouse =
  mongoose.models.Warehouse || mongoose.model("Warehouse", warehouseSchema);

export default Warehouse;
