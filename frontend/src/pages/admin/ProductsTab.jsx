import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Tag,
  CheckCircle2,
  AlertCircle,
  Flame,
  Sparkles,
  DollarSign,
  Image as ImageIcon,
  Layers,
  Filter,
  Upload,
  Link as LinkIcon,
  Loader2,
  X,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_CATEGORIES = [
  "New Arrivals",
  "Men",
  "Women",
  "Kids",
  "Accessories",
  "School Shoes"
];

const DEFAULT_SUBCATEGORIES = {
  "New Arrivals": ["New Releases", "Trending Now", "Best Sellers", "Men's New In", "Women's New In", "Kids' New In"],
  "Men": ["Running Shoes", "Casual Sneakers", "Formal Loafers", "Gym & Training", "Daily Walking", "Wide-Fit Shoes"],
  "Women": ["Daily Sneakers", "Running Shoes", "Flats & Pumps", "Studio & Yoga", "Platform Soles", "Cloud Comfort"],
  "Kids": ["Boys Sneakers", "Girls Sneakers", "Light-Up Soles", "Toddlers (22–27)", "Juniors (28–35)", "Velcro Straps"],
  "Accessories": ["Foam Cleaner", "Water Shield", "Cleaning Brush", "Memory Insoles", "Cushioned Socks", "Shoe Laces"],
  "School Shoes": ["Black Uniform", "Girls Strap Shoes", "White PT Shoes", "Velcro Strap", "Genuine Leather", "Non-Marking Soles"],
};

