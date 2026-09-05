import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Menu, DollarSign, ShoppingBag, Users, Package, Sliders, Globe, ChevronDown, Sparkles, Image as ImageIcon, Tag, RefreshCw, ArrowUpRight, ArrowRight, Info } from 'lucide-react';

// Separate Component Imports
import Sidebar from './Sidebar';
import ProductsTab from './ProductsTab';
import OrdersTab from './OrdersTab';
import CustomersTab from './CustomersTab';
import SettingsTab from './SettingsTab';
import SliderTab from './Setup/SliderTab';
import CategoryTab from './Setup/CategoryTab';
import AboutTab from './Setup/AboutTab';
import DashboardCharts from './DashboardCharts';


const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = searchParams.get('tab') || 'overview';
  const [user, setUser] = useState({ name: "Admin", email: "admin@bloomshop.com" });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(currentTabParam);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [frontendDropdownOpen, setFrontendDropdownOpen] = useState(false);

  // Dynamic Store Statistics State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersCount: 0,
    pendingOrdersCount: 0,
    deliveredOrdersCount: 0,
    customersCount: 0,
    productsCount: 0,
    inStockCount: 0,
    recentOrders: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const dropdownRef = useRef(null);

  // Fetch Real Dynamic Statistics from Backend MongoDB APIs
  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const [ordersRes, productsRes, customersRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/orders`),
        axios.get(`${API_URL}/api/products`),
        axios.get(`${API_URL}/api/customers`),
      ]);

      const orders = ordersRes.status === 'fulfilled' && ordersRes.value.data?.orders ? ordersRes.value.data.orders : [];
      const products = productsRes.status === 'fulfilled' && productsRes.value.data?.products ? productsRes.value.data.products : [];
      const customers = customersRes.status === 'fulfilled' && customersRes.value.data?.customers ? customersRes.value.data.customers : [];

      const totalRevenue = orders.reduce((sum, ord) => {
        if (ord.status !== 'Cancelled') {
          return sum + (Number(ord.totalAmount) || 0);
        }
        return sum;
      }, 0);

      const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || !o.status).length;
      const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
      const inStockCount = products.filter(p => p.stock === undefined || p.stock > 0).length;

      setStats({
        totalRevenue,
        ordersCount: orders.length,
        pendingOrdersCount,
        deliveredOrdersCount,
        customersCount: customers.length,
        productsCount: products.length,
        inStockCount,
        recentOrders: orders.slice(0, 5),
        rawOrders: orders,
        rawProducts: products,
        rawCustomers: customers,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Processing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default: // Pending
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, Admin! 👋
          </h1>
          <p className="text-xs text-gray-500">
            Real-time administrator metrics, orders summary, and database statistics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardStats}
            disabled={statsLoading}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? "animate-spin" : ""}`} />
            <span>Refresh Stats</span>
          </button>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Store
          </span>
        </div>
      </div>

      {/* Metric Cards with Real Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {statsLoading ? (
              <div className="h-8 w-28 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              `$${stats.totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            )}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total real store earnings
          </p>
        </div>

        {/* Orders Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Orders</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              stats.ordersCount
            )}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            {stats.pendingOrdersCount} pending fulfillment
          </p>
        </div>

        {/* Customers Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              stats.customersCount
            )}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Registered customer accounts</p>
        </div>

        {/* Products Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Products</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {statsLoading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              stats.productsCount
            )}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            {stats.inStockCount} in stock catalog items
          </p>
        </div>
      </div>

      {/* Dynamic Visual Analytics Charts */}
      {statsLoading ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-gray-500">Loading Real Analytics & Charts...</p>
        </div>
      ) : (
        <DashboardCharts
          orders={stats.rawOrders || []}
          products={stats.rawProducts || []}
          customers={stats.rawCustomers || []}
        />
      )}

      {/* Recent Orders Overview Table */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" /> Recent Orders Activity
            </h3>
            <p className="text-xs text-gray-500">Latest customer orders from store front</p>
          </div>
          <button
            onClick={() => handleTabChange('orders')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-2">Order ID</th>
                  <th className="pb-3 px-2">Customer</th>
                  <th className="pb-3 px-2">Items</th>
                  <th className="pb-3 px-2">Total Amount</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {stats.recentOrders.map((ord) => (
                  <tr key={ord._id || ord.orderId} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-2 font-mono font-bold text-gray-900">
                      #{ord.orderId || (ord._id ? ord._id.substring(18) : 'ORD')}
                    </td>
                    <td className="py-3 px-2 text-gray-900 font-semibold">
                      {ord.customer?.fullName || 'Guest Customer'}
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {ord.items ? ord.items.length : 0} item(s)
                    </td>
                    <td className="py-3 px-2 font-bold font-mono text-emerald-600">
                      ${Number(ord.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusBadgeClass(ord.status || 'Pending')}`}>
                        {ord.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-gray-400 text-[11px]">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Today'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            No recent orders recorded yet.
          </div>
        )}
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
      case 'about':
        return <AboutTab />;
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

                  {/* About Us Setup Option */}
                  <button
                    onClick={() => {
                      handleTabChange('about');
                      setFrontendDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition text-left cursor-pointer ${activeTab === 'about'
                        ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-500'
                        : 'text-gray-700 hover:bg-gray-50 font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">About Us Setup</div>
                        <div className="text-[10px] text-gray-500">Edit titles, text & image</div>
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
