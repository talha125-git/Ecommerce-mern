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
import axios from "axios";

// ── Badge Style Helper for Luxury Aesthetics ──
const getBadgeClass = (badge, isSpecial) => {
  if (badge === "HOT" || badge === "SALE") {
    return "bg-rose-50 text-rose-600 border border-rose-200/80";
  }
  if (badge === "NEW") {
    return "bg-blue-50 text-blue-600 border border-blue-200/80";
  }
  if (badge === "POPULAR") {
    return "bg-purple-50 text-purple-600 border border-purple-200/80";
  }
  if (badge === "TOP PICK" || badge === "MUST HAVE" || isSpecial) {
    return "bg-orange-50 text-[#C84B31] border border-orange-200/80";
  }
  if (badge === "CUTE") {
    return "bg-pink-50 text-pink-600 border border-pink-200/80";
  }
  if (badge === "EASY WEAR" || badge === "EASY") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200/80";
  }
  if (badge === "BEST") {
    return "bg-amber-50 text-amber-700 border border-amber-200/80";
  }
  return "bg-gray-100 text-gray-700 border border-gray-200/80";
};

// ═════════════════════════════════════════════════════════════════════════
// DYNAMIC NAVIGATION CATEGORIES & SUBCATEGORIES SYSTEM
// ═════════════════════════════════════════════════════════════════════════
// 1. DYNAMIC REMOVAL & ADDITION:
//    - When you delete a category or subcategory in the Admin Dashboard (Setup -> CategoryTab),
//      it is removed here in real time without refreshing the page!
//    - When you add a new category or subcategory in Admin, it appears automatically!
// 2. CURATED VISUAL PRESETS:
//    - Built-in categories and known subcategories retain ultra-luxury visuals,
//      custom subtitles, badges, and spotlight cards.
//    - Any custom category created by the Admin gets dynamically formatted with high-res
//      product imagery, custom columns, and direct shop links.
// ═════════════════════════════════════════════════════════════════════════

const normalizeKey = (s) => (s || "").toLowerCase().replace(/[-_\s]+/g, "");

// High-resolution footwear fallback images for dynamically created categories
const FALLBACK_CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=300&auto=format&fit=crop"
];

