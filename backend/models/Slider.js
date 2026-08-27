const mongoose = require("mongoose");

const SlideItemSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.Mixed },
  tag: { type: String, default: "" },
  tagIcon: { type: String, default: "Sparkles" },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  badge: { type: String, default: "" },
  bgGradient: { type: String, default: "from-orange-600/90 via-amber-600/80 to-stone-900" },
  image: { type: String, default: "" },
  accentColor: { type: String, default: "bg-orange-500" },
});

const SliderSchema = new mongoose.Schema({
  key: { type: String, default: "hero_slider", unique: true },
  slides: [SlideItemSchema],
  updatedAt: { type: Date, default: Date.now }
});

const SliderModel = mongoose.model("sliders", SliderSchema);
module.exports = SliderModel;
