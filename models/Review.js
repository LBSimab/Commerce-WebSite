import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
      validate: {
        validator: async function (productId) {
          const Product = mongoose.model("Product");
          const product = await Product.findById(productId);
          return product !== null && product.isActive === true;
        },
        message: "Product does not exist or is inactive",
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewerName: {
      type: String,
      required: [true, "Reviewer name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name is too long"],
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1 star"],
      max: [5, "Rating cannot exceed 5 stars"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number",
      },
    },

    title: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Title is too long"],
    },

    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [5, "Comment must be at least 5 characters"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },

    pros: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 5;
        },
        message: "Maximum 5 pros allowed",
      },
    },

    cons: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 5;
        },
        message: "Maximum 5 cons allowed",
      },
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ product: 1, isApproved: 1 });
// reviewSchema.index({ product: 1, user: 1 }, { unique: true, sparse: true });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
