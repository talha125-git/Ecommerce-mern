import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Store,
  LogOut,
  Sliders,
  Tag,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  handleLogout,
}) {
  const navTabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: '' },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: '' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];


  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-gray-900 text-gray-300 flex flex-col justify-between border-r border-gray-800 transition-transform duration-200 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div>
          {/* Logo Header */}
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <Link to="/" className="text-xl font-black tracking-tight text-white">
              BLOOM<span className="text-primary">SHOP</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 pt-2 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Navigation
            </div>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${isActive
                    ? 'bg-primary text-gray-950 font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-gray-950 text-primary' : 'bg-gray-800 text-gray-300'
                        }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-xl transition"
          >
            <Store className="w-4 h-4 text-primary" /> View Storefront
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
