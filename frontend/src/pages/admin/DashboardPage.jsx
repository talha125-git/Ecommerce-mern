import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Menu, DollarSign, ShoppingBag, Users, Package, Sliders, Globe, ChevronDown, Sparkles, Image as ImageIcon, Tag } from 'lucide-react';

// Separate Component Imports
import Sidebar from './Sidebar';
import ProductsTab from './ProductsTab';
import OrdersTab from './OrdersTab';
import CustomersTab from './CustomersTab';
import SettingsTab from './SettingsTab';
import SliderTab from './Setup/SliderTab';
import CategoryTab from './Setup/CategoryTab';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = searchParams.get('tab') || 'overview';
  const [user, setUser] = useState({ name: "Admin", email: "admin@bloomshop.com" });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(currentTabParam);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [frontendDropdownOpen, setFrontendDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Keep activeTab in sync with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFrontendDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    const token = localStorage.getItem('token');
    const config = {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    const API_URL = import.meta.env.VITE_API_URL || '';
    axios.get(`${API_URL}/api/dashboard`, config)
      .then(res => {
        if (res.data.message === "Success") {
          setUser({ name: "Admin", email: "admin@bloomshop.com" });
        } else {
          setUser({ name: "Admin", email: "admin@bloomshop.com" });
        }
      })
      .catch(err => {
        console.log("Dashboard auth check:", err);
        setUser({ name: "Admin", email: "admin@bloomshop.com" });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('user');
    navigate('/');
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, Admin! 👋
          </h1>
          <p className="text-xs text-gray-500">
            Administrator portal control panel and store overview.
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">
          ● Store Live
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">$12,450.00</div>
          <p className="text-[11px] text-emerald-600 font-semibold">+14.2% from last month</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Orders</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">148</div>
          <p className="text-[11px] text-gray-400">12 pending fulfillment</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">320</div>
          <p className="text-[11px] text-gray-400">24 new signups this week</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Products</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">24</div>
          <p className="text-[11px] text-gray-400">In stock items</p>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'slider':
        return <SliderTab />;
      case 'categories':
        return <CategoryTab />;
      case 'products':
        return <ProductsTab />;
      case 'orders':
        return <OrdersTab />;
      case 'customers':
        return <CustomersTab />;
      case 'settings':
        return <SettingsTab user={user} />;
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-500">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row antialiased">
      {/* Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleLogout={handleLogout}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative hidden sm:block max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Header Dropdown for Frontend Pages */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setFrontendDropdownOpen(!frontendDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Frontend Setup</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${frontendDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {frontendDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                    Manage Storefront 
                  </div>

                  {/* Home Slider Option */}
                  <button
                    onClick={() => {
                      handleTabChange('slider');
                      setFrontendDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition text-left cursor-pointer ${activeTab === 'slider'
                        ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-500'
                        : 'text-gray-700 hover:bg-gray-50 font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <Sliders className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Home Slider</div>
                        <div className="text-[10px] text-gray-500">Edit titles, text & bg picture</div>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-extrabold">Active</span>
                  </button>

                  {/* Category Setup Option */}
                  <button
                    onClick={() => {
                      handleTabChange('categories');
                      setFrontendDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition text-left cursor-pointer ${activeTab === 'categories'
                        ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-500'
                        : 'text-gray-700 hover:bg-gray-50 font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Category Setup</div>
                        <div className="text-[10px] text-gray-500">Manage & add dynamic categories</div>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-extrabold">Active</span>
                  </button>

                  {/* Featured Products */}
                  <div className="px-3 py-2 text-xs text-gray-400 opacity-60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-gray-100 text-gray-400">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-600">Featured Products</div>
                        <div className="text-[10px] text-gray-400">Homepage grid</div>
                      </div>
                    </div>
                    <span className="text-[9px] px-1 py-0.5 bg-gray-100 text-gray-400 rounded-md font-bold">Soon</span>
                  </div>


                  {/* Banner */}
                  <div className="px-3 py-2 text-xs text-gray-400 opacity-60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-gray-100 text-gray-400">
                        <ImageIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-600">Promo Banner</div>
                        <div className="text-[10px] text-gray-400">Header strip banner</div>
                      </div>
                    </div>
                    <span className="text-[9px] px-1 py-0.5 bg-gray-100 text-gray-400 rounded-md font-bold">Soon</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                A
              </div>
              <span className="text-xs font-bold text-gray-800 hidden sm:inline">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="grow p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
