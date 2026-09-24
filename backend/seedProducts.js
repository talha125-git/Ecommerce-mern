const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Category = require("./models/Category");

const CATEGORIES_TO_ADD = [
  {
    id: "all",
    name: "All",
    slug: "all",
    active: true,
    isDefault: true,
    icon: "Grid",
    description: "All available products catalog",
    subcategories: [],
  },
  {
    id: "new-arrivals",
    name: "New Arrivals",
    slug: "new-arrivals",
    active: true,
    isDefault: true,
    icon: "Sparkles",
    description: "Fresh drops, new releases, trending styles, and best sellers",
    subcategories: [
      "New Releases",
      "Trending Now",
      "Best Sellers",
      "Men's New In",
      "Women's New In",
      "Kids' New In",
    ],
  },
  {
    id: "men",
    name: "Men",
    slug: "men",
    active: true,
    isDefault: true,
    icon: "User",
    description: "Men's performance running, casual streetwear, formal loafers, and gym trainers",
    subcategories: [
      "Running Shoes",
      "Casual Sneakers",
      "Formal Loafers",
      "Gym & Training",
      "Daily Walking",
      "Wide-Fit Shoes",
    ],
  },
  {
    id: "women",
    name: "Women",
    slug: "women",
    active: true,
    isDefault: true,
    icon: "Heart",
    description: "Women's daily sneakers, running shoes, flats, yoga studio, platform soles, and cloud comfort",
    subcategories: [
      "Daily Sneakers",
      "Running Shoes",
      "Flats & Pumps",
      "Studio & Yoga",
      "Platform Soles",
      "Cloud Comfort",
    ],
  },
  {
    id: "kids",
    name: "Kids",
    slug: "kids",
    active: true,
    isDefault: true,
    icon: "Smile",
    description: "Kids' boys & girls sneakers, light-up LED soles, toddlers, juniors, and velcro straps",
    subcategories: [
      "Boys Sneakers",
      "Girls Sneakers",
      "Light-Up Soles",
      "Toddlers (22–27)",
      "Juniors (28–35)",
      "Velcro Straps",
    ],
  },
  {
    id: "accessories",
    name: "Accessories",
    slug: "accessories",
    active: true,
    isDefault: true,
    icon: "Package",
    description: "Shoe care foam cleaner, water shield spray, brush, memory insoles, socks, and laces",
    subcategories: [
      "Foam Cleaner",
      "Water Shield",
      "Cleaning Brush",
      "Memory Insoles",
      "Cushioned Socks",
      "Shoe Laces",
    ],
  },
  {
    id: "school-shoes",
    name: "School Shoes",
    slug: "school-shoes",
    active: true,
    isDefault: true,
    icon: "Shield",
    description: "Uniform approved black leather, girls strap shoes, white PT shoes, velcro, and non-marking soles",
    subcategories: [
      "Black Uniform",
      "Girls Strap Shoes",
      "White PT Shoes",
      "Velcro Strap",
      "Genuine Leather",
      "Non-Marking Soles",
    ],
  },
];

