require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Category = require("./models/Category");

const CATEGORIES_TO_ADD = [
  { id: "all", name: "All", slug: "all", active: true, isDefault: true, icon: "Grid", description: "All available products catalog" },
  { id: "men", name: "Men", slug: "men", active: true, isDefault: true, icon: "User", description: "Men's footwear, running, casual and formal shoes" },
  { id: "women", name: "Women", slug: "women", active: true, isDefault: true, icon: "Heart", description: "Women's sneakers, flats, platforms and fitness shoes" },
  { id: "kids", name: "Kids", slug: "kids", active: true, isDefault: true, icon: "Smile", description: "Kids' boys, girls, toddlers and velcro shoes" },
  { id: "accessories", name: "Accessories", slug: "accessories", active: true, isDefault: true, icon: "Sparkles", description: "Shoe care kits, insoles, socks and laces" },
  { id: "school-shoes", name: "School Shoes", slug: "school-shoes", active: true, isDefault: true, icon: "Shield", description: "Uniform approved black leather, velcro and white PT shoes" },
  { id: "running", name: "Running", slug: "running", active: true, isDefault: true, icon: "Zap", description: "High performance running & athletic footwear" },
  { id: "casual", name: "Casual", slug: "casual", active: true, isDefault: true, icon: "Smile", description: "Everyday comfort sneakers and streetwear shoes" },
  { id: "retro", name: "Retro", slug: "retro", active: true, isDefault: true, icon: "Sparkles", description: "Iconic timeless classic sneakers" },
  { id: "training", name: "Training", slug: "training", active: true, isDefault: true, icon: "Dumbbell", description: "Gym, cross-fit, and workout trainers" },
  { id: "lifestyle", name: "Lifestyle", slug: "lifestyle", active: true, isDefault: true, icon: "Compass", description: "Chic fashion lifestyle and chunky sneakers" },
];

