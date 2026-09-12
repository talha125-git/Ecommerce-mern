import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import {
  Menu,
  Search,
  ShoppingCart,
  X,
  ChevronDown,
  User,
  ShieldCheck,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  Flame,
  Star,
  CheckCircle2,
  Package,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";

// ── Navigation Categories Matching Reference Image ──
const NAV_CATEGORIES = [
  {
    id: "new-arrivals",
    label: "NEW ARRIVALS",
    href: "/shop?category=new",
    isSpecial: false,
    columns: [
      {
        title: "WHAT'S NEW",
        links: [
          { name: "All New Releases", href: "/shop?category=new", badge: "NEW" },
          { name: "Trending This Week", href: "/shop?category=trending", badge: "HOT" },
          { name: "Fresh Sneaker Drops", href: "/shop?category=casual" },
          { name: "High-Performance Runners", href: "/shop?category=running" },
          { name: "Retro Court Editions", href: "/shop?category=retro" },
          { name: "Best Sellers 2026", href: "/shop?category=bestseller", badge: "POPULAR" },
        ],
      },
      {
        title: "SHOP BY GENDER & AGE",
        links: [
          { name: "Men's New Arrivals", href: "/shop?category=men" },
          { name: "Women's Fresh Drops", href: "/shop?category=women" },
          { name: "Kids' Latest Releases", href: "/shop?category=kids" },
          { name: "New Footwear Accessories", href: "/shop?category=accessories" },
          { name: "Exclusive Online Editions", href: "/shop?category=new" },
        ],
      },
    ],
    featured: {
      badge: "SEASON 2026",
      title: "Spring / Summer Drops",
      desc: "Ultra-lightweight mesh and high-energy rebound soles engineered for comfort.",
      cta: "Explore Drops",
      href: "/shop?category=new",
      bgGradient: "from-blue-700 via-indigo-800 to-slate-900",
    },
  },
  {
    id: "men",
    label: "MEN",
    href: "/shop?category=men",
    isSpecial: false,
    columns: [
      {
        title: "FOOTWEAR STYLES",
        links: [
          { name: "Performance Running Shoes", href: "/shop?category=running", badge: "POPULAR" },
          { name: "Everyday Casual Sneakers", href: "/shop?category=casual" },
          { name: "High-Top Streetwear", href: "/shop?category=high top" },
          { name: "Formal Loafers & Dress Shoes", href: "/shop?category=casual" },
          { name: "Comfort Slides & Chappals", href: "/shop?category=casual" },
          { name: "Retro Court Classics", href: "/shop?category=retro" },
        ],
      },
      {
        title: "BY ACTIVITY & FIT",
        links: [
          { name: "Gym & Cross-Training", href: "/shop?category=training" },
          { name: "Marathon & Long Distance", href: "/shop?category=running" },
          { name: "Office & Daily Commute", href: "/shop?category=casual" },
          { name: "Trail & Outdoor Hiking", href: "/shop?category=performance" },
          { name: "Wide-Fit Comfort Soles", href: "/shop?category=men" },
        ],
      },
    ],
    featured: {
      badge: "MEN'S BESTSELLER",
      title: "AirFlex Runner Pro",
      desc: "Engineered dual-density sole with dynamic propulsion for all-day comfort.",
      cta: "Shop Men's",
      href: "/shop?category=men",
      bgGradient: "from-zinc-800 via-slate-900 to-neutral-950",
    },
  },
  {
    id: "women",
    label: "WOMEN",
    href: "/shop?category=women",
    isSpecial: false,
    columns: [
      {
        title: "POPULAR STYLES",
        links: [
          { name: "Everyday Sneakers", href: "/shop?category=casual", badge: "HOT" },
          { name: "Running & Training Kicks", href: "/shop?category=running" },
          { name: "Chunky Platform Soles", href: "/shop?category=lifestyle" },
          { name: "Casual Flats & Loafers", href: "/shop?category=women" },
          { name: "Slip-On Walking Shoes", href: "/shop?category=casual" },
          { name: "Athletic Slides & Sandals", href: "/shop?category=women" },
        ],
      },
      {
        title: "LIFESTYLE & ACTIVITY",
        links: [
          { name: "Yoga & Studio Fitness", href: "/shop?category=training" },
          { name: "Lightweight Commuter", href: "/shop?category=casual" },
          { name: "Minimalist Pastels", href: "/shop?category=lifestyle", badge: "NEW" },
          { name: "Cloud-Comfort Cushioning", href: "/shop?category=running" },
          { name: "Weekend Lifestyle Shoes", href: "/shop?category=casual" },
        ],
      },
    ],
    featured: {
      badge: "WOMEN'S FAVORITE",
      title: "Zenith Flow Comfort",
      desc: "Featherlight seamless knit upper with anatomical arch support for supreme ease.",
      cta: "Shop Women's",
      href: "/shop?category=women",
      bgGradient: "from-rose-700 via-pink-800 to-purple-950",
    },
  },
  {
    id: "kids",
    label: "KIDS",
    href: "/shop?category=kids",
    isSpecial: false,
    columns: [
      {
        title: "BOYS FOOTWEAR",
        links: [
          { name: "Boys Active Sneakers", href: "/shop?category=kids", badge: "POPULAR" },
          { name: "Running & Gym Shoes", href: "/shop?category=kids" },
          { name: "Slip-On Casuals", href: "/shop?category=kids" },
          { name: "High-Grip Play Soles", href: "/shop?category=kids" },
        ],
      },
      {
        title: "GIRLS FOOTWEAR",
        links: [
          { name: "Girls Fashion Sneakers", href: "/shop?category=kids" },
          { name: "Ballerinas & Flat Shoes", href: "/shop?category=kids", badge: "CUTE" },
          { name: "Light-Up & Sparkle Soles", href: "/shop?category=kids" },
          { name: "Everyday Comfort Loafers", href: "/shop?category=kids" },
        ],
      },
      {
        title: "BY AGE & FIT",
        links: [
          { name: "Toddlers (Sizes 22-27)", href: "/shop?category=kids" },
          { name: "Young Kids (Sizes 28-34)", href: "/shop?category=kids" },
          { name: "Juniors (Sizes 35-39)", href: "/shop?category=kids" },
          { name: "Easy-Velcro Fasteners", href: "/shop?category=kids", badge: "EASY" },
        ],
      },
    ],
    featured: {
      badge: "PLAYTIME PROOF",
      title: "Built For Active Kids",
      desc: "Tough scuff-resistant rubber and breathable linings designed for all-day playground fun.",
      cta: "Shop Kids",
      href: "/shop?category=kids",
      bgGradient: "from-emerald-700 via-teal-800 to-cyan-950",
    },
  },
  {
    id: "accessories",
    label: "ACCESSORIES",
    href: "/shop?category=accessories",
    isSpecial: false,
    columns: [
      {
        title: "SHOE CARE & CLEANING",
        links: [
          { name: "Sneaker Foam Cleaner", href: "/shop?category=accessories", badge: "HOT" },
          { name: "Water & Stain Shield Spray", href: "/shop?category=accessories" },
          { name: "Leather Wax & Conditioner", href: "/shop?category=accessories" },
          { name: "Deep-Clean Bristle Brush", href: "/shop?category=accessories" },
          { name: "Shoe Deodorizer & Freshener", href: "/shop?category=accessories" },
        ],
      },
      {
        title: "ESSENTIALS & COMFORT",
        links: [
          { name: "Memory Foam Insoles", href: "/shop?category=accessories", badge: "BEST" },
          { name: "Athletic Cushioned Crew Socks", href: "/shop?category=accessories" },
          { name: "Invisible No-Show Socks", href: "/shop?category=accessories" },
          { name: "Elastic & Flat Laces", href: "/shop?category=accessories" },
          { name: "Gym Duffels & Backpacks", href: "/shop?category=accessories" },
        ],
      },
    ],
    featured: {
      badge: "PRO CARE",
      title: "Complete Care Kit",
      desc: "Professional-grade sneaker foam, water repellent, and hog-bristle brush in a bundle.",
      cta: "Explore Care Kits",
      href: "/shop?category=accessories",
      bgGradient: "from-slate-700 via-zinc-800 to-gray-950",
    },
  },
  {
    id: "school-shoes",
    label: "SCHOOL SHOES",
    href: "/shop?category=school",
    isSpecial: true, // Special styling: Burnt-orange / rust color (#C84B31)
    columns: [
      {
        title: "UNIFORM FOOTWEAR",
        links: [
          { name: "Boys Black Uniform Shoes", href: "/shop?category=school", badge: "TOP PICK" },
          { name: "Girls Black Strap Shoes", href: "/shop?category=school" },
          { name: "White PT & Sports Sneakers", href: "/shop?category=school", badge: "MUST HAVE" },
          { name: "Durable Oxford Lace-Ups", href: "/shop?category=school" },
          { name: "Comfort Slip-On Loafers", href: "/shop?category=school" },
        ],
      },
      {
        title: "CLOSURE & COMFORT",
        links: [
          { name: "Easy Hook & Loop (Velcro)", href: "/shop?category=school", badge: "EASY WEAR" },
          { name: "Classic Formal Lace-Up", href: "/shop?category=school" },
          { name: "Anti-Scuff Genuine Leather", href: "/shop?category=school" },
          { name: "Non-Marking Traction Soles", href: "/shop?category=school" },
          { name: "Orthopedic Breathable Insoles", href: "/shop?category=school" },
        ],
      },
    ],
    featured: {
      badge: "BACK TO SCHOOL 2026",
      title: "Uniform Approved Shoes",
      desc: "Certified school-ready styles engineered with heavy-duty leather to survive the whole academic year.",
      cta: "Shop School Footwear",
      href: "/shop?category=school",
      bgGradient: "from-[#C84B31] via-[#A83820] to-[#701E0E]",
    },
  },
];

export default function Header() {
  const { cart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const cartCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const { pathname } = useLocation();

  const userRole = localStorage.getItem("userRole");
  const isLoggedIn = !!localStorage.getItem("userLoggedIn") || !!localStorage.getItem("token");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setLoginDropdownOpen(false);
  }, [pathname]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileOpen(false);
    }
  };

  const getDashboardPath = () => {
    return userRole === "admin" ? "/admin/dashboard" : "/user/dashboard";
  };

  const toggleMobileCategory = (catId) => {
    setMobileExpandedCat((prev) => (prev === catId ? null : catId));
  };

  // Determine dropdown alignment to prevent viewport overflow
  const getDropdownAlignment = (id) => {
    if (id === "new-arrivals") return "left-0";
    if (id === "school-shoes") return "right-0";
    if (id === "accessories") return "right-0 lg:left-1/2 lg:-translate-x-1/2";
    return "left-1/2 -translate-x-1/2";
  };

  return (
    <header
      id="header"
      className={`sticky top-0 z-50 transition-all duration-300 bg-white ${
        isScrolled
          ? "border-b border-gray-200/90 shadow-md"
          : "border-b border-gray-100 shadow-sm"
      }`}
    >
      {/* ═════════════════════════════════════════════════════════════════
          TOP BAR: Brand Logo, Search Bar, Auth/Dashboard & Cart
      ═════════════════════════════════════════════════════════════════ */}
      <div className="container mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? (
                <X className="h-6 w-6 text-gray-800" />
              ) : (
                <Menu className="h-6 w-6 text-gray-800" />
              )}
            </button>

            <Link
              to="/"
              className="text-2xl sm:text-3xl tracking-tight text-gray-950 font-black hover:opacity-90 transition-opacity flex items-center gap-1"
              aria-label="Store Home"
            >
              <span>{settings?.storeName?.split(" ")[0] || "BLOOM"}</span>
              <span className="text-primary font-black">
                {settings?.storeName?.split(" ").slice(1).join(" ") || "SHOP"}
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="search"
                placeholder="Search sneakers, running shoes, school shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-gray-50/80 hover:bg-gray-50 border border-gray-200/90 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all shadow-inner"
                aria-label="Search products"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Right Action Icons: Search Toggle (Mobile), Cart & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Icon Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Open search input"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Shopping Cart Button */}
            <Link
              to={isLoggedIn ? "/user/dashboard?tab=cart" : "/cart"}
              className="relative p-2 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group flex items-center gap-2"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-primary transition-colors" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 bg-[#C84B31] text-white text-[11px] font-extrabold rounded-full min-w-5 h-5 flex items-center justify-center px-1 shadow-sm animate-in zoom-in-75 duration-200"
                    aria-label={`${cartCount} items in cart`}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-bold text-gray-700 group-hover:text-primary">
                Cart
              </span>
            </Link>

            {/* Auth Buttons / User Dashboard Pill */}
            <div className="hidden sm:flex items-center space-x-2">
              {isLoggedIn ? (
                <Link to={getDashboardPath()}>
                  <Button
                    size="sm"
                    variant="default"
                    className="text-xs font-bold gap-1.5 rounded-xl shadow-sm px-3.5 py-2"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  {/* Sign In Dropdown Button */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                      className="text-xs font-semibold gap-1 rounded-xl px-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      Sign In{" "}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          loginDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Button>

                    {loginDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5">
                        <Link
                          to="/login"
                          onClick={() => setLoginDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-950 transition"
                        >
                          <User className="w-4 h-4 text-primary" /> User Login
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <Link
                          to="/admin/login"
                          onClick={() => setLoginDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-950 transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#C84B31]" /> Admin Login
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link to="/register">
                    <Button
                      size="sm"
                      variant="default"
                      className="text-xs font-bold rounded-xl px-4 py-2"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Expandable Box */}
        {isSearchOpen && (
          <div className="lg:hidden mt-3 pt-2 pb-1 border-t border-gray-100 animate-in slide-in-from-top duration-200">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="search"
                placeholder="Search shoes, sneakers, school shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Search products"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          DEDICATED HORIZONTAL NAVIGATION BAR (Matches Reference Image)
          Items: NEW ARRIVALS | MEN | WOMEN | KIDS | ACCESSORIES | SCHOOL SHOES
      ═════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block border-t border-gray-100 bg-white/95">
        <div className="container mx-auto px-4 sm:px-6">
          <nav
            className="flex items-center justify-center space-x-6 xl:space-x-10 relative"
            role="navigation"
            aria-label="Main Store Navigation"
          >
            {NAV_CATEGORIES.map((cat) => (
              <div key={cat.id} className="relative group py-2.5">
                {/* Category Navigation Link / Button */}
                <Link
                  to={cat.href}
                  className={`inline-flex items-center gap-1.5 py-1 text-xs xl:text-[13px] tracking-wider uppercase font-semibold transition-all duration-200 relative ${
                    cat.isSpecial
                      ? "text-[#C84B31] font-bold hover:text-[#A83820]"
                      : "text-gray-700 hover:text-black font-medium"
                  }`}
                >
                  <span>{cat.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-all duration-200 group-hover:rotate-180 ${
                      cat.isSpecial ? "text-[#C84B31]" : "text-gray-400 group-hover:text-black"
                    }`}
                  />
                  {/* Subtle active / hover bottom line indicator */}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center ${
                      cat.isSpecial ? "bg-[#C84B31]" : "bg-black"
                    }`}
                  />
                </Link>

                {/* ── SMOOTH ON-HOVER DROPDOWN MEGA MENU ── */}
                <div
                  className={`absolute top-full ${getDropdownAlignment(
                    cat.id
                  )} pt-2.5 z-50 pointer-events-none opacity-0 invisible -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0 transition-all duration-300 ease-out`}
                  style={{ minWidth: "680px", maxWidth: "90vw" }}
                >
                  <div className="bg-white/98 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl p-6 ring-1 ring-black/5">
                    <div className="grid grid-cols-12 gap-6">
                      {/* Subcategories Section */}
                      <div
                        className={`grid gap-6 ${
                          cat.columns.length === 3 ? "col-span-8 grid-cols-3" : "col-span-7 grid-cols-2"
                        }`}
                      >
                        {cat.columns.map((col, cIdx) => (
                          <div key={cIdx} className="space-y-3">
                            <h4 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-100 pb-1.5">
                              {col.title}
                            </h4>
                            <ul className="space-y-2">
                              {col.links.map((link, lIdx) => (
                                <li key={lIdx}>
                                  <Link
                                    to={link.href}
                                    className="group/link flex items-center justify-between text-xs font-medium text-gray-700 hover:text-black transition-colors py-0.5"
                                  >
                                    <span className="group-hover/link:translate-x-1 group-hover/link:text-primary transition-all duration-150">
                                      {link.name}
                                    </span>
                                    {link.badge && (
                                      <span
                                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                          link.badge === "HOT" || link.badge === "SALE"
                                            ? "bg-rose-100 text-rose-600"
                                            : link.badge === "NEW"
                                            ? "bg-blue-100 text-blue-600"
                                            : link.badge === "TOP PICK" ||
                                              link.badge === "MUST HAVE" ||
                                              cat.isSpecial
                                            ? "bg-orange-100 text-[#C84B31]"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        {link.badge}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Featured Spotlight Card */}
                      {cat.featured && (
                        <div
                          className={`${
                            cat.columns.length === 3 ? "col-span-4" : "col-span-5"
                          }`}
                        >
                          <div
                            className={`h-full rounded-2xl bg-gradient-to-br ${cat.featured.bgGradient} p-5 text-white flex flex-col justify-between shadow-lg relative overflow-hidden group/card`}
                          >
                            <div className="relative z-10 space-y-2">
                              <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white shadow-sm">
                                {cat.featured.badge}
                              </span>
                              <h5 className="text-base font-extrabold leading-snug">
                                {cat.featured.title}
                              </h5>
                              <p className="text-xs text-white/80 line-clamp-3 leading-relaxed">
                                {cat.featured.desc}
                              </p>
                            </div>
                            <div className="relative z-10 pt-5">
                              <Link
                                to={cat.featured.href}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 hover:bg-white hover:text-gray-950 px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-200 group-hover/card:gap-2 shadow-sm"
                              >
                                <span>{cat.featured.cta}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          MOBILE NAVIGATION DRAWER (Slide-in with Accordions)
      ═════════════════════════════════════════════════════════════════ */}
      {isMobileOpen && (
        <nav
          className="lg:hidden fixed inset-x-0 top-[60px] bottom-0 bg-white/98 backdrop-blur-2xl z-50 overflow-y-auto px-5 py-6 space-y-6 animate-in slide-in-from-top-4 duration-200 border-t border-gray-100 shadow-2xl"
          role="navigation"
          aria-label="Mobile Navigation Drawer"
        >
          {/* Main Category Accordions */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-1 mb-2">
              Browse Categories
            </p>

            {NAV_CATEGORIES.map((cat) => {
              const isExpanded = mobileExpandedCat === cat.id;

              return (
                <div
                  key={cat.id}
                  className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50"
                >
                  <button
                    onClick={() => toggleMobileCategory(cat.id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors"
                  >
                    <span
                      className={`text-sm font-bold tracking-wide uppercase ${
                        cat.isSpecial ? "text-[#C84B31]" : "text-gray-800"
                      }`}
                    >
                      {cat.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-gray-900" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-4 bg-white border-t border-gray-100 animate-in fade-in duration-150">
                      {cat.columns.map((col, cIdx) => (
                        <div key={cIdx} className="space-y-2">
                          <h6 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {col.title}
                          </h6>
                          <div className="space-y-1.5 pl-1">
                            {col.links.map((link, lIdx) => (
                              <Link
                                key={lIdx}
                                to={link.href}
                                onClick={closeMobileMenu}
                                className="flex items-center justify-between text-xs font-medium text-gray-700 hover:text-primary py-1"
                              >
                                <span>{link.name}</span>
                                {link.badge && (
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                      cat.isSpecial
                                        ? "bg-orange-100 text-[#C84B31]"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {link.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Direct Category Shop Link */}
                      <Link
                        to={cat.href}
                        onClick={closeMobileMenu}
                        className={`inline-flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-bold ${
                          cat.isSpecial
                            ? "bg-orange-50 text-[#C84B31]"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <span>View All {cat.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Secondary Quick Links */}
          <div className="border-t border-gray-100 pt-4 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-1 mb-2">
              Quick Links
            </p>
            <Link
              to="/shop"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              All Products & Collections
            </Link>
            <Link
              to="/about"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              About Our Store
            </Link>
            <Link
              to="/contact"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              Contact & Customer Support
            </Link>
          </div>

          {/* User Account & Login Buttons on Mobile */}
          <div className="border-t border-gray-100 pt-4 space-y-2.5">
            {isLoggedIn ? (
              <Button className="w-full text-xs font-bold rounded-xl" variant="default" asChild>
                <Link to={getDashboardPath()} onClick={closeMobileMenu}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold justify-between rounded-xl"
                  asChild
                >
                  <Link to="/login" onClick={closeMobileMenu}>
                    <span>User Login</span>
                    <User className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold justify-between text-[#C84B31] border-orange-200 hover:bg-orange-50 rounded-xl"
                  asChild
                >
                  <Link to="/admin/login" onClick={closeMobileMenu}>
                    <span>Admin Login</span>
                    <ShieldCheck className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  className="w-full text-xs font-bold rounded-xl"
                  variant="default"
                  asChild
                >
                  <Link to="/register" onClick={closeMobileMenu}>
                    Create Free Account
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
