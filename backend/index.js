require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/Users");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
// Parse cookies attached to the client request object
app.use(cookieParser());
// Allow requests from frontend and permit cookies/credentials to be sent back and forth
app.use(cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true
}));

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully");
    })
    .catch((err) => {
        console.log("❌ MongoDB Connection Error:", err);
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

module.exports = app;


app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;
    UserModel.create({ name, email, password })
        .then(user => res.json(user))
        .catch(err => res.json(err))
});

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email:email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    // JWT IMPLEMENTATION: 
                    // 1. Sign a token containing the user's email and ID.
                    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET || "jwt_secret_key", { expiresIn: "1d" });
                    // 2. Set the token inside an HttpOnly cookie so the browser securely stores it.
                    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
                    res.json({ message: "Login successful" });
                } else {
                    res.json({ message: "Invalid credentials" });
                }
            } else {
                res.json({ message: "Email is not registered" });
            }
        })
        .catch(err => res.json(err))
});

// Logout route: Clears the JWT cookie
app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
});

// Protected route: Verifies the JWT before allowing access to the dashboard
app.get('/api/dashboard', (req, res) => {
    // 1. Extract the token from the cookies
    const token = req.cookies.token;
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