require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/Users");
const SliderModel = require("./models/Slider");
const CategoryModel = require("./models/Category");
const ProductModel = require("./models/Product");
const OrderModel = require("./models/Order");
const AboutModel = require("./models/About");

const DEFAULT_ABOUT_SECTION = {
  key: "about_us_section",
  badge: "About BloomShop",
  title: "Where Modern Style Meets Uncompromised Comfort",
  description: "Founded with a passion for elevated footwear, BloomShop merges aesthetic innovation with day-long ergonomic support. We craft shoes for those who walk with confidence.",
  subTitle: "Built for the Street, Designed for the Future",
  subDescription: "Whether you're hitting the pavement, training for your next milestone, or making a sleek fashion statement, our curated sneaker lineup delivers optimum support without compromising on trendsetting design.",
  quote: "Every stitch is calculated for maximum durability and timeless visual appeal.",
  quoteBadge: "Our Commitment",
  image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  buttonText: "Explore Products",
  bullet1: "Ethically Sourced Materials",
  bullet2: "Rigorous 12-Point Quality Checks",
  stats: [
    { label: "Happy Shoppers", value: "50,000+" },
    { label: "Original Models", value: "250+" },
    { label: "Avg Rating", value: "4.9 ★" },
    { label: "Global Stores", value: "18 Outlets" }
  ],
  features: [
    {
      title: "Premium Craftsmanship",
      description: "Engineered with high-grade breathable mesh, genuine leather, and ultra-responsive soles.",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30"
    },
    {
      title: "Express Delivery",
      description: "Fast and reliable worldwide shipping with full real-time order tracking.",
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30"
    },
    {
      title: "100% Authentic Guarantee",
      description: "Every pair undergoes rigorous quality inspection before leaving our warehouse.",
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      title: "Hassle-Free Returns",
      description: "30-day effortless return policy with instant refunds or size exchanges.",
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30"
    }
  ]
};

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