const PRODUCTS_DATA = [
  // ── KIDS FOOTWEAR (Boys, Girls, Light-Up, Toddlers, Juniors, Velcro) ──
  {
    name: "StreetRacer Boys Cushioned Runners",
    category: "Kids",
    subcategory: "Boys Sneakers",
    price: 2799,
    originalPrice: 3499,
    description: "Breathable engineered mesh boys running shoes with anti-scuff toe guards and shock-absorbing soles for active boys.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop"
    ],
    stock: 28,
    rating: 4.8,
    reviewsCount: 92,
    isHot: true,
    isNew: false,
    badge: "POPULAR",
    tags: ["POPULAR", "HOT", "BOYS"],
    sizes: [28, 29, 30, 31, 32, 33, 34, 35],
    colors: ["Racer Blue / Orange", "Jet Black / Neon"],
  },
  {
    name: "TurboDash Boys Active Sneakers",
    category: "Kids",
    subcategory: "Boys Sneakers",
    price: 2999,
    originalPrice: 3699,
    description: "Durable high-grip athletic sneakers engineered for school playground sprints, sports, and outdoor activities.",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 22,
    rating: 4.9,
    reviewsCount: 114,
    isHot: true,
    isNew: true,
    badge: "POPULAR",
    tags: ["POPULAR", "HOT", "NEW"],
    sizes: [29, 30, 31, 32, 33, 34],
    colors: ["Electric Red", "Stealth Grey"],
  },
  {
    name: "RainbowBloom Girls Casual Sneakers",
    category: "Kids",
    subcategory: "Girls Sneakers",
    price: 2699,
    originalPrice: 3299,
    description: "Sweet pastel colorway girls sneakers with glitter heel accents, padded memory footbeds, and lightweight flexible soles.",
    image: "https://images.unsplash.com/photo-1507464098880-e367bc5d2c08?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1507464098880-e367bc5d2c08?w=800&auto=format&fit=crop"
    ],
    stock: 25,
    rating: 4.9,
    reviewsCount: 88,
    isHot: false,
    isNew: true,
    badge: "CUTE",
    tags: ["CUTE", "POPULAR", "GIRLS"],
    sizes: [26, 27, 28, 29, 30, 31, 32],
    colors: ["Pastel Lilac", "Cotton Candy Pink"],
  },
  {
    name: "Sparkle Step Girls Fashion Kicks",
    category: "Kids",
    subcategory: "Girls Sneakers",
    price: 2899,
    originalPrice: 3599,
    description: "Shimmering glitter finish with ultra-soft interior mesh lining and cloud-step bounce foam for girls daily comfort.",
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop"
    ],
    stock: 19,
    rating: 4.8,
    reviewsCount: 73,
    isHot: false,
    isNew: true,
    badge: "CUTE",
    tags: ["CUTE", "NEW", "GIRLS"],
    sizes: [27, 28, 29, 30, 31, 32, 33],
    colors: ["Rose Gold Glitter", "Silver Sparkle"],
  },
  {
    name: "FlashLight Kids LED Star Runners",
    category: "Kids",
    subcategory: "Light-Up Soles",
    price: 3199,
    originalPrice: 3999,
    description: "Vibrant multi-color LED motion-activated soles that light up with every bounce and step. USB rechargeable battery.",
    image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&auto=format&fit=crop"
    ],
    stock: 20,
    rating: 4.9,
    reviewsCount: 165,
    isHot: true,
    isNew: true,
    badge: "HOT",
    tags: ["HOT", "GLOW", "POPULAR"],
    sizes: [26, 27, 28, 29, 30, 31, 32],
    colors: ["Cosmic Black Glow", "Neon Cyan Glow"],
  },
  {
    name: "GlowFlex Light-Up Soles",
    category: "Kids",
    subcategory: "Light-Up Soles",
    price: 3099,
    originalPrice: 3899,
    description: "Translucent high-rebound soles equipped with waterproof 7-color LED lights. Durable scuff-proof upper.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 18,
    rating: 4.8,
    reviewsCount: 94,
    isHot: true,
    isNew: true,
    badge: "HOT",
    tags: ["HOT", "GLOW"],
    sizes: [25, 26, 27, 28, 29, 30],
    colors: ["Sky Blue LED", "Flash Purple LED"],
  },
  {
    name: "TinyToes Soft-Sole Toddler Sneaker (22-27)",
    category: "Kids",
    subcategory: "Toddlers (22–27)",
    price: 2199,
    originalPrice: 2799,
    description: "Pediatrician-recommended first walker shoes with flexible zero-drop soles, wide toe box, and anti-slip rubber pods.",
    image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop"
    ],
    stock: 30,
    rating: 4.9,
    reviewsCount: 120,
    isHot: false,
    isNew: true,
    badge: "EASY",
    tags: ["EASY", "POPULAR", "TODDLER"],
    sizes: [22, 23, 24, 25, 26, 27],
    colors: ["Butter Cream", "Baby Sky Blue"],
  },
  {
    name: "FirstSteps Toddler Walker Shoes (22-27)",
    category: "Kids",
    subcategory: "Toddlers (22–27)",
    price: 2299,
    originalPrice: 2899,
    description: "Ultra-plush featherlight toddler walkers with single Velcro quick-strap and soft ankle cushioning.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 24,
    rating: 4.8,
    reviewsCount: 82,
    isHot: false,
    isNew: false,
    badge: "EASY",
    tags: ["EASY", "COMFORT", "TODDLER"],
    sizes: [22, 23, 24, 25, 26, 27],
    colors: ["Mint Green", "Sunny Yellow"],
  },
  {
    name: "Junior Speedster High-Top Sneakers (28-35)",
    category: "Kids",
    subcategory: "Juniors (28–35)",
    price: 3299,
    originalPrice: 4199,
    description: "Retro street basketball inspired high-top junior trainers with ankle stabilization and non-skid herringbone grip.",
    image: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&auto=format&fit=crop"
    ],
    stock: 20,
    rating: 4.8,
    reviewsCount: 105,
    isHot: false,
    isNew: false,
    badge: "BEST",
    tags: ["BEST", "HOT", "JUNIOR"],
    sizes: [28, 29, 30, 31, 32, 33, 34, 35],
    colors: ["Classic Red / Black", "Triple White"],
  },
  {
    name: "SwiftStride Junior Court Shoes (28-35)",
    category: "Kids",
    subcategory: "Juniors (28–35)",
    price: 3199,
    originalPrice: 3999,
    description: "Indoor court and outdoor multi-sport training shoes for junior school athletics and active play.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 16,
    rating: 4.7,
    reviewsCount: 65,
    isHot: false,
    isNew: false,
    badge: "BEST",
    tags: ["BEST", "POPULAR", "JUNIOR"],
    sizes: [28, 29, 30, 31, 32, 33, 34, 35],
    colors: ["Navy / Volt", "All White"],
  },
  {
    name: "EasyLock Kids Velcro Strap Runners",
    category: "Kids",
    subcategory: "Velcro Straps",
    price: 2599,
    originalPrice: 3299,
    description: "Double hook-and-loop self-fastening Velcro straps allow kids to put on and take off their shoes independently in seconds.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 35,
    rating: 4.9,
    reviewsCount: 140,
    isHot: true,
    isNew: true,
    badge: "HOT",
    tags: ["HOT", "EASY WEAR", "POPULAR"],
    sizes: [24, 25, 26, 27, 28, 29, 30, 31],
    colors: ["Charcoal / Lime", "Berry Pink"],
  },
  {
    name: "PlayTime Dual Velcro Kids Everyday Shoes",
    category: "Kids",
    subcategory: "Velcro Straps",
    price: 2499,
    originalPrice: 3199,
    description: "Rugged reinforced rubber toe cap and double Velcro straps withstand playground abrasion and active wear.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 28,
    rating: 4.8,
    reviewsCount: 78,
    isHot: false,
    isNew: false,
    badge: "EASY WEAR",
    tags: ["EASY WEAR", "POPULAR"],
    sizes: [25, 26, 27, 28, 29, 30, 31, 32],
    colors: ["Royal Blue", "Burgundy"],
  },

  // ── MEN FOOTWEAR (Running Shoes, Casual Sneakers, Formal Loafers, Gym & Training, Daily Walking, Wide-Fit Shoes) ──
  {
    name: "AirStride Pro Running Shoes",
    category: "Men",
    subcategory: "Running Shoes",
    price: 4499,
    originalPrice: 5499,
    description: "High-mileage athletic running shoes with responsive nitrogen-infused foam cushioning and breathable engineered mesh.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&auto=format&fit=crop"
    ],
    stock: 24,
    rating: 4.9,
    reviewsCount: 142,
    isHot: true,
    isNew: true,
    badge: "POPULAR",
    tags: ["POPULAR", "HOT", "NEW"],
    sizes: [7, 8, 9, 10, 11],
    colors: ["Red / White", "Core Black"],
  },
  {
    name: "Urban Pace Casual Sneakers",
    category: "Men",
    subcategory: "Casual Sneakers",
    price: 3899,
    originalPrice: 4799,
    description: "Minimalist everyday streetwear sneakers in clean cream and slate tones. Ultra-soft padded collar for all-day comfort.",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop"
    ],
    stock: 35,
    rating: 4.7,
    reviewsCount: 115,
    isHot: true,
    isNew: false,
    badge: "HOT",
    tags: ["HOT", "POPULAR"],
    sizes: [7, 8, 9, 10, 11],
    colors: ["Off-White", "Slate Grey"],
  },
  {
    name: "Oxford Classic Leather Loafers",
    category: "Men",
    subcategory: "Formal Loafers",
    price: 5999,
    originalPrice: 7499,
    description: "Handcrafted genuine full-grain leather formal loafers with cushioned memory insole and durable non-slip rubber outsoles.",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop"
    ],
    stock: 18,
    rating: 4.8,
    reviewsCount: 89,
    isHot: false,
    isNew: false,
    badge: "PREMIUM",
    tags: ["PREMIUM", "POPULAR"],
    sizes: [8, 9, 10, 11],
    colors: ["Classic Brown", "Midnight Black"],
  },
  {
    name: "Apex Power Training Shoes",
    category: "Men",
    subcategory: "Gym & Training",
    price: 4199,
    originalPrice: 4999,
    description: "Flat stable-sole cross-trainer designed for heavy squats, deadlifts, and high-intensity agility workouts.",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop"
    ],
    stock: 20,
    rating: 4.8,
    reviewsCount: 76,
    isHot: false,
    isNew: true,
    badge: "NEW",
    tags: ["NEW", "HOT"],
    sizes: [8, 9, 10, 11],
    colors: ["Neon Volt", "Shadow Black"],
  },
  {
    name: "StreetComfort Daily Walking Shoes",
    category: "Men",
    subcategory: "Daily Walking",
    price: 3799,
    originalPrice: 4599,
    description: "Ergonomic arch-support walking sneakers designed for long city commutes and standing all day in comfort.",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop"
    ],
    stock: 25,
    rating: 4.8,
    reviewsCount: 88,
    isHot: false,
    isNew: true,
    badge: "POPULAR",
    tags: ["POPULAR", "COMFORT"],
    sizes: [7, 8, 9, 10, 11],
    colors: ["Cool Grey", "Midnight Black"],
  },
  {
    name: "CloudGrip Wide-Fit Walkers",
    category: "Men",
    subcategory: "Wide-Fit Shoes",
    price: 3999,
    originalPrice: 4899,
    description: "Specially engineered extra-wide toe box (EE width) preventing bunion pressure with plush shock absorbing soles.",
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&auto=format&fit=crop"
    ],
    stock: 15,
    rating: 4.9,
    reviewsCount: 62,
    isHot: false,
    isNew: false,
    badge: "POPULAR",
    tags: ["POPULAR", "COMFORT"],
    sizes: [8, 9, 10, 11, 12],
    colors: ["Charcoal Grey", "Navy Blue"],
  },

  // ── WOMEN FOOTWEAR (Daily Sneakers, Running Shoes, Flats & Pumps, Studio & Yoga, Platform Soles, Cloud Comfort) ──
  {
    name: "Aura Cloud Daily Sneakers",
    category: "Women",
    subcategory: "Daily Sneakers",
    price: 3699,
    originalPrice: 4499,
    description: "Featherlight slip-on walking sneakers engineered with breathable stretch knit and sculpted memory insole.",
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop"
    ],
    stock: 32,
    rating: 4.9,
    reviewsCount: 138,
    isHot: true,
    isNew: true,
    badge: "HOT",
    tags: ["HOT", "POPULAR", "NEW"],
    sizes: [5, 6, 7, 8, 9],
    colors: ["Lavender Mist", "Clean White"],
  },
  {
    name: "Zenith Velocity Women's Runner",
    category: "Women",
    subcategory: "Running Shoes",
    price: 4399,
    originalPrice: 5299,
    description: "Tailored female-specific ergonomic arch support, tuned rebound foam, and durable carbon-rubber outsole.",
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop"
    ],
    stock: 21,
    rating: 4.8,
    reviewsCount: 97,
    isHot: true,
    isNew: false,
    badge: "POPULAR",
    tags: ["POPULAR", "HOT"],
    sizes: [6, 7, 8, 9],
    colors: ["Coral Blush", "Arctic Blue"],
  },
  {
    name: "Elegance Leather Ballerina Flats",
    category: "Women",
    subcategory: "Flats & Pumps",
    price: 3499,
    originalPrice: 4299,
    description: "Buttery soft lambskin leather ballerina flats featuring 5mm cushioned memory foam insole and flexible skid-safe rubber.",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop"
    ],
    stock: 20,
    rating: 4.7,
    reviewsCount: 54,
    isHot: false,
    isNew: false,
    badge: "POPULAR",
    tags: ["POPULAR", "PREMIUM"],
    sizes: [5, 6, 7, 8],
    colors: ["Nude Beige", "Jet Black"],
  },
  {
    name: "Harmony Flex Studio & Yoga Shoes",
    category: "Women",
    subcategory: "Studio & Yoga",
    price: 2999,
    originalPrice: 3699,
    description: "Ultra-thin barefoot-feel studio footwear with split-sole flexibility for yoga, Pilates, and barre workouts.",
    image: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop"
    ],
    stock: 18,
    rating: 4.8,
    reviewsCount: 42,
    isHot: false,
    isNew: false,
    badge: "POPULAR",
    tags: ["POPULAR", "YOGA"],
    sizes: [6, 7, 8],
    colors: ["Dusty Rose", "Onyx Black"],
  },
  {
    name: "Chunky Horizon Platform Sneakers",
    category: "Women",
    subcategory: "Platform Soles",
    price: 4299,
    originalPrice: 5199,
    description: "Trendy 90s chunky platform sneaker with lightweight hollowed EVA midsole that adds 2 inches of height in total comfort.",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop"
    ],
    stock: 24,
    rating: 4.9,
    reviewsCount: 112,
    isHot: false,
    isNew: true,
    badge: "NEW",
    tags: ["NEW", "HOT", "PLATFORM"],
    sizes: [6, 7, 8, 9],
    colors: ["Chalk White / Silver", "Pastel Multi"],
  },
  {
    name: "PureCloud Ultra-Soft Comfort Walkers",
    category: "Women",
    subcategory: "Cloud Comfort",
    price: 3899,
    originalPrice: 4699,
    description: "Plush multi-density memory cushioning wrapped in a cloud-soft stretch mesh upper for effortless walking all day.",
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop"
    ],
    stock: 28,
    rating: 4.9,
    reviewsCount: 104,
    isHot: true,
    isNew: true,
    badge: "HOT",
    tags: ["HOT", "POPULAR", "COMFORT"],
    sizes: [5, 6, 7, 8, 9],
    colors: ["Cloud Pearl", "Blush Pink"],
  },

  // ── ACCESSORIES (Foam Cleaner, Water Shield, Cleaning Brush, Memory Insoles, Cushioned Socks, Shoe Laces) ──
  {
    name: "Pro Sneaker Foam Cleaner (200ml)",
    category: "Accessories",
    subcategory: "Foam Cleaner",
    price: 899,
    originalPrice: 1199,
    description: "Instant pump foam that breaks down dirt and oil on leather, mesh, canvas, and rubber without soaking or discoloring.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop"
    ],
    stock: 65,
    rating: 4.9,
    reviewsCount: 215,
    isHot: true,
    isNew: false,
    badge: "HOT",
    tags: ["HOT", "POPULAR", "BESTSELLER"],
    sizes: ["200ml Bottle"],
    colors: ["Standard Foam"],
  },
  {
    name: "Nano-Tech Hydrophobic Water Shield Spray",
    category: "Accessories",
    subcategory: "Water Shield",
    price: 1099,
    originalPrice: 1399,
    description: "Nano-coating spray creating an invisible waterproof barrier against rain, slush, coffee stains, and mud splashes.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop"
    ],
    stock: 50,
    rating: 4.9,
    reviewsCount: 180,
    isHot: true,
    isNew: false,
    badge: "POPULAR",
    tags: ["POPULAR", "HOT", "MUST HAVE"],
    sizes: ["250ml Can"],
    colors: ["Clear Matte"],
  },
  {
    name: "Dual-Bristle Deep Clean Shoe Brush",
    category: "Accessories",
    subcategory: "Cleaning Brush",
    price: 599,
    originalPrice: 799,
    description: "Natural soft hog hair on one side for delicate knit & suede, stiff brass/nylon on the other for soles & mud.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop"
    ],
    stock: 80,
    rating: 4.8,
    reviewsCount: 94,
    isHot: false,
    isNew: false,
    badge: "POPULAR",
    tags: ["POPULAR", "ESSENTIAL"],
    sizes: ["Standard Brush"],
    colors: ["Natural Beech Wood"],
  },
  {
    name: "Orthopedic Memory Foam Cushion Insoles",
    category: "Accessories",
    subcategory: "Memory Insoles",
    price: 999,
    originalPrice: 1299,
    description: "Doctor-designed deep heel cup and anatomical arch support to alleviate plantar fasciitis and walking fatigue.",
    image: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop"
    ],
    stock: 75,
    rating: 4.9,
    reviewsCount: 168,
    isHot: false,
    isNew: true,
    badge: "POPULAR",
    tags: ["POPULAR", "COMFORT"],
    sizes: ["Cut-to-Fit (36-46)"],
    colors: ["Blue Cloud Foam"],
  },
  {
    name: "Athletic Cushion Crew Socks (3-Pack)",
    category: "Accessories",
    subcategory: "Cushioned Socks",
    price: 799,
    originalPrice: 999,
    description: "Combed Egyptian cotton with anti-blister terry-cushioned soles and silver-ion odor protection. 3 pairs per pack.",
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&auto=format&fit=crop"
    ],
    stock: 120,
    rating: 4.8,
    reviewsCount: 130,
    isHot: false,
    isNew: false,
    badge: "POPULAR",
    tags: ["POPULAR", "ESSENTIAL"],
    sizes: ["One Size (38-44)"],
    colors: ["Triple White", "Triple Black", "Grey Heather"],
  },
  {
    name: "UltraLock Reflective Replacement Shoe Laces",
    category: "Accessories",
    subcategory: "Shoe Laces",
    price: 499,
    originalPrice: 699,
    description: "High-visibility 3M reflective threads woven into tear-proof braided nylon. 120cm length for sneakers and running shoes.",
    image: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop"
    ],
    stock: 100,
    rating: 4.8,
    reviewsCount: 154,
    isHot: false,
    isNew: true,
    badge: "POPULAR",
    tags: ["POPULAR", "ESSENTIAL"],
    sizes: ["120cm Pair"],
    colors: ["Reflective Black", "Reflective Neon", "Reflective White"],
  },

  // ── SCHOOL SHOES (Black Uniform, Girls Strap Shoes, White PT Shoes, Velcro Strap, Genuine Leather, Non-Marking Soles) ──
  {
    name: "Premier Boys Black Uniform Shoes",
    category: "School Shoes",
    subcategory: "Black Uniform",
    price: 2999,
    originalPrice: 3699,
    description: "High-shine action leather school uniform shoes with padded collar, reinforced toe, and durable non-skid rubber.",
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop"
    ],
    stock: 45,
    rating: 4.9,
    reviewsCount: 156,
    isHot: true,
    isNew: false,
    badge: "TOP PICK",
    tags: ["TOP PICK", "HOT", "POPULAR"],
    sizes: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
    colors: ["Polishable Black"],
  },
  {
    name: "Grace Girls Mary Jane Black Strap Shoes",
    category: "School Shoes",
    subcategory: "Girls Strap Shoes",
    price: 2899,
    originalPrice: 3599,
    description: "Classic Mary Jane silhouette with quick Velcro strap fastener, cushioned arch, and scuff-resistant black finish.",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop"
    ],
    stock: 40,
    rating: 4.8,
    reviewsCount: 132,
    isHot: true,
    isNew: false,
    badge: "POPULAR",
    tags: ["POPULAR", "HOT", "GIRLS"],
    sizes: [26, 27, 28, 29, 30, 31, 32, 33, 34],
    colors: ["Formal Black"],
  },
  {
    name: "All-Star White PT & Sports Shoes",
    category: "School Shoes",
    subcategory: "White PT Shoes",
    price: 2499,
    originalPrice: 2999,
    description: "Mandatory school physical training white canvas shoes with breathable cotton lining and vulcanized white rubber sole.",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop"
    ],
    stock: 60,
    rating: 4.9,
    reviewsCount: 184,
    isHot: true,
    isNew: true,
    badge: "MUST HAVE",
    tags: ["MUST HAVE", "HOT", "POPULAR"],
    sizes: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
    colors: ["Crisp School White"],
  },
  {
    name: "SturdyWalk Easy Velcro School Shoes",
    category: "School Shoes",
    subcategory: "Velcro Strap",
    price: 2799,
    originalPrice: 3399,
    description: "No laces needed: heavy-duty dual Velcro straps engineered for quick dressing during morning school rush.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 35,
    rating: 4.8,
    reviewsCount: 95,
    isHot: false,
    isNew: true,
    badge: "EASY WEAR",
    tags: ["EASY WEAR", "POPULAR"],
    sizes: [28, 29, 30, 31, 32, 33, 34, 35],
    colors: ["School Black"],
  },
  {
    name: "ToughGrip Genuine Leather Oxford School Shoes",
    category: "School Shoes",
    subcategory: "Genuine Leather",
    price: 3499,
    originalPrice: 4299,
    description: "100% genuine full-grain cowhide leather school shoes built tough to withstand an entire academic year of daily wear.",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop"
    ],
    stock: 25,
    rating: 4.9,
    reviewsCount: 110,
    isHot: false,
    isNew: false,
    badge: "POPULAR",
    tags: ["POPULAR", "PREMIUM"],
    sizes: [32, 33, 34, 35, 36, 37, 38, 39],
    colors: ["Waxed Black Cowhide"],
  },
  {
    name: "Academy Non-Marking Sole Uniform Shoes",
    category: "School Shoes",
    subcategory: "Non-Marking Soles",
    price: 2699,
    originalPrice: 3299,
    description: "Certified gym-floor friendly non-marking gum soles that leave zero scuff marks on school basketball and assembly courts.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 30,
    rating: 4.7,
    reviewsCount: 78,
    isHot: false,
    isNew: true,
    badge: "POPULAR",
    tags: ["POPULAR", "NEW"],
    sizes: [28, 29, 30, 31, 32, 33, 34, 35, 36],
    colors: ["Black / Gum Sole"],
  },
];

