import { useState, useEffect } from "react";
import axios from "axios";
import {
  ShoppingBag,
  Search,
  Eye,
  Trash2,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modal State for View Order Details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Expandable Row State
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/orders`);
      if (res.data && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.warn("Could not fetch orders from API:", err);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 4000);
  };

  // Update Status of an Order
  const handleUpdateStatus = async (orderMongoId, newStatus) => {
    try {
      const res = await axios.put(`${API_URL}/api/orders/${orderMongoId}/status`, {
        status: newStatus,
      });
      if (res.data && res.data.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderMongoId ? res.data.order : o))
        );
        if (selectedOrder && selectedOrder._id === orderMongoId) {
          setSelectedOrder(res.data.order);
        }
        showStatus("success", `Order status updated to "${newStatus}"!`);
      }
    } catch (err) {
      console.error("Status update error:", err);
      showStatus("error", "Failed to update order status.");
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderMongoId, orderIdCode) => {
    if (window.confirm(`Are you sure you want to delete order "${orderIdCode}"?`)) {
      try {
        await axios.delete(`${API_URL}/api/orders/${orderMongoId}`);
        setOrders((prev) => prev.filter((o) => o._id !== orderMongoId));
        if (selectedOrder && selectedOrder._id === orderMongoId) {
          setIsModalOpen(false);
        }
        showStatus("success", `Order "${orderIdCode}" deleted successfully.`);
      } catch (err) {
        console.error("Delete order error:", err);
        showStatus("error", "Failed to delete order.");
      }
    }
  };

  // Filter Orders
  const filteredOrders = orders.filter((ord) => {
    // Status Filter
    if (selectedStatus !== "All" && ord.status !== selectedStatus) return false;

    // Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchId = (ord.orderId || "").toLowerCase().includes(query);
      const matchName = (ord.customer?.fullName || "").toLowerCase().includes(query);
      const matchEmail = (ord.customer?.email || "").toLowerCase().includes(query);
      const matchPhone = (ord.customer?.phone || "").toLowerCase().includes(query);
      const matchAddress = (ord.customer?.address || "").toLowerCase().includes(query);
      const matchCity = (ord.customer?.city || "").toLowerCase().includes(query);
      if (!matchId && !matchName && !matchEmail && !matchPhone && !matchAddress && !matchCity) {
        return false;
      }
    }

    return true;
  });

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-slate-900" /> Customer Orders
          </h1>
          <p className="text-xs text-gray-500">
            Complete details, contact information, and delivery addresses for customer purchases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            🔄 Refresh List ({orders.length})
          </button>
        </div>
      </div>

      {/* Alert Status Banner */}
      {statusMsg.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between border ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : statusMsg.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg({ type: "", text: "" })}>
            <X className="w-4 h-4 cursor-pointer" />
          </button>
        </div>
      )}

      {/* Filter Bar & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 border border-gray-200 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedStatus === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone, address, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-500">Loading customer orders & addresses...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Customer Orders Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {orders.length === 0
              ? "No customer orders have been placed yet. When customers complete checkout, their full address and contact details will appear here in real-time."
              : "No orders match your current status filter or search query."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order Code</th>
                  <th className="p-4">Customer Details & Delivery Address</th>
                  <th className="p-4">Items Ordered</th>
                  <th className="p-4">Total Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((ord) => {
                  const isExpanded = expandedOrderId === ord._id;

                  return (
                    <>
                      <tr key={ord._id || ord.orderId} className="hover:bg-gray-50/80 transition">
                        {/* Order Code */}
                        <td className="p-4 font-extrabold text-slate-900 align-top">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-slate-900 text-white font-extrabold rounded-md text-[11px]">
                              {ord.orderId}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 font-normal mt-1.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : "Just now"}
                          </div>
                        </td>

                        {/* Customer Details & Address */}
                        <td className="p-4 space-y-1 align-top max-w-xs">
                          <div className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                            <User className="w-4 h-4 text-slate-700" />
                            <span>{ord.customer?.fullName || "Guest Customer"}</span>
                          </div>
                          <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{ord.customer?.email || "N/A"}</span>
                          </div>
                          <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{ord.customer?.phone || "N/A"}</span>
                          </div>
                          <div className="text-[11px] text-emerald-800 font-semibold flex items-start gap-1.5 pt-1 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">
                              {ord.customer?.address ? `${ord.customer.address}, ${ord.customer.city}, ${ord.customer.country || "Pakistan"}` : ord.customer?.city || "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* Items Ordered */}
                        <td className="p-4 align-top">
                          <div className="space-y-1.5">
                            <div className="font-bold text-gray-900 flex items-center gap-1">
                              <Package className="w-3.5 h-3.5 text-gray-500" />
                              <span>{ord.items?.length || 0} item{(ord.items?.length || 0) > 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex items-center gap-1 overflow-x-auto max-w-45">
                              {ord.items?.slice(0, 3).map((it, idx) => (
                                <img
                                  key={idx}
                                  src={it.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"}
                                  alt={it.name}
                                  title={`${it.name} (Qty: ${it.quantity})`}
                                  className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                                />
                              ))}
                              {(ord.items?.length || 0) > 3 && (
                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-1 rounded-md">
                                  +{(ord.items?.length || 0) - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Total Price & Payment */}
                        <td className="p-4 align-top">
                          <div className="font-black text-sm text-slate-900">
                            ${Number(ord.totalAmount || 0).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1 flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-gray-400" />
                            {ord.paymentMethod || "Card"}
                          </div>
                        </td>

                        {/* Status Selector */}
                        <td className="p-4 align-top">
                          <select
                            value={ord.status || "Pending"}
                            onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold border focus:outline-none cursor-pointer ${getStatusBadgeClass(
                              ord.status
                            )}`}
                          >
                            <option value="Pending">⌛ Pending</option>
                            <option value="Processing">⚙️ Processing</option>
                            <option value="Shipped">🚚 Shipped</option>
                            <option value="Delivered">✅ Delivered</option>
                            <option value="Cancelled">❌ Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="p-4 align-top text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : ord._id)}
                            className="p-1.5 text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition"
                            title={isExpanded ? "Collapse Details" : "Expand Details"}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition"
                            title="Full Modal View"
                          >
                            <Eye className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(ord._id, ord.orderId)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Order Detail Drawer Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-gray-200">
                          <td colSpan="6" className="p-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-4">
                              <div className="flex items-center justify-between border-b pb-3 text-xs font-bold text-gray-700">
                                <span className="flex items-center gap-2 text-slate-900 font-extrabold">
                                  <Sparkles className="w-4 h-4 text-amber-500" /> Complete Purchase Breakdown for Order #{ord.orderId}
                                </span>
                                <span className="text-gray-500">
                                  Payment Mode: <strong className="uppercase text-slate-900">{ord.paymentMethod || "Card"}</strong>
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                                {/* Left: Full Address Card */}
                                <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 space-y-2">
                                  <h4 className="font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-emerald-600" /> Delivery Address & Contact
                                  </h4>
                                  <div className="space-y-1 text-gray-700">
                                    <div><strong>Name:</strong> {ord.customer?.fullName}</div>
                                    <div><strong>Email:</strong> {ord.customer?.email}</div>
                                    <div><strong>Phone:</strong> {ord.customer?.phone}</div>
                                    <div><strong>Street Address:</strong> {ord.customer?.address}</div>
                                    <div><strong>City & Country:</strong> {ord.customer?.city}, {ord.customer?.country || "Pakistan"}</div>
                                  </div>
                                </div>

                                {/* Right: Product Items Breakdown */}
                                <div className="space-y-2">
                                  <h4 className="font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <Package className="w-4 h-4 text-slate-700" /> Items List
                                  </h4>
                                  <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto">
                                    {ord.items?.map((it, idx) => (
                                      <div key={idx} className="py-2 flex items-center justify-between gap-3 text-xs">
                                        <img
                                          src={it.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"}
                                          alt={it.name}
                                          className="w-9 h-9 rounded-md object-cover border shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="font-bold text-gray-900 truncate">{it.name}</div>
                                          <div className="text-gray-500 text-[10px]">
                                            Qty: {it.quantity} × ${it.price}
                                          </div>
                                        </div>
                                        <div className="font-black text-gray-900 shrink-0">
                                          ${(it.quantity * it.price).toFixed(2)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="px-2.5 py-1 bg-slate-900 text-white font-extrabold text-[11px] rounded-md">
                  {selectedOrder.orderId}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">Full Customer & Order Details</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <div className="space-y-1.5">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm border-b border-emerald-200/60 pb-1">
                  <User className="w-4 h-4 text-emerald-700" /> Customer Profile
                </div>
                <div className="text-gray-900 font-bold">{selectedOrder.customer?.fullName}</div>
                <div className="text-gray-600 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> {selectedOrder.customer?.email}
                </div>
                <div className="text-gray-600 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedOrder.customer?.phone || "N/A"}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm border-b border-emerald-200/60 pb-1">
                  <MapPin className="w-4 h-4 text-emerald-700" /> Complete Delivery Address
                </div>
                <div className="text-gray-900 font-bold">{selectedOrder.customer?.address}</div>
                <div className="text-gray-700 font-semibold">
                  {selectedOrder.customer?.city}, {selectedOrder.customer?.country || "Pakistan"}
                </div>
                <div className="text-gray-600 flex items-center gap-1 pt-1">
                  <CreditCard className="w-3.5 h-3.5 text-gray-400" /> Payment:{" "}
                  <strong className="uppercase text-gray-900">{selectedOrder.paymentMethod || "Card"}</strong>
                </div>
              </div>
            </div>

            {/* Items Ordered List */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                Purchased Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-gray-100 border rounded-xl overflow-hidden">
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs bg-white">
                    <img
                      src={it.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"}
                      alt={it.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">{it.name}</div>
                      <div className="text-gray-400 text-[10px]">
                        Qty: {it.quantity} × ${it.price}
                      </div>
                    </div>
                    <div className="font-black text-gray-900">
                      ${(it.quantity * it.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total & Status Update */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">Update Order Status:</span>
                <select
                  value={selectedOrder.status || "Pending"}
                  onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${getStatusBadgeClass(
                    selectedOrder.status
                  )}`}
                >
                  <option value="Pending">⌛ Pending</option>
                  <option value="Processing">⚙️ Processing</option>
                  <option value="Shipped">🚚 Shipped</option>
                  <option value="Delivered">✅ Delivered</option>
                  <option value="Cancelled">❌ Cancelled</option>
                </select>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-500 block">Total Amount Paid</span>
                <span className="text-xl font-black text-slate-900">
                  ${Number(selectedOrder.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