const DEFAULT_PRODUCTS = [
  { id: "1", name: "AirFlex Runner", price: 89, originalPrice: 119, rating: 4.9, reviewsCount: 128, isHot: true, isNew: false, badge: "HOT", category: "Running", image: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "Lightweight running sneakers designed for speed and comfort. Breathable mesh and durable sole." },
  { id: "2", name: "Urban Street Pro", price: 99, originalPrice: 129, rating: 4.8, reviewsCount: 94, isHot: false, isNew: true, badge: "NEW", category: "Casual", image: "https://images.unsplash.com/photo-1608667508764-33cf0726b13a?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "Minimalist sneakers for everyday wear. Premium leather with a modern urban look." },
  { id: "3", name: "Classic Court 90s", price: 79, originalPrice: 99, rating: 4.7, reviewsCount: 86, isHot: true, isNew: false, badge: "HOT", category: "Retro", image: "https://images.unsplash.com/photo-1465453869711-7e174808ace9?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "Retro-inspired sneakers with a tennis court vibe. Perfect balance between comfort and style." },
  { id: "4", name: "Volt Edge", price: 119, originalPrice: 149, rating: 4.9, reviewsCount: 210, isHot: true, isNew: true, badge: "BESTSELLER", category: "Performance", image: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "Performance sneakers with bold details. Responsive cushioning for all-day energy." },
  { id: "5", name: "Zenith Flow", price: 129, originalPrice: 159, rating: 4.9, reviewsCount: 175, isHot: false, isNew: true, badge: "NEW", category: "Lifestyle", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "Premium lifestyle sneakers blending high-quality knit material and futuristic design." },
  { id: "6", name: "Street Vibe Low", price: 69, originalPrice: 89, rating: 4.6, reviewsCount: 62, isHot: false, isNew: false, badge: "SALE", category: "Casual", image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "Casual low-top sneakers with a timeless silhouette. Built for versatility and comfort." },
  { id: "7", name: "Nova Horizon", price: 109, originalPrice: 139, rating: 4.8, reviewsCount: 115, isHot: true, isNew: false, badge: "HOT", category: "High Top", image: "https://images.unsplash.com/photo-1516767254874-281bffac9e9a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "High-top sneakers crafted with suede and mesh. Perfect mix of streetwear and performance." },
  { id: "8", name: "Pulse React", price: 99, originalPrice: 119, rating: 4.7, reviewsCount: 88, isHot: false, isNew: true, badge: "NEW", category: "Training", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "Dynamic sneakers with responsive cushioning. Designed for training and everyday comfort." },
  { id: "9", name: "Core Street Retro", price: 85, originalPrice: 105, rating: 4.8, reviewsCount: 140, isHot: true, isNew: false, badge: "HOT", category: "Retro", image: "https://images.unsplash.com/photo-1621315271772-28b1f3a5df87?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "Old-school sneakers inspired by 80s basketball. Durable construction with vintage vibes." },
  { id: "10", name: "AeroFlex Lite", price: 75, originalPrice: 95, rating: 4.6, reviewsCount: 53, isHot: false, isNew: true, badge: "NEW", category: "Running", image: "https://images.unsplash.com/photo-1496202703211-aa28e9500c30?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "Ultra-light sneakers designed for everyday mobility. Breathable and flexible design." }
];




const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Parse cookies attached to the client request object
app.use(cookieParser());
// Allow requests from frontend and permit cookies/credentials to be sent back and forth
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (
            origin === "http://localhost:5173" ||
            origin.endsWith(".vercel.app") ||
            (process.env.FRONTEND_URL && origin.startsWith(process.env.FRONTEND_URL))
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Serverless MongoDB Connection Handler
let isConnected = false;
const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) return;
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI environment variable is missing!");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
};

// Immediate DB connection on startup
connectDB();

// Middleware: ensure database connection is ready before processing API requests
app.use(async (req, res, next) => {
    if (req.path === "/") return next();
    if (mongoose.connection.readyState !== 1) {
        await connectDB();
    }
    next();
});

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "xcpimhvz",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Endpoint to upload slider image to Cloudinary cloud storage
app.post("/api/upload-slider-image", async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ message: "No image data provided" });
        }

        // Check if Cloudinary credentials are set correctly
        const hasCredentials = process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_KEY !== "YOUR_API_KEY_HERE" &&
                               process.env.CLOUDINARY_API_SECRET &&
                               process.env.CLOUDINARY_API_SECRET !== "YOUR_API_SECRET_HERE";

        if (!hasCredentials) {
            console.warn("⚠️ Cloudinary API keys not configured. Falling back to direct Base64 embedding.");
            return res.json({
                message: "Cloudinary credentials not configured, fell back to base64",
                url: imageBase64
            });
        }

        // Upload base64 image directly to Cloudinary
        const result = await cloudinary.uploader.upload(imageBase64, {
            folder: "ecommerce/sliders",
            resource_type: "image",
            transformation: [
                { width: 1400, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" }
            ]
        });

        console.log(`✅ Image uploaded to Cloudinary: ${result.secure_url}`);
        return res.json({
            message: "Image uploaded to Cloudinary successfully",
            url: result.secure_url,
        });
    } catch (err) {
        console.error("❌ Cloudinary upload error, falling back to base64:", err);
        return res.json({
            message: "Cloudinary upload failed, fell back to base64",
            url: req.body.imageBase64
        });
    }
});

// Endpoint to upload product image to Cloudinary (or fallback base64)
app.post("/api/upload-product-image", async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ message: "No image data provided" });
        }

        const hasCredentials = process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_KEY !== "YOUR_API_KEY_HERE" &&
                               process.env.CLOUDINARY_API_SECRET &&
                               process.env.CLOUDINARY_API_SECRET !== "YOUR_API_SECRET_HERE";

        if (!hasCredentials) {
            console.warn("⚠️ Cloudinary API keys not configured. Falling back to Base64 image data.");
            return res.json({
                message: "Cloudinary credentials not configured, fell back to base64",
                url: imageBase64
            });
        }

        const result = await cloudinary.uploader.upload(imageBase64, {
            folder: "ecommerce/products",
            resource_type: "image",
            transformation: [
                { width: 1000, height: 1000, crop: "limit", quality: "auto", fetch_format: "auto" }
            ]
        });

        console.log(`✅ Product image uploaded to Cloudinary: ${result.secure_url}`);
        return res.json({
            message: "Product image uploaded to Cloudinary successfully",
            url: result.secure_url,
        });
    } catch (err) {
        console.error("❌ Cloudinary upload error:", err);
        return res.json({
            message: "Cloudinary upload failed, fell back to base64",
            url: req.body.imageBase64
        });
    }
});