export default function ProductsTab({ onAddNew, onEditProduct }) {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [subcategoriesMap, setSubcategoriesMap] = useState(DEFAULT_SUBCATEGORIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState("file"); // "file" or "url"
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State for Add / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Kids",
    subcategory: "Boys Sneakers",
    customSubcategory: "",
    tags: ["POPULAR"],
    price: "",
    originalPrice: "",
    description: "",
    image: "",
    images: [],
    stock: "15",
    rating: "4.8",
    reviewsCount: "88",
    isNew: false,
    isHot: false,
    badge: "POPULAR",
  });
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "";

  // Handle uploading image file from device (laptop / mobile)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showStatus("error", "Please select a valid image file.");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        const res = await axios.post(`${API_URL}/api/upload-product-image`, {
          imageBase64: base64,
        });
        const url = (res.data && res.data.url) ? res.data.url : base64;
        setFormData((prev) => {
          const newImages = prev.images && prev.images.length > 0 ? [...prev.images] : [];
          if (!newImages.includes(url)) newImages.push(url);
          return { ...prev, image: url, images: newImages };
        });
        showStatus("success", "Cover image uploaded successfully!");
      } catch (err) {
        console.error("Cloudinary image upload failed:", err);
        setFormData((prev) => {
          const newImages = prev.images && prev.images.length > 0 ? [...prev.images] : [];
          if (!newImages.includes(base64)) newImages.push(base64);
          return { ...prev, image: base64, images: newImages };
        });
        showStatus("warning", "Uploaded offline preview image.");
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload an extra angle image directly to the product's gallery
  const handleGalleryFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showStatus("error", "Please select a valid image file.");
      return;
    }

    setUploadingGalleryImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        const res = await axios.post(`${API_URL}/api/upload-product-image`, {
          imageBase64: base64,
        });
        const url = (res.data && res.data.url) ? res.data.url : base64;
        setFormData((prev) => {
          const currentList = Array.isArray(prev.images) ? [...prev.images] : [];
          if (prev.image && !currentList.includes(prev.image)) {
            currentList.unshift(prev.image);
          }
          currentList.push(url);
          return {
            ...prev,
            images: currentList,
            image: prev.image || url,
          };
        });
        showStatus("success", "Additional image added to gallery!");
      } catch (err) {
        console.error("Gallery upload error:", err);
        setFormData((prev) => {
          const currentList = Array.isArray(prev.images) ? [...prev.images] : [];
          if (prev.image && !currentList.includes(prev.image)) {
            currentList.unshift(prev.image);
          }
          currentList.push(base64);
          return {
            ...prev,
            images: currentList,
            image: prev.image || base64,
          };
        });
        showStatus("warning", "Added offline preview image to gallery.");
      } finally {
        setUploadingGalleryImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add an image to gallery by URL
  const handleAddGalleryUrl = () => {
    const url = galleryUrlInput.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:")) {
      showStatus("error", "Please enter a valid HTTP or HTTPS image URL.");
      return;
    }
    setFormData((prev) => {
      const currentList = Array.isArray(prev.images) ? [...prev.images] : [];
      if (prev.image && !currentList.includes(prev.image)) {
        currentList.unshift(prev.image);
      }
      currentList.push(url);
      return {
        ...prev,
        images: currentList,
        image: prev.image || url,
      };
    });
    setGalleryUrlInput("");
    showStatus("success", "Image URL added to gallery!");
  };

  // Remove an image from gallery
  const handleRemoveGalleryImage = (idxToRemove) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.images) ? [...prev.images] : [];
      const removedUrl = current[idxToRemove];
      const updated = current.filter((_, i) => i !== idxToRemove);
      const newCover = (prev.image === removedUrl) ? (updated[0] || "") : prev.image;
      return {
        ...prev,
        images: updated,
        image: newCover,
      };
    });
  };

  // Set selected image as the primary cover
  const handleSetCover = (imgUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imgUrl,
    }));
    showStatus("success", "Set as main cover image!");
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch Products from Backend API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      if (res.data && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.warn("Could not fetch products from API, using fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Categories from Backend API for Category Dropdown
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      if (res.data && Array.isArray(res.data.categories)) {
        const activeCats = res.data.categories.filter((c) => c.active && c.name.toLowerCase() !== "all");
        const catNames = activeCats.map((c) => c.name);
        if (catNames.length > 0) {
          setCategories(catNames);
        }
        const newMap = { ...DEFAULT_SUBCATEGORIES };
        activeCats.forEach((c) => {
          if (Array.isArray(c.subcategories) && c.subcategories.length > 0) {
            newMap[c.name] = c.subcategories;
          }
        });
        setSubcategoriesMap(newMap);
      }
    } catch (err) {
      console.warn("Error fetching categories for dropdown:", err);
    }
  };

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 4000);
  };

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
    } else {
      navigate('/admin/dashboard?tab=add-product');
    }
  };

  const handleEdit = (prod) => {
    if (onEditProduct) {
      onEditProduct(prod);
    } else {
      const pId = prod._id || prod.id;
      navigate(`/admin/dashboard?tab=edit-product&id=${pId}`);
    }
  };

  // Open Modal for Add
  const openAddModal = () => {
    setEditingProduct(null);
    const initialCat = categories[0] || "Kids";
    const availableSubs = subcategoriesMap[initialCat] || [];
    setFormData({
      name: "",
      category: initialCat,
      subcategory: availableSubs[0] || "",
      customSubcategory: "",
      tags: [],
      price: "",
      originalPrice: "",
      description: "",
      image: "",
      images: [],
      stock: "15",
      rating: "4.8",
      reviewsCount: "88",
      isNew: false,
      isHot: false,
      badge: "",
    });
    setGalleryUrlInput("");
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (prod) => {
    setEditingProduct(prod);
    const existingImages = Array.isArray(prod.images) && prod.images.length > 0
      ? prod.images
      : (prod.image ? [prod.image] : []);

    const cat = prod.category || categories[0] || "Kids";
    const availableSubs = subcategoriesMap[cat] || [];
    const isCustomSub = prod.subcategory && !availableSubs.includes(prod.subcategory);

    setFormData({
      name: prod.name || "",
      category: cat,
      subcategory: isCustomSub ? "custom" : (prod.subcategory || availableSubs[0] || ""),
      customSubcategory: isCustomSub ? prod.subcategory : "",
      tags: Array.isArray(prod.tags) && prod.tags.length > 0 ? prod.tags : (prod.badge ? [prod.badge] : []),
      price: prod.price ? String(prod.price) : "",
      originalPrice: prod.originalPrice ? String(prod.originalPrice) : "",
      description: prod.description || "",
      image: prod.image || (existingImages[0] || ""),
      images: existingImages,
      stock: prod.stock !== undefined ? String(prod.stock) : "15",
      rating: prod.rating !== undefined ? String(prod.rating) : "4.8",
      reviewsCount: prod.reviewsCount !== undefined ? String(prod.reviewsCount) : "88",
      isNew: Boolean(prod.isNew),
      isHot: Boolean(prod.isHot),
      badge: prod.badge || "",
    });
    setGalleryUrlInput("");
    setIsModalOpen(true);
  };

  // Delete Product
  const handleDeleteProduct = async (prodId, prodName) => {
    if (window.confirm(`Are you sure you want to delete "${prodName}"?`)) {
      try {
        await axios.delete(`${API_URL}/api/products/${prodId}`);
        setProducts((prev) => prev.filter((p) => p._id !== prodId && p.id !== prodId));
        showStatus("success", `Product "${prodName}" deleted successfully!`);
      } catch (err) {
        console.error("Delete product error:", err);
        showStatus("error", "Failed to delete product from database.");
      }
    }
  };

  // Submit Add / Edit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.category) {
      showStatus("error", "Please fill in all required fields (Name, Price, Category).");
      return;
    }

    const galleryImages = Array.isArray(formData.images) && formData.images.length > 0
      ? formData.images
      : (formData.image ? [formData.image.trim()] : []);
    const primaryCover = formData.image.trim() || (galleryImages[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600");

    const finalSubcategory = formData.subcategory === "custom"
      ? (formData.customSubcategory || "").trim()
      : (formData.subcategory || "").trim();

    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      subcategory: finalSubcategory,
      tags: formData.tags || (formData.badge ? [formData.badge] : []),
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      description: formData.description.trim(),
      image: primaryCover,
      images: galleryImages,
      stock: Number(formData.stock || 15),
      rating: Number(formData.rating || 4.8),
      reviewsCount: Number(formData.reviewsCount || 88),
      isNew: Boolean(formData.isNew),
      isHot: Boolean(formData.isHot),
      badge: formData.badge || (formData.isNew ? "NEW" : formData.isHot ? "HOT" : (formData.tags?.[0] || "")),
    };


    try {
      if (editingProduct) {
        // Edit API call
        const id = editingProduct._id || editingProduct.id;
        const res = await axios.put(`${API_URL}/api/products/${id}`, payload);
        if (res.data && res.data.product) {
          setProducts((prev) =>
            prev.map((p) => ((p._id === id || p.id === id) ? res.data.product : p))
          );
        } else {
          fetchProducts();
        }
        showStatus("success", `Product "${payload.name}" updated successfully!`);
      } else {
        // Add API call
        const res = await axios.post(`${API_URL}/api/products`, payload);
        if (res.data && res.data.product) {
          setProducts((prev) => [res.data.product, ...prev]);
        } else {
          fetchProducts();
        }
        showStatus("success", `Product "${payload.name}" added to store catalog!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save product error:", err);
      showStatus("error", "Failed to save product. Please check your backend connection.");
    } finally {
      setSaving(false);
    }
  };

  // Filter products by category & search query
  const filteredProducts = products.filter((prod) => {
    if (selectedCategory !== "All" && prod.category !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = prod.name?.toLowerCase().includes(q);
      const catMatch = prod.category?.toLowerCase().includes(q);
      const subMatch = prod.subcategory?.toLowerCase().includes(q);
      const badgeMatch = prod.badge?.toLowerCase().includes(q);
      const tagsMatch = Array.isArray(prod.tags) && prod.tags.some((t) => t.toLowerCase().includes(q));
      if (!nameMatch && !catMatch && !subMatch && !badgeMatch && !tagsMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">Products Catalog Management</h1>
          </div>
          <p className="text-xs text-gray-500 max-w-xl">
            Add, update, and manage all store footwear products dynamically. Assign categories from active store categories.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Alert Status Banner */}
      {statusMsg.text && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top duration-200 ${statusMsg.type === "success"
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

      {/* Controls Bar: Search & Category Filter Pills */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none order-2 md:order-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline-block">
            Category:
          </span>
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${selectedCategory === cat
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 order-1 md:order-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 md:py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Products Catalog View */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-500">Loading product catalog...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* MOBILE VIEW (Independent Separated Cards - No Truncation, Do Not Touch)   */}
          {/* ========================================================================= */}
          <div className="block md:hidden space-y-3.5">
            {/* Mobile Header Bar */}
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-gray-900">Products Catalog</span>
                <span className="px-2 py-0.5 bg-slate-900 text-white rounded-full text-[10px] font-extrabold">
                  {filteredProducts.length}
                </span>
              </div>
              {selectedCategory !== "All" && (
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
                  {selectedCategory}
                </span>
              )}
            </div>

            {/* Separated Product Cards */}
            {filteredProducts.length > 0 ? (
              filteredProducts.map((prod) => {
                const stockVal = prod.stock !== undefined ? Number(prod.stock) : 15;
                const hasDiscount = prod.originalPrice && Number(prod.originalPrice) > Number(prod.price);

                return (
                  <div
                    key={prod._id || prod.id}
                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all space-y-3"
                  >
                    {/* Top Row: Product Image + Information */}
                    <div className="flex items-start gap-3.5">
                      {/* Product Thumbnail with Badges */}
                      <div className="relative shrink-0">
                        <img
                          src={prod.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"}
                          alt={prod.name}
                          className="w-20 h-20 rounded-2xl object-cover border border-gray-200/80 bg-gray-50 shadow-2xs"
                        />
                        {/* Status / Promo Badges */}
                        {prod.isHot ? (
                          <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-md shadow-xs flex items-center gap-0.5 leading-none">
                            🔥 HOT
                          </span>
                        ) : prod.isNew ? (
                          <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-black rounded-md shadow-xs flex items-center gap-0.5 leading-none">
                            ✨ NEW
                          </span>
                        ) : prod.badge ? (
                          <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-md shadow-xs leading-none">
                            {prod.badge}
                          </span>
                        ) : null}
                      </div>

                      {/* Info Column */}
                      <div className="flex-1 min-w-0">
                        {/* Category & Stock Status */}
                        <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded-md text-[10px] border border-purple-100 inline-flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" /> {prod.category}
                            </span>
                            {prod.subcategory && (
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[9px] border border-blue-100">
                                {prod.subcategory}
                              </span>
                            )}
                          </div>

                          {/* Dynamic Stock Indicator */}
                          {stockVal === 0 ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Out of stock
                            </span>
                          ) : stockVal <= 5 ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Only {stockVal} left
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {stockVal} in stock
                            </span>
                          )}
                        </div>

                        {/* Product Title (No truncation, shown in full) */}
                        <h3 className="font-extrabold text-gray-900 text-sm leading-snug wrap-break-word">
                          {prod.name}
                        </h3>

                        {/* Description (Full text shown, no line clamp or ellipses) */}
                        <p className="text-[11px] text-gray-500 leading-relaxed wrap-break-word mt-1">
                          {prod.description || "No description provided."}
                        </p>

                        {/* Price & Savings */}
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-base font-black text-slate-900 leading-none">
                            Rs. {prod.price}
                          </span>
                          {prod.originalPrice && (
                            <span className="text-xs text-gray-400 line-through leading-none">
                              Rs. {prod.originalPrice}
                            </span>
                          )}
                          {hasDiscount && (
                            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded leading-none">
                              Save Rs. {(Number(prod.originalPrice) - Number(prod.price)).toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-50 hover:bg-amber-50 text-gray-700 hover:text-amber-800 font-bold rounded-xl text-xs transition border border-gray-200/80 active:scale-98 cursor-pointer shadow-2xs"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-600" />
                        <span>Edit Product</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod._id || prod.id, prod.name)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs transition border border-rose-200/80 active:scale-98 cursor-pointer shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400 space-y-2 shadow-xs">
                <Package className="w-8 h-8 mx-auto text-gray-300 stroke-1" />
                <p className="text-xs font-medium">No products match your current search or category filter.</p>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* DESKTOP VIEW (Full Table with standard columns)                           */}
          {/* ========================================================================= */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Product Info</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Badges</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((prod) => (
                      <tr key={prod._id || prod.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"}
                              alt={prod.name}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-gray-900">{prod.name}</div>
                              <div className="text-[10px] text-gray-400 line-clamp-1 max-w-xs">
                                {prod.description || "No description."}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg text-[10px] border border-purple-100 inline-flex items-center gap-1">
                              <Tag className="w-3 h-3" /> {prod.category}
                            </span>
                            {prod.subcategory && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[9px] border border-blue-100/80">
                                {prod.subcategory}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-extrabold text-gray-900">Rs. {prod.price}</div>
                          {prod.originalPrice && (
                            <div className="text-[10px] text-gray-400 line-through">
                              Rs. {prod.originalPrice}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap items-center gap-1 max-w-[170px]">
                            {prod.isHot && (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[9px] font-bold border border-rose-200 flex items-center gap-0.5">
                                🔥 HOT
                              </span>
                            )}
                            {prod.isNew && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold border border-blue-200 flex items-center gap-0.5">
                                ✨ NEW
                              </span>
                            )}
                            {prod.badge && prod.badge !== "HOT" && prod.badge !== "NEW" && (
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-md text-[9px] font-bold border flex items-center gap-0.5",
                                  prod.badge === "POPULAR"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : prod.badge === "CUTE"
                                    ? "bg-pink-50 text-pink-700 border-pink-200"
                                    : prod.badge === "TOP PICK" || prod.badge === "MUST HAVE"
                                    ? "bg-orange-50 text-[#C84B31] border-orange-200"
                                    : prod.badge === "BEST" || prod.badge === "BESTSELLER"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : prod.badge === "EASY WEAR" || prod.badge === "EASY"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                )}
                              >
                                {prod.badge === "POPULAR" ? "⭐ " : ""}
                                {prod.badge}
                              </span>
                            )}
                            {Array.isArray(prod.tags) &&
                              prod.tags
                                .filter((t) => t !== prod.badge && t !== "HOT" && t !== "NEW")
                                .map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-medium border border-gray-200"
                                  >
                                    #{t}
                                  </span>
                                ))}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-gray-700">
                          {prod.stock !== undefined ? prod.stock : 15} items
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(prod)}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod._id || prod.id, prod.name)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                        No products match your current search or category filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                <span>{editingProduct ? "Edit Product" : "Add New Product"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ultra Boost Runner 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                {/* Category Selection Dropdown (FETCHED DYNAMICALLY) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const subs = subcategoriesMap[newCat] || [];
                      setFormData({
                        ...formData,
                        category: newCat,
                        subcategory: subs[0] || "",
                        customSubcategory: "",
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold text-gray-900 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Dropdown (Dynamically paired with Category) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Dropdown Subcategory
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold text-gray-900 cursor-pointer"
                  >
                    {(subcategoriesMap[formData.category] || []).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                    <option value="custom">+ Custom Subcategory...</option>
                  </select>
                  {formData.subcategory === "custom" && (
                    <input
                      type="text"
                      placeholder="Type custom subcategory..."
                      value={formData.customSubcategory}
                      onChange={(e) => setFormData({ ...formData, customSubcategory: e.target.value })}
                      className="mt-1.5 w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Price (PKR / Rs.) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Original Price (PKR / Rs.) (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="3500"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="15"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                {/* Rating (★ 4.8) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Rating ⭐ (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="4.8"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                {/* Total Reviews Count (e.g. 88) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Reviews Count 💬
                  </label>
                  <input
                    type="number"
                    placeholder="88"
                    value={formData.reviewsCount}
                    onChange={(e) => setFormData({ ...formData, reviewsCount: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>


                {/* Product Main Cover & Multi-Angle Gallery Management */}
                <div className="sm:col-span-2 space-y-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-purple-600" />
                        Product Images & Multi-Angle Gallery
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Add multiple images for different angles (front, side, sole, on-foot). Buyers will be able to click thumbnails to view each angle.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[11px] font-bold rounded-lg border border-purple-100">
                      {formData.images?.length || (formData.image ? 1 : 0)} Images Attached
                    </span>
                  </div>

                  {/* Add Image Options: 1) Upload File from Computer / 2) Add via Image URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200">
                    {/* Option A: Upload Device File */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-slate-700" />
                        Browse from Device:
                      </span>
                      <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-dashed border-gray-300 hover:border-slate-900 rounded-xl cursor-pointer transition text-xs font-semibold text-slate-900 shadow-2xs hover:bg-gray-50">
                        {uploadingGalleryImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                            <span>Uploading Image...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 text-purple-600" />
                            <span>Upload File from Device</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingGalleryImage}
                          onChange={handleGalleryFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Option B: Add by URL Link */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-700" />
                        Add via Image URL:
                      </span>
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={galleryUrlInput}
                          onChange={(e) => setGalleryUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddGalleryUrl();
                            }
                          }}
                          className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <button
                          type="button"
                          onClick={handleAddGalleryUrl}
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0 shadow-xs"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Visual Gallery Grid of Attached Images */}
                  {Array.isArray(formData.images) && formData.images.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold px-0.5">
                        <span>Current Attached Images (Click "Make Cover" to set the main catalog photo):</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {formData.images.map((imgUrl, idx) => {
                          const isCover = formData.image === imgUrl || (!formData.image && idx === 0);
                          return (
                            <div
                              key={idx}
                              className={cn(
                                "group relative rounded-2xl overflow-hidden aspect-square border-2 bg-white shadow-xs transition-all",
                                isCover
                                  ? "border-emerald-500 ring-2 ring-emerald-500/20"
                                  : "border-gray-200 hover:border-gray-400"
                              )}
                            >
                              <img
                                src={imgUrl}
                                alt={`Angle ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />

                              {/* Cover Badge */}
                              {isCover ? (
                                <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow leading-tight">
                                  Cover
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetCover(imgUrl)}
                                  className="absolute top-1 left-1 bg-slate-900/80 hover:bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition shadow"
                                  title="Set as Main Cover"
                                >
                                  Make Cover
                                </button>
                              )}

                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition"
                                title="Remove Angle"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>

                              {/* Index tag */}
                              <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded-sm">
                                #{idx + 1}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-gray-200 rounded-2xl text-center bg-gray-50/50">
                      <p className="text-xs text-gray-500">
                        No images added yet. Upload from your device or paste an image link above.
                      </p>
                    </div>
                  )}
                </div>


                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter product features, materials, and highlights..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                {/* Promotional Tags & Badges Selector */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Promotional Tags & Badges (Click to toggle)</span>
                    </label>
                    <span className="text-[10px] text-gray-400">Popular, Hot, New, Sale, etc.</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { tag: "POPULAR", icon: "⭐", activeClass: "bg-purple-50 text-purple-700 border-purple-200 ring-2 ring-purple-300" },
                      { tag: "HOT", icon: "🔥", activeClass: "bg-rose-50 text-rose-700 border-rose-200 ring-2 ring-rose-300" },
                      { tag: "NEW", icon: "✨", activeClass: "bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-300" },
                      { tag: "SALE", icon: "🏷️", activeClass: "bg-amber-50 text-amber-700 border-amber-200 ring-2 ring-amber-300" },
                      { tag: "BEST SELLER", icon: "🏆", activeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-2 ring-emerald-300" },
                      { tag: "TRENDING", icon: "⚡", activeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-indigo-300" },
                      { tag: "TOP PICK", icon: "🎯", activeClass: "bg-orange-50 text-orange-700 border-orange-200 ring-2 ring-orange-300" },
                      { tag: "MUST HAVE", icon: "💫", activeClass: "bg-cyan-50 text-cyan-700 border-cyan-200 ring-2 ring-cyan-300" },
                      { tag: "CUTE", icon: "💖", activeClass: "bg-pink-50 text-pink-700 border-pink-200 ring-2 ring-pink-300" },
                      { tag: "EASY WEAR", icon: "👟", activeClass: "bg-teal-50 text-teal-700 border-teal-200 ring-2 ring-teal-300" },
                      { tag: "PREMIUM", icon: "👑", activeClass: "bg-slate-100 text-slate-800 border-slate-300 ring-2 ring-slate-400" },
                    ].map(({ tag, icon, activeClass }) => {
                      const isSelected = formData.tags?.includes(tag) || formData.badge === tag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const currentTags = Array.isArray(formData.tags) ? [...formData.tags] : [];
                            let newTags = [];
                            let newBadge = formData.badge;
                            let newIsHot = formData.isHot;
                            let newIsNew = formData.isNew;

                            if (isSelected) {
                              newTags = currentTags.filter((t) => t !== tag);
                              if (newBadge === tag) newBadge = newTags[0] || "";
                              if (tag === "HOT") newIsHot = false;
                              if (tag === "NEW") newIsNew = false;
                            } else {
                              newTags = [...currentTags, tag];
                              newBadge = tag;
                              if (tag === "HOT") newIsHot = true;
                              if (tag === "NEW") newIsNew = true;
                            }

                            setFormData({
                              ...formData,
                              tags: newTags,
                              badge: newBadge,
                              isHot: newIsHot,
                              isNew: newIsNew,
                            });
                          }}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1",
                            isSelected
                              ? `${activeClass} shadow-xs font-black`
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                          )}
                        >
                          <span>{icon}</span>
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Or type custom badge / tag..."
                      value={formData.badge}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setFormData({
                          ...formData,
                          badge: val,
                          tags: val ? Array.from(new Set([...(formData.tags || []), val])) : formData.tags,
                        });
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl uppercase font-bold"
                    />
                  </div>
                </div>

                {/* Badges & Checkboxes */}
                <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isHot}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const currentTags = Array.isArray(formData.tags) ? [...formData.tags] : [];
                        const updatedTags = checked
                          ? (currentTags.includes("HOT") ? currentTags : [...currentTags, "HOT"])
                          : currentTags.filter((t) => t !== "HOT");
                        setFormData({
                          ...formData,
                          isHot: checked,
                          tags: updatedTags,
                          badge: checked ? "HOT" : (formData.badge === "HOT" ? "" : formData.badge),
                        });
                      }}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>🔥 Mark as Hot Product</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const currentTags = Array.isArray(formData.tags) ? [...formData.tags] : [];
                        const updatedTags = checked
                          ? (currentTags.includes("NEW") ? currentTags : [...currentTags, "NEW"])
                          : currentTags.filter((t) => t !== "NEW");
                        setFormData({
                          ...formData,
                          isNew: checked,
                          tags: updatedTags,
                          badge: checked ? "NEW" : (formData.badge === "NEW" ? "" : formData.badge),
                        });
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>✨ Mark as New Arrival</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