// Mapping for any legacy product names/categories to clean categories & subcategories
const LEGACY_CATEGORY_MAPPING = {
  Running: { category: "Men", subcategory: "Running Shoes" },
  Casual: { category: "Men", subcategory: "Casual Sneakers" },
  Retro: { category: "Men", subcategory: "Casual Sneakers" },
  Training: { category: "Men", subcategory: "Gym & Training" },
  Performance: { category: "Men", subcategory: "Running Shoes" },
  "High Top": { category: "Men", subcategory: "Casual Sneakers" },
  Lifestyle: { category: "Women", subcategory: "Cloud Comfort" },
  summer: { category: "Men", subcategory: "Casual Sneakers" },
};

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    // 1. Permanently update Categories in MongoDB with the 6 clean categories and subcategories
    console.log("Updating categories...");
    await Category.findOneAndUpdate(
      { key: "store_categories" },
      { categories: CATEGORIES_TO_ADD, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    console.log("✅ Categories updated in database (deprecated categories removed).");

    // 2. Insert or Update Primary Products in MongoDB
    console.log("Seeding products...");
    let addedCount = 0;
    let updatedCount = 0;

    for (const p of PRODUCTS_DATA) {
      const existing = await Product.findOne({ name: p.name });
      if (existing) {
        await Product.updateOne({ _id: existing._id }, { $set: p });
        updatedCount++;
      } else {
        await Product.create({
          ...p,
          id: new mongoose.Types.ObjectId().toString(),
        });
        addedCount++;
      }
    }

    // 3. Migrate any lingering legacy products with old categories to valid categories
    const oldProducts = await Product.find({
      category: {
        $in: [
          "Running",
          "Casual",
          "Retro",
          "Training",
          "Performance",
          "High Top",
          "Lifestyle",
          "summer",
        ],
      },
    });

    for (const op of oldProducts) {
      const mapping = LEGACY_CATEGORY_MAPPING[op.category] || {
        category: "Men",
        subcategory: "Casual Sneakers",
      };
      await Product.updateOne(
        { _id: op._id },
        {
          $set: {
            category: mapping.category,
            subcategory: mapping.subcategory,
            tags: op.badge ? [op.badge] : ["POPULAR"],
          },
        }
      );
      console.log(`Migrated legacy product "${op.name}" (${op.category} -> ${mapping.category})`);
    }

    console.log(`Products Seeded: ${addedCount} added, ${updatedCount} updated.`);
    const totalCount = await Product.countDocuments();
    console.log(`Total products now in database: ${totalCount}`);

    process.exit(0);
  } catch (err) {
    console.error("Error seeding products:", err);
    process.exit(1);
  }
}

seed();
