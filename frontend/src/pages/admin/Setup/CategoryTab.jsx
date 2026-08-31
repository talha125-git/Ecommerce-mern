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
} from "lucide-react";

const DEFAULT_CATEGORIES = [
  { id: "all", name: "All", slug: "all", active: true, isDefault: true, icon: "Grid", description: "All available products catalog" },
  { id: "running", name: "Running", slug: "running", active: true, isDefault: true, icon: "Zap", description: "High performance running & athletic footwear" },
  { id: "casual", name: "Casual", slug: "casual", active: true, isDefault: true, icon: "Smile", description: "Everyday comfort sneakers and shoes" },
  { id: "retro", name: "Retro", slug: "retro", active: true, isDefault: true, icon: "Sparkles", description: "Iconic timeless classic models" },
  { id: "performance", name: "Performance", slug: "performance", active: true, isDefault: true, icon: "Activity", description: "Pro-level sports performance footwear" },
  { id: "lifestyle", name: "Lifestyle", slug: "lifestyle", active: true, isDefault: true, icon: "Compass", description: "Modern street style and fashion shoes" },
  { id: "high-top", name: "High Top", slug: "high-top", active: true, isDefault: true, icon: "Shield", description: "Ankle support high top sneakers" },
  { id: "training", name: "Training", slug: "training", active: true, isDefault: true, icon: "Dumbbell", description: "Gym and cross-training athletic shoes" },
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

  // Modal / Form state for Add/Edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", icon: "Tag" });

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
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 4000);
  };

  // Toggle Category Active status
  const handleToggleActive = (id) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, active: !cat.active } : cat))
    );
  };

  // Delete Category
  const handleDelete = (id) => {
    if (id === "all") {
      showStatus("error", "The 'All' category is a system default and cannot be deleted.");
      return;
    }
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    showStatus("success", "Category removed from local list. Click 'Save Changes' to persist.");
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (window.confirm("Are you sure you want to reset all categories to default setup?")) {
      setSaving(true);
      try {
        const res = await axios.post(`${API_URL}/api/categories/reset`);
        if (res.data && res.data.categories) {
          setCategories(res.data.categories);
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
    setFormData({ name: "", description: "", icon: "Tag" });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || "", icon: cat.icon || "Tag" });
    setIsAddModalOpen(true);
  };

  // Save Modal Form (Create or Edit)
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCategory) {
      // Edit existing
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? {
                ...cat,
                name: formData.name.trim(),
                slug: formData.name.trim().toLowerCase().replace(/\s+/g, "-"),
                description: formData.description,
                icon: formData.icon,
              }
            : cat
        )
      );
      showStatus("success", `Category "${formData.name}" updated!`);
    } else {
      // Create new category
      const newId = formData.name.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);
      const newCat = {
        id: newId,
        name: formData.name.trim(),
        slug: formData.name.trim().toLowerCase().replace(/\s+/g, "-"),
        active: true,
        isDefault: false,
        icon: formData.icon,
        description: formData.description,
      };
      setCategories((prev) => [...prev, newCat]);
      showStatus("success", `New category "${formData.name}" added to list!`);
    }

    setIsAddModalOpen(false);
  };

  // Persist Changes to Database
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const res = await axios.post(`${API_URL}/api/categories`, { categories });
      if (res.data && res.data.categories) {
        setCategories(res.data.categories);
      }
      showStatus("success", "✅ Store categories saved successfully to MongoDB database!");
    } catch (err) {
      console.error("Save error:", err);
      showStatus("error", "❌ Failed to save categories to server. Please check your backend connection.");
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Tag className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-gray-900">Category Management Setup</h1>
          </div>
          <p className="text-xs text-gray-500 max-w-xl">
            Configure dynamic store categories. Enable, disable, edit or add custom category pills for the storefront product catalog.
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
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Category</span>
          </button>

          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
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
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Live Storefront Preview
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
              return (
                <div
                  key={cat.id}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap border border-slate-700 shadow-xs"
                >
                  <IconComp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{cat.name}</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const IconComp = ICON_MAP[cat.icon] || Tag;
            return (
              <div
                key={cat.id}
                className={`bg-white border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all duration-200 ${
                  cat.active
                    ? "border-gray-200 hover:border-emerald-500/50 hover:shadow-md"
                    : "border-gray-200 bg-gray-50/50 opacity-60"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center">
                      <IconComp className="w-5 h-5 text-emerald-600" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Active Status Badge */}
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
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
                      {cat.isDefault && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-extrabold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                      {cat.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">ID: {cat.id}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {cat.id !== "all" && (
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>{editingCategory ? "Edit Category" : "Add New Category"}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short summary for this footwear collection..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

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
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
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

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  {editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
