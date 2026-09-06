const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: "store_settings", unique: true },
  
  // Store General Info
  storeName: { type: String, default: "BloomShop" },
  storeTagline: { type: String, default: "Premium Footwear & Streetwear Lifestyle" },
  supportEmail: { type: String, default: "support@bloomshop.com" },
  supportPhone: { type: String, default: "+92 347 6722423" },
  storeAddress: { type: String, default: "Shabqadar Charsadda, Peshawar, Pakistan" },
  currency: { type: String, default: "USD ($)" },
  currencySymbol: { type: String, default: "$" },
  timezone: { type: String, default: "UTC+05:00 (Pakistan Standard Time)" },

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
