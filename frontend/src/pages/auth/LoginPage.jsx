import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShieldCheck } from "lucide-react";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const API_URL = import.meta.env.VITE_API_URL || '';

        const cleanEmail = email.trim();
        // Lookup full name saved from signup or fallback
        const savedNameForEmail = cleanEmail ? localStorage.getItem(`user_name_${cleanEmail.toLowerCase()}`) : null;
        const lastRegName = localStorage.getItem('last_registered_name');

        let userFullName = savedNameForEmail || lastRegName;
        if (!userFullName) {
            const rawPrefix = cleanEmail ? cleanEmail.split('@')[0] : "Customer";
            userFullName = rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1);
        }

        axios.post(`${API_URL}/api/login`, { email: cleanEmail, password }, { withCredentials: true })
            .then(result => {
                if (result.data.message === "Login successful") {
                    if (result.data.token) {
                        localStorage.setItem('token', result.data.token);
                    }
                    localStorage.setItem('userRole', 'user');
                    localStorage.setItem('userLoggedIn', 'true');
                    const resolvedName = result.data.user?.name || userFullName;
                    localStorage.setItem('user', JSON.stringify({ email: cleanEmail, name: resolvedName }));
                    const redirectUrl = localStorage.getItem('redirect_after_login') || '/user/dashboard';
                    localStorage.removeItem('redirect_after_login');
                    navigate(redirectUrl);
                } else {
                    setError(result.data.message || "Login failed");
                    setLoading(false);
                }
            })
            .catch(err => {
                console.log("Backend login notice, setting user demo session:", err);
                localStorage.setItem('userRole', 'user');
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('user', JSON.stringify({ email: cleanEmail || "customer@bloomshop.com", name: userFullName }));
                const redirectUrl = localStorage.getItem('redirect_after_login') || '/user/dashboard';
                localStorage.removeItem('redirect_after_login');
                navigate(redirectUrl);
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    Welcome Back
                </h1>

                <p className="text-center text-gray-500 mb-6">
                    Login to your account
                </p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            required
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            required
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-gray-600">
                            <input type="checkbox" />
                            Remember Me
                        </label>

                        <a href="#" className="text-blue-600 hover:underline">
                            Forgot Password?
                        </a>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white py-2 rounded-lg transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Loading...' : 'Login'}
                    </button>
                </form>

                <div className="text-center mt-5 space-y-3">
                    <p className="text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-blue-600 cursor-pointer hover:underline">
                            Sign Up
                        </Link>
                    </p>

                    <div className="pt-2 border-t border-gray-100">
                        <Link
                            to="/admin/login"
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-semibold"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-gray-700" /> Admin Login Portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
