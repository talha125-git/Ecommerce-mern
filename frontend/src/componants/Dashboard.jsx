import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const config = {
            withCredentials: true,
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        };
        // Automatically check if the user is authenticated
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        axios.get(`${API_URL}/api/dashboard`, config)
            .then(res => {
                if (res.data.message === "Success") {
                    setUser(res.data.user);
                } else {
                    navigate('/login');
                }
            })
            .catch(err => {
                console.log(err);
                navigate('/login');
            });
    }, [navigate]);

    const handleLogout = () => {
        const token = localStorage.getItem('token');
        const config = {
            withCredentials: true,
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        };
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        axios.post(`${API_URL}/api/logout`, {}, config)
            .then(res => {
                if (res.data.message === "Logged out successfully") {
                    localStorage.removeItem('token');
                    navigate('/');
                }
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <nav className="bg-white shadow-md p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">My Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="text-red-500 font-semibold hover:underline"
                >
                    Logout
                </button>
            </nav>
            <main className="grow flex items-center justify-center">
                <div className="bg-white p-10 rouned-xl shadow-lg max-w-lg w-full text-center">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-4">Welcome to your Dashboard{user && user.email ? `, ${user.email}` : ''}!</h2>
                    <p className="text-gray-600">You have successfully logged in. This is a protected area.</p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;