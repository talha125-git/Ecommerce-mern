import { useState, useEffect } from "react";
import axios from "axios";
import { Users, Search, Trash2, Mail, Calendar, ShoppingBag, Shield, User, CheckCircle2 } from "lucide-react";

export default function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetchCustomersAndOrders();
  }, []);

  const fetchCustomersAndOrders = async () => {
    setLoading(true);
    try {
      const [custRes, ordRes] = await Promise.all([
        axios.get(`${API_URL}/api/customers`),
        axios.get(`${API_URL}/api/orders`).catch(() => ({ data: { orders: [] } })),
      ]);

      if (custRes.data && Array.isArray(custRes.data.customers)) {
        setCustomers(custRes.data.customers);
      }
      if (ordRes.data && Array.isArray(ordRes.data.orders)) {
        setOrders(ordRes.data.orders);
      }
    } catch (err) {
      console.warn("Could not fetch customer users:", err);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 4000);
  };

  const handleDeleteCustomer = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete customer account "${userName}"?`)) {
      try {
        await axios.delete(`${API_URL}/api/customers/${userId}`);
        setCustomers((prev) => prev.filter((c) => c._id !== userId));
        showStatus("success", `Customer "${userName}" deleted successfully.`);
      } catch (err) {
        console.error("Error deleting customer:", err);
        showStatus("error", "Failed to delete customer account.");
      }
    }
  };

  // Calculate order count per customer email
  const getCustomerOrderCount = (email) => {
    if (!email || !orders) return 0;
    return orders.filter(
      (ord) => (ord.customer?.email || "").toLowerCase() === email.toLowerCase()
    ).length;
  };

  // Filter customers search
  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-slate-900" /> Customer Accounts
          </h1>
          <p className="text-xs text-gray-500">
            All registered users signed up on your storefront
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs">
            👥 {customers.length} Signed Up Users
          </span>
          <button
            onClick={fetchCustomersAndOrders}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {statusMsg.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold border ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex justify-between items-center bg-white p-3 border border-gray-200 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-500">Loading registered customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Customers Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {customers.length === 0
              ? "No customers have signed up on your storefront yet. When users register accounts, they will appear here in real-time."
              : "No customers match your search query."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const orderCount = getCustomerOrderCount(cust.email);

            return (
              <div
                key={cust._id}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center text-sm shadow-xs uppercase">
                      {cust.name ? cust.name.charAt(0) : "U"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{cust.name || "Customer User"}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" /> {cust.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCustomer(cust._id, cust.name)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : "Registered"}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full">
                    <ShoppingBag className="w-3.5 h-3.5 text-primary" /> {orderCount} Order{orderCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
