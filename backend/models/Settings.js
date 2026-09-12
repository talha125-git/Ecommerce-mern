const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: "store_settings", unique: true },
  
  // Store General Info & Brand Identity
  storeName: { type: String, default: "BloomShop" },
  storeTagline: { type: String, default: "Premium Footwear & Streetwear Lifestyle" },
  logo: { type: String, default: "" },
  favicon: { type: String, default: "/favicon.svg" },
  supportEmail: { type: String, default: "support@bloomshop.com" },
  supportPhone: { type: String, default: "+92 347 6722423" },
  storeAddress: { type: String, default: "Shabqadar Charsadda, Peshawar, Pakistan" },
  currency: { type: String, default: "USD ($)" },
  currencySymbol: { type: String, default: "$" },
  timezone: { type: String, default: "UTC+05:00 (Pakistan Standard Time)" },

  // About Us Content
  aboutUsBadge: { type: String, default: "About BloomShop" },
  aboutUsTitle: { type: String, default: "Where Modern Style Meets Uncompromised Comfort" },
  aboutUsDescription: {
    type: String,
    default: "Founded with a passion for elevated footwear, BloomShop merges aesthetic innovation with day-long ergonomic support. We craft shoes for those who walk with confidence."
  },
  aboutUsStory: {
    type: String,
    default: "Whether you're hitting the pavement, training for your next milestone, or making a sleek fashion statement, our curated sneaker lineup delivers optimum support without compromising on trendsetting design."
  },
  aboutUsImage: {
    type: String,
    default: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop"
  },

  // Legal Policies
  termsConditions: {
    type: String,
    default: "Welcome to BloomShop. By accessing and using our website, you accept and agree to be bound by these terms and conditions. All orders placed through our website are subject to product availability and acceptance. We reserve the right to cancel or refuse any order for reasons including pricing inaccuracies, product shortages, or suspected unauthorized activity. All returns must be initiated within 30 days of delivery in original condition."
  },
  privacyPolicy: {
    type: String,
    default: "Your privacy is paramount to us at BloomShop. We collect essential information such as customer name, shipping address, contact phone, and email solely to process orders, communicate tracking updates, and deliver exceptional service. We implement industry-standard 256-bit SSL encryption to safeguard all checkout transactions and never sell or rent your personal data to unauthorized third parties."
  },

  // Admin Profile Info
  adminName: { type: String, default: "Talha (Admin)" },
  adminEmail: { type: String, default: "admin@bloomshop.com" },
  adminRole: { type: String, default: "Super Administrator" },

  // Payment & Financial Settings
  taxRate: { type: Number, default: 5 },
  flatShippingRate: { type: Number, default: 15 },
  freeShippingThreshold: { type: Number, default: 150 },
  enableCOD: { type: Boolean, default: true },
  enableCardPayment: { type: Boolean, default: true },
  enablePaypal: { type: Boolean, default: false },
  enableBankTransfer: { type: Boolean, default: true },

  // Inventory & Order Notifications
  lowStockThreshold: { type: Number, default: 5 },
  orderEmailNotification: { type: Boolean, default: true },
  orderSoundAlert: { type: Boolean, default: true },
  allowBackorders: { type: Boolean, default: false },

  // Social & Brand Links
  socialInstagram: { type: String, default: "https://instagram.com/bloomshop" },
  socialFacebook: { type: String, default: "https://facebook.com/bloomshop" },
  socialTwitter: { type: String, default: "https://twitter.com/bloomshop" },
  socialWhatsapp: { type: String, default: "+923476722423" },

  // System & Maintenance
  maintenanceMode: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

const SettingsModel = mongoose.model("settings", SettingsSchema);
module.exports = SettingsModel;
