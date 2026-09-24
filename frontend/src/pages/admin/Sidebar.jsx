import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
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
  Info,
  X,
  PlusCircle,
  Truck,
  MailCheck,
  Mail,
  Send,
  ChevronDown
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  handleLogout,
}) {
  const { settings } = useSettings();

  const isEmailActive = activeTab === 'subscribers' || activeTab === 'send-email';
  const [emailMenuOpen, setEmailMenuOpen] = useState(isEmailActive);

  useEffect(() => {
    if (activeTab === 'subscribers' || activeTab === 'send-email') {
      setEmailMenuOpen(true);
    }
  }, [activeTab]);

  const topNavTabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: '' },
    { id: 'add-product', label: 'Add Product', icon: PlusCircle, badge: '+' },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: '' },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  const bottomNavTabs = [
    { id: 'shipping', label: 'Shipping Rates', icon: Truck, badge: 'PKR' },
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
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-gray-900 text-gray-300 flex flex-col justify-between border-r border-gray-800 transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto">
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

            {/* Top Navigation Tabs */}
            {topNavTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
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
                      className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                        isActive ? 'bg-gray-950 text-primary' : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Newsletter & Marketing Dropdown */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setEmailMenuOpen(!emailMenuOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isEmailActive
                    ? 'bg-gray-800/90 text-white font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Mail className={`w-4 h-4 ${isEmailActive ? 'text-primary' : ''}`} />
                  <span>Newsletter Marketing</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    emailMenuOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Sub-menu Items */}
              {emailMenuOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-gray-800 space-y-1 py-1 animate-in fade-in duration-150">
                  <button
                    onClick={() => {
                      setActiveTab('subscribers');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'subscribers'
                        ? 'bg-primary text-gray-950 font-bold shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <MailCheck className="w-3.5 h-3.5" />
                    <span>Subscribers</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('send-email');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'send-email'
                        ? 'bg-primary text-gray-950 font-bold shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Emails</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Navigation Tabs */}
            {bottomNavTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
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
                      className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                        isActive ? 'bg-gray-950 text-primary' : 'bg-gray-800 text-gray-300'
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
        <div className="p-4 border-t border-gray-800 space-y-3 shrink-0">
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
