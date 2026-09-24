import { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronDown, ShoppingBag, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import productsData from "@/data/products.json";

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState(productsData);
  const [categories, setCategories] = useState([{ slug: "all", name: "All" }]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [subFilter, setSubFilter] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const { addToCart } = useCart();

  const API_URL = import.meta.env.VITE_API_URL || "";

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`).catch(() => ({ data: null })),
          axios.get(`${API_URL}/api/categories`).catch(() => ({ data: null }))
        ]);

        // Safely extract products array
        const fetchedProds = Array.isArray(prodRes.data?.products)
          ? prodRes.data.products
          : Array.isArray(prodRes.data)
          ? prodRes.data
          : [];

        if (fetchedProds.length > 0) {
          setProducts(fetchedProds);
        } else {
          setProducts(productsData);
        }

        // Safely extract categories array
        const fetchedCats = Array.isArray(catRes.data?.categories)
          ? catRes.data.categories
          : Array.isArray(catRes.data)
          ? catRes.data
          : [];

        if (fetchedCats.length > 0) {
          const catList = [{ slug: "all", name: "All" }];
          fetchedCats.forEach((c) => {
            if (c.slug !== "all" && (c.active === undefined || c.active)) {
              catList.push({ slug: c.slug || c.name.toLowerCase(), name: c.name });
            }
          });
          setCategories(catList);
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

  const normalize = (s) => (s || "").toLowerCase().replace(/[-_]/g, " ").trim();

  const SUB_KEYWORD_MAP = {
    boys: ["boy", "boys"],
    girls: ["girl", "girls", "sparkle", "rainbow"],
    "light-up": ["light", "glow", "led"],
    light: ["light", "glow", "led"],
    glow: ["light", "glow", "led"],
    toddler: ["toddler", "toddlers", "firststeps", "tinytoes", "walker", "22-27", "22–27"],
    toddlers: ["toddler", "toddlers", "firststeps", "tinytoes", "walker", "22-27", "22–27"],
    junior: ["junior", "juniors", "speedster", "court", "28-35", "28–35"],
    juniors: ["junior", "juniors", "speedster", "court", "28-35", "28–35"],
    velcro: ["velcro", "easylock", "playtime", "sturdywalk", "strap", "hook"],
    running: ["run", "running", "runner", "airstride", "velocity", "stride"],
    casual: ["casual", "sneaker", "urban", "pace"],
    loafers: ["loafer", "loafers", "oxford", "formal", "leather"],
    formal: ["loafer", "loafers", "oxford", "formal", "leather"],
    training: ["train", "training", "gym", "crossfit", "apex", "power"],
    walking: ["walk", "walking", "walker", "commute", "comfort"],
    wide: ["wide", "extra-wide", "cloudgrip"],
    daily: ["daily", "everyday", "cloud", "aura"],
    flats: ["flat", "flats", "ballerina", "pumps"],
    yoga: ["yoga", "studio", "pilates", "harmony", "flex"],
    platform: ["platform", "chunky", "horizon"],
    comfort: ["comfort", "cloud", "soft", "purecloud"],
    black: ["black", "uniform", "scholar", "premier", "oxford"],
    strap: ["strap", "mary jane", "buckle", "velcro"],
    white: ["white", "pt", "canvas", "assembly", "all-star"],
    leather: ["leather", "cowhide", "oxford", "toughgrip", "premier"],
    soles: ["non-marking", "marking", "soles", "sole", "academy", "rubber"],
    foam: ["foam", "cleaner"],
    water: ["shield", "water", "spray", "nano", "hydrophobic"],
    shield: ["shield", "water", "spray", "nano", "hydrophobic"],
    brush: ["brush", "bristle"],
    insoles: ["insole", "insoles", "memory foam", "cushion", "orthopedic"],
    socks: ["sock", "socks", "crew", "cotton"],
    laces: ["lace", "laces", "reflective", "ultralock"],
    release: ["new", "release", "2026"],
    trending: ["hot", "trend", "popular"],
    bestseller: ["bestseller", "popular", "top pick", "must have", "best"],
  };

  const filtered = safeProducts
    .filter((p) => {
      if (!p) return false;
      const nameLower = normalize(p.name);
      const descLower = normalize(p.description);
      const catLower = normalize(p.category || p.categoryName);
      const subLower = normalize(p.subcategory || "");
      const tagsLower = Array.isArray(p.tags) ? p.tags.join(" ").toLowerCase() : "";
      const badgeLower = normalize(p.badge);
      const combinedText = `${nameLower} ${descLower} ${catLower} ${subLower} ${tagsLower} ${badgeLower}`;

      // 1. Search Query Match
      const matchSearch =
        !search ||
        nameLower.includes(normalize(search)) ||
        descLower.includes(normalize(search)) ||
        subLower.includes(normalize(search)) ||
        tagsLower.includes(normalize(search));

      // 2. Category Match (normalize hyphens e.g. "school-shoes" -> "school shoes")
      const selectedCatLower = normalize(selectedCategory);
      let matchCategory = true;
      if (selectedCatLower && selectedCatLower !== "all") {
        if (selectedCatLower === "new" || selectedCatLower === "new arrivals") {
          matchCategory = p.isNew || badgeLower.includes("new") || catLower.includes("new") || tagsLower.includes("new");
        } else if (selectedCatLower === "trending" || selectedCatLower === "bestseller") {
          matchCategory =
            p.isHot ||
            badgeLower.includes("hot") ||
            badgeLower.includes("popular") ||
            badgeLower.includes("bestseller") ||
            tagsLower.includes("hot") ||
            tagsLower.includes("popular");
        } else {
          matchCategory =
            catLower === selectedCatLower ||
            catLower.includes(selectedCatLower) ||
            selectedCatLower.includes(catLower) ||
            nameLower.includes(selectedCatLower);
        }
      }

      // 3. Sub-item Match (e.g. boys, girls, toddler, light-up, velcro, running, etc.)
      let matchSub = true;
      if (subFilter) {
        const normalizedSub = normalize(subFilter);
        const keywords =
          SUB_KEYWORD_MAP[normalizedSub] ||
          normalizedSub.split(/\s+/).filter(Boolean);
        matchSub = subLower.includes(normalizedSub) || keywords.some((kw) => combinedText.includes(kw));
      }

      return matchSearch && matchCategory && matchSub;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

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
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm">
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

          {/* Category Filter */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto pl-3 pr-8 py-2.5 text-sm bg-background border border-border rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
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

        {/* Active Filter Chips */}
        {(selectedCategory !== "all" || subFilter || search) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filtered By:</span>
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <span>Category: {selectedCategory.toUpperCase().replace(/[-_]/g, " ")}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="hover:opacity-75 p-0.5 cursor-pointer"
                  title="Clear category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {subFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                <span>Item: {subFilter.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => setSubFilter("")}
                  className="hover:opacity-75 p-0.5 cursor-pointer"
                  title="Clear item filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
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
              onClick={() => { setSelectedCategory("all"); setSubFilter(""); setSearch(""); }}
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
              onClick={() => { setSelectedCategory("all"); setSubFilter(""); setSearch(""); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity"
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
                  className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <Link to={`/product/${pid}`} className="block relative">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.image || "https://via.placeholder.com/400"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {product.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-extrabold rounded-full uppercase">
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
                    </p>
                    <div className="flex items-center justify-between pt-1">
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
