import React from "react";
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  CreditCard,
  Package,
  User
} from "lucide-react";

export default function UserSidebar({ activeTab, setActiveTab, profileData, cartCount, wishlistCount, ordersCount }) {
  const tabs = [
    { id: "products", label: "Browse Products", icon: ShoppingBag },
    { id: "cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    { id: "wishlist", label: "Wishlist", icon: Heart, badge: wishlistCount },
    { id: "checkout", label: "Checkout", icon: CreditCard },
    { id: "orders", label: "My Orders", icon: Package, badge: ordersCount },
    { id: "profile", label: "Profile", icon: User },
  ];

  const displayName = profileData.name || "Customer User";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-full md:w-64 space-y-2 shrink-0">
      {/* User Profile Info Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm text-gray-900 truncate" title={displayName}>
              {displayName}
            </h3>
            <p className="text-[11px] text-gray-500 truncate" title={profileData.email}>
              {profileData.email}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-xs space-y-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? "bg-primary text-gray-950 font-bold shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </div>
              {t.badge > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-gray-950 text-primary" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