// Curated visual presets for known categories & subcategories
const CATEGORY_VISUAL_PRESETS = {
  "newarrivals": {
    label: "NEW ARRIVALS",
    isSpecial: false,
    featured: {
      badge: "SEASON 2026",
      title: "Spring / Summer Drops",
      desc: "Ultra-lightweight mesh and high-energy rebound soles engineered for comfort.",
      cta: "Explore Drops",
      href: "/shop?category=new",
      bgGradient: "from-blue-700 via-indigo-800 to-slate-900",
    },
    subVisuals: {
      "new releases": { subtitle: "Fresh 2026 Drops", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop", badge: "NEW" },
      "trending now": { subtitle: "Most Wanted Styles", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&auto=format&fit=crop", badge: "HOT" },
      "best sellers": { subtitle: "Top Rated Favorites", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&auto=format&fit=crop", badge: "POPULAR" },
      "men's new in": { subtitle: "Performance & Comfort", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&auto=format&fit=crop" },
      "mens new in": { subtitle: "Performance & Comfort", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&auto=format&fit=crop" },
      "women's new in": { subtitle: "Chic & Cloud Comfort", image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop" },
      "womens new in": { subtitle: "Chic & Cloud Comfort", image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop" },
      "kids' new in": { subtitle: "Durable & Play-Ready", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop" },
      "kids new in": { subtitle: "Durable & Play-Ready", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop" },
    }
  },
  "men": {
    label: "MEN",
    isSpecial: false,
    featured: {
      badge: "MEN'S BESTSELLER",
      title: "AirStride Pro Running",
      desc: "Engineered dual-density sole with dynamic propulsion for all-day comfort.",
      cta: "Shop Men's",
      href: "/shop?category=men",
      bgGradient: "from-zinc-800 via-slate-900 to-neutral-950",
    },
    subVisuals: {
      "running shoes": { subtitle: "High-Mileage Cushion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop", badge: "POPULAR" },
      "casual sneakers": { subtitle: "Everyday Streetwear", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&auto=format&fit=crop" },
      "formal loafers": { subtitle: "Handcrafted Cowhide", image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=300&auto=format&fit=crop" },
      "gym & training": { subtitle: "Stability & Agility", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&auto=format&fit=crop" },
      "gym training": { subtitle: "Stability & Agility", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&auto=format&fit=crop" },
      "daily walking": { subtitle: "Office & Commute", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&auto=format&fit=crop" },
      "wide-fit shoes": { subtitle: "Pressure-Free Room", image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=300&auto=format&fit=crop" },
      "wide fit shoes": { subtitle: "Pressure-Free Room", image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=300&auto=format&fit=crop" },
    }
  },
  "women": {
    label: "WOMEN",
    isSpecial: false,
    featured: {
      badge: "WOMEN'S FAVORITE",
      title: "Zenith Flow Comfort",
      desc: "Featherlight seamless knit upper with anatomical arch support for supreme ease.",
      cta: "Shop Women's",
      href: "/shop?category=women",
      bgGradient: "from-rose-700 via-pink-800 to-purple-950",
    },
    subVisuals: {
      "daily sneakers": { subtitle: "Featherlight Ease", image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop", badge: "HOT" },
      "running shoes": { subtitle: "Arch Support & Energy", image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=300&auto=format&fit=crop" },
      "flats & pumps": { subtitle: "Memory-Foam Insole", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&auto=format&fit=crop" },
      "flats pumps": { subtitle: "Memory-Foam Insole", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&auto=format&fit=crop" },
      "studio & yoga": { subtitle: "Barefoot Flexibility", image: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=300&auto=format&fit=crop" },
      "studio yoga": { subtitle: "Barefoot Flexibility", image: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=300&auto=format&fit=crop" },
      "platform soles": { subtitle: "Chunky 90s Platform", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&auto=format&fit=crop", badge: "NEW" },
      "cloud comfort": { subtitle: "All-Day Plush Relief", image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=300&auto=format&fit=crop" },
    }
  },
  "kids": {
    label: "KIDS",
    isSpecial: false,
    featured: {
      badge: "PLAYTIME PROOF",
      title: "Built For Active Kids",
      desc: "Tough scuff-resistant rubber and breathable linings designed for all-day playground fun.",
      cta: "Shop Kids",
      href: "/shop?category=kids",
      bgGradient: "from-emerald-700 via-teal-800 to-cyan-950",
    },
    subVisuals: {
      "boys sneakers": { subtitle: "Active & Anti-Scuff", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop", badge: "POPULAR" },
      "girls sneakers": { subtitle: "Glitter & Cushioned", image: "https://images.unsplash.com/photo-1507464098880-e367bc5d2c08?w=300&auto=format&fit=crop", badge: "CUTE" },
      "light-up soles": { subtitle: "Multi-Color LED Soles", image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=300&auto=format&fit=crop", badge: "GLOW" },
      "light up soles": { subtitle: "Multi-Color LED Soles", image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=300&auto=format&fit=crop", badge: "GLOW" },
      "toddlers (22–27)": { subtitle: "First Steps Soft Soles", image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=300&auto=format&fit=crop" },
      "toddlers 22-27": { subtitle: "First Steps Soft Soles", image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=300&auto=format&fit=crop" },
      "toddlers": { subtitle: "First Steps Soft Soles", image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=300&auto=format&fit=crop" },
      "juniors (28–35)": { subtitle: "Court & School Sports", image: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=300&auto=format&fit=crop" },
      "juniors 28-35": { subtitle: "Court & School Sports", image: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=300&auto=format&fit=crop" },
      "juniors": { subtitle: "Court & School Sports", image: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=300&auto=format&fit=crop" },
      "velcro straps": { subtitle: "Easy Self-Fasten Wear", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop", badge: "EASY" },
    }
  },
  "accessories": {
    label: "ACCESSORIES",
    isSpecial: false,
    featured: {
      badge: "PRO CARE",
      title: "Complete Care Kit",
      desc: "Professional-grade sneaker foam, water repellent, and hog-bristle brush in a bundle.",
      cta: "Explore Care Kits",
      href: "/shop?category=accessories",
      bgGradient: "from-slate-700 via-zinc-800 to-gray-950",
    },
    subVisuals: {
      "foam cleaner": { subtitle: "Instant Ready Foam 200ml", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop", badge: "HOT" },
      "water shield": { subtitle: "Nano Hydrophobic Barrier", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop" },
      "cleaning brush": { subtitle: "Dual Hog-Hair Bristle", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop" },
      "memory insoles": { subtitle: "Arch Support Cushion", image: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=300&auto=format&fit=crop", badge: "BEST" },
      "cushioned socks": { subtitle: "Anti-Odor Cotton 3-Pack", image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=300&auto=format&fit=crop" },
      "shoe laces": { subtitle: "3M Reflective Braided", image: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=300&auto=format&fit=crop" },
    }
  },
  "schoolshoes": {
    label: "SCHOOL SHOES",
    isSpecial: true,
    featured: {
      badge: "BACK TO SCHOOL 2026",
      title: "Uniform Approved Shoes",
      desc: "Certified school-ready styles engineered with heavy-duty leather to survive the whole academic year.",
      cta: "Shop School Footwear",
      href: "/shop?category=school-shoes",
      bgGradient: "from-[#C84B31] via-[#A83820] to-[#701E0E]",
    },
    subVisuals: {
      "black uniform": { subtitle: "Polishable Action Leather", image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=300&auto=format&fit=crop", badge: "TOP PICK" },
      "girls strap shoes": { subtitle: "Mary Jane Velcro Strap", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&auto=format&fit=crop", badge: "APPROVED" },
      "white pt shoes": { subtitle: "Morning Assembly Shoes", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&auto=format&fit=crop", badge: "MUST HAVE" },
      "velcro strap": { subtitle: "Quick On/Off Security", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop", badge: "EASY WEAR" },
      "genuine leather": { subtitle: "Durable Oxford Cowhide", image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=300&auto=format&fit=crop" },
      "non-marking soles": { subtitle: "Indoor Court Safe Rubber", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop" },
      "non marking soles": { subtitle: "Indoor Court Safe Rubber", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop" },
    }
  },
};

// Fallback categories if database is not reachable yet
const DEFAULT_CATEGORIES = [
  {
    id: "new-arrivals",
    name: "New Arrivals",
    slug: "new-arrivals",
    active: true,
    subcategories: ["New Releases", "Trending Now", "Best Sellers", "Men's New In", "Women's New In", "Kids' New In"]
  },
  {
    id: "men",
    name: "Men",
    slug: "men",
    active: true,
    subcategories: ["Running Shoes", "Casual Sneakers", "Formal Loafers", "Gym & Training", "Daily Walking", "Wide-Fit Shoes"]
  },
  {
    id: "women",
    name: "Women",
    slug: "women",
    active: true,
    subcategories: ["Daily Sneakers", "Running Shoes", "Flats & Pumps", "Studio & Yoga", "Platform Soles", "Cloud Comfort"]
  },
  {
    id: "kids",
    name: "Kids",
    slug: "kids",
    active: true,
    subcategories: ["Boys Sneakers", "Girls Sneakers", "Light-Up Soles", "Toddlers (22–27)", "Juniors (28–35)", "Velcro Straps"]
  },
  {
    id: "accessories",
    name: "Accessories",
    slug: "accessories",
    active: true,
    subcategories: ["Foam Cleaner", "Water Shield", "Cleaning Brush", "Memory Insoles", "Cushioned Socks", "Shoe Laces"]
  },
  {
    id: "school-shoes",
    name: "School Shoes",
    slug: "school-shoes",
    active: true,
    subcategories: ["Black Uniform", "Girls Strap Shoes", "White PT Shoes", "Velcro Strap", "Genuine Leather", "Non-Marking Soles"]
  }
];

// ── Primary Store Navigation Tabs (Matches Reference Image) ──
const PRIMARY_NAV_ITEMS = [
  { id: "new-arrivals", slug: "new-arrivals", name: "New Arrivals", label: "NEW ARRIVALS", href: "/shop?category=new", isSpecial: false },
  { id: "men", slug: "men", name: "Men", label: "MEN", href: "/shop?category=men", isSpecial: false },
  { id: "women", slug: "women", name: "Women", label: "WOMEN", href: "/shop?category=women", isSpecial: false },
  { id: "kids", slug: "kids", name: "Kids", label: "KIDS", href: "/shop?category=kids", isSpecial: false },
  { id: "accessories", slug: "accessories", name: "Accessories", label: "ACCESSORIES", href: "/shop?category=accessories", isSpecial: false },
  { id: "school-shoes", slug: "school-shoes", name: "School Shoes", label: "SCHOOL SHOES", href: "/shop?category=school-shoes", isSpecial: true },
];

// ── Dynamic Navigation Builder ──
// Keeps the pristine primary navigation tabs while making all subcategories 100% dynamic
// with custom pictures, subtitles, and badges added in Admin Dashboard
const buildDynamicNavCategories = (rawCats) => {
  const catsArray = Array.isArray(rawCats) ? rawCats : DEFAULT_CATEGORIES;

  // 1. Build primary 6 categories with their dynamic subcategories
  const navList = PRIMARY_NAV_ITEMS.map((tab, tabIdx) => {
    // Find matching category in admin data
    const matchedCat = catsArray.find((c) => {
      if (!c) return false;
      const cId = normalizeKey(c.id || "");
      const cSlug = normalizeKey(c.slug || "");
      const cName = normalizeKey(c.name || "");
      const target = normalizeKey(tab.id);
      return cId === target || cSlug === target || cName === target;
    });

    const rawKey = normalizeKey(tab.id);
    const preset = CATEGORY_VISUAL_PRESETS[rawKey] || null;

    // Dynamically pull subcategories from DB / Admin category
    const rawSubs = Array.isArray(matchedCat?.subcategories) && matchedCat.subcategories.length > 0
      ? matchedCat.subcategories
      : (DEFAULT_CATEGORIES.find((d) => normalizeKey(d.id) === rawKey)?.subcategories || []);

    const links = rawSubs.map((subItem, subIdx) => {
      const subName = typeof subItem === "string" ? subItem : (subItem?.name || "");
      const customImg = typeof subItem === "object" ? subItem?.image : "";
      const customSubtitle = typeof subItem === "object" ? subItem?.subtitle : "";
      const customBadge = typeof subItem === "object" ? subItem?.badge : "";

      const subKey = normalizeKey(subName);
      const subPreset = preset?.subVisuals?.[subKey] || preset?.subVisuals?.[subName.toLowerCase()];

      // Priority: Custom Image from Admin > Curated Preset Image > Fallback Stock Image
      const image =
        customImg ||
        subPreset?.image ||
        FALLBACK_CATEGORY_IMAGES[(tabIdx * 3 + subIdx) % FALLBACK_CATEGORY_IMAGES.length];
      const subtitle = customSubtitle || subPreset?.subtitle || `${tab.name} Style`;
      const badge = customBadge || subPreset?.badge || null;

      return {
        name: subName,
        subtitle,
        href: `/shop?category=${encodeURIComponent(tab.slug)}&sub=${encodeURIComponent(subName)}`,
        image,
        badge,
      };
    });

    // Structure subcategory columns
    let columns = [];
    if (links.length === 0) {
      columns = [
        {
          title: "COLLECTION",
          links: [
            {
              name: `All ${tab.name}`,
              subtitle: `Browse all items in ${tab.name}`,
              href: tab.href,
              image: FALLBACK_CATEGORY_IMAGES[tabIdx % FALLBACK_CATEGORY_IMAGES.length],
            },
          ],
        },
      ];
    } else if (links.length <= 3) {
      columns = [
        {
          title:
            rawKey === "newarrivals"
              ? "WHAT'S NEW"
              : rawKey === "schoolshoes"
              ? "UNIFORM FOOTWEAR"
              : "POPULAR STYLES",
          links,
        },
      ];
    } else {
      const mid = Math.ceil(links.length / 2);
      columns = [
        {
          title:
            rawKey === "newarrivals"
              ? "WHAT'S NEW"
              : rawKey === "schoolshoes"
              ? "UNIFORM FOOTWEAR"
              : "POPULAR STYLES",
          links: links.slice(0, mid),
        },
        {
          title:
            rawKey === "newarrivals"
              ? "SHOP BY GENDER"
              : rawKey === "schoolshoes"
              ? "COMFORT & FIT"
              : "BY ACTIVITY & FIT",
          links: links.slice(mid),
        },
      ];
    }

    return {
      id: tab.id,
      label: tab.label,
      href: tab.href,
      isSpecial: tab.isSpecial,
      columns,
      featured: preset?.featured || {
        badge: `${tab.name.toUpperCase()} 2026`,
        title: `${tab.name} Collection`,
        desc: `Handpicked selection of premium ${tab.name} footwear crafted for comfort and style.`,
        cta: `Shop ${tab.name}`,
        href: tab.href,
        bgGradient: "from-zinc-800 via-slate-900 to-neutral-950",
      },
    };
  });

  // 2. Also append any extra custom categories created in Admin Dashboard (if any)
  const primaryKeys = new Set(PRIMARY_NAV_ITEMS.map((p) => normalizeKey(p.id)));
  catsArray.forEach((c, cIdx) => {
    if (!c || c.active === false) return;
    const k = normalizeKey(c.id || c.slug || c.name || "");
    if (k === "all" || primaryKeys.has(k)) return;

    const catSlug = c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const rawSubs = Array.isArray(c.subcategories) ? c.subcategories : [];
    const links = rawSubs.map((subItem, sIdx) => {
      const subName = typeof subItem === "string" ? subItem : (subItem?.name || "");
      const customImg = typeof subItem === "object" ? subItem?.image : "";
      const customSub = typeof subItem === "object" ? subItem?.subtitle : "";
      const customBadge = typeof subItem === "object" ? subItem?.badge : "";

      return {
        name: subName,
        subtitle: customSub || `${c.name} Style`,
        href: `/shop?category=${encodeURIComponent(catSlug)}&sub=${encodeURIComponent(subName)}`,
        image: customImg || FALLBACK_CATEGORY_IMAGES[(cIdx + sIdx) % FALLBACK_CATEGORY_IMAGES.length],
        badge: customBadge || null,
      };
    });

    navList.push({
      id: c.id || catSlug,
      label: c.name.toUpperCase(),
      href: `/shop?category=${encodeURIComponent(catSlug)}`,
      isSpecial: false,
      columns: [
        {
          title: `${c.name.toUpperCase()} STYLES`,
          links: links.length > 0 ? links : [
            {
              name: `All ${c.name}`,
              subtitle: `Explore ${c.name}`,
              href: `/shop?category=${encodeURIComponent(catSlug)}`,
              image: FALLBACK_CATEGORY_IMAGES[cIdx % FALLBACK_CATEGORY_IMAGES.length],
            }
          ],
        }
      ],
      featured: {
        badge: `${c.name.toUpperCase()} 2026`,
        title: `${c.name} Collection`,
        desc: c.description || `Explore our handpicked ${c.name} footwear collection.`,
        cta: `Shop ${c.name}`,
        href: `/shop?category=${encodeURIComponent(catSlug)}`,
        bgGradient: "from-zinc-800 via-slate-900 to-neutral-950",
      },
    });
  });

  return navList;
};

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
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const { pathname } = location;

  const API_URL = import.meta.env.VITE_API_URL || "";

  // Dynamic Navigation Categories state - synced with MongoDB and Admin Dashboard
  const [navCategories, setNavCategories] = useState(() => {
    try {
      const cached = localStorage.getItem("cached_categories");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return buildDynamicNavCategories(parsed);
        }
      }
    } catch (e) {}
    return buildDynamicNavCategories(DEFAULT_CATEGORIES);
  });

  // Fetch latest categories from backend API and listen for dynamic Admin changes
  useEffect(() => {
    const syncCategories = (rawCats) => {
      if (Array.isArray(rawCats) && rawCats.length > 0) {
        setNavCategories(buildDynamicNavCategories(rawCats));
      }
    };

    // 1. Fetch latest from backend MongoDB
    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => {
        const cats = res.data?.categories || (Array.isArray(res.data) ? res.data : null);
        if (cats && Array.isArray(cats) && cats.length > 0) {
          syncCategories(cats);
          try {
            localStorage.setItem("cached_categories", JSON.stringify(cats));
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.warn("Could not fetch categories in header:", err);
      });

    // 2. Real-time updates when an Admin adds, modifies, or deletes a category/subcategory
    const handleCategoriesUpdated = (event) => {
      if (event.detail && Array.isArray(event.detail)) {
        syncCategories(event.detail);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "cached_categories" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          syncCategories(parsed);
        } catch (err) {}
      }
    };

    window.addEventListener("categories-updated", handleCategoriesUpdated);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("categories-updated", handleCategoriesUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [API_URL]);

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
    setActiveDropdown(null);
    setIsMobileOpen(false);
    setLoginDropdownOpen(false);
  }, [pathname, location.search]);

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

  // Determine dynamic dropdown alignment to prevent viewport overflow based on index
  const getDropdownAlignment = (id, index = 0, total = 1) => {
    if (index === 0) return "left-0";
    if (index === total - 1) return "right-0";
    if (index >= total - 2) return "right-0 lg:left-1/2 lg:-translate-x-1/2";
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
            {navCategories.map((cat, catIdx) => {
              const isOpen = activeDropdown === cat.id;

              return (
                <div
                  key={cat.id}
                  className="relative py-2.5"
                  onMouseEnter={() => setActiveDropdown(cat.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {/* Category Navigation Link / Button */}
                  <Link
                    to={cat.href}
                    onClick={() => setActiveDropdown(null)}
                    className={`inline-flex items-center gap-1.5 py-1 text-xs xl:text-[13px] tracking-wider uppercase font-semibold transition-all duration-200 relative ${
                      cat.isSpecial
                        ? "text-[#C84B31] font-bold hover:text-[#A83820]"
                        : "text-gray-700 hover:text-black font-medium"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 opacity-60 transition-all duration-200 ${
                        isOpen ? "rotate-180 opacity-100" : ""
                      } ${
                        cat.isSpecial ? "text-[#C84B31]" : "text-gray-400"
                      }`}
                    />
                    {/* Subtle active / hover bottom line indicator */}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full transition-transform duration-200 origin-center ${
                        isOpen ? "scale-x-100" : "scale-x-0"
                      } ${cat.isSpecial ? "bg-[#C84B31]" : "bg-black"}`}
                    />
                  </Link>

                  {/* ── SMOOTH ON-HOVER DROPDOWN MEGA MENU (Disappears instantly on click like Hush Puppies) ── */}
                  <div
                    className={`absolute top-full ${getDropdownAlignment(
                      cat.id,
                      catIdx,
                      navCategories.length
                    )} pt-3.5 z-50 transition-all duration-200 ease-out ${
                      isOpen
                        ? "opacity-100 visible pointer-events-auto translate-y-0"
                        : "opacity-0 invisible pointer-events-none -translate-y-2"
                    }`}
                    style={{ minWidth: "860px", maxWidth: "95vw" }}
                  >
                    <div className="bg-white/98 backdrop-blur-2xl border border-gray-100/90 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.16)] p-6 ring-1 ring-black/[0.04]">
                      <div className="grid grid-cols-12 gap-7 items-stretch">
                        {/* Subcategories Section with Image Thumbnails */}
                        <div className="col-span-8 grid grid-cols-2 gap-6 pr-6 border-r border-gray-100/90">
                          {cat.columns.map((col, cIdx) => (
                            <div key={cIdx} className="space-y-3">
                              <h4 className="text-[10px] font-extrabold tracking-[0.14em] text-gray-400 uppercase flex items-center gap-1.5 pb-1.5 border-b border-gray-100/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 inline-block" />
                                {col.title}
                              </h4>
                              <ul className="space-y-1.5">
                                {col.links.map((link, lIdx) => (
                                  <li key={lIdx}>
                                    <Link
                                      to={link.href}
                                      onClick={() => setActiveDropdown(null)}
                                      className="group/link flex items-center gap-3 p-2 -mx-2 rounded-2xl hover:bg-gray-50/90 transition-all duration-150 border border-transparent hover:border-gray-100"
                                    >
                                      {/* Thumbnail Image */}
                                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-2xs group-hover/link:scale-105 transition-transform duration-200">
                                        <img
                                          src={link.image}
                                          alt={link.name}
                                          className="w-full h-full object-cover object-center"
                                          loading="lazy"
                                        />
                                      </div>

                                      {/* Link Details */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1.5">
                                          <span className="text-[12.5px] font-semibold text-gray-800 group-hover/link:text-primary transition-colors truncate">
                                            {link.name}
                                          </span>
                                          {link.badge && (
                                            <span
                                              className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ml-1 shadow-2xs ${getBadgeClass(
                                                link.badge,
                                                cat.isSpecial
                                              )}`}
                                            >
                                              {link.badge}
                                            </span>
                                          )}
                                        </div>
                                        {link.subtitle && (
                                          <p className="text-[10.5px] text-gray-400 truncate">
                                            {link.subtitle}
                                          </p>
                                        )}
                                      </div>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Featured Spotlight Card */}
                        {cat.featured && (
                          <div className="col-span-4 flex flex-col">
                            <div
                              className={`h-full rounded-2xl bg-gradient-to-br ${cat.featured.bgGradient} p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden group/card`}
                            >
                              {/* Ambient luxury light glows */}
                              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/20 blur-xl pointer-events-none" />

                              <div className="relative z-10 space-y-2.5">
                                <span className="inline-block text-[9px] font-extrabold tracking-widest uppercase bg-white/20 backdrop-blur-md border border-white/25 px-2.5 py-0.5 rounded-full text-white shadow-sm">
                                  {cat.featured.badge}
                                </span>
                                <h5 className="text-sm font-black leading-snug tracking-tight text-white">
                                  {cat.featured.title}
                                </h5>
                                <p className="text-[11px] text-white/85 line-clamp-3 leading-relaxed font-normal">
                                  {cat.featured.desc}
                                </p>
                              </div>

                              <div className="relative z-10 pt-4">
                                <Link
                                  to={cat.featured.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-950 bg-white hover:bg-white/95 px-3.5 py-2 rounded-full transition-all duration-200 shadow-md group-hover/card:gap-2 group-hover/card:shadow-lg"
                                >
                                  <span>{cat.featured.cta}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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

            {navCategories.map((cat) => {
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
                                className="flex items-center gap-3 text-xs font-medium text-gray-700 hover:text-primary py-2 px-1 rounded-xl hover:bg-gray-50 transition-colors"
                              >
                                {link.image && (
                                  <img
                                    src={link.image}
                                    alt={link.name}
                                    className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-100"
                                    loading="lazy"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-800">{link.name}</span>
                                    {link.badge && (
                                      <span
                                        className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${
                                          cat.isSpecial
                                            ? "bg-orange-100 text-[#C84B31]"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        {link.badge}
                                      </span>
                                    )}
                                  </div>
                                  {link.subtitle && (
                                    <p className="text-[10px] text-gray-400 truncate">{link.subtitle}</p>
                                  )}
                                </div>
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
