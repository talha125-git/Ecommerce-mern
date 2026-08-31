const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "store_categories",
      unique: true,
    },
    categories: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        slug: { type: String },
        active: { type: Boolean, default: true },
        isDefault: { type: Boolean, default: false },
        icon: { type: String, default: "Tag" },
        description: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
