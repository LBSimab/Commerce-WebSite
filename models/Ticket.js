import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    // Who sent this reply: 'user' or 'admin'
    sender: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // If sender is a logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Name shown for this reply
    senderName: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const ticketSchema = new mongoose.Schema(
  {
    // Logged-in user (optional — guests don't have one)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // For guests: name and email
    name: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    // Ticket details
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    // Optional: link to an order
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    // Status
    status: {
      type: String,
      enum: ["open", "replied", "closed"],
      default: "open",
    },
    // All replies to this ticket
    replies: [replySchema],
    // Public access token for guest tickets
    // Guests use this to view their ticket without logging in
    accessToken: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  },
);

// Generate an access token for guest tickets
ticketSchema.pre("save", function () {
  if (!this.user && !this.accessToken) {
    this.accessToken =
      "ticket-" +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36);
  }
});

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

export default Ticket;
