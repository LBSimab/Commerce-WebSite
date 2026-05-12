import mongoose from "mongoose";

const siteContentSchema = new mongoose.Schema(
  {
    // Which page: 'about' or 'contact'
    section: {
      type: String,
      required: true,
      enum: ["about", "contact"],
    },
    // Block type determines what fields are needed and how it renders
    type: {
      type: String,
      required: true,
      enum: [
        "hero",
        "text",
        "features",
        "team",
        "locations",
        "testimonials",
        "cta",
        "contact-form",
        "contact-info",
      ],
    },
    // Display order within the section
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Flexible data object — structure depends on block type
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

const SiteContent =
  mongoose.models.SiteContent ||
  mongoose.model("SiteContent", siteContentSchema);

export default SiteContent;
