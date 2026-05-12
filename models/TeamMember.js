import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    nameFa: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    roleFa: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio is too long"],
    },
    bioFa: {
      type: String,
      default: "",
      maxlength: [500, "Bio is too long"],
    },
    fullDetails: {
      type: String,
      default: "",
      maxlength: [2000, "Full details too long"],
    },
    fullDetailsFa: {
      type: String,
      default: "",
      maxlength: [2000, "Full details too long"],
    },
    personality: {
      type: [String],
      enum: ["Cold", "Hot", "Evil", "Angel", "GentleWoman", "Gentleman"],
      validate: {
        validator: function (arr) {
          return arr.length <= 3;
        },
        message: "Maximum 3 personality types",
      },
      default: [],
    },
    statPower: { type: Number, min: 0, max: 6, default: 3 },
    statSpeed: { type: Number, min: 0, max: 6, default: 3 },
    statEndurance: { type: Number, min: 0, max: 6, default: 3 },
    statEnergy: { type: Number, min: 0, max: 6, default: 3 },
    statTiming: { type: Number, min: 0, max: 6, default: 3 },
    statExperience: { type: Number, min: 0, max: 6, default: 3 },
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

const TeamMember =
  mongoose.models.TeamMember || mongoose.model("TeamMember", teamMemberSchema);

export default TeamMember;
