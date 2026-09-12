const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: "Pakistan" },
    },
    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: "card" },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
