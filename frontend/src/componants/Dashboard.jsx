import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Automatically check if the user is authenticated by sending their cookie to the server
        axios.get('http://localhost:5000/dashboard', { withCredentials: true })
            .then(res => {
                if (res.data.message === "Success") {
                    // Token is valid, allow access
                    setUser(res.data.user);
                } else {
                    // Token is missing or invalid, kick back to login
                    navigate('/login');
                }
            })
            .catch(err => {
                console.log(err);
                navigate('/login');
            });
    }, [navigate]);

    const handleLogout = () => {
        // Send a request to the backend to clear the cookie
        axios.post('http://localhost:5000/logout', {}, { withCredentials: true })
            .then(res => {
                if (res.data.message === "Logged out successfully") {
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
                    <h2 className="text-3xl font-semibold text-gray-800 mb-4">Welcome to your Dashboard!</h2>
                    <p className="text-gray-600">You have successfully logged in. This is a protected area.</p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
