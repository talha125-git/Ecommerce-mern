import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { LogOut, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

// Modular Sub-components
import UserSidebar from "./UserSidebar";
import CartTab from "./CartTab";
import WishlistTab from "./WishlistTab";
import OrdersTab from "./OrdersTab";
import ProfileTab from "./ProfileTab";

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const API_URL = import.meta.env.VITE_API_URL || "";
  
  const initialTab = searchParams.get("tab") || "cart";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(null);

  // Sync activeTab with URL search params when changed
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Profile form state — declared early so wishlist helpers can reference profileData.email
  const [profileData, setProfileData] = useState({
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    address: "742 Evergreen Terrace, Springfield, OR"
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Persistent Wishlist — synced with MongoDB (works across devices & deployments)
  const [wishlist, setWishlist] = useState([]);

  // Helper: localStorage cache key
  const getWishlistKey = (email) => `user_wishlist_${(email || "guest").toLowerCase()}`;

  // Load wishlist — tries MongoDB first, falls back to localStorage cache
  const loadWishlist = async (email) => {
    if (!email) return;
    try {
      const res = await axios.get(`${API_URL}/api/wishlist/${encodeURIComponent(email)}`);
      if (res.data && Array.isArray(res.data.wishlist)) {
        setWishlist(res.data.wishlist);
        // Keep localStorage in sync as cache
        localStorage.setItem(getWishlistKey(email), JSON.stringify(res.data.wishlist));
        return;
      }
    } catch (err) {
      console.warn("Could not fetch wishlist from API, using localStorage cache:", err);
    }
    // Fallback: read from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem(getWishlistKey(email)) || "[]");
      setWishlist(Array.isArray(stored) ? stored : []);
    } catch (e) {
      setWishlist([]);
    }
  };

  // Save wishlist — writes to MongoDB AND localStorage cache
  const saveWishlist = async (email, items) => {
    // Optimistic local update
    try {
      localStorage.setItem(getWishlistKey(email), JSON.stringify(items));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (e) {}
    // Persist to MongoDB
    if (email) {
      try {
        await axios.put(`${API_URL}/api/wishlist/${encodeURIComponent(email)}`, { wishlist: items });
      } catch (err) {
        console.warn("Could not save wishlist to API:", err);
      }
    }
  };

  // Re-read wishlist when ProductCard fires the wishlist-updated event
  useEffect(() => {
    const onWishlistUpdated = () => {
      const email = profileData.email || (user && user.email) || "";
      loadWishlist(email);
    };
    window.addEventListener("wishlist-updated", onWishlistUpdated);
    return () => window.removeEventListener("wishlist-updated", onWishlistUpdated);
  }, [profileData.email, user]);

  // Real User Orders state fetched dynamically from MongoDB / API
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchUserOrders = async () => {
    setLoadingOrders(true);
    const userEmail = profileData.email || (user && user.email) || "";
    let apiOrders = [];
    try {
      const res = await axios.get(`${API_URL}/api/orders`);
      if (res.data && Array.isArray(res.data.orders)) {
        apiOrders = userEmail
          ? res.data.orders.filter(
              (o) => o.customer?.email?.toLowerCase() === userEmail.toLowerCase()
            )
          : res.data.orders;
      }
    } catch (err) {
      console.warn("Could not fetch orders from backend API:", err);
    }

    if (userEmail) {
      const localKey = `user_orders_${userEmail.toLowerCase()}`;
      try {
        const localOrders = JSON.parse(localStorage.getItem(localKey) || "[]");
        const apiIds = new Set(apiOrders.map((o) => o.orderId || o._id));
        const missingLocal = localOrders.filter(
          (lo) => !apiIds.has(lo.orderId) && !apiIds.has(lo._id)
        );
        apiOrders = [...apiOrders, ...missingLocal];
      } catch (e) {}
    }

    setOrders(apiOrders);
    setLoadingOrders(false);
  };

  useEffect(() => {
    fetchUserOrders();
  }, [profileData.email, user]);

  useEffect(() => {
    const savedUserStr = localStorage.getItem("user");
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        setUser(parsed);
        if (parsed.name) {
          setProfileData(prev => ({ ...prev, name: parsed.name, email: parsed.email || prev.email }));
        }
        // Load wishlist for this user
        if (parsed.email) loadWishlist(parsed.email);
      } catch (e) {
        // Fallback
      }
    } else {
      const lastRegName = localStorage.getItem('last_registered_name');
      if (lastRegName) {
        setProfileData(prev => ({ ...prev, name: lastRegName }));
      }
      // Load guest wishlist
      loadWishlist("");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleToggleWishlist = (product) => {
    const email = profileData.email || (user && user.email) || "";
    const exists = wishlist.some(item => (item._id || item.id) === (product._id || product.id));
    let updated;
    if (exists) {
      updated = wishlist.filter(item => (item._id || item.id) !== (product._id || product.id));
    } else {
      updated = [...wishlist, product];
    }
    setWishlist(updated);
    saveWishlist(email, updated);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify({ name: profileData.name, email: profileData.email }));
    if (profileData.email) {
      localStorage.setItem(`user_name_${profileData.email.toLowerCase()}`, profileData.name);
    }
    localStorage.setItem("last_registered_name", profileData.name);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const cartSubtotal = cart?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const cartTotalItems = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const renderActiveTab = () => {
    switch (activeTab) {
      case "cart":
        return (
          <CartTab
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            cartSubtotal={cartSubtotal}
            setActiveTab={handleTabChange}
          />
        );
      case "wishlist":
        return (
          <WishlistTab
            wishlist={wishlist}
            handleToggleWishlist={handleToggleWishlist}
            addToCart={addToCart}
            setActiveTab={handleTabChange}
          />
        );
      case "orders":
        return (
          <OrdersTab
            orders={orders}
            loading={loadingOrders}
            fetchUserOrders={fetchUserOrders}
            setActiveTab={handleTabChange}
          />
        );
      case "profile":
        return (
          <ProfileTab
            profileData={profileData}
            setProfileData={setProfileData}
            profileSaved={profileSaved}
            handleSaveProfile={handleSaveProfile}
          />
        );
      default:
        return (
          <CartTab
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            cartSubtotal={cartSubtotal}
            setActiveTab={handleTabChange}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col antialiased">
      {/* Top Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-black tracking-tight text-gray-900">
              BLOOM<span className="text-primary">SHOP</span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
              Customer Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-xl cursor-pointer">
                <Store className="w-3.5 h-3.5" /> Back to Store
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="destructive" size="sm" className="text-xs gap-1.5 rounded-xl cursor-pointer">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container mx-auto px-4 sm:px-6 py-6 grow flex flex-col md:flex-row gap-6 max-w-6xl">
        {/* Modular Sidebar Component */}
        <UserSidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          profileData={profileData}
          cartCount={cartTotalItems}
          wishlistCount={wishlist.length}
          ordersCount={orders.length}
        />

        {/* Dynamic Tab Body Panel */}
        <main className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs min-h-125">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}

