require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/Users");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const path = require("path");
const fs = require("fs");

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

// Upload directory path in frontend/public/uploads
const uploadDir = path.join(__dirname, "../frontend/public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// Endpoint to upload slider picture and save it into frontend/public/uploads
app.post("/api/upload-slider-image", (req, res) => {
    try {
        const { imageBase64, imageName } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ message: "No image data provided" });
        }

        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const extMatch = imageBase64.match(/^data:image\/(\w+);base64,/);
        const ext = extMatch ? (extMatch[1] === 'jpeg' ? 'jpg' : extMatch[1]) : 'jpg';
        const sanitizedName = (imageName || 'slider-bg')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-');
        const filename = `${sanitizedName}-${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, filename);

        fs.writeFileSync(filePath, buffer);
        console.log(`✅ Saved image to public folder: ${filePath}`);

        const publicUrl = `/uploads/${filename}`;
        return res.json({
            message: "Image saved successfully to public folder",
            url: publicUrl,
            filename: filename
        });
    } catch (err) {
        console.error("❌ Error uploading image:", err);
        return res.status(500).json({ message: "Failed to save image", error: err.message });
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