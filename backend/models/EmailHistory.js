const mongoose = require("mongoose");

const RecipientSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
    },
    sentAt: {
      type: Date,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const EmailHistorySchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    heading: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      trim: true,
      default: "",
    },
    buttonLink: {
      type: String,
      trim: true,
      default: "",
    },
    emailType: {
      type: String,
      enum: ["broadcast", "product_alert", "newsletter", "custom"],
      default: "broadcast",
    },
    sender: {
      type: String,
      default: "BloomShop",
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending", "partial"],
      default: "pending",
    },
    totalRecipients: {
      type: Number,
      default: 0,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    pendingCount: {
      type: Number,
      default: 0,
    },
    recipients: [RecipientSchema],
    errorMessage: {
      type: String,
      default: null,
    },
    targetAudience: {
      type: String,
      default: "All Subscribers",
    },
  },
  {
    timestamps: true,
  }
);

EmailHistorySchema.index({ createdAt: -1 });
EmailHistorySchema.index({ "recipients.email": 1 });
EmailHistorySchema.index({ status: 1 });

const EmailHistoryModel = mongoose.model("emailHistory", EmailHistorySchema);

module.exports = EmailHistoryModel;
