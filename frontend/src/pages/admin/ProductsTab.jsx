import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';

const DEFAULT_CATEGORIES = ["Running", "Casual", "Retro", "Performance", "Lifestyle", "High Top", "Training"];

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
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
    category: "Running",
    price: "",
    originalPrice: "",
    description: "",
    image: "",
    stock: "15",
    rating: "4.8",
    reviewsCount: "88",
    isNew: false,
    isHot: false,
    badge: "",
  });

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
        if (res.data && res.data.url) {
          setFormData((prev) => ({ ...prev, image: res.data.url }));
          showStatus("success", "Image uploaded successfully to Cloudinary!");
        }
      } catch (err) {
        console.error("Cloudinary image upload failed:", err);
        setFormData((prev) => ({ ...prev, image: base64 }));
        showStatus("warning", "Uploaded offline preview image.");
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
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
        const catNames = res.data.categories
          .filter((c) => c.active && c.name.toLowerCase() !== "all")
          .map((c) => c.name);
        if (catNames.length > 0) {
          setCategories(catNames);
        }
      }
    } catch (err) {
      console.warn("Error fetching categories for dropdown:", err);
    }
  };

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 4000);
  };

  // Open Modal for Add
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: categories[0] || "Running",
      price: "",
      originalPrice: "",
      description: "",
      image: "",
      stock: "15",
      rating: "4.8",
      reviewsCount: "88",
      isNew: false,
      isHot: false,
      badge: "",
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || "",
      category: prod.category || categories[0] || "Running",
      price: prod.price ? String(prod.price) : "",
      originalPrice: prod.originalPrice ? String(prod.originalPrice) : "",
      description: prod.description || "",
      image: prod.image || "",
      stock: prod.stock !== undefined ? String(prod.stock) : "15",
      rating: prod.rating !== undefined ? String(prod.rating) : "4.8",
      reviewsCount: prod.reviewsCount !== undefined ? String(prod.reviewsCount) : "88",
      isNew: Boolean(prod.isNew),
      isHot: Boolean(prod.isHot),
      badge: prod.badge || "",
    });
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

    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      description: formData.description.trim(),
      image: formData.image.trim() || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      stock: Number(formData.stock || 15),
      rating: Number(formData.rating || 4.8),
      reviewsCount: Number(formData.reviewsCount || 88),
      isNew: formData.isNew,
      isHot: formData.isHot,
      badge: formData.badge || (formData.isNew ? "NEW" : formData.isHot ? "HOT" : ""),
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
    if (
      searchQuery &&
      !prod.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !prod.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
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
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer active:scale-98"
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
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded-md text-[10px] border border-purple-100 inline-flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" /> {prod.category}
                          </span>

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
                        <h3 className="font-extrabold text-gray-900 text-sm leading-snug break-words">
                          {prod.name}
                        </h3>

                        {/* Description (Full text shown, no line clamp or ellipses) */}
                        <p className="text-[11px] text-gray-500 leading-relaxed break-words mt-1">
                          {prod.description || "No description provided."}
                        </p>

                        {/* Price & Savings */}
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-base font-black text-slate-900 leading-none">
                            ${prod.price}
                          </span>
                          {prod.originalPrice && (
                            <span className="text-xs text-gray-400 line-through leading-none">
                              ${prod.originalPrice}
                            </span>
                          )}
                          {hasDiscount && (
                            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded leading-none">
                              Save ${(Number(prod.originalPrice) - Number(prod.price)).toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => openEditModal(prod)}
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
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg text-[10px] border border-purple-100 inline-flex items-center gap-1">
                            <Tag className="w-3 h-3" /> {prod.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-extrabold text-gray-900">${prod.price}</div>
                          {prod.originalPrice && (
                            <div className="text-[10px] text-gray-400 line-through">
                              ${prod.originalPrice}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {prod.isHot && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[9px] font-bold border border-amber-200">
                                🔥 HOT
                              </span>
                            )}
                            {prod.isNew && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-bold border border-emerald-200">
                                ✨ NEW
                              </span>
                            )}
                            {prod.badge && !prod.isHot && !prod.isNew && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold border border-blue-200">
                                {prod.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-gray-700">
                          {prod.stock !== undefined ? prod.stock : 15} items
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(prod)}
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
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold text-gray-900 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Original Price ($) (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="129.99"
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


                {/* Product Image Selection (URL Link OR Upload File from Laptop/Mobile to Cloudinary) */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700">
                      Product Image
                    </label>
                    <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setImageInputMode("file")}
                        className={`px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer ${imageInputMode === "file"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-gray-500 hover:text-gray-900"
                          }`}
                      >
                        <Upload className="w-3 h-3" /> Upload Device File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode("url")}
                        className={`px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer ${imageInputMode === "url"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-gray-500 hover:text-gray-900"
                          }`}
                      >
                        <LinkIcon className="w-3 h-3" /> Image URL Link
                      </button>
                    </div>
                  </div>

                  {imageInputMode === "file" ? (
                    <div className="border-2 border-dashed border-gray-200 hover:border-slate-900 rounded-xl p-4 text-center transition bg-gray-50/50">
                      {uploadingImage ? (
                        <div className="flex flex-col items-center justify-center py-2 space-y-2">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                          <span className="text-xs font-bold text-gray-600">
                            Uploading image to Cloudinary...
                          </span>
                        </div>
                      ) : (
                        <label className="cursor-pointer block space-y-2">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                          <div className="text-xs font-bold text-slate-900">
                            Click to browse image from laptop / mobile
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Supports PNG, JPG, WEBP (Uploaded directly to Cloudinary)
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  )}

                  {/* Image Preview Box */}
                  {formData.image && (
                    <div className="relative inline-block mt-2 group">
                      <img
                        src={formData.image}
                        alt="Product preview"
                        className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition"
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>
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

                {/* Badges & Checkboxes */}
                <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isHot}
                      onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>🔥 Mark as Hot Product</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
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
