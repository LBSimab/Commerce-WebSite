import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    nameFa: {
      type: String,
      default: "",
      trim: true,
    },
    // Type: 'store', 'office', 'warehouse'
    type: {
      type: String,
      enum: ["store", "office", "warehouse"],
      default: "store",
    },
    address: {
      type: String,
      default: "",
    },
    addressFa: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    phone2: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    // Working hours
    workingHours: {
      type: String,
      default: "",
    },
    workingHoursFa: {
      type: String,
      default: "",
    },
    // Map coordinates (for your local webmap later)
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "Description is too long"],
    },
    descriptionFa: {
      type: String,
      default: "",
      maxlength: [500, "Description is too long"],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Location =
  mongoose.models.Location || mongoose.model("Location", locationSchema);

export default Location;