// Endpoint to upload About Us image to Cloudinary (or fallback base64)
app.post("/api/upload-about-image", async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ message: "No image data provided" });
        }

        const hasCredentials = process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_KEY !== "YOUR_API_KEY_HERE" &&
                               process.env.CLOUDINARY_API_SECRET &&
                               process.env.CLOUDINARY_API_SECRET !== "YOUR_API_SECRET_HERE";

        if (!hasCredentials) {
            return res.json({
                message: "Cloudinary credentials not configured, fell back to base64",
                url: imageBase64
            });
        }

        const result = await cloudinary.uploader.upload(imageBase64, {
            folder: "ecommerce/about",
            resource_type: "image",
            transformation: [
                { width: 1200, height: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }
            ]
        });

        console.log(`✅ About image uploaded to Cloudinary: ${result.secure_url}`);
        return res.json({
            message: "About image uploaded to Cloudinary successfully",
            url: result.secure_url,
        });
    } catch (err) {
        console.error("❌ Cloudinary upload error:", err);
        return res.json({
            message: "Cloudinary upload failed, fell back to base64",
            url: req.body.imageBase64
        });
    }
});

// GET /api/about: Fetch saved About section details (seed default if empty)
app.get("/api/about", async (req, res) => {
    try {
        let doc = await AboutModel.findOne({ key: "about_us_section" });
        if (!doc) {
            console.log("ℹ️ Seeding default About Us section into MongoDB database...");
            doc = await AboutModel.create(DEFAULT_ABOUT_SECTION);
        }
        return res.json({ about: doc });
    } catch (err) {
        console.error("❌ Error fetching About section:", err);
        return res.status(500).json({ message: "Failed to fetch About section", about: DEFAULT_ABOUT_SECTION, error: err.message });
    }
});

// POST /api/about: Save/Update About section details in MongoDB database
app.post("/api/about", async (req, res) => {
    try {
        const updateData = { ...req.body, updatedAt: new Date() };
        delete updateData._id;

        const doc = await AboutModel.findOneAndUpdate(
            { key: "about_us_section" },
            updateData,
            { new: true, upsert: true }
        );

        console.log("✅ Saved About Us section to MongoDB database successfully");
        return res.json({ message: "About Us section updated successfully", about: doc });
    } catch (err) {
        console.error("❌ Error saving About section:", err);
        return res.status(500).json({ message: "Failed to save About section", error: err.message });
    }
});


// GET /api/slides: Fetch saved slides from MongoDB database
app.get("/api/slides", async (req, res) => {
    try {
        const doc = await SliderModel.findOne({ key: "hero_slider" });
        if (doc && doc.slides && doc.slides.length > 0) {
            return res.json({ slides: doc.slides });
        }
        return res.json({ slides: null });
    } catch (err) {
        console.error("❌ Error fetching slides:", err);
        return res.status(500).json({ message: "Failed to fetch slides", error: err.message });
    }
});

// POST /api/slides: Save/Update slides in MongoDB database
app.post("/api/slides", async (req, res) => {
    try {
        const { slides } = req.body;
        if (!Array.isArray(slides)) {
            return res.status(400).json({ message: "Slides array is required" });
        }

        const doc = await SliderModel.findOneAndUpdate(
            { key: "hero_slider" },
            { slides: slides, updatedAt: new Date() },
            { new: true, upsert: true }
        );

        console.log("✅ Saved slides to MongoDB database successfully");
        return res.json({ message: "Slides updated successfully", slides: doc.slides });
    } catch (err) {
        console.error("❌ Error saving slides:", err);
        return res.status(500).json({ message: "Failed to save slides to database", error: err.message });
    }
});

// GET /api/categories: Fetch saved categories from MongoDB database (or return default list)
app.get("/api/categories", async (req, res) => {
    try {
        let doc = await CategoryModel.findOne({ key: "store_categories" });
        if (!doc || !doc.categories || doc.categories.length === 0) {
            // Seed default categories into DB if none exist
            doc = await CategoryModel.create({ key: "store_categories", categories: DEFAULT_CATEGORIES });
        }
        return res.json({ categories: doc.categories });
    } catch (err) {
        console.error("❌ Error fetching categories:", err);
        return res.status(500).json({ message: "Failed to fetch categories", categories: DEFAULT_CATEGORIES, error: err.message });
    }
});

// POST /api/categories: Update categories in MongoDB database
app.post("/api/categories", async (req, res) => {
    try {
        const { categories } = req.body;
        if (!Array.isArray(categories)) {
            return res.status(400).json({ message: "Categories array is required" });
        }

        const doc = await CategoryModel.findOneAndUpdate(
            { key: "store_categories" },
            { categories: categories, updatedAt: new Date() },
            { new: true, upsert: true }
        );

        console.log("✅ Saved categories to MongoDB database successfully");
        return res.json({ message: "Categories updated successfully", categories: doc.categories });
    } catch (err) {
        console.error("❌ Error saving categories:", err);
        return res.status(500).json({ message: "Failed to save categories to database", error: err.message });
    }
});

