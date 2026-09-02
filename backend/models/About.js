const mongoose = require("mongoose");

const StatItemSchema = new mongoose.Schema({
  label: { type: String, default: "" },
  value: { type: String, default: "" }
});

const FeatureItemSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  color: { type: String, default: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" }
});

const AboutSchema = new mongoose.Schema({
  key: { type: String, default: "about_us_section", unique: true },
  badge: { type: String, default: "About BloomShop" },
  title: { type: String, default: "Where Modern Style Meets Uncompromised Comfort" },
  description: {
    type: String,
    default: "Founded with a passion for elevated footwear, BloomShop merges aesthetic innovation with day-long ergonomic support. We craft shoes for those who walk with confidence."
  },
  subTitle: { type: String, default: "Built for the Street, Designed for the Future" },
  subDescription: {
    type: String,
    default: "Whether you're hitting the pavement, training for your next milestone, or making a sleek fashion statement, our curated sneaker lineup delivers optimum support without compromising on trendsetting design."
  },
  quote: {
    type: String,
    default: "Every stitch is calculated for maximum durability and timeless visual appeal."
  },
  quoteBadge: { type: String, default: "Our Commitment" },
  image: {
    type: String,
    default: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop"
  },
  buttonText: { type: String, default: "Explore Products" },
  bullet1: { type: String, default: "Ethically Sourced Materials" },
  bullet2: { type: String, default: "Rigorous 12-Point Quality Checks" },
  stats: [StatItemSchema],
  features: [FeatureItemSchema],
  updatedAt: { type: Date, default: Date.now }
});

const AboutModel = mongoose.model("about_section", AboutSchema);
module.exports = AboutModel;
