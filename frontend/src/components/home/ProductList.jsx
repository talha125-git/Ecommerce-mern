import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import productsData from "@/data/products.json";
import ProductCard from "./ProductCard";
import { Flame, Sparkles, SlidersHorizontal, Search, Tag, Grid } from "lucide-react";

const DEFAULT_CAT_NAMES = ["All", "Running", "Casual", "Retro", "Performance", "Lifestyle", "High Top", "Training"];

export default function ProductList() {
  const [activeTab, setActiveTab] = useState("all"); // "all", "hot", "new", "sale"
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [dynamicCategories, setDynamicCategories] = useState(DEFAULT_CAT_NAMES);
  const [productsList, setProductsList] = useState(productsData);
  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL || "";

  // Fetch dynamic categories from backend
  useEffect(() => {
    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => {
        if (res.data && Array.isArray(res.data.categories)) {
          const activeCatNames = res.data.categories
            .filter((cat) => cat.active)
            .map((cat) => cat.name);
          if (activeCatNames.length > 0) {
            // Ensure "All" is always first
            const hasAll = activeCatNames.includes("All");
            const finalCats = hasAll
              ? ["All", ...activeCatNames.filter((c) => c !== "All")]
              : ["All", ...activeCatNames];
            setDynamicCategories(finalCats);
          }
        }
      })
      .catch((err) => {
        console.log("Could not fetch categories from server, fallback to default:", err);
      });
  }, []);

  // Fetch dynamic products from backend
  useEffect(() => {
    axios
      .get(`${API_URL}/api/products`)
      .then((res) => {
        if (res.data && Array.isArray(res.data.products) && res.data.products.length > 0) {
          setProductsList(res.data.products);
        }
      })
      .catch((err) => {
        console.log("Could not fetch products from server, using local fallback:", err);
      });
  }, []);

  // Listen to hash changes in URL (e.g. #hot-products or #new-arrivals)
  useEffect(() => {
    if (location.hash === "#hot-products") {
      setActiveTab("hot");
    } else if (location.hash === "#new-arrivals") {
      setActiveTab("new");
    }
  }, [location.hash]);

  const categories = dynamicCategories;

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return productsList
      .filter((product) => {
        // Tab Filter
        if (activeTab === "hot" && !product.isHot && product.badge !== "HOT" && product.badge !== "BESTSELLER") return false;
        if (activeTab === "new" && !product.isNew && product.badge !== "NEW") return false;
        if (activeTab === "sale" && product.badge !== "SALE" && !product.originalPrice) return false;

        // Category Filter
        if (selectedCategory !== "All" && product.category !== selectedCategory) return false;

        // Search Query
        if (
          searchQuery &&
          !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(product.description || "").toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0; // featured
      });
  }, [productsList, activeTab, selectedCategory, searchQuery, sortBy]);

  const hotProductsCount = productsList.filter((p) => p.isHot || p.badge === "HOT" || p.badge === "BESTSELLER").length;
  const newArrivalsCount = productsList.filter((p) => p.isNew || p.badge === "NEW").length;


  return (
    <section id="products" className="py-12 space-y-10 scroll-mt-24">
      {/* Main Section Header */}
      <div className="text-center mx-auto max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider">
          <Tag className="h-4 w-4" />
          <span>Curated Footwear Catalog</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
          Explore Our Featured Collections
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg text-balance">
          Discover high-performance runners, iconic retro kicks, and casual everyday sneakers designed to elevate your style.
        </p>
      </div>

      {/* Main Tabs (All, Hot Products, New Arrivals, Sale) */}
      <div className="flex flex-wrap items-center justify-center gap-3 border-b border-border/80 pb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
            activeTab === "all"
              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Grid className="h-4 w-4" />
          <span>All Products</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20 text-current font-extrabold">
            {productsList.length}
          </span>
        </button>

        <button
          id="hot-products"
          onClick={() => setActiveTab("hot")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 scroll-mt-28 ${
            activeTab === "hot"
              ? "bg-linear-to-r from-red-600 to-amber-500 text-white shadow-lg shadow-red-500/25 scale-105"
              : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100"
          }`}
        >
          <Flame className="h-4 w-4 fill-current animate-pulse" />
          <span>Hot Products</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20 text-current font-extrabold">
            {hotProductsCount}
          </span>
        </button>

        <button
          id="new-arrivals"
          onClick={() => setActiveTab("new")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 scroll-mt-28 ${
            activeTab === "new"
              ? "bg-linear-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-105"
              : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span> New Arrivals</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20 text-current font-extrabold">
            {newArrivalsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("sale")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
            activeTab === "sale"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-105"
              : "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100"
          }`}
        >
          <span>On Sale</span>
        </button>
      </div>

      {/* Controls Bar: Category Pills, Search, and Sort */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1 hidden sm:inline-block">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort Dropdown */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-50">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 px-3 text-xs sm:text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium text-foreground cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tab Notice Banner */}
      {activeTab === "hot" && (
        <div className="max-w-7xl mx-auto bg-linear-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-red-600 animate-bounce" />
            <div>
              <h4 className="font-extrabold text-foreground text-sm sm:text-base">Showing Hot Products & Bestsellers</h4>
              <p className="text-xs text-muted-foreground">High-demand sneakers with glowing customer reviews and limited stock.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("all")}
            className="text-xs font-semibold text-red-600 underline hover:text-red-700"
          >
            Show All
          </button>
        </div>
      )}

      {activeTab === "new" && (
        <div className="max-w-7xl mx-auto bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            <div>
              <h4 className="font-extrabold text-foreground text-sm sm:text-base">Showing New Arrivals</h4>
              <p className="text-xs text-muted-foreground">The latest sneaker additions and fresh colorways released this season.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("all")}
            className="text-xs font-semibold text-emerald-600 underline hover:text-emerald-700"
          >
            Show All
          </button>
        </div>
      )}

      {/* Product Cards Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed border-border p-8">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No matching products found
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md">
              We couldn't find any sneakers matching your current search or category filters.
            </p>
            <button
              onClick={() => {
                setActiveTab("all");
                setSelectedCategory("All");
                setSearchQuery("");
                setSortBy("featured");
              }}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow hover:bg-primary/90 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
