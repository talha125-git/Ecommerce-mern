import React, { useState } from "react";
import axios from "axios"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
const Signup = () => {

    const [name, setName] = useState()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post('/api/register', { name, email, password })
            .then(result => {
                console.log(result)
                navigate('/login')
            })
            .catch(err => console.log(err))
    }

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
                    {/* Name */}
                    <div>
                        <label className="block text-gray-700 mb-2">Full Name</label>
                        <input
                            onChange={(e) => setName(e.target.value)}
                            type="text"
                            placeholder="Enter your name"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Sign Up
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

export default Signup;