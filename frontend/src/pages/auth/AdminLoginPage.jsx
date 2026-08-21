import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Admin login verification: username "admin", password "admin123"
    setTimeout(() => {
      if (
        (username.trim().toLowerCase() === "admin" || username.trim().toLowerCase() === "admin@bloomshop.com") &&
        password === "admin123"
      ) {
        localStorage.setItem("token", "admin-demo-token");
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify({ name: "Admin", email: "admin@bloomshop.com", role: "admin" }));
        navigate("/admin/dashboard");
      } else {
        setError("Invalid Admin Credentials. (Username: admin, Password: admin123)");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-8 antialiased">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 shadow-2xl rounded-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Admin Portal Access
          </h1>
          <p className="text-xs text-gray-400">
            Sign in with administrator credentials
          </p>
        </div>

        {/* Demo Hint Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs text-primary space-y-1 text-center">
          <p className="font-bold">🔑 Demo Admin Credentials:</p>
          <p className="font-mono">Username: <span className="underline">admin</span> | Password: <span className="underline">admin123</span></p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                placeholder="admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold bg-primary text-gray-950 hover:bg-primary/90 transition shadow-lg"
          >
            {loading ? "Verifying..." : "Sign In to Admin Dashboard"}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="pt-2 border-t border-gray-700 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Regular User Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
