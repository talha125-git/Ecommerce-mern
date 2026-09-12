require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Product = require("./models/Product");

async function exportJson() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find().sort({ createdAt: -1 });
    const filePath = path.join(__dirname, "../frontend/src/data/products.json");
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf-8");
    console.log(`Synced ${products.length} products to products.json successfully!`);
    process.exit(0);
  } catch (err) {
    console.error("Export error:", err);
    process.exit(1);
  }
}
exportJson();
