import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { LogOut, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

// Modular Sub-components
import UserSidebar from "./UserSidebar";
import BrowseProductsTab from "./BrowseProductsTab";
import CartTab from "./CartTab";
import WishlistTab from "./WishlistTab";
import OrdersTab from "./OrdersTab";
import ProfileTab from "./ProfileTab";

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  
  const initialTab = searchParams.get("tab") || "products";
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

  // Sample Wishlist state
  const [wishlist, setWishlist] = useState([
    { id: 1, name: "Floral Summer Dress", price: 64.99, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=400" },
    { id: 2, name: "Leather Crossbody Handbag", price: 89.00, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400" },
  ]);

  // Sample User Orders history
  const [orders, setOrders] = useState([
    { id: "#ORD-8821", date: "2026-08-18", total: "$153.99", status: "Delivered", items: "Floral Summer Dress, Leather Handbag" },
    { id: "#ORD-8804", date: "2026-08-10", total: "$89.00", status: "Processing", items: "Quartz Gold Wristwatch" },
  ]);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    address: "742 Evergreen Terrace, Springfield, OR"
  });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    const savedUserStr = localStorage.getItem("user");
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        setUser(parsed);
        if (parsed.name) {
          setProfileData(prev => ({ ...prev, name: parsed.name, email: parsed.email || prev.email }));
        }
      } catch (e) {
        // Fallback
      }
    } else {
      const lastRegName = localStorage.getItem('last_registered_name');
      if (lastRegName) {
        setProfileData(prev => ({ ...prev, name: lastRegName }));
      }
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
    const exists = wishlist.some(item => (item._id || item.id) === (product._id || product.id));
    if (exists) {
      setWishlist(wishlist.filter(item => (item._id || item.id) !== (product._id || product.id)));
    } else {
      setWishlist([...wishlist, product]);
    }
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

  // Sample Product List for Browse Products tab
  const productsList = [
    { id: 101, name: "Floral Summer Dress", price: 64.99, cat: "Clothing", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=400" },
    { id: 102, name: "Leather Crossbody Handbag", price: 89.00, cat: "Accessories", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400" },
    { id: 103, name: "Unisex Oversized Denim Jacket", price: 110.00, cat: "Outerwear", image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=400" },
    { id: 104, name: "Quartz Gold Wristwatch", price: 90.00, cat: "Jewelry", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400" }
  ];

  const cartSubtotal = cart?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const cartTotalItems = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const renderActiveTab = () => {
    switch (activeTab) {
      case "products":
        return (
          <BrowseProductsTab
            productsList={productsList}
            wishlist={wishlist}
            handleToggleWishlist={handleToggleWishlist}
            addToCart={addToCart}
            setActiveTab={handleTabChange}
          />
        );
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
          />
        );
      case "orders":
        return <OrdersTab orders={orders} />;
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
          <BrowseProductsTab
            productsList={productsList}
            wishlist={wishlist}
            handleToggleWishlist={handleToggleWishlist}
            addToCart={addToCart}
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