// POST /api/categories/reset: Reset categories back to default list
app.post("/api/categories/reset", async (req, res) => {
    try {
        const doc = await CategoryModel.findOneAndUpdate(
            { key: "store_categories" },
            { categories: DEFAULT_CATEGORIES, updatedAt: new Date() },
            { new: true, upsert: true }
        );
        return res.json({ message: "Categories reset to defaults successfully", categories: doc.categories });
    } catch (err) {
        console.error("❌ Error resetting categories:", err);
        return res.status(500).json({ message: "Failed to reset categories", error: err.message });
    }
});

// --- PRODUCT API ROUTES ---

// GET /api/products: Fetch all products from MongoDB (seed defaults if empty)
app.get("/api/products", async (req, res) => {
    try {
        let products = await ProductModel.find().sort({ createdAt: -1 });
        if (!products || products.length === 0) {
            console.log("📦 Seeding default products into MongoDB database...");
            await ProductModel.insertMany(DEFAULT_PRODUCTS);
            products = await ProductModel.find().sort({ createdAt: -1 });
        }
        return res.json({ products });
    } catch (err) {
        console.error("❌ Error fetching products:", err);
        return res.status(500).json({ message: "Failed to fetch products", error: err.message, products: DEFAULT_PRODUCTS });
    }
});

// POST /api/products: Add a new product dynamically
app.post("/api/products", async (req, res) => {
    try {
        const { name, category, price, originalPrice, description, image, stock, rating, isNew, isHot, badge } = req.body;
        if (!name || !category || !price) {
            return res.status(400).json({ message: "Name, category, and price are required" });
        }

        const newProduct = await ProductModel.create({
            name,
            category,
            price: Number(price),
            originalPrice: originalPrice ? Number(originalPrice) : undefined,
            description: description || "",
            image: image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
            stock: stock !== undefined ? Number(stock) : 10,
            rating: rating !== undefined ? Number(rating) : 4.8,
            reviewsCount: 1,
            isNew: Boolean(isNew),
            isHot: Boolean(isHot),
            badge: badge || (isNew ? "NEW" : isHot ? "HOT" : ""),
        });

        console.log(`✅ Product "${newProduct.name}" created successfully`);
        return res.json({ message: "Product created successfully", product: newProduct });
    } catch (err) {
        console.error("❌ Error creating product:", err);
        return res.status(500).json({ message: "Failed to create product", error: err.message });
    }
});

// PUT /api/products/:id: Update existing product dynamically
app.put("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (updateData.price) updateData.price = Number(updateData.price);
        if (updateData.originalPrice) updateData.originalPrice = Number(updateData.originalPrice);
        if (updateData.stock) updateData.stock = Number(updateData.stock);

        let product = await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!product) {
            // Fall back to custom numeric id match
            product = await ProductModel.findOneAndUpdate({ id: id }, updateData, { new: true });
        }

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.json({ message: "Product updated successfully", product });
    } catch (err) {
        console.error("❌ Error updating product:", err);
        return res.status(500).json({ message: "Failed to update product", error: err.message });
    }
});

// DELETE /api/products/:id: Delete product dynamically
app.delete("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let deleted = await ProductModel.findByIdAndDelete(id);
        if (!deleted) {
            deleted = await ProductModel.findOneAndDelete({ id: id });
        }

        if (!deleted) {
            return res.status(404).json({ message: "Product not found" });
        }

        console.log(`🗑️ Product deleted: ${id}`);
        return res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting product:", err);
        return res.status(500).json({ message: "Failed to delete product", error: err.message });
    }
});





// Test Route
app.get("/", (req, res) => {
    res.send("Backend is Running...");
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`🚀 Server is running on port ${process.env.PORT || 5000}`);
    });
}

