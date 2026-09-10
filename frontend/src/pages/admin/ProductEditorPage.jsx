import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Star,
  Sparkles,
  DollarSign,
  Package,
  Layers,
  Check,
  Eye,
  Plus,
  X,
  Loader2,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORIES = [
  "Running",
  "Casual",
  "Retro",
  "Performance",
  "Lifestyle",
  "High Top",
  "Training"
];

const STANDARD_SIZES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13];

export default function ProductEditorPage({ productId: propId, onBack }) {
  const navigate = useNavigate();
  const routeParams = useParams();
  const [searchParams] = useSearchParams();

  // Resolve target product ID from prop, route params, or query string
  const targetId = propId || routeParams.id || searchParams.get("id");
  const isEditing = Boolean(targetId);

  const API_URL = import.meta.env.VITE_API_URL || "";

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Running",
    price: "",
    originalPrice: "",
    description: "",
    image: "",
    images: [],
    stock: "20",
    rating: "4.9",
    reviewsCount: "1",
    badge: "NEW",
    isNew: true,
    isHot: false,
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["Standard"],
    details: {
      material: "Engineered Breathable Mesh & Leather Overlays",
      sole: "Dynamic Cloud EVA Foam & High-Traction Rubber",
      fit: "True to size (Standard D width)",
      care: "Spot clean with damp cloth",
      closure: "Traditional Lace-Up"
    }
  });

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [showCustomCatInput, setShowCustomCatInput] = useState(false);

  // Gallery inputs
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [customSizeInput, setCustomSizeInput] = useState("");

  // Loading & Submission State
  const [fetchingProduct, setFetchingProduct] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [createdProduct, setCreatedProduct] = useState(null);

  // Fetch available categories from server
  useEffect(() => {
    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => {
        if (res.data && Array.isArray(res.data.categories)) {
          const catNames = res.data.categories
            .filter((c) => c.active && c.name.toLowerCase() !== "all")
            .map((c) => c.name);
          if (catNames.length > 0) {
            setCategories(catNames);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch categories from server:", err);
      });
  }, [API_URL]);

  // Fetch existing product data if editing
  useEffect(() => {
    if (!targetId) return;

    setFetchingProduct(true);
    axios
      .get(`${API_URL}/api/products/${targetId}`)
      .then((res) => {
        const prod = res.data?.product;
        if (prod) {
          const existingImages = Array.isArray(prod.images) && prod.images.length > 0
            ? prod.images
            : (prod.image ? [prod.image] : []);

          setFormData({
            name: prod.name || "",
            category: prod.category || "Running",
            price: prod.price != null ? String(prod.price) : "",
            originalPrice: prod.originalPrice != null ? String(prod.originalPrice) : "",
            description: prod.description || "",
            image: prod.image || (existingImages[0] || ""),
            images: existingImages,
            stock: prod.stock != null ? String(prod.stock) : "20",
            rating: prod.rating != null ? String(prod.rating) : "4.9",
            reviewsCount: prod.reviewsCount != null ? String(prod.reviewsCount) : "1",
            badge: prod.badge || "",
            isNew: Boolean(prod.isNew),
            isHot: Boolean(prod.isHot),
            sizes: Array.isArray(prod.sizes) && prod.sizes.length > 0
              ? prod.sizes
              : [7, 8, 9, 10, 11, 12],
            colors: Array.isArray(prod.colors) && prod.colors.length > 0
              ? prod.colors
              : ["Standard"],
            details: {
              material: prod.details?.material || "Engineered Breathable Mesh & Leather Overlays",
              sole: prod.details?.sole || "Dynamic Cloud EVA Foam & High-Traction Rubber",
              fit: prod.details?.fit || "True to size (Standard D width)",
              care: prod.details?.care || "Spot clean with damp cloth",
              closure: prod.details?.closure || "Traditional Lace-Up"
            }
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching product for editing:", err);
        setStatusMsg({ type: "error", text: "Failed to load product details for editing." });
      })
      .finally(() => {
        setFetchingProduct(false);
      });
  }, [targetId, API_URL]);

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    if (type === "success") {
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 5000);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE MANAGEMENT: Browser File Upload + Direct URL
  // ═══════════════════════════════════════════════════════════════════════════

  // Handle files selected via file browser (supports multiple files at once!)
  const handleBrowserFileUpload = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    const imageFiles = fileList.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      showStatus("error", "Please select valid image files (PNG, JPG, WEBP, etc.).");
      return;
    }

    setUploadingFiles(true);
    setUploadProgress(`Processing ${imageFiles.length} image(s)...`);

    const uploadedUrls = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      setUploadProgress(`Uploading image ${i + 1} of ${imageFiles.length}...`);

      try {
        const base64 = await readFileAsBase64(file);
        try {
          const res = await axios.post(`${API_URL}/api/upload-product-image`, {
            imageBase64: base64,
          });
          const url = res.data?.url || base64;
          uploadedUrls.push(url);
        } catch (serverErr) {
          console.warn("Cloudinary upload fallback to base64:", serverErr);
          uploadedUrls.push(base64);
        }
      } catch (readErr) {
        console.error("File reading error:", readErr);
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData((prev) => {
        const existing = Array.isArray(prev.images) ? [...prev.images] : [];
        uploadedUrls.forEach((u) => {
          if (!existing.includes(u)) existing.push(u);
        });
        return {
          ...prev,
          images: existing,
          image: prev.image || existing[0] || uploadedUrls[0]
        };
      });
      showStatus("success", `Successfully added ${uploadedUrls.length} image(s) from your device!`);
    }

    setUploadingFiles(false);
    setUploadProgress("");
    // Reset file input value so user can upload the same file again if desired
    e.target.value = "";
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    const url = galleryUrlInput.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:")) {
      showStatus("error", "Please enter a valid HTTP or HTTPS image URL.");
      return;
    }

    setFormData((prev) => {
      const existing = Array.isArray(prev.images) ? [...prev.images] : [];
      if (!existing.includes(url)) existing.push(url);
      return {
        ...prev,
        images: existing,
        image: prev.image || url
      };
    });

    setGalleryUrlInput("");
    showStatus("success", "Image URL added to gallery!");
  };

  // Remove image from gallery
  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.images) ? [...prev.images] : [];
      const removedUrl = current[indexToRemove];
      const updated = current.filter((_, idx) => idx !== indexToRemove);
      const newCover = (prev.image === removedUrl) ? (updated[0] || "") : prev.image;
      return {
        ...prev,
        images: updated,
        image: newCover
      };
    });
  };

  // Set primary cover image
  const handleSetCover = (imgUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imgUrl
    }));
    showStatus("success", "Selected image set as primary catalog cover!");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SIZES & CATEGORY HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleToggleSize = (sizeVal) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.sizes) ? [...prev.sizes] : [];
      const exists = current.some((s) => String(s) === String(sizeVal));
      const updated = exists
        ? current.filter((s) => String(s) !== String(sizeVal))
        : [...current, sizeVal].sort((a, b) => Number(a) - Number(b));
      return { ...prev, sizes: updated };
    });
  };

  const handleAddCustomSize = () => {
    const sz = customSizeInput.trim();
    if (!sz) return;
    setFormData((prev) => {
      const current = Array.isArray(prev.sizes) ? [...prev.sizes] : [];
      if (!current.includes(sz)) {
        return { ...prev, sizes: [...current, sz] };
      }
      return prev;
    });
    setCustomSizeInput("");
  };

  const handleAddCustomCategory = () => {
    const cat = customCategoryInput.trim();
    if (!cat) return;
    if (!categories.includes(cat)) {
      setCategories((prev) => [...prev, cat]);
    }
    setFormData((prev) => ({ ...prev, category: cat }));
    setCustomCategoryInput("");
    setShowCustomCatInput(false);
    showStatus("success", `Category "${cat}" selected!`);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE & PUBLISH PRODUCT
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showStatus("error", "Please provide a product title / name.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      showStatus("error", "Please provide a valid numeric selling price greater than 0.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!formData.category) {
      showStatus("error", "Please select a product category.");
      return;
    }

    const galleryImages = Array.isArray(formData.images) && formData.images.length > 0
      ? formData.images
      : (formData.image ? [formData.image] : []);

    const primaryImage = formData.image || (galleryImages.length > 0 ? galleryImages[0] : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800");

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      description: formData.description.trim(),
      image: primaryImage,
      images: galleryImages.length > 0 ? galleryImages : [primaryImage],
      stock: formData.stock !== "" ? Number(formData.stock) : 20,
      rating: formData.rating !== "" ? Number(formData.rating) : 4.9,
      badge: formData.badge.trim(),
      isNew: Boolean(formData.isNew),
      isHot: Boolean(formData.isHot),
      sizes: Array.isArray(formData.sizes) && formData.sizes.length > 0 ? formData.sizes : [7, 8, 9, 10, 11, 12],
      colors: Array.isArray(formData.colors) && formData.colors.length > 0 ? formData.colors : ["Standard"],
      details: {
        material: formData.details?.material || "Engineered Breathable Mesh & Leather Overlays",
        sole: formData.details?.sole || "Dynamic Cloud EVA Foam & High-Traction Rubber",
        fit: formData.details?.fit || "True to size (Standard D width)",
        care: formData.details?.care || "Spot clean with damp cloth",
        closure: formData.details?.closure || "Traditional Lace-Up"
      }
    };

    setSaving(true);
    try {
      let res;
      if (isEditing) {
        res = await axios.put(`${API_URL}/api/products/${targetId}`, payload);
      } else {
        res = await axios.post(`${API_URL}/api/products`, payload);
      }

      const saved = res.data?.product;
      setCreatedProduct(saved || payload);
      showStatus("success", isEditing ? "Product updated successfully!" : "Product published to store successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to save product:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to save product to database.";
      showStatus("error", errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleReturnToProducts = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/admin/dashboard?tab=products");
    }
  };

  const discountPercentage = formData.originalPrice && Number(formData.originalPrice) > Number(formData.price)
    ? Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)
    : 0;

  if (fetchingProduct) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
        <p className="text-sm font-bold text-gray-500">Loading product information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TOP HEADER: Navigation, Title & Quick Save Action Bar                 */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="space-y-1">
          <button
            type="button"
            onClick={handleReturnToProducts}
            className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
            Back to Products Catalog
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {isEditing ? "Edit Product Details" : "Add New Product"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-primary/15 text-primary border border-primary/20">
              {isEditing ? "Editing Mode" : "New Catalog Entry"}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {isEditing
              ? "Update product pricing, images, specifications and inventory in real-time."
              : "Upload images from your browser or add links, configure specifications, and publish instantly to the live storefront."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleReturnToProducts}
            className="rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={saving || uploadingFiles}
            className="rounded-xl text-xs font-bold h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white shadow-md cursor-pointer flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving to Store...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                {isEditing ? "Save Changes" : "Publish to Store"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* STATUS ALERT NOTIFICATION                                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {statusMsg.text && (
        <div
          className={cn(
            "p-4 rounded-2xl text-xs font-bold flex items-center justify-between border animate-in slide-in-from-top-2 duration-200",
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          )}
        >
          <div className="flex items-center gap-2.5">
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMsg({ type: "", text: "" })}
            className="p-1 hover:bg-black/5 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* POST-PUBLISH SUCCESS MODAL / BANNER (Direct Live Storefront Link)     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {createdProduct && (
        <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30 rounded-3xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Product Successfully {isEditing ? "Updated" : "Created & Published"}!
                </h3>
                <p className="text-xs text-gray-600">
                  "{createdProduct.name}" is now live on your e-commerce storefront with {createdProduct.images?.length || 1} image(s).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCreatedProduct(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={`/product/${createdProduct._id || createdProduct.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Eye className="w-4 h-4" />
              View on Live Storefront
            </Link>
            <button
              type="button"
              onClick={() => {
                setCreatedProduct(null);
                setFormData({
                  name: "",
                  category: "Running",
                  price: "",
                  originalPrice: "",
                  description: "",
                  image: "",
                  images: [],
                  stock: "20",
                  rating: "4.9",
                  reviewsCount: "1",
                  badge: "NEW",
                  isNew: true,
                  isHot: false,
                  sizes: [7, 8, 9, 10, 11, 12],
                  colors: ["Standard"],
                  details: {
                    material: "Engineered Breathable Mesh & Leather Overlays",
                    sole: "Dynamic Cloud EVA Foam & High-Traction Rubber",
                    fit: "True to size (Standard D width)",
                    care: "Spot clean with damp cloth",
                    closure: "Traditional Lace-Up"
                  }
                });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" />
              Add Another Product
            </button>
            <button
              type="button"
              onClick={handleReturnToProducts}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
            >
              <Package className="w-4 h-4" />
              Return to Catalog
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MAIN TWO-COLUMN FORM LAYOUT                                           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =================================================================== */}
        {/* LEFT COLUMN: Input Fields & Gallery Uploader (8 Columns)            */}
        {/* =================================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. BASIC INFORMATION CARD */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                  1. General Information
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-gray-400">Required fields marked *</span>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Product Title / Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nike Air Max Pulse, CloudRunner Pro, Retro Court Low"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
              />
            </div>

            {/* Category Selection + Custom Option */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700">Category *</label>
                  <button
                    type="button"
                    onClick={() => setShowCustomCatInput(!showCustomCatInput)}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    {showCustomCatInput ? "Pick from list" : "+ Custom category"}
                  </button>
                </div>

                {!showCustomCatInput ? (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Type custom category..."
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shrink-0"
                    >
                      Set
                    </button>
                  </div>
                )}
              </div>

              {/* Promotional Badge / Tag */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Promotional Tag / Badge
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. HOT, NEW, SALE, LIMITED"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition uppercase"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {["HOT", "NEW", "SALE"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFormData({ ...formData, badge: tag })}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-black text-gray-700"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>



            {/* Checkbox Toggles */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2.5 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <span>Mark as New Release</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isHot}
                  onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <span>Mark as Trending / Hot Deal</span>
              </label>
            </div>
          </div>

          {/* 2. MULTI-IMAGE MEDIA GALLERY CARD (BROWSER FILE UPLOAD + URL FORM) */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                  2. Product Images & Multi-Angle Gallery
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold">
                {formData.images.length} {formData.images.length === 1 ? "Image" : "Images"} Attached
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Add multiple angles (side profile, sole view, front perspective, on-foot). You can upload image files directly from your computer browser, or paste image URLs below.
            </p>

            {/* DUAL INPUT SECTION: BROWSER FILE UPLOAD + URL INPUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Browser File Upload */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-gray-300 hover:border-slate-800 bg-gray-50/50 hover:bg-gray-50 transition-all text-center flex flex-col items-center justify-center space-y-2 relative cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBrowserFileUpload}
                  disabled={uploadingFiles}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  title="Click to browse image files from laptop/mobile"
                />
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  {uploadingFiles ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    {uploadingFiles ? uploadProgress : "Upload from Computer Browser"}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Click to browse files (PNG, JPG, WEBP, multiple allowed)
                  </span>
                </div>
              </div>

              {/* Option B: Direct URL Input */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-900 block flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-primary" />
                    Add via Web Image Link
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Paste any direct image link from Unsplash, CDN, or online source
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={galleryUrlInput}
                    onChange={(e) => setGalleryUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs cursor-pointer"
                  >
                    Add Link
                  </button>
                </div>
              </div>
            </div>

            {/* ATTACHED IMAGES GALLERY GRID */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block">
                Gallery Angle Thumbnails:
              </span>

              {formData.images.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                  No images uploaded yet. Please browse image files from your computer or add a link above.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {formData.images.map((imgUrl, idx) => {
                    const isCover = formData.image === imgUrl || (!formData.image && idx === 0);
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "relative rounded-2xl overflow-hidden border-2 aspect-square bg-gray-100 group shadow-2xs transition-all",
                          isCover
                            ? "border-primary ring-2 ring-primary/30 shadow-md"
                            : "border-gray-200 hover:border-gray-400"
                        )}
                      >
                        <img
                          src={imgUrl}
                          alt={`Angle ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                          {isCover ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black shadow">
                              ⭐ Cover
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-md text-gray-800 text-[10px] font-bold">
                              #{idx + 1}
                            </span>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Set Cover Overlay Button */}
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(imgUrl)}
                            className="absolute bottom-2 left-2 right-2 py-1.5 bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md text-white rounded-lg text-[10px] font-extrabold opacity-0 group-hover:opacity-100 transition-all shadow text-center cursor-pointer"
                          >
                            Set as Cover
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. PRICING & INVENTORY CARD */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                3. Pricing & Inventory
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Selling Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Selling Price ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Compare At / Original Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Original Price ($) (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="129.00"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                  />
                </div>
                {discountPercentage > 0 && (
                  <span className="text-[11px] font-black text-emerald-600 block">
                    Calculated Discount: {discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Stock Inventory */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Stock Units Available
                </label>
                <input
                  type="number"
                  placeholder="20"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* 4. PRODUCT DESCRIPTION & DETAILS CARD */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                  4. Product Description & Details
                </h2>
              </div>
              <span className="text-[11px] text-gray-400">Appears as bullet points on Product Details page</span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Write each product feature on a new line starting with <strong>•</strong> or <strong>-</strong> to create bullet points. These will display as a clean description list on the storefront product page.
            </p>

            {/* Large Description Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Product Features & Description *
              </label>
              <textarea
                rows={8}
                placeholder={"• Designed for everyday ease, provides comfort, durability, and lightweight performance\n• Featuring a durable synthetic upper that gives a neat look with easy-care\n• Built with a smooth inner lining to enhance comfort and reduce fatigue\n• Constructed with premium technology for a strong and reliable build\n• Equipped with a lightweight sole and cushioned footbed for all-day comfort\n• Spot clean with damp cloth"}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition leading-relaxed"
              />
              <span className="text-[11px] text-gray-400">
                Tip: Start each line with • or - for bullet points. Plain text will also display as a description.
              </span>
            </div>

            {/* Live Description Preview */}
            {formData.description.trim() && (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Storefront Preview
                </span>
                <h4 className="text-sm font-extrabold text-gray-900 italic">Product Description</h4>
                <div className="text-xs text-gray-600 leading-relaxed space-y-1.5">
                  {(() => {
                    const desc = formData.description || "";
                    let bullets = [];
                    if (desc.includes("•") || desc.includes("- ")) {
                      bullets = desc.split(/[•\-]/).map(s => s.trim()).filter(Boolean);
                    } else {
                      bullets = desc.split("\n").map(s => s.trim()).filter(Boolean);
                    }
                    return bullets.map((point, idx) => (
                      <p key={idx} className="flex items-start gap-2">
                        <span className="text-gray-900 mt-0.5 shrink-0">•</span>
                        <span>{point}</span>
                      </p>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* 5. SIZES SELECTION CARD */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                5. Available Sizes
              </h2>
              <span className="text-[11px] text-gray-400">Click to toggle on/off</span>
            </div>

            {/* Standard Size Chips */}
            <div className="flex flex-wrap gap-2">
              {STANDARD_SIZES.map((sz) => {
                const isSelected = formData.sizes.some((s) => String(s) === String(sz));
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleToggleSize(sz)}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      isSelected
                        ? "bg-slate-900 text-white shadow-sm scale-102"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    US {sz}
                  </button>
                );
              })}
            </div>

            {/* Add Custom Size */}
            <div className="flex items-center gap-2 pt-2 max-w-xs">
              <input
                type="text"
                placeholder="Add custom size (e.g. 14, S, M, L)"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Live Storefront Card Preview & Publish Actions (4 Cols)*/}
        {/* =================================================================== */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* LIVE STOREFRONT CARD PREVIEW */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Live Storefront Preview
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Buyer View
              </span>
            </div>

            {/* Render Storefront Product Card */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm space-y-3 p-3">
              {/* Image Preview Container */}
              <div className="relative rounded-xl overflow-hidden aspect-square bg-gray-100 flex items-center justify-center">
                {formData.images.length > 0 ? (
                  <img
                    src={formData.image || formData.images[0]}
                    alt={formData.name || "Product Preview"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-gray-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-[11px] font-semibold">Attach an image to preview</span>
                  </div>
                )}

                {/* Badge Tag */}
                {formData.badge && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-black tracking-wider shadow">
                    {formData.badge}
                  </span>
                )}

                {discountPercentage > 0 && (
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black shadow">
                    -{discountPercentage}%
                  </span>
                )}
              </div>

              {/* Thumbnails preview strip */}
              {formData.images.length > 1 && (
                <div className="grid grid-cols-4 gap-1.5">
                  {formData.images.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-lg overflow-hidden aspect-square border",
                        img === formData.image ? "border-primary ring-1 ring-primary" : "border-gray-200 opacity-70"
                      )}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Card Meta */}
              <div className="space-y-1.5 px-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-gray-400 uppercase tracking-wider">{formData.category}</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-gray-900">4.9</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-gray-900 truncate">
                  {formData.name || "Untitled Product Model"}
                </h3>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-base font-black text-gray-900">
                    ${formData.price ? Number(formData.price).toFixed(2) : "0.00"}
                  </span>
                  {formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) && (
                    <span className="text-xs text-gray-400 line-through">
                      ${Number(formData.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Stock Indicator */}
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock ({formData.stock || 20} units)
                  </span>
                  <span className="text-gray-400 font-medium">
                    {formData.sizes.length} sizes available
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CHECKLIST & FINAL PUBLISH CARD */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
              Publishing Checklist
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                {formData.name.trim() ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-300" />
                )}
                <span className={formData.name.trim() ? "text-gray-800 font-semibold" : "text-gray-400"}>
                  Product name provided
                </span>
              </div>

              <div className="flex items-center gap-2">
                {formData.price && Number(formData.price) > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-300" />
                )}
                <span className={formData.price ? "text-gray-800 font-semibold" : "text-gray-400"}>
                  Valid price set
                </span>
              </div>

              <div className="flex items-center gap-2">
                {formData.images.length > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-300" />
                )}
                <span className={formData.images.length > 0 ? "text-gray-800 font-semibold" : "text-gray-400"}>
                  At least 1 image attached
                </span>
              </div>

              <div className="flex items-center gap-2">
                {formData.category ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-300" />
                )}
                <span className="text-gray-800 font-semibold">
                  Category: {formData.category}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Button
                type="submit"
                disabled={saving || uploadingFiles}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    {isEditing ? "Save & Update Product" : "Publish to Live Store"}
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleReturnToProducts}
                className="w-full py-2.5 text-center text-xs font-bold text-gray-500 hover:text-gray-900 transition cursor-pointer"
              >
                Discard & Return to Catalog
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
