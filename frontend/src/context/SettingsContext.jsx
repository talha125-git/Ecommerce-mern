import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const DEFAULT_SETTINGS = {
  storeName: "BloomShop",
  storeTagline: "Premium Footwear & Streetwear Lifestyle",
  logo: "",
  favicon: "/favicon.svg",
  supportEmail: "support@bloomshop.com",
  supportPhone: "+92 347 6722423",
  storeAddress: "Shabqadar Charsadda, Peshawar, Pakistan",
  currency: "USD ($)",
  currencySymbol: "$",
  timezone: "UTC+05:00 (Pakistan Standard Time)",

  // About Us Content
  aboutUsBadge: "About BloomShop",
  aboutUsTitle: "Where Modern Style Meets Uncompromised Comfort",
  aboutUsDescription:
    "Founded with a passion for elevated footwear, BloomShop merges aesthetic innovation with day-long ergonomic support. We craft shoes for those who walk with confidence.",
  aboutUsStory:
    "Whether you're hitting the pavement, training for your next milestone, or making a sleek fashion statement, our curated sneaker lineup delivers optimum support without compromising on trendsetting design.",
  aboutUsImage:
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",

  // Legal Policies
  termsConditions:
    "Welcome to BloomShop. By accessing and using our website, you accept and agree to be bound by these terms and conditions. All orders placed through our website are subject to product availability and acceptance. We reserve the right to cancel or refuse any order for reasons including pricing inaccuracies, product shortages, or suspected unauthorized activity. All returns must be initiated within 30 days of delivery in original condition.",
  privacyPolicy:
    "Your privacy is paramount to us at BloomShop. We collect essential information such as customer name, shipping address, contact phone, and email solely to process orders, communicate tracking updates, and deliver exceptional service. We implement industry-standard 256-bit SSL encryption to safeguard all checkout transactions and never sell or rent your personal data to unauthorized third parties.",

  // Social & Brand Links
  socialInstagram: "https://instagram.com/bloomshop",
  socialFacebook: "https://facebook.com/bloomshop",
  socialTwitter: "https://twitter.com/bloomshop",
  socialWhatsapp: "+923476722423",

  taxRate: 5,
  flatShippingRate: 15,
  freeShippingThreshold: 150,
  enableCOD: true,
  enableCardPayment: true,
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  updateSettings: async () => {},
  refreshSettings: async () => {},
});

const STORAGE_KEY = "bloom_store_settings";

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
      }
    } catch (e) {
      console.warn("Could not read cached settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "";

  // Dynamic Favicon sync with DOM <head>
  useEffect(() => {
    if (settings.favicon) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings.favicon]);

  // Dynamic Document Title sync
  useEffect(() => {
    if (settings.storeName) {
      document.title = settings.storeName;
    }
  }, [settings.storeName]);

  // Fetch settings from backend MongoDB
  const fetchSettings = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/settings`);
      if (res.data?.settings) {
        const merged = { ...DEFAULT_SETTINGS, ...res.data.settings };
        setSettings(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        localStorage.setItem("bloom_admin_settings", JSON.stringify(merged));
      }
    } catch (err) {
      console.warn("Failed to fetch settings from API, using fallback:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save / update settings
  const updateSettings = async (newSettingsData) => {
    try {
      const payload = { ...settings, ...newSettingsData };
      const res = await axios.post(`${API_URL}/api/settings`, payload);
      const saved = res.data?.settings ? { ...DEFAULT_SETTINGS, ...res.data.settings } : payload;
      setSettings(saved);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      localStorage.setItem("bloom_admin_settings", JSON.stringify(saved));
      return { success: true, settings: saved };
    } catch (err) {
      console.error("Failed to save settings to API:", err);
      // Fallback local save
      const fallback = { ...settings, ...newSettingsData };
      setSettings(fallback);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      localStorage.setItem("bloom_admin_settings", JSON.stringify(fallback));
      return { success: false, settings: fallback, error: err };
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