app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;
    UserModel.create({ name, email, password })
        .then(user => res.json(user))
        .catch(err => res.status(500).json({ message: "Database Error: " + (err.message || "Unknown error"), error: err }))
});

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email:email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    // JWT IMPLEMENTATION: 
                    // 1. Sign a token containing the user's email and ID.
                    const token = jwt.sign({ email: user.email, name: user.name, id: user._id }, process.env.JWT_SECRET || "jwt_secret_key", { expiresIn: "1d" });
                    // 2. Set the token inside an HttpOnly cookie with cross-domain support flags.
                    res.cookie("token", token, { 
                        httpOnly: true, 
                        maxAge: 24 * 60 * 60 * 1000,
                        sameSite: 'none',
                        secure: true
                    });
                    // 3. Also return token in response body so frontend can store in localStorage as fallback
                    res.json({ message: "Login successful", token });
                } else {
                    res.json({ message: "Invalid credentials" });
                }
            } else {
                res.json({ message: "Email is not registered" });
            }
        })
        .catch(err => res.status(500).json({ message: "Database Error: " + (err.message || "Unknown error"), error: err }))
});

// Logout route: Clears the JWT cookie
app.post('/api/logout', (req, res) => {
    res.clearCookie('token', { sameSite: 'none', secure: true });
    res.json({ message: "Logged out successfully" });
});

// Protected route: Verifies the JWT before allowing access to the dashboard
app.get('/api/dashboard', (req, res) => {
    // 1. Check cookie first, then fall back to Authorization header (for cross-domain)
    let token = req.cookies.token;
    if (!token) {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    if (!token) {
        return res.json({ message: "No token provided" });
    }
    // 2. Verify the token using the secret key
    jwt.verify(token, process.env.JWT_SECRET || "jwt_secret_key", (err, decoded) => {
        if (err) {
            return res.json({ message: "Invalid token" }); // Token expired or manipulated
        }
        return res.json({ message: "Success", user: decoded }); // Token is valid!
    });
});

// GET /api/customers: Fetch all registered users from MongoDB
app.get("/api/customers", async (req, res) => {
    try {
        const customers = await UserModel.find({}, "-password").sort({ createdAt: -1 });
        return res.json({ customers });
    } catch (err) {
        console.error("❌ Error fetching customers:", err);
        return res.status(500).json({ message: "Failed to fetch customers", error: err.message });
    }
});

// DELETE /api/customers/:id: Delete a registered customer
app.delete("/api/customers/:id", async (req, res) => {
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "Customer not found" });
        }
        return res.json({ message: "Customer account deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting customer:", err);
        return res.status(500).json({ message: "Failed to delete customer", error: err.message });
    }
});

// ═════════════════════════════════════════════════════════════
// ORDER MANAGEMENT REST API ENDPOINTS
// ═════════════════════════════════════════════════════════════

// GET /api/orders: Fetch all orders from MongoDB (sorted by newest first)
app.get("/api/orders", async (req, res) => {
    try {
        const orders = await OrderModel.find().sort({ createdAt: -1 });
        return res.json({ orders });
    } catch (err) {
        console.error("❌ Error fetching orders:", err);
        return res.status(500).json({ message: "Failed to fetch orders", error: err.message });
    }
});

// POST /api/orders: Save a new order when customer places order at checkout
app.post("/api/orders", async (req, res) => {
    try {
        const { orderId, customer, items, totalAmount, paymentMethod } = req.body;
        if (!orderId || !customer || !items || !totalAmount) {
            return res.status(400).json({ message: "Missing required order details" });
        }

        const newOrder = await OrderModel.create({
            orderId,
            customer,
            items,
            totalAmount: Number(totalAmount),
            paymentMethod: paymentMethod || "card",
            status: "Pending",
        });

        console.log(`✅ Order "${newOrder.orderId}" created successfully for ${customer.fullName}`);
        return res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (err) {
        console.error("❌ Error saving order:", err);
        return res.status(500).json({ message: "Failed to place order", error: err.message });
    }
});

// PUT /api/orders/:id/status: Update an order status (Pending -> Processing -> Shipped -> Delivered -> Cancelled)
app.put("/api/orders/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const updatedOrder = await OrderModel.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        console.log(`✅ Order "${updatedOrder.orderId}" status updated to ${status}`);
        return res.json({ message: "Order status updated successfully", order: updatedOrder });
    } catch (err) {
        console.error("❌ Error updating order status:", err);
        return res.status(500).json({ message: "Failed to update order status", error: err.message });
    }
});

// DELETE /api/orders/:id: Delete an order
app.delete("/api/orders/:id", async (req, res) => {
    try {
        const deletedOrder = await OrderModel.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        console.log(`✅ Order "${deletedOrder.orderId}" deleted successfully`);
        return res.json({ message: "Order deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting order:", err);
        return res.status(500).json({ message: "Failed to delete order", error: err.message });
    }
});

module.exports = app;