import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Search, ChevronDown, ShoppingBag, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import productsData from "@/data/products.json";

// ═════════════════════════════════════════════════════════════════════════
// DYNAMIC CATEGORY & SUBCATEGORY SHOP FILTERING ENGINE
// ═════════════════════════════════════════════════════════════════════════
// 1. ADD / DELETE HANDLING:
//    - When you add or delete a category or subcategory in the Admin Dashboard (Setup -> CategoryTab),
//      the Shop automatically updates its dropdown filter and subcategory pills in real-time!
//    - If a category is removed from Admin, it is immediately removed from the dropdown here.
//    - If a user was browsing a category that was deleted, it safely resets to "All Products".
// 2. RESILIENT MATCHING:
//    - Category filter matches against slug, name, ID, or dynamic badges (New Arrivals, Trending).
//    - Subcategory pills filter products by product.subcategory or associated tags.
// ═════════════════════════════════════════════════════════════════════════

// Normalize strings for resilient and case-insensitive comparison
const normalize = (s) => (s || "").toLowerCase().replace(/[-_]/g, " ").trim();

// Dynamic category match: matches against selected category name, slug, id, or special flags
const isCategoryMatch = (p, selectedCat, activeCategoryObj) => {
  if (!selectedCat || selectedCat === "all") return true;
  const s = normalize(selectedCat);
  const pCat = normalize(p.category || p.categoryName || "");

  // Special dynamic filters for badge / tags
  if (s === "new" || s === "new arrivals" || s === "new-arrivals") {
    const badge = normalize(p.badge || "");
    const tags = Array.isArray(p.tags) ? p.tags.map(normalize) : [];
    return Boolean(p.isNew) || pCat === "new arrivals" || pCat === "new" || badge === "new" || tags.includes("new");
  }

  if (s === "trending") {
    const badge = normalize(p.badge || "");
    const tags = Array.isArray(p.tags) ? p.tags.map(normalize) : [];
    return Boolean(p.isHot) || badge === "hot" || tags.includes("hot");
  }

  if (s === "bestseller" || s === "best sellers" || s === "best seller") {
    const badge = normalize(p.badge || "");
    const tags = Array.isArray(p.tags) ? p.tags.map(normalize) : [];
    return badge.includes("popular") || badge.includes("bestseller") || tags.includes("popular") || tags.includes("bestseller");
  }

  // Gather target names from selected category object if available
  const targets = new Set([s]);
  if (activeCategoryObj) {
    if (activeCategoryObj.name) targets.add(normalize(activeCategoryObj.name));
    if (activeCategoryObj.slug) targets.add(normalize(activeCategoryObj.slug));
    if (activeCategoryObj.id) targets.add(normalize(activeCategoryObj.id));
  }

  // Exact gender/department separation to prevent "Men" matching "Women"
  if (targets.has("men") || targets.has("mens") || targets.has("man")) {
    return pCat === "men" || pCat === "mens" || pCat === "man";
  }
  if (targets.has("women") || targets.has("womens") || targets.has("woman")) {
    return pCat === "women" || pCat === "womens" || pCat === "woman";
  }
  if (targets.has("kids") || targets.has("kid") || targets.has("children")) {
    return pCat === "kids" || pCat === "kid" || pCat === "children";
  }

  // Dynamic matching for any category created in Admin Dashboard
  for (const target of targets) {
    if (target && (pCat === target || pCat.includes(target) || target.includes(pCat))) {
      return true;
    }
  }

  return false;
};

