import { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronDown, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import productsData from "@/data/products.json";

export default function ShopPage() {
  const [products, setProducts] = useState(productsData);
  const [categories, setCategories] = useState([{ slug: "all", name: "All" }]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const { addToCart } = useCart();

  const API_URL = import.meta.env.VITE_API_URL || "";

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

  const filtered = safeProducts
    .filter((p) => {
      if (!p) return false;
      const nameMatch = p.name ? p.name.toLowerCase().includes(search.toLowerCase()) : false;
      const descMatch = p.description ? p.description.toLowerCase().includes(search.toLowerCase()) : false;
      const matchSearch = nameMatch || descMatch;

      const pCat = (p.category || "").toLowerCase();
      const matchCategory =
        selectedCategory === "all" ||
        pCat === selectedCategory.toLowerCase() ||
        (p.categoryName && p.categoryName.toLowerCase() === selectedCategory.toLowerCase());

      return matchSearch && matchCategory;
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
          <div className="py-20 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-lg font-bold text-foreground">No products found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
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
                        ${Number(product.price || 0).toFixed(2)}
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
