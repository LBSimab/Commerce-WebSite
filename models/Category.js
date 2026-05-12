import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [100, "Category name is too long"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    nameFa: {
      type: String,
      required: [true, "Persian name is required"],
      trim: true,
      maxlength: [100, "Persian name is too long"],
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

    image: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
      min: [0, "Order must be a positive number"],
    },
  },
  {
    timestamps: true,
  },
);

// Auto-generate slug from name before saving
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
});

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
