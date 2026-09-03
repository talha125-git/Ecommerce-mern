import React, { useState } from "react";
import {
  Package,
  Calendar,
  CreditCard,
  RefreshCw,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrdersTab({ orders, loading, fetchUserOrders, setActiveTab }) {
  const [expandedId, setExpandedId] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default: // Pending
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> My Order History
          </h2>
          <p className="text-xs text-gray-500">
            Track real-time status of your orders and delivery progress
          </p>
        </div>
        <button
          onClick={fetchUserOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 space-y-3 border border-gray-200 rounded-2xl bg-white">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-gray-500">Fetching your latest orders...</p>
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-14 space-y-3 border border-dashed border-gray-200 rounded-2xl bg-white">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No Orders Placed Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You haven't placed any orders with this account yet. When you complete checkout, your real order details and live status will appear here.
          </p>
          <Button
            onClick={() => setActiveTab && setActiveTab("products")}
            variant="outline"
            size="sm"
            className="rounded-xl cursor-pointer font-bold text-xs"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Total Amount</th>
                    <th className="p-3.5">Live Status</th>
                    <th className="p-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((ord) => {
                    const orderMongoId = ord._id || ord.orderId;
                    const orderCode = ord.orderId || (ord._id ? `#${ord._id.substring(0, 8)}` : "#ORD");
                    const dateStr = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : ord.date || "Recent";
                    const isExpanded = expandedId === orderMongoId;
                    const totalAmt = Number(ord.totalAmount || (ord.total ? parseFloat(ord.total.replace(/[^0-9.]/g, "")) : 0));

                    return (
                      <React.Fragment key={orderMongoId}>
                        <tr className="hover:bg-gray-50/80 transition">
                          <td className="p-3.5 font-black text-gray-900">
                            <span className="px-2 py-1 bg-slate-900 text-white rounded-lg text-[11px]">
                              {orderCode}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-500 font-medium">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{dateStr}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            {ord.items && Array.isArray(ord.items) && ord.items.length > 0 ? (
                              <div className="flex items-center gap-1 overflow-x-auto max-w-40">
                                {ord.items.slice(0, 3).map((it, idx) => (
                                  <img
                                    key={idx}
                                    src={it.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"}
                                    alt={it.name}
                                    title={`${it.name} (Qty: ${it.quantity})`}
                                    className="w-7 h-7 rounded-lg object-cover border border-gray-200 shrink-0"
                                  />
                                ))}
                                {ord.items.length > 3 && (
                                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                                    +{ord.items.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">{ord.items || "1 Item"}</span>
                            )}
                          </td>
                          <td className="p-3.5 font-black text-gray-900">
                            ${totalAmt.toFixed(2)}
                          </td>
                          <td className="p-3.5">
                            {getStatusBadge(ord.status || "Pending")}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : orderMongoId)}
                              className="p-1.5 text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                              title={isExpanded ? "Hide items" : "View items"}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Order Breakdown Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-50 border-b border-gray-200">
                            <td colSpan="6" className="p-4">
                              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                <div className="flex items-center justify-between border-b pb-2 text-xs font-bold text-gray-700">
                                  <span className="flex items-center gap-1.5 text-slate-900">
                                    <Sparkles className="w-4 h-4 text-amber-500" /> Order Details & Shipping
                                  </span>
                                  <span className="text-gray-500 font-semibold uppercase">
                                    Payment: <strong className="text-gray-900">{ord.paymentMethod || "Card"}</strong>
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  {/* Delivery Address */}
                                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                                    <div className="font-bold text-gray-900 flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Shipping Address
                                    </div>
                                    <p className="text-gray-600 font-medium">
                                      {ord.customer?.fullName || "Valued Customer"}
                                    </p>
                                    <p className="text-gray-500 text-[11px]">
                                      {ord.customer?.address ? `${ord.customer.address}, ${ord.customer.city}` : "Standard Shipping"}
                                    </p>
                                  </div>

                                  {/* Itemized List */}
                                  <div className="space-y-1.5">
                                    <div className="font-bold text-gray-700 flex items-center gap-1">
                                      <Package className="w-3.5 h-3.5 text-slate-700" /> Purchased Items
                                    </div>
                                    <div className="divide-y divide-gray-100 max-h-36 overflow-y-auto">
                                      {ord.items && Array.isArray(ord.items) ? (
                                        ord.items.map((it, idx) => (
                                          <div key={idx} className="py-1.5 flex items-center justify-between gap-2 text-xs">
                                            <img
                                              src={it.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"}
                                              alt={it.name}
                                              className="w-7 h-7 rounded-md object-cover border shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                              <p className="font-bold text-gray-900 truncate">{it.name}</p>
                                              <p className="text-gray-400 text-[10px]">
                                                Qty: {it.quantity} × ${it.price}
                                              </p>
                                            </div>
                                            <p className="font-black text-gray-900">
                                              ${(it.quantity * it.price).toFixed(2)}
                                            </p>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-gray-500 text-xs">{ord.items || "Order Items"}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
