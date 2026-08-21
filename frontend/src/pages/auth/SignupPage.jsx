import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SignupPage = () => {
    const [name, setName] = useState("");
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

        const userFullName = name.trim() || "Customer User";
        const userEmail = email.trim();

        // Save name mapping to localStorage so login can retrieve full name
        if (userEmail) {
            localStorage.setItem(`user_name_${userEmail.toLowerCase()}`, userFullName);
        }
        localStorage.setItem('last_registered_name', userFullName);
        localStorage.setItem('user', JSON.stringify({ name: userFullName, email: userEmail }));

        axios.post(`${API_URL}/api/register`, { name: userFullName, email: userEmail, password })
            .then(() => {
                navigate('/login');
            })
            .catch(err => {
                console.log("Signup backend note:", err);
                navigate('/login');
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    Create Account
                </h1>

                <p className="text-center text-gray-500 mb-6">
                    Sign up to continue
                </p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    {/* Name */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
                        <input
                            onChange={(e) => setName(e.target.value)}
                            type="text"
                            required
                            placeholder="e.g. Talha Khan"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

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

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white py-2 rounded-lg transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Loading...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-5">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 cursor-pointer hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
