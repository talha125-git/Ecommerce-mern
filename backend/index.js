require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/Users");
const SliderModel = require("./models/Slider");
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

// Middleware: ensure database connection is ready before processing API requests
app.use(async (req, res, next) => {
    if (req.path === "/") return next();
    if (mongoose.connection.readyState !== 1) {
        await connectDB();
    }
    next();
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

module.exports = app;