// Dynamic subcategory match: matches product.subcategory or product name/tags
const isSubMatch = (p, subFilter) => {
  if (!subFilter) return true;
  const targetNorm = normalize(subFilter);
  const pSubNorm = normalize(p.subcategory || "");

  // 1. If product has a subcategory assigned, match directly
  if (pSubNorm) {
    return pSubNorm === targetNorm || pSubNorm.includes(targetNorm) || targetNorm.includes(pSubNorm);
  }

  // 2. Fallback only if product has NO subcategory assigned at all:
  const pNameNorm = normalize(p.name || "");
  const tags = Array.isArray(p.tags) ? p.tags.map(normalize) : [];
  return pNameNorm.includes(targetNorm) || tags.some((t) => t.includes(targetNorm) || targetNorm.includes(t));
};

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState(productsData);

  // Initialize categories dynamically from local cache if present
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem("cached_categories");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = [{ slug: "all", name: "All Products", subcategories: [] }];
          parsed.forEach((c) => {
            if (c.slug !== "all" && c.active !== false) {
              list.push({
                id: c.id || c.slug,
                slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                name: c.name,
                subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
              });
            }
          });
          return list;
        }
      }
    } catch (e) {}
    return [{ slug: "all", name: "All Products", subcategories: [] }];
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [subFilter, setSubFilter] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const { addToCart } = useCart();

  const API_URL = import.meta.env.VITE_API_URL || "";

  // Synchronize categories dynamically when updated from Admin Dashboard in real-time
  useEffect(() => {
    const handleCategoriesUpdated = (event) => {
      const updatedList = event.detail || [];
      if (Array.isArray(updatedList) && updatedList.length > 0) {
        const catList = [{ slug: "all", name: "All Products", subcategories: [] }];
        updatedList.forEach((c) => {
          if (c.slug !== "all" && c.active !== false) {
            catList.push({
              id: c.id || c.slug,
              slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              name: c.name,
              subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
            });
          }
        });
        setCategories(catList);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "cached_categories" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const catList = [{ slug: "all", name: "All Products", subcategories: [] }];
            parsed.forEach((c) => {
              if (c.slug !== "all" && c.active !== false) {
                catList.push({
                  id: c.id || c.slug,
                  slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  name: c.name,
                  subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
                });
              }
            });
            setCategories(catList);
          }
        } catch (err) {}
      }
    };

    window.addEventListener("categories-updated", handleCategoriesUpdated);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("categories-updated", handleCategoriesUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Update URL filter parameters
  useEffect(() => {
    const catParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const subParam = searchParams.get("sub");

    if (catParam) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory("all");
    }

    if (searchParam !== null && searchParam !== undefined) {
      setSearch(searchParam);
    } else {
      setSearch("");
    }

    if (subParam) {
      setSubFilter(subParam);
    } else {
      setSubFilter("");
    }
  }, [searchParams]);

  // Safety fallback: If active category was deleted from Admin Dashboard, reset to "all"
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "all") {
      const norm = normalize(selectedCategory);
      // Skip special system tags
      if (["new", "new arrivals", "new-arrivals", "trending", "bestseller", "best sellers"].includes(norm)) {
        return;
      }
      const exists = categories.some(
        (c) => normalize(c.slug) === norm || normalize(c.name) === norm || normalize(c.id) === norm
      );
      if (!exists && categories.length > 1) {
        setSelectedCategory("all");
        setSubFilter("");
      }
    }
  }, [categories, selectedCategory]);

  // Fetch products and categories dynamically from backend API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`).catch(() => ({ data: null })),
          axios.get(`${API_URL}/api/categories`).catch(() => ({ data: null })),
        ]);

        // Safely extract products array
        const fetchedProds = Array.isArray(prodRes?.data?.products)
          ? prodRes.data.products
          : Array.isArray(prodRes?.data)
          ? prodRes.data
          : [];

        if (fetchedProds.length > 0) {
          setProducts(fetchedProds);
        } else {
          setProducts(productsData);
        }

        // Safely extract categories array from database
        const fetchedCats = Array.isArray(catRes?.data?.categories)
          ? catRes.data.categories
          : Array.isArray(catRes?.data)
          ? catRes.data
          : [];

        if (fetchedCats.length > 0) {
          const catList = [{ slug: "all", name: "All Products", subcategories: [] }];
          fetchedCats.forEach((c) => {
            if (c.slug !== "all" && c.active !== false) {
              catList.push({
                id: c.id || c.slug,
                slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                name: c.name,
                subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
              });
            }
          });
          setCategories(catList);
          try {
            localStorage.setItem("cached_categories", JSON.stringify(fetchedCats));
          } catch (e) {}
        }
      } catch (err) {
        console.error("Error fetching shop data:", err);
        setProducts(productsData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const safeProducts = Array.isArray(products) ? products : productsData;

  // Selected category object in categories array
  const selectedCategoryObj = useMemo(() => {
    const norm = normalize(selectedCategory);
    return categories.find(
      (c) => normalize(c.slug) === norm || normalize(c.name) === norm || normalize(c.id) === norm
    );
  }, [categories, selectedCategory]);

  // Determine available subcategories dynamically from the active category & its products
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory || selectedCategory === "all") return [];
    const norm = normalize(selectedCategory);
    const catObj = categories.find(
      (c) => normalize(c.slug) === norm || normalize(c.name) === norm || normalize(c.id) === norm
    );

    const subsSet = new Set();

    // 1. Subcategories defined on the category in Admin Dashboard
    if (catObj && Array.isArray(catObj.subcategories)) {
      catObj.subcategories.forEach((s) => {
        const subName = typeof s === "string" ? s.trim() : (s?.name || "").trim();
        if (subName) {
          subsSet.add(subName);
        }
      });
    }

    // 2. Subcategories assigned directly on products matching this category
    safeProducts.forEach((p) => {
      if (isCategoryMatch(p, selectedCategory, catObj)) {
        if (p.subcategory && typeof p.subcategory === "string" && p.subcategory.trim()) {
          subsSet.add(p.subcategory.trim());
        }
      }
    });

    return Array.from(subsSet);
  }, [selectedCategory, categories, safeProducts]);

  // Check if a subcategory pill is currently active
  const isSubActive = (subName, currentSub) => {
    if (!currentSub) return false;
    const nSub = normalize(subName);
    const nCur = normalize(currentSub);
    return nSub === nCur || nSub.includes(nCur) || nCur.includes(nSub);
  };

  // Get friendly display label for subcategory chip
  const getSubDisplayLabel = (sub) => {
    if (!sub) return "";
    const norm = normalize(sub);
    const found = availableSubcategories.find(
      (s) => normalize(s) === norm || normalize(s).includes(norm) || norm.includes(normalize(s))
    );
    return found || sub;
  };

  // Filter and sort products dynamically
  const filtered = useMemo(() => {
    return safeProducts
      .filter((p) => {
        if (!p) return false;
        const nameLower = normalize(p.name);
        const descLower = normalize(p.description);
        const subLower = normalize(p.subcategory || "");
        const tagsLower = Array.isArray(p.tags) ? p.tags.join(" ").toLowerCase() : "";

        // 1. Search Query Match
        const matchSearch =
          !search ||
          nameLower.includes(normalize(search)) ||
          descLower.includes(normalize(search)) ||
          subLower.includes(normalize(search)) ||
          tagsLower.includes(normalize(search));

        // 2. Strict Category Match (dynamic match against admin created category)
        const matchCategory = isCategoryMatch(p, selectedCategory, selectedCategoryObj);

        // 3. Strict Subcategory Match (dynamic match against admin created subcategory)
        const matchSub = isSubMatch(p, subFilter);

        return matchSearch && matchCategory && matchSub;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
        if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
        return 0;
      });
  }, [safeProducts, selectedCategory, selectedCategoryObj, subFilter, search, sortBy]);

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Our Collection
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Explore our curated selection of premium products crafted for style and comfort.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border border-border rounded-2xl p-4 shadow-xs">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Dynamic Category Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSubFilter(""); // Reset subcategory filter when switching category
              }}
              className="w-full sm:w-auto pl-3 pr-8 py-2.5 text-sm bg-background border border-border rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id || cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto pl-3 pr-8 py-2.5 text-sm bg-background border border-border rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer"
            >
              <option value="default">Sort By</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name: A → Z</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Dynamic Subcategory Pills Bar (shown when a specific category is selected) */}
        {availableSubcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSubFilter("")}
              className={cn(
                "px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer",
                !subFilter
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              All {selectedCategoryObj?.name || "Items"}
            </button>
            {availableSubcategories.map((subName) => {
              const active = isSubActive(subName, subFilter);
              return (
                <button
                  key={subName}
                  type="button"
                  onClick={() => setSubFilter(active ? "" : subName)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer",
                    active
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {subName}
                </button>
              );
            })}
          </div>
        )}

        {/* Active Filter Chips */}
        {(selectedCategory !== "all" || subFilter || search) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filtered By:</span>
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <span>{(selectedCategoryObj?.name || selectedCategory).toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSubFilter("");
                  }}
                  className="hover:opacity-75 p-0.5 cursor-pointer"
                  title="Clear category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {subFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <span>{getSubDisplayLabel(subFilter)}</span>
                <button
                  type="button"
                  onClick={() => setSubFilter("")}
                  className="hover:opacity-75 p-0.5 cursor-pointer"
                  title="Clear subcategory filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted text-foreground border border-border">
                <span>Search: &ldquo;{search}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="hover:opacity-75 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSubFilter("");
                setSearch("");
              }}
              className="text-xs text-primary underline hover:opacity-80 font-bold ml-2 cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Results count */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">No products found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or browse all our shoes.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSubFilter("");
                setSearch("");
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((product) => {
              const pid = product._id || product.id;
              return (
                <div
                  key={pid}
                  className="group bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <Link to={`/product/${pid}`} className="block relative">
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={product.image || "https://via.placeholder.com/400"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {product.badge && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-extrabold rounded-full uppercase shadow-xs">
                          {product.badge}
                        </span>
                      )}
                    </Link>

                    <div className="p-4 space-y-2">
                      <Link to={`/product/${pid}`}>
                        <h3 className="font-bold text-sm text-foreground line-clamp-1 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {product.category || "Uncategorized"}
                        {product.subcategory ? ` • ${product.subcategory}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-base font-extrabold text-foreground">
                        Rs. {Number(product.price || 0).toLocaleString()}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="p-2 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary rounded-xl transition-all cursor-pointer"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