const PRODUCTS_DATA = [
  // ── MEN FOOTWEAR ──
  {
    name: "AirStride Pro Running Shoes",
    category: "Men",
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
    sizes: [7, 8, 9, 10, 11],
    colors: ["Red / White", "Core Black"],
  },
  {
    name: "Oxford Classic Leather Loafers",
    category: "Men",
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
    sizes: [8, 9, 10, 11],
    colors: ["Classic Brown", "Midnight Black"],
  },
  {
    name: "Urban Pace Casual Sneakers",
    category: "Men",
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
    sizes: [7, 8, 9, 10, 11],
    colors: ["Off-White", "Slate Grey"],
  },
  {
    name: "Apex Power Training Shoes",
    category: "Men",
    price: 4199,
    originalPrice: 4999,
    description: "Flat stable-sole cross-trainer designed for heavy squats, deadlifts, and high-intensity agility workouts.",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop"
    ],
    stock: 20,
    rating: 4.8,
    reviewsCount: 76,
    isHot: false,
    isNew: true,
    badge: "NEW",
    sizes: [8, 9, 10, 11],
    colors: ["Neon Volt", "Shadow Black"],
  },
  {
    name: "CloudGrip Wide-Fit Walkers",
    category: "Men",
    price: 3499,
    originalPrice: 4299,
    description: "Extra-wide toe box walking shoes engineered for daily office commute and long hours on your feet.",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop"
    ],
    stock: 28,
    rating: 4.7,
    reviewsCount: 64,
    isHot: false,
    isNew: false,
    badge: "COMFORT",
    sizes: [8, 9, 10, 11, 12],
    colors: ["Deep Charcoal", "Navy Blue"],
  },

  // ── WOMEN FOOTWEAR ──
  {
    name: "Aura Cloud Daily Sneakers",
    category: "Women",
    price: 3999,
    originalPrice: 4999,
    description: "Featherlight everyday sneakers in soft pastel aesthetics. Cushion-flex sole provides seamless cloud-like bounce.",
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&auto=format&fit=crop"
    ],
    stock: 30,
    rating: 4.9,
    reviewsCount: 168,
    isHot: true,
    isNew: true,
    badge: "HOT",
    sizes: [5, 6, 7, 8, 9],
    colors: ["Pastel Rose", "Cloud White"],
  },
  {
    name: "Zenith Velocity Women's Runner",
    category: "Women",
    price: 4299,
    originalPrice: 5299,
    description: "Aerodynamic running shoes tailored specifically for women's foot biomechanics with superior arch stability.",
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop"
    ],
    stock: 22,
    rating: 4.8,
    reviewsCount: 95,
    isHot: true,
    isNew: false,
    badge: "POPULAR",
    sizes: [5, 6, 7, 8],
    colors: ["Sky Blue", "Lavender"],
  },
  {
    name: "Elegance Leather Ballerina Flats",
    category: "Women",
    price: 2899,
    originalPrice: 3499,
    description: "Soft Napa leather ballet flats with memory-foam cushion heel pad. Chic everyday versatility from work to dinner.",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop"
    ],
    stock: 25,
    rating: 4.7,
    reviewsCount: 82,
    isHot: false,
    isNew: false,
    badge: "ELEGANT",
    sizes: [5, 6, 7, 8, 9],
    colors: ["Nude Beige", "Jet Black"],
  },
  {
    name: "Chunky Horizon Platform Sneakers",
    category: "Women",
    price: 4699,
    originalPrice: 5899,
    description: "Statement 90s chunky platform sole sneaker. Premium suede overlays and high-traction rubber bottom.",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop"
    ],
    stock: 19,
    rating: 4.8,
    reviewsCount: 110,
    isHot: false,
    isNew: true,
    badge: "NEW",
    sizes: [6, 7, 8, 9],
    colors: ["Ivory / Sand", "Pure White"],
  },
  {
    name: "Harmony Flex Studio & Yoga Shoes",
    category: "Women",
    price: 3199,
    originalPrice: 3999,
    description: "Slip-on barefoot-feel stretch knit trainers designed for studio fitness, pilates, and light cardio workouts.",
    image: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop"
    ],
    stock: 20,
    rating: 4.6,
    reviewsCount: 48,
    isHot: false,
    isNew: false,
    badge: "FLEX",
    sizes: [5, 6, 7, 8],
    colors: ["Dusty Pink", "Cool Grey"],
  },

  // ── KIDS FOOTWEAR ──
  {
    name: "TurboDash Boys Active Sneakers",
    category: "Kids",
    price: 2799,
    originalPrice: 3499,
    description: "High-energy playground sneakers with anti-scuff toe reinforcement and easy hook-and-loop velcro strap.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 35,
    rating: 4.9,
    reviewsCount: 92,
    isHot: true,
    isNew: false,
    badge: "POPULAR",
    sizes: [28, 29, 30, 31, 32, 33, 34, 35],
    colors: ["Royal Blue", "Racer Red"],
  },
  {
    name: "Sparkle Step Girls Fashion Kicks",
    category: "Kids",
    price: 2999,
    originalPrice: 3699,
    description: "Iridescent fashion sneakers for girls with cushioned collar and glitter accents. Lightweight and durable.",
    image: "https://images.unsplash.com/photo-1507464098880-e367bc5d2c08?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1507464098880-e367bc5d2c08?w=800&auto=format&fit=crop"
    ],
    stock: 28,
    rating: 4.8,
    reviewsCount: 74,
    isHot: false,
    isNew: true,
    badge: "CUTE",
    sizes: [28, 29, 30, 31, 32, 33, 34],
    colors: ["Shimmer Pink", "Lilac Purple"],
  },
  {
    name: "GlowFlex Light-Up Soles",
    category: "Kids",
    price: 3299,
    originalPrice: 3999,
    description: "Interactive impact-activated multi-color LED soles. Long battery life and water-resistant protective sole.",
    image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&auto=format&fit=crop"
    ],
    stock: 30,
    rating: 4.9,
    reviewsCount: 130,
    isHot: true,
    isNew: true,
    badge: "GLOW",
    sizes: [26, 27, 28, 29, 30, 31, 32],
    colors: ["Neon Green", "Electric Blue"],
  },
  {
    name: "FirstSteps Toddler Walker Shoes (22-27)",
    category: "Kids",
    price: 2199,
    originalPrice: 2699,
    description: "Ultra-soft flexible soles promoting healthy foot development for early walkers. Wide easy-entry opening.",
    image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop"
    ],
    stock: 24,
    rating: 4.8,
    reviewsCount: 56,
    isHot: false,
    isNew: false,
    badge: "EASY",
    sizes: [22, 23, 24, 25, 26, 27],
    colors: ["Butter Yellow", "Soft Grey"],
  },
  {
    name: "SwiftStride Junior Court Shoes (28-35)",
    category: "Kids",
    price: 2899,
    originalPrice: 3499,
    description: "Durable synthetic leather and mesh court shoes engineered for school games, badminton, and running.",
    image: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&auto=format&fit=crop"
    ],
    stock: 26,
    rating: 4.7,
    reviewsCount: 68,
    isHot: false,
    isNew: false,
    badge: "BEST",
    sizes: [28, 29, 30, 31, 32, 33, 34, 35],
    colors: ["White / Navy", "White / Red"],
  },

  // ── ACCESSORIES ──
  {
    name: "Pro Sneaker Foam Cleaner (200ml)",
    category: "Accessories",
    price: 1199,
    originalPrice: 1499,
    description: "Fast-acting ready-to-use foaming formula that lifts dirt, mud, and stains without soaking the shoe.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop"
    ],
    stock: 50,
    rating: 4.9,
    reviewsCount: 215,
    isHot: true,
    isNew: false,
    badge: "HOT",
    sizes: ["200ml Can"],
    colors: ["Original Formula"],
  },
  {
    name: "Nano-Tech Hydrophobic Water Shield Spray",
    category: "Accessories",
    price: 1499,
    originalPrice: 1899,
    description: "Advanced breathable waterproofing spray forming an invisible barrier against rain, spills, and grease.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop"
    ],
    stock: 45,
    rating: 4.9,
    reviewsCount: 184,
    isHot: true,
    isNew: false,
    badge: "BESTSELLER",
    sizes: ["250ml Aerosol"],
    colors: ["Clear Spray"],
  },
  {
    name: "Dual-Bristle Deep Clean Shoe Brush",
    category: "Accessories",
    price: 699,
    originalPrice: 899,
    description: "Premium natural hog-hair soft bristles for delicate mesh/suede, plus stiff synthetic bristles for dirty soles.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop"
    ],
    stock: 60,
    rating: 4.8,
    reviewsCount: 95,
    isHot: false,
    isNew: false,
    badge: "ESSENTIAL",
    sizes: ["Standard Brush"],
    colors: ["Natural Wood"],
  },
  {
    name: "Orthopedic Memory Foam Cushion Insoles",
    category: "Accessories",
    price: 999,
    originalPrice: 1299,
    description: "Deep heel cup with arch support and shock-absorbing memory foam. Trimmable to fit sizes 36 to 45.",
    image: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop"
    ],
    stock: 70,
    rating: 4.8,
    reviewsCount: 160,
    isHot: false,
    isNew: true,
    badge: "TOP RATED",
    sizes: ["One Size (Trimmable 36-45)"],
    colors: ["Breathable Blue"],
  },
  {
    name: "Athletic Cushion Crew Socks (3-Pack)",
    category: "Accessories",
    price: 899,
    originalPrice: 1199,
    description: "Moisture-wicking combed cotton crew socks with reinforced heel and toe cushioning. Anti-odor silver ions.",
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&auto=format&fit=crop"
    ],
    stock: 80,
    rating: 4.7,
    reviewsCount: 120,
    isHot: false,
    isNew: false,
    badge: "PACK OF 3",
    sizes: ["Medium (38-42)", "Large (43-46)"],
    colors: ["Black / White / Grey Trio"],
  },

  // ── SCHOOL SHOES ──
  {
    name: "Premier Boys Black Uniform Shoes",
    category: "School Shoes",
    price: 2799,
    originalPrice: 3499,
    description: "100% genuine scuff-resistant black action leather school shoes. Padded collar and high-durability rubber sole.",
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop"
    ],
    stock: 45,
    rating: 4.9,
    reviewsCount: 175,
    isHot: true,
    isNew: false,
    badge: "TOP PICK",
    sizes: [28, 30, 32, 34, 36, 38, 40],
    colors: ["Deep Black"],
  },
  {
    name: "Grace Girls Mary Jane Black Strap Shoes",
    category: "School Shoes",
    price: 2699,
    originalPrice: 3299,
    description: "Formal uniform black strap shoes with easy quick-fasten velcro buckle and breathable anti-odor sockliner.",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop"
    ],
    stock: 40,
    rating: 4.8,
    reviewsCount: 140,
    isHot: true,
    isNew: false,
    badge: "APPROVED",
    sizes: [28, 30, 32, 34, 36, 38],
    colors: ["Polished Black"],
  },
  {
    name: "All-Star White PT & Sports Shoes",
    category: "School Shoes",
    price: 2499,
    originalPrice: 2999,
    description: "Pure white morning assembly and physical education shoes. Lightweight non-marking grip sole and breathable canvas.",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop"
    ],
    stock: 50,
    rating: 4.9,
    reviewsCount: 190,
    isHot: true,
    isNew: true,
    badge: "MUST HAVE",
    sizes: [28, 30, 32, 34, 36, 38, 40],
    colors: ["Pure White"],
  },
  {
    name: "SturdyWalk Easy Velcro School Shoes",
    category: "School Shoes",
    price: 2599,
    originalPrice: 3199,
    description: "Dual hook-and-loop velcro straps for quick on/off. Reinforced toe bumper prevents scuffing during active play.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 35,
    rating: 4.8,
    reviewsCount: 110,
    isHot: false,
    isNew: true,
    badge: "EASY WEAR",
    sizes: [28, 30, 32, 34, 36],
    colors: ["Matte Black"],
  },
  {
    name: "ToughGrip Genuine Leather Oxford School Shoes",
    category: "School Shoes",
    price: 3199,
    originalPrice: 3999,
    description: "Classic lace-up formal school dress shoes crafted from heavy-gauge polishable black cowhide leather.",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop"
    ],
    stock: 30,
    rating: 4.9,
    reviewsCount: 98,
    isHot: false,
    isNew: false,
    badge: "DURABLE",
    sizes: [32, 34, 36, 38, 40, 42],
    colors: ["Formal Black"],
  },
  {
    name: "Academy Non-Marking Sole Uniform Shoes",
    category: "School Shoes",
    price: 2699,
    originalPrice: 3299,
    description: "Specialized non-marking composite rubber soles ideal for indoor school halls and sports courts. Polishable black upper.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 35,
    rating: 4.8,
    reviewsCount: 75,
    isHot: false,
    isNew: true,
    badge: "NON-MARKING",
    sizes: [28, 30, 32, 34, 36, 38],
    colors: ["Standard Black"],
  },

  // ── MORE KIDS FOOTWEAR (Boys, Girls, Light-up, Toddler, Junior, Velcro) ──
  {
    name: "EasyLock Kids Velcro Strap Runners",
    category: "Kids",
    price: 2699,
    originalPrice: 3299,
    description: "Dual velcro strap fasteners designed for quick independent wear. Cushioned EVA footbed for non-stop playground comfort.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 40,
    rating: 4.9,
    reviewsCount: 118,
    isHot: true,
    isNew: true,
    badge: "EASY",
    sizes: [26, 28, 30, 32, 34],
    colors: ["Navy / Orange", "Teal / Lime"],
  },
  {
    name: "StreetRacer Boys Cushioned Runners",
    category: "Kids",
    price: 2899,
    originalPrice: 3599,
    description: "High-traction boys road and turf runners with responsive foam bounce and reinforced anti-scuff rubber toe.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop"
    ],
    stock: 32,
    rating: 4.8,
    reviewsCount: 88,
    isHot: true,
    isNew: false,
    badge: "POPULAR",
    sizes: [28, 30, 32, 34, 35],
    colors: ["Black / Crimson", "Electric Royal"],
  },
  {
    name: "RainbowBloom Girls Casual Sneakers",
    category: "Kids",
    price: 2799,
    originalPrice: 3399,
    description: "Charming pastel rainbow accents with soft breathable knit lining and padded ankle collar. Perfect for school and play.",
    image: "https://images.unsplash.com/photo-1507464098880-e367bc5d2c08?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1507464098880-e367bc5d2c08?w=800&auto=format&fit=crop"
    ],
    stock: 26,
    rating: 4.9,
    reviewsCount: 65,
    isHot: false,
    isNew: true,
    badge: "CUTE",
    sizes: [27, 28, 29, 30, 31, 32, 33],
    colors: ["Pastel Rainbow", "Candy Pink"],
  },
  {
    name: "FlashLight Kids LED Star Runners",
    category: "Kids",
    price: 3499,
    originalPrice: 4199,
    description: "Super bright multi-color LED motion-activated soles with stars pattern. Durable impact-resistant battery casing.",
    image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&auto=format&fit=crop"
    ],
    stock: 22,
    rating: 5.0,
    reviewsCount: 145,
    isHot: true,
    isNew: true,
    badge: "GLOW",
    sizes: [26, 27, 28, 29, 30, 31],
    colors: ["Cosmic Black", "Galaxy Silver"],
  },
  {
    name: "TinyToes Soft-Sole Toddler Sneaker (22-27)",
    category: "Kids",
    price: 2299,
    originalPrice: 2799,
    description: "Super lightweight flexible first-walkers with anti-skid bottom and wide toe box for toddler feet.",
    image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop"
    ],
    stock: 25,
    rating: 4.8,
    reviewsCount: 42,
    isHot: false,
    isNew: true,
    badge: "EASY",
    sizes: [22, 23, 24, 25, 26, 27],
    colors: ["Cloud Cream", "Sky Baby Blue"],
  },
  {
    name: "Junior Speedster High-Top Sneakers (28-35)",
    category: "Kids",
    price: 3199,
    originalPrice: 3899,
    description: "Ankle-support high-top court shoes for active juniors. Padded collar, impact dampening, and grippy herringbone rubber.",
    image: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&auto=format&fit=crop"
    ],
    stock: 20,
    rating: 4.7,
    reviewsCount: 53,
    isHot: false,
    isNew: false,
    badge: "BEST",
    sizes: [28, 29, 30, 31, 32, 33, 34, 35],
    colors: ["Fire Red / Black", "Ice White / Teal"],
  },
  {
    name: "PlayTime Dual Velcro Kids Everyday Shoes",
    category: "Kids",
    price: 2499,
    originalPrice: 2999,
    description: "All-day playground shoes with double velcro strap security. Machine washable breathable upper and bounce cushioning.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop"
    ],
    stock: 36,
    rating: 4.9,
    reviewsCount: 80,
    isHot: false,
    isNew: false,
    badge: "EASY WEAR",
    sizes: [25, 26, 27, 28, 29, 30, 31, 32],
    colors: ["Denim Blue", "Charcoal Lime"],
  },

  // ── MORE ACCESSORIES, MEN & WOMEN ──
  {
    name: "UltraLock Reflective Replacement Shoe Laces",
    category: "Accessories",
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
    badge: "ESSENTIAL",
    sizes: ["120cm Pair"],
    colors: ["Reflective Black", "Reflective Neon", "Reflective White"],
  },
  {
    name: "StreetComfort Daily Walking Shoes",
    category: "Men",
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
    badge: "COMFORT",
    sizes: [7, 8, 9, 10, 11],
    colors: ["Cool Grey", "Midnight Black"],
  },
  {
    name: "PureCloud Ultra-Soft Comfort Walkers",
    category: "Women",
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
    badge: "COMFORT",
    sizes: [5, 6, 7, 8, 9],
    colors: ["Cloud Pearl", "Blush Pink"],
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    // 1. Update Categories in MongoDB
    console.log("Updating categories...");
    const catDoc = await Category.findOne({ key: "store_categories" });
    let existingCats = catDoc ? catDoc.categories : [];
    
    // Merge without duplicates by slug or name
    for (const newCat of CATEGORIES_TO_ADD) {
      const exists = existingCats.some(
        c => c.name.toLowerCase() === newCat.name.toLowerCase() || c.slug === newCat.slug
      );
      if (!exists) {
        existingCats.push(newCat);
        console.log(`+ Added category: ${newCat.name}`);
      }
    }

    await Category.findOneAndUpdate(
      { key: "store_categories" },
      { categories: existingCats, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    console.log("Categories updated in database.");

    // 2. Insert or Update Products in MongoDB
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
