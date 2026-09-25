import { useState, useEffect } from "react";
import axios from "axios";
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Save,
  Grid,
  Zap,
  Smile,
  Sparkles,
  Activity,
  Compass,
  Shield,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  X,
  Layers,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Camera,
  ExternalLink,
} from "lucide-react";

// ═════════════════════════════════════════════════════════════════════════
// ADMIN CATEGORY & SUBCATEGORY MANAGEMENT (WITH DYNAMIC PICTURES)
// ═════════════════════════════════════════════════════════════════════════
// 1. DYNAMIC SUBCATEGORIES WITH PICTURES:
//    - Add, edit, or remove subcategories under any category.
//    - Attach custom high-res pictures to each subcategory (upload, preset, or URL).
//    - Subcategory picture, subtitle, and badges immediately appear in the
//      Header mega menu dropdown, Shop page filters, and Product editor.
// 2. CENTRAL SOURCE OF TRUTH:
//    - Saves to MongoDB (/api/categories), updates localStorage ("cached_categories"),
//      and dispatches "categories-updated" event for instant real-time live preview.
// ═════════════════════════════════════════════════════════════════════════

export const SAMPLE_FOOTWEAR_IMAGES = [
  { label: "Red Runner", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop" },
  { label: "White Casual", url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&auto=format&fit=crop" },
  { label: "Leather Loafer", url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=300&auto=format&fit=crop" },
  { label: "Gym Trainer", url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&auto=format&fit=crop" },
  { label: "Walking Shoe", url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&auto=format&fit=crop" },
  { label: "High-Top", url: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=300&auto=format&fit=crop" },
  { label: "Black Uniform", url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=300&auto=format&fit=crop" },
  { label: "Flats & Pumps", url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&auto=format&fit=crop" },
  { label: "Chunky Sole", url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&auto=format&fit=crop" },
  { label: "Kids Sneaker", url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop" },
  { label: "Shoe Care", url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop" },
  { label: "Wide Comfort", url: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=300&auto=format&fit=crop" },
];

const BADGE_OPTIONS = ["", "POPULAR", "HOT", "NEW", "TOP PICK", "SALE", "BEST", "APPROVED", "EASY WEAR"];

export const normalizeSub = (sub) => {
  if (!sub) return { name: "", image: "", subtitle: "", badge: "" };
  if (typeof sub === "string") {
    return { name: sub, image: "", subtitle: "", badge: "" };
  }
  return {
    name: sub.name || "",
    image: sub.image || "",
    subtitle: sub.subtitle || "",
    badge: sub.badge || "",
  };
};

export const getSubName = (sub) => {
  if (!sub) return "";
  if (typeof sub === "string") return sub;
  return sub.name || "";
};

const DEFAULT_CATEGORIES = [
  {
    id: "all",
    name: "All",
    slug: "all",
    active: true,
    isDefault: true,
    icon: "Grid",
    description: "All available products catalog",
    subcategories: [],
  },
  {
    id: "new-arrivals",
    name: "New Arrivals",
    slug: "new-arrivals",
    active: true,
    isDefault: true,
    icon: "Sparkles",
    description: "Fresh drops, new releases, trending styles, and best sellers",
    subcategories: [
      { name: "New Releases", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop", subtitle: "Fresh 2026 Drops", badge: "NEW" },
      { name: "Trending Now", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&auto=format&fit=crop", subtitle: "Most Wanted Styles", badge: "HOT" },
      { name: "Best Sellers", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&auto=format&fit=crop", subtitle: "Top Rated Favorites", badge: "POPULAR" },
      { name: "Men's New In", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&auto=format&fit=crop", subtitle: "Performance & Comfort", badge: "" },
      { name: "Women's New In", image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop", subtitle: "Chic & Cloud Comfort", badge: "" },
      { name: "Kids' New In", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop", subtitle: "Durable & Play-Ready", badge: "" },
    ],
  },
  {
    id: "men",
    name: "Men",
    slug: "men",
    active: true,
    isDefault: true,
    icon: "Tag",
    description: "Men's performance running, casual sneakers, formal loafers, and gym trainers",
    subcategories: [
      { name: "Running Shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop", subtitle: "High-Mileage Cushion", badge: "POPULAR" },
      { name: "Casual Sneakers", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&auto=format&fit=crop", subtitle: "Everyday Streetwear", badge: "" },
      { name: "Formal Loafers", image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=300&auto=format&fit=crop", subtitle: "Handcrafted Cowhide", badge: "" },
      { name: "Gym & Training", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&auto=format&fit=crop", subtitle: "Stability & Agility", badge: "" },
      { name: "Daily Walking", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&auto=format&fit=crop", subtitle: "Office & Commute", badge: "" },
      { name: "Wide-Fit Shoes", image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=300&auto=format&fit=crop", subtitle: "Pressure-Free Room", badge: "" },
    ],
  },
  {
    id: "women",
    name: "Women",
    slug: "women",
    active: true,
    isDefault: true,
    icon: "Sparkles",
    description: "Women's daily sneakers, running shoes, flats, yoga studio, platform soles, and cloud comfort",
    subcategories: [
      { name: "Daily Sneakers", image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop", subtitle: "Featherlight Ease", badge: "HOT" },
      { name: "Running Shoes", image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=300&auto=format&fit=crop", subtitle: "Arch Support & Energy", badge: "" },
      { name: "Flats & Pumps", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&auto=format&fit=crop", subtitle: "Memory-Foam Insole", badge: "" },
      { name: "Studio & Yoga", image: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=300&auto=format&fit=crop", subtitle: "Barefoot Flexibility", badge: "" },
      { name: "Platform Soles", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&auto=format&fit=crop", subtitle: "Chunky 90s Platform", badge: "NEW" },
      { name: "Cloud Comfort", image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=300&auto=format&fit=crop", subtitle: "All-Day Plush Relief", badge: "" },
    ],
  },
  {
    id: "kids",
    name: "Kids",
    slug: "kids",
    active: true,
    isDefault: true,
    icon: "Smile",
    description: "Kids' boys & girls sneakers, light-up LED soles, toddlers, juniors, and velcro straps",
    subcategories: [
      { name: "Boys Sneakers", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop", subtitle: "Active & Anti-Scuff", badge: "POPULAR" },
      { name: "Girls Sneakers", image: "https://images.unsplash.com/photo-1507464098880-e367bc5d2c08?w=300&auto=format&fit=crop", subtitle: "Glitter & Cushioned", badge: "CUTE" },
      { name: "Light-Up Soles", image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=300&auto=format&fit=crop", subtitle: "Flashing LED Action", badge: "HOT" },
      { name: "Toddlers (22–27)", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop", subtitle: "Soft Rubber Soles", badge: "EASY WEAR" },
      { name: "Juniors (28–35)", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&auto=format&fit=crop", subtitle: "School & Play Durability", badge: "" },
      { name: "Velcro Straps", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&auto=format&fit=crop", subtitle: "Dual Secure Fastening", badge: "EASY" },
    ],
  },
  {
    id: "accessories",
    name: "Accessories",
    slug: "accessories",
    active: true,
    isDefault: true,
    icon: "Compass",
    description: "Shoe care foam cleaner, water shield spray, brush, memory insoles, socks, and laces",
    subcategories: [
      { name: "Foam Cleaner", image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop", subtitle: "Instant Stain Remover", badge: "BEST" },
      { name: "Water Shield", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&auto=format&fit=crop", subtitle: "Rain & Stain Repellent", badge: "TOP PICK" },
      { name: "Cleaning Brush", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop", subtitle: "Premium Horsehair Bristles", badge: "" },
      { name: "Memory Insoles", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&auto=format&fit=crop", subtitle: "Gel Cushioning Arch Support", badge: "POPULAR" },
      { name: "Cushioned Socks", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&auto=format&fit=crop", subtitle: "Breathable Combed Cotton 3-Pack", badge: "" },
      { name: "Shoe Laces", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop", subtitle: "Waxed Flat Replacement Laces", badge: "" },
    ],
  },
  {
    id: "school-shoes",
    name: "School Shoes",
    slug: "school-shoes",
    active: true,
    isDefault: true,
    icon: "Shield",
    description: "Uniform approved black leather, girls strap shoes, white PT shoes, velcro, and non-marking soles",
    subcategories: [
      { name: "Black Uniform", image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=300&auto=format&fit=crop", subtitle: "Polishable Action Leather", badge: "TOP PICK" },
      { name: "Girls Strap Shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&auto=format&fit=crop", subtitle: "Mary Jane Velcro Strap", badge: "APPROVED" },
      { name: "White PT Shoes", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&auto=format&fit=crop", subtitle: "Morning Assembly Shoes", badge: "MUST HAVE" },
      { name: "Velcro Strap", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop", subtitle: "Quick On/Off Security", badge: "EASY WEAR" },
      { name: "Genuine Leather", image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=300&auto=format&fit=crop", subtitle: "Durable Oxford Cowhide", badge: "" },
      { name: "Non-Marking Soles", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop", subtitle: "Indoor Court Safe Rubber", badge: "" },
    ],
  },
];

const ICON_MAP = {
  Grid: Grid,
  Zap: Zap,
  Smile: Smile,
  Sparkles: Sparkles,
  Activity: Activity,
  Compass: Compass,
  Shield: Shield,
  Dumbbell: Dumbbell,
  Tag: Tag,
};

export default function CategoryTab() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [searchFilter, setSearchFilter] = useState("");

  // Inline subcategory input per category card { [categoryId]: "input text" }
  const [quickSubInputs, setQuickSubInputs] = useState({});

  // Category Add / Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "Tag",
    subcategories: [],
  });
  const [modalSubInput, setModalSubInput] = useState("");
  const [bulkSubInput, setBulkSubInput] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Dedicated Subcategory Modal State (for Adding or Editing Subcategory with Picture)
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subModalTargetCatId, setSubModalTargetCatId] = useState("");
  const [editingSubIdx, setEditingSubIdx] = useState(null); // null = adding new, number = editing
  const [subFormData, setSubFormData] = useState({
    name: "",
    image: SAMPLE_FOOTWEAR_IMAGES[0].url,
    subtitle: "",
    badge: "",
  });
  const [subImageTab, setSubImageTab] = useState("preset"); // "preset" | "upload" | "url"
  const [uploadingSubImage, setUploadingSubImage] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "";

  // Fetch initial categories from Backend
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      if (res.data && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
        setCategories(res.data.categories);
        try {
          localStorage.setItem("cached_categories", JSON.stringify(res.data.categories));
        } catch (e) {}
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (err) {
      console.warn("Could not fetch categories from server, using default list:", err);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 4500);
  };

  // Centralized persistent save function that syncs with database & localStorage
  const persistCategories = async (updatedCategories, successMessage) => {
    setSaving(true);
    try {
      const res = await axios.post(`${API_URL}/api/categories`, { categories: updatedCategories });
      const savedList = res.data?.categories || updatedCategories;
      setCategories(savedList);
      try {
        localStorage.setItem("cached_categories", JSON.stringify(savedList));
        window.dispatchEvent(new CustomEvent("categories-updated", { detail: savedList }));
      } catch (e) {}

      if (successMessage) {
        showStatus("success", successMessage);
      }
      return savedList;
    } catch (err) {
      console.error("Save error:", err);
      showStatus("error", "❌ Failed to save categories to server: " + (err.response?.data?.message || err.message));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Toggle Category Active status (auto-saves to DB)
  const handleToggleActive = async (id) => {
    const updated = categories.map((cat) =>
      cat.id === id ? { ...cat, active: !cat.active } : cat
    );
    const targetCat = updated.find((c) => c.id === id);
    try {
      await persistCategories(
        updated,
        `Category "${targetCat?.name}" is now ${targetCat?.active ? "Active" : "Hidden"}!`
      );
    } catch (e) {}
  };

  // Delete Category (auto-saves to DB)
  const handleDelete = async (id) => {
    if (id === "all") {
      showStatus("error", "The 'All' category is a system default and cannot be deleted.");
      return;
    }

    const catToDelete = categories.find((c) => c.id === id);
    if (!window.confirm(`Are you sure you want to delete category "${catToDelete?.name || id}"?`)) {
      return;
    }

    const updated = categories.filter((cat) => cat.id !== id);
    try {
      await persistCategories(updated, `Category "${catToDelete?.name || id}" deleted successfully!`);
    } catch (e) {}
  };

  // ═════════════════════════════════════════════════════════════════════════
  // SUBCATEGORY MANAGEMENT WITH PICTURE MODAL
  // ═════════════════════════════════════════════════════════════════════════

  // Open modal to add a brand new subcategory with picture
  const openAddSubModal = (catId) => {
    const targetCat = categories.find((c) => c.id === catId);
    setSubModalTargetCatId(catId);
    setEditingSubIdx(null);
    setSubFormData({
      name: "",
      image: SAMPLE_FOOTWEAR_IMAGES[0].url,
      subtitle: targetCat ? `${targetCat.name} Footwear` : "",
      badge: "",
    });
    setSubImageTab("preset");
    setSubModalOpen(true);
  };

  // Open modal to edit an existing subcategory (modify its picture, name, subtitle, or badge)
  const openEditSubModal = (catId, subItem, idx) => {
    const norm = normalizeSub(subItem);
    setSubModalTargetCatId(catId);
    setEditingSubIdx(idx);
    setSubFormData({
      name: norm.name,
      image: norm.image || SAMPLE_FOOTWEAR_IMAGES[idx % SAMPLE_FOOTWEAR_IMAGES.length].url,
      subtitle: norm.subtitle,
      badge: norm.badge,
    });
    setSubImageTab(
      norm.image && norm.image.startsWith("data:")
        ? "upload"
        : norm.image && !SAMPLE_FOOTWEAR_IMAGES.some((s) => s.url === norm.image)
        ? "url"
        : "preset"
    );
    setSubModalOpen(true);
  };

  // Handle local file upload for subcategory picture
  const handleSubFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showStatus("error", "Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    setUploadingSubImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const res = await axios.post(`${API_URL}/api/upload-product-image`, {
          imageBase64: base64Data,
        });
        const finalUrl = res.data?.url || base64Data;
        setSubFormData((prev) => ({ ...prev, image: finalUrl }));
        showStatus("success", "Subcategory picture attached!");
      } catch (uploadErr) {
        console.warn("Upload fallback to base64:", uploadErr);
        setSubFormData((prev) => ({ ...prev, image: base64Data }));
        showStatus("success", "Subcategory picture attached locally!");
      } finally {
        setUploadingSubImage(false);
      }
    };
    reader.onerror = () => {
      setUploadingSubImage(false);
      showStatus("error", "Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  // Save subcategory from SubcategoryModal (Add or Edit)
  const handleSaveSubModal = async (e) => {
    if (e) e.preventDefault();
    const cleanName = subFormData.name.trim();
    if (!cleanName) {
      showStatus("error", "Subcategory name is required.");
      return;
    }

    const cat = categories.find((c) => c.id === subModalTargetCatId);
    if (!cat) return;

    const existingSubs = Array.isArray(cat.subcategories) ? [...cat.subcategories] : [];

    const newSubObj = {
      name: cleanName,
      image: subFormData.image.trim() || SAMPLE_FOOTWEAR_IMAGES[0].url,
      subtitle: subFormData.subtitle.trim(),
      badge: subFormData.badge.trim(),
    };

    let updatedSubs;
    if (editingSubIdx !== null && editingSubIdx >= 0) {
      // Editing existing subcategory at index
      updatedSubs = existingSubs.map((item, idx) => (idx === editingSubIdx ? newSubObj : item));
    } else {
      // Check duplicate name
      if (existingSubs.some((s) => getSubName(s).toLowerCase() === cleanName.toLowerCase())) {
        showStatus("error", `Subcategory "${cleanName}" already exists in ${cat.name}.`);
        return;
      }
      updatedSubs = [...existingSubs, newSubObj];
    }

    const updatedCategories = categories.map((c) =>
      c.id === subModalTargetCatId ? { ...c, subcategories: updatedSubs } : c
    );

    try {
      await persistCategories(
        updatedCategories,
        editingSubIdx !== null
          ? `✅ Updated subcategory "${cleanName}" with picture in ${cat.name}!`
          : `✅ Added subcategory "${cleanName}" with picture to ${cat.name}!`
      );
      setSubModalOpen(false);
    } catch (err) {}
  };

  // Quick Add Subcategory directly from card (auto-saves with an auto footwear picture)
  const handleQuickAddSubcategory = async (catId) => {
    const subName = (quickSubInputs[catId] || "").trim();
    if (!subName) return;

    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;

    const existingSubs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
    if (existingSubs.some((s) => getSubName(s).toLowerCase() === subName.toLowerCase())) {
      showStatus("error", `Subcategory "${subName}" already exists in ${cat.name}.`);
      return;
    }

    // Assign automatic sample footwear image
    const presetImg =
      SAMPLE_FOOTWEAR_IMAGES[existingSubs.length % SAMPLE_FOOTWEAR_IMAGES.length].url;

    const newSubObj = {
      name: subName,
      image: presetImg,
      subtitle: `${cat.name} Style`,
      badge: "",
    };

    const updated = categories.map((c) =>
      c.id === catId ? { ...c, subcategories: [...existingSubs, newSubObj] } : c
    );

    try {
      await persistCategories(updated, `✅ Added "${subName}" to ${cat.name}!`);
      setQuickSubInputs((prev) => ({ ...prev, [catId]: "" }));
    } catch (e) {}
  };

  // Quick Remove Subcategory directly from card (auto-saves to DB)
  const handleQuickRemoveSubcategory = async (catId, subNameToRemove) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;

    const updated = categories.map((c) => {
      if (c.id === catId) {
        return {
          ...c,
          subcategories: (c.subcategories || []).filter(
            (s) => getSubName(s).toLowerCase() !== subNameToRemove.toLowerCase()
          ),
        };
      }
      return c;
    });

    try {
      await persistCategories(updated, `Removed "${subNameToRemove}" from ${cat.name}!`);
    } catch (e) {}
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (window.confirm("Are you sure you want to reset all categories to default setup?")) {
      setSaving(true);
      try {
        const res = await axios.post(`${API_URL}/api/categories/reset`);
        if (res.data && res.data.categories) {
          setCategories(res.data.categories);
          try {
            localStorage.setItem("cached_categories", JSON.stringify(res.data.categories));
            window.dispatchEvent(new CustomEvent("categories-updated", { detail: res.data.categories }));
          } catch (e) {}
          showStatus("success", "Categories reset to default list successfully!");
        }
      } catch (err) {
        console.error("Reset error:", err);
        setCategories(DEFAULT_CATEGORIES);
        showStatus("success", "Categories reset to defaults locally.");
      } finally {
        setSaving(false);
      }
    }
  };

  // Open Add Category Modal
  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "Tag",
      subcategories: [],
    });
    setModalSubInput("");
    setBulkSubInput("");
    setShowBulkInput(false);
    setIsAddModalOpen(true);
  };

  // Open Edit Category Modal
  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug || "",
      description: cat.description || "",
      icon: cat.icon || "Tag",
      subcategories: Array.isArray(cat.subcategories) ? [...cat.subcategories] : [],
    });
    setModalSubInput("");
    setBulkSubInput("");
    setShowBulkInput(false);
    setIsAddModalOpen(true);
  };

  // Add Subcategory inside Category Modal
  const handleModalAddSub = (e) => {
    if (e) e.preventDefault();
    const clean = modalSubInput.trim();
    if (!clean) return;

    if (!formData.subcategories.some((s) => getSubName(s).toLowerCase() === clean.toLowerCase())) {
      const presetImg =
        SAMPLE_FOOTWEAR_IMAGES[formData.subcategories.length % SAMPLE_FOOTWEAR_IMAGES.length].url;
      setFormData((prev) => ({
        ...prev,
        subcategories: [
          ...prev.subcategories,
          {
            name: clean,
            image: presetImg,
            subtitle: `${formData.name || "Footwear"} Style`,
            badge: "",
          },
        ],
      }));
    }
    setModalSubInput("");
  };

  // Remove Subcategory inside Category Modal
  const handleModalRemoveSub = (subToRemove) => {
    const targetName = getSubName(subToRemove).toLowerCase();
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((s) => getSubName(s).toLowerCase() !== targetName),
    }));
  };

  // Bulk Add Subcategories from comma-separated string
  const handleBulkAddSubs = () => {
    if (!bulkSubInput.trim()) return;
    const parsed = bulkSubInput
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    setFormData((prev) => {
      const existing = new Set(prev.subcategories.map((s) => getSubName(s).toLowerCase()));
      const toAdd = parsed
        .filter((s) => !existing.has(s.toLowerCase()))
        .map((name, idx) => ({
          name,
          image: SAMPLE_FOOTWEAR_IMAGES[(prev.subcategories.length + idx) % SAMPLE_FOOTWEAR_IMAGES.length].url,
          subtitle: `${prev.name || "Store"} Style`,
          badge: "",
        }));

      return {
        ...prev,
        subcategories: [...prev.subcategories, ...toAdd],
      };
    });
    setBulkSubInput("");
    setShowBulkInput(false);
  };

  // Save Category Modal Form (Create or Edit)
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const computedSlug =
      formData.slug.trim() ||
      formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    let updatedList;
    if (editingCategory) {
      // Edit existing
      updatedList = categories.map((cat) =>
        cat.id === editingCategory.id
          ? {
              ...cat,
              name: formData.name.trim(),
              slug: computedSlug,
              description: formData.description,
              icon: formData.icon,
              subcategories: formData.subcategories,
            }
          : cat
      );
    } else {
      // Create new category
      const newId = computedSlug + "-" + Date.now().toString().slice(-4);
      const newCat = {
        id: newId,
        name: formData.name.trim(),
        slug: computedSlug,
        active: true,
        isDefault: false,
        icon: formData.icon,
        description: formData.description,
        subcategories: formData.subcategories,
      };
      updatedList = [...categories, newCat];
    }

    try {
      await persistCategories(
        updatedList,
        editingCategory
          ? `✅ Category "${formData.name}" updated successfully in database!`
          : `✅ New category "${formData.name}" added successfully to database!`
      );
      setIsAddModalOpen(false);
    } catch (e) {}
  };

  // Explicit Manual Save
  const handleManualSave = async () => {
    try {
      await persistCategories(categories, "✅ Store categories and subcategories saved successfully!");
    } catch (e) {}
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const targetCategoryForSubModal = categories.find((c) => c.id === subModalTargetCatId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Tag className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-gray-900">Category & Subcategory Management</h1>
          </div>
          <p className="text-xs text-gray-500 max-w-xl">
            Configure dynamic store categories and subcategories with custom footwear pictures. When you add a subcategory with a picture, it immediately appears in the navigation dropdown and live storefront!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleResetDefaults}
            disabled={saving}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Category</span>
          </button>

          <button
            onClick={handleManualSave}
            disabled={saving}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving..." : "Save All"}</span>
          </button>
        </div>
      </div>

      {/* Alert Status Banner */}
      {statusMsg.text && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top duration-200 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        </div>
      )}

      {/* Dynamic Storefront Preview Pill Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Live Storefront Navigation Preview
            </h3>
          </div>
          <span className="text-[10px] bg-slate-800 text-gray-400 px-2.5 py-0.5 rounded-full font-bold">
            {categories.filter((c) => c.active).length} Active Categories
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {categories
            .filter((cat) => cat.active)
            .map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || Tag;
              const subCount = Array.isArray(cat.subcategories) ? cat.subcategories.length : 0;
              return (
                <div
                  key={cat.id}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 whitespace-nowrap border border-slate-700 shadow-xs"
                >
                  <IconComp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{cat.name}</span>
                  {subCount > 0 && (
                    <span className="text-[10px] bg-slate-700 text-emerald-300 px-1.5 py-0.2 rounded-full">
                      {subCount} subs
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{filteredCategories.length}</span> of{" "}
          <span className="font-bold text-gray-900">{categories.length}</span> categories
        </div>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-500">Loading store categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => {
            const IconComp = ICON_MAP[cat.icon] || Tag;
            const subList = Array.isArray(cat.subcategories) ? cat.subcategories : [];
            const quickInputVal = quickSubInputs[cat.id] || "";

            return (
              <div
                key={cat.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 ${
                  cat.active
                    ? "border-gray-200 hover:border-emerald-500/50 hover:shadow-md"
                    : "border-gray-200 bg-gray-50/50 opacity-60"
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center">
                        <IconComp className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-base">{cat.name}</h3>
                          {cat.isDefault && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-extrabold">
                              Default
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">slug: {cat.slug}</span>
                      </div>
                    </div>

                    {/* Active Status Badge Button */}
                    <button
                      onClick={() => handleToggleActive(cat.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                        cat.active
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                      title="Click to toggle category status"
                    >
                      {cat.active ? (
                        <>
                          <Eye className="w-3 h-3 text-emerald-600" /> Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-gray-500" /> Hidden
                        </>
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {cat.description || "No description provided."}
                  </p>

                  {/* Subcategories Management Section */}
                  <div className="pt-3 border-t border-gray-100 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Subcategories ({subList.length})</span>
                      </span>

                      {/* Prominent "+ Add with Picture" button */}
                      <button
                        type="button"
                        onClick={() => openAddSubModal(cat.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-200/80 transition cursor-pointer"
                        title="Add subcategory with image, subtitle, and badge"
                      >
                        <Camera className="w-3 h-3 text-emerald-600" />
                        <span>+ Add with Picture</span>
                      </button>
                    </div>

                    {/* Subcategories Pill List with Picture Thumbnail, Edit, and Delete */}
                    <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                      {subList.length === 0 ? (
                        <span className="text-[11px] text-gray-400 italic">
                          No subcategories added yet. Click "+ Add with Picture" above.
                        </span>
                      ) : (
                        subList.map((sub, sIdx) => {
                          const norm = normalizeSub(sub);
                          const thumbUrl =
                            norm.image ||
                            SAMPLE_FOOTWEAR_IMAGES[sIdx % SAMPLE_FOOTWEAR_IMAGES.length].url;

                          return (
                            <span
                              key={sIdx}
                              className="group/pill inline-flex items-center gap-1.5 pl-1 pr-1.5 py-1 bg-white hover:bg-emerald-50/80 text-gray-800 rounded-xl text-[11px] font-medium border border-gray-200 hover:border-emerald-300 transition shadow-2xs"
                            >
                              {/* Subcategory Thumbnail Image */}
                              <img
                                src={thumbUrl}
                                alt={norm.name}
                                className="w-5 h-5 rounded-md object-cover border border-gray-100 shrink-0 bg-gray-100"
                                onError={(e) => {
                                  e.target.src = SAMPLE_FOOTWEAR_IMAGES[0].url;
                                }}
                              />

                              <span className="font-semibold text-gray-900 max-w-[130px] truncate">
                                {norm.name}
                              </span>

                              {norm.badge && (
                                <span className="text-[8px] font-black px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-md tracking-wider">
                                  {norm.badge}
                                </span>
                              )}

                              {/* Edit Subcategory (Picture/Details) */}
                              <button
                                type="button"
                                onClick={() => openEditSubModal(cat.id, sub, sIdx)}
                                className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-100/60 rounded-md p-0.5 transition cursor-pointer"
                                title={`Edit picture and details for "${norm.name}"`}
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>

                              {/* Delete Subcategory */}
                              <button
                                type="button"
                                onClick={() => handleQuickRemoveSubcategory(cat.id, norm.name)}
                                className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md p-0.5 transition cursor-pointer"
                                title={`Delete subcategory "${norm.name}"`}
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          );
                        })
                      )}
                    </div>

                    {/* Quick Add Subcategory Inline Input */}
                    <div className="pt-2 flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Quick add subcategory name..."
                        value={quickInputVal}
                        onChange={(e) =>
                          setQuickSubInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleQuickAddSubcategory(cat.id);
                          }
                        }}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuickAddSubcategory(cat.id)}
                        disabled={!quickInputVal.trim()}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                      >
                        + Add
                      </button>
                      <button
                        type="button"
                        onClick={() => openAddSubModal(cat.id)}
                        className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                        title="Add with custom picture"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">ID: {cat.id}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                      title="Edit Category & Subcategories"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {cat.id !== "all" && (
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* DEDICATED SUBCATEGORY MODAL (WITH PICTURE SELECTION & PREVIEW)   */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {subModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 border border-gray-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Camera className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">
                    {editingSubIdx !== null ? "Edit Subcategory & Picture" : "Add Subcategory with Picture"}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Category:{" "}
                    <span className="font-bold text-gray-700">
                      {targetCategoryForSubModal?.name || subModalTargetCatId}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubModal} className="space-y-4">
              {/* Category Target Selector (if admin wants to switch) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Target Category
                </label>
                <select
                  value={subModalTargetCatId}
                  onChange={(e) => setSubModalTargetCatId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 cursor-pointer"
                >
                  {categories
                    .filter((c) => c.active !== false && c.id !== "all")
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Subcategory Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subcategory Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Running Shoes, Loafers, White PT Shoes"
                  value={subFormData.name}
                  onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Subtitle / Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subtitle <span className="text-gray-400 font-normal">(shown in mega menu)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. High-Mileage Cushion, Everyday Streetwear"
                  value={subFormData.subtitle}
                  onChange={(e) => setSubFormData({ ...subFormData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Badge Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Badge Tag <span className="text-gray-400 font-normal">(optional highlight)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BADGE_OPTIONS.map((badge) => (
                    <button
                      type="button"
                      key={badge || "none"}
                      onClick={() => setSubFormData({ ...subFormData, badge })}
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition cursor-pointer ${
                        subFormData.badge === badge
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {badge || "None"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Subcategory Picture Section ── */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800">
                    Subcategory Picture <span className="text-rose-500">*</span>
                  </label>
                  {/* Picture Source Tabs */}
                  <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setSubImageTab("preset")}
                      className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                        subImageTab === "preset"
                          ? "bg-white text-gray-900 shadow-2xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Footwear Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubImageTab("upload")}
                      className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                        subImageTab === "upload"
                          ? "bg-white text-gray-900 shadow-2xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubImageTab("url")}
                      className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                        subImageTab === "url"
                          ? "bg-white text-gray-900 shadow-2xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Tab 1: Preset Gallery of Footwear Photos */}
                {subImageTab === "preset" && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400">
                      Click any photo to instantly assign it to this subcategory:
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 bg-gray-50 rounded-2xl border border-gray-200">
                      {SAMPLE_FOOTWEAR_IMAGES.map((img, i) => {
                        const isSelected = subFormData.image === img.url;
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setSubFormData({ ...subFormData, image: img.url })}
                            className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition cursor-pointer ${
                              isSelected
                                ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={img.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
                                <Check className="w-2.5 h-2.5 stroke-3" />
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[8px] text-white text-center font-bold truncate px-1">
                              {img.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab 2: Upload File */}
                {subImageTab === "upload" && (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl bg-gray-50 hover:bg-emerald-50/20 transition cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-700">
                        {uploadingSubImage ? "Uploading image..." : "Click or drag to upload shoe picture"}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        PNG, JPG, or WEBP supported
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSubFileUpload}
                        disabled={uploadingSubImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Tab 3: URL Input */}
                {subImageTab === "url" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <LinkIcon className="w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={subFormData.image}
                        onChange={(e) => setSubFormData({ ...subFormData, image: e.target.value })}
                        className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                )}

                {/* Live Mega Menu Preview of Subcategory Card */}
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Navigation Mega Menu Live Preview</span>
                    <span className="text-emerald-400 font-mono">100% Dynamic</span>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-700 shrink-0 border border-slate-600 shadow-2xs">
                      <img
                        src={subFormData.image || SAMPLE_FOOTWEAR_IMAGES[0].url}
                        alt="Preview"
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.target.src = SAMPLE_FOOTWEAR_IMAGES[0].url;
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">
                          {subFormData.name || "Subcategory Name"}
                        </span>
                        {subFormData.badge && (
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full uppercase tracking-wider shrink-0">
                            {subFormData.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate">
                        {subFormData.subtitle || `${targetCategoryForSubModal?.name || "Store"} Footwear`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingSubImage}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>
                    {editingSubIdx !== null ? "Save Changes" : "Add Subcategory with Picture"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ADD / EDIT CATEGORY MODAL                                       */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>{editingCategory ? "Edit Category & Subcategories" : "Add New Category"}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basketball, Boots, Limited Edition"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    setFormData({
                      ...formData,
                      name,
                      slug: editingCategory ? formData.slug : autoSlug,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. basketball, boots"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short summary for this collection..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Interactive Subcategories Manager */}
              <div className="space-y-2.5 border border-gray-200 rounded-2xl p-3.5 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800">
                    Subcategories ({formData.subcategories.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowBulkInput(!showBulkInput)}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer"
                  >
                    {showBulkInput ? "Hide Bulk Input" : "+ Paste Multiple"}
                  </button>
                </div>

                {/* Subcategory Pills with Pictures */}
                <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-white rounded-xl border border-gray-200 max-h-44 overflow-y-auto">
                  {formData.subcategories.length === 0 ? (
                    <span className="text-[11px] text-gray-400 italic">
                      No subcategories added yet. Type below and click "+ Add".
                    </span>
                  ) : (
                    formData.subcategories.map((sub, idx) => {
                      const norm = normalizeSub(sub);
                      const thumb =
                        norm.image ||
                        SAMPLE_FOOTWEAR_IMAGES[idx % SAMPLE_FOOTWEAR_IMAGES.length].url;
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 pl-1 pr-1.5 py-1 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-bold border border-emerald-200 shadow-2xs"
                        >
                          <img
                            src={thumb}
                            alt={norm.name}
                            className="w-4 h-4 rounded-md object-cover"
                          />
                          <span>{norm.name}</span>
                          <button
                            type="button"
                            onClick={() => handleModalRemoveSub(sub)}
                            className="hover:text-rose-600 rounded-full p-0.5 cursor-pointer ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>

                {/* Add Subcategory Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="New subcategory name..."
                    value={modalSubInput}
                    onChange={(e) => setModalSubInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleModalAddSub();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleModalAddSub}
                    disabled={!modalSubInput.trim()}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {/* Bulk Import Box */}
                {showBulkInput && (
                  <div className="pt-2 space-y-2 border-t border-gray-200 mt-2">
                    <p className="text-[10px] text-gray-500">
                      Paste subcategories separated by commas or new lines:
                    </p>
                    <textarea
                      rows={2}
                      placeholder="e.g. Running Shoes, Casual Sneakers, Formal Loafers"
                      value={bulkSubInput}
                      onChange={(e) => setBulkSubInput(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleBulkAddSubs}
                        disabled={!bulkSubInput.trim()}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-[11px] font-bold rounded-xl transition cursor-pointer"
                      >
                        Add All
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Category Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(ICON_MAP).map((iconKey) => {
                    const IconC = ICON_MAP[iconKey];
                    const isSelected = formData.icon === iconKey;
                    return (
                      <button
                        type="button"
                        key={iconKey}
                        onClick={() => setFormData({ ...formData, icon: iconKey })}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <IconC className="w-4 h-4" />
                        <span className="text-[9px]">{iconKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{editingCategory ? "Update & Save" : "Create & Save"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
