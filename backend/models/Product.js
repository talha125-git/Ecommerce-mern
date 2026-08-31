const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    description: { type: String },
    image: { type: String },
    stock: { type: Number, default: 10 },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 24 },
    isNew: { type: Boolean, default: false },
    isHot: { type: Boolean, default: false },
    badge: { type: String, default: "" },
    sizes: { type: Array, default: [7, 8, 9, 10, 11] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